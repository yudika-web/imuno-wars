(() => {
  'use strict';
  const bank=window.IMMUNO_AUDIO_DATA||{},buffers=new Map(),voices=new Set(),lastPlayed=new Map();
  let context=null,master=null,ready=false,pending=null,paused=false,muted=false,volume=.55,failed=0;
  try{muted=localStorage.getItem('immunofrontSfxMuted')==='true';const saved=localStorage.getItem('immunofrontSfxVolume');if(saved!==null&&Number.isFinite(Number(saved)))volume=Math.max(0,Math.min(1,Number(saved)));}catch{}
  function save(){try{localStorage.setItem('immunofrontSfxMuted',String(muted));localStorage.setItem('immunofrontSfxVolume',String(volume));}catch{}}
  function updateUI(){
    const button=document.querySelector('#soundBtn'),slider=document.querySelector('#sfxVolume'),status=document.querySelector('#audioStatus');
    if(button){button.textContent=muted?'SFX: MATI':'SFX: AKTIF';button.setAttribute('aria-pressed',String(!muted));}
    if(slider)slider.value=String(Math.round(volume*100));
    if(status)status.textContent=failed?'Sebagian SFX tidak tersedia.':!(window.AudioContext||window.webkitAudioContext)?'Audio tidak didukung browser ini.':muted?'SFX dibisukan.':ready?'SFX siap • dapat dimainkan offline':'SFX aktif setelah interaksi pertama.';
  }
  function dispose(voice){voices.delete(voice);try{voice.source.disconnect();voice.gain.disconnect();}catch{}}
  function stopAll(){for(const voice of [...voices]){try{voice.source.stop();}catch{}dispose(voice);}}
  function setMuted(value){muted=!!value;if(muted)stopAll();if(master)master.gain.value=muted?0:volume;save();updateUI();window.IMMUNO_SETTINGS?.refresh();}
  function setVolume(value){volume=Math.max(0,Math.min(1,Number(value)||0));if(master)master.gain.value=muted?0:volume;save();updateUI();window.IMMUNO_SETTINGS?.refresh();}
  async function unlock(){
    try{
      if(!context){
        const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){updateUI();return false;}
        context=new Audio();master=context.createGain();master.gain.value=muted?0:volume;
        const limiter=context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.12;
        master.connect(limiter);limiter.connect(context.destination);
      }
      if(context.state==='suspended')await context.resume();
      if(!pending)pending=Promise.all(Object.entries(bank).map(async([name,entry])=>{
        try{const raw=atob(entry.wav),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);buffers.set(name,await context.decodeAudioData(bytes.buffer));}catch{failed++;}
      })).then(()=>{ready=true;updateUI();return buffers.size>0;});
      return await pending;
    }catch{updateUI();return false;}
  }
  function play(name,options={}){
    if(!ready||muted||volume===0||!context||context.state!=='running'||document.hidden||(paused&&!options.ui))return false;
    const entry=bank[name],buffer=buffers.get(name);if(!entry||!buffer)return false;
    const now=context.currentTime;if(now-(lastPlayed.get(name)??-Infinity)<entry.cooldown)return false;
    lastPlayed.set(name,now);
    // Retire oldest voice before adding one: battle crowds cannot grow the mixer.
    if(voices.size>=12){const oldest=voices.values().next().value;try{oldest.source.stop();}catch{}dispose(oldest);}
    try{
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffer;gain.gain.value=entry.volume*(options.volume??1);
      source.connect(gain);gain.connect(master);const voice={source,gain};voices.add(voice);source.onended=()=>dispose(voice);source.start();return true;
    }catch{return false;}
  }
  function setPaused(value){paused=!!value;if(paused)stopAll();}
  window.IMMUNO_SOUND={unlock,play,setMuted,setVolume,setPaused,stopAll,get muted(){return muted;},get volume(){return volume;}};
  // Audio starts only following a trusted user gesture; autoplay stays untouched.
  document.addEventListener('pointerdown',()=>{void unlock();},{passive:true});
  document.addEventListener('keydown',()=>{void unlock();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
  document.querySelector('#soundBtn')?.addEventListener('click',()=>{setMuted(!muted);if(!muted)void unlock().then(()=>play('ui_click',{ui:true}));});
  document.querySelector('#sfxVolume')?.addEventListener('input',ev=>setVolume(Number(ev.target.value)/100));
  document.querySelector('#sfxVolume')?.addEventListener('change',()=>play('ui_click',{ui:true}));
  updateUI();
})();
