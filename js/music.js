(() => {
  'use strict';
  const paths={menu:'assets/music/start_screen_and_menu.mp3',battle:'assets/music/in_fight.mp3',boss:'assets/music/boss_fight.mp3'};
  // Reuse the same unlocked media element across scenes; never layer two music tracks.
  const audio=window.Audio?new Audio(paths.menu):null;
  let scene='menu',activated=false,paused=false,muted=false,volume=.35,blocked=false,failed=false,pending=false,revision=0;
  try{muted=localStorage.getItem('immunofrontMusicMuted')==='true';const v=localStorage.getItem('immunofrontMusicVolume');if(v!==null&&Number.isFinite(Number(v)))volume=Math.max(0,Math.min(1,Number(v)));}catch{}
  function save(){try{localStorage.setItem('immunofrontMusicMuted',String(muted));localStorage.setItem('immunofrontMusicVolume',String(volume));}catch{}}
  function status(){
    const el=document.querySelector('#musicStatus');
    if(el)el.textContent=!audio?'Musik tidak didukung browser ini.':failed?'Musik ini gagal dimuat. Pastikan folder assets/music ikut diekstrak.':muted||volume===0?'Musik dibisukan.':blocked?'Sentuh tombol atau layar untuk mengaktifkan musik.':paused?'Musik dijeda bersama permainan.':activated?'Musik: '+({menu:'Menu utama',battle:'Pertempuran',boss:'Pertempuran boss'}[scene]):'Musik dimulai setelah Sentuh untuk Mulai.';
  }
  function mayPlay(){return activated&&!paused&&!muted&&volume>0&&!document.hidden&&!failed;}
  function reconcile(){
    if(!audio){status();return;}
    audio.volume=volume;audio.muted=muted;
    if(!mayPlay())audio.pause();
    else if(audio.paused&&!pending){
      pending=true;const started=revision;
      try{Promise.resolve(audio.play()).then(()=>{blocked=false;if(!mayPlay())audio.pause();}).catch(err=>{if(started!==revision)return;if(err?.name==='NotSupportedError')failed=true;else if(err?.name!=='AbortError')blocked=true;}).finally(()=>{pending=false;status();if(started!==revision)reconcile();});}catch{pending=false;blocked=true;}
    }
    status();
  }
  if(audio){audio.loop=true;audio.preload='metadata';audio.volume=volume;audio.addEventListener('error',()=>{failed=true;status();});}
  function unlock(){activated=true;reconcile();}
  function setScene(value){if(!paths[value]||value===scene)return;scene=value;revision++;failed=false;blocked=false;if(audio){audio.pause();audio.src=paths[scene];}reconcile();}
  function setPaused(value){if(paused!==!!value)revision++;paused=!!value;reconcile();}
  function setMuted(value){if(muted!==!!value)revision++;muted=!!value;save();reconcile();window.IMMUNO_SETTINGS?.refresh();}
  function setVolume(value){revision++;volume=Math.max(0,Math.min(1,Number(value)||0));save();reconcile();window.IMMUNO_SETTINGS?.refresh();}
  window.IMMUNO_MUSIC={unlock,setScene,setPaused,setMuted,setVolume,get scene(){return scene;},get muted(){return muted;},get volume(){return volume;}};
  document.addEventListener('visibilitychange',reconcile);
  const retry=()=>{if(activated)reconcile();};
  document.addEventListener('pointerdown',retry,{passive:true});document.addEventListener('keydown',retry);
  status();
})();
