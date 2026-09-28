(() => {
  'use strict';
  const $=s=>document.querySelector(s),panel=$('#audioSettings'),app=$('#app'),modal=$('#modal');
  let opener=null,priorApp=false,priorModal=false;
  function refresh(){
    const m=window.IMMUNO_MUSIC,s=window.IMMUNO_SOUND;
    $('#musicVolume').value=Math.round((m?.volume??.35)*100);$('#musicVolumeValue').textContent=$('#musicVolume').value+'%';
    $('#settingsSfxVolume').value=Math.round((s?.volume??.55)*100);$('#settingsSfxValue').textContent=$('#settingsSfxVolume').value+'%';
    $('#musicMuteBtn').textContent=m?.muted?'Aktifkan musik':'Bisukan musik';$('#musicMuteBtn').setAttribute('aria-pressed',String(!!m?.muted));
    $('#settingsSfxMuteBtn').textContent=s?.muted?'Aktifkan SFX':'Bisukan SFX';$('#settingsSfxMuteBtn').setAttribute('aria-pressed',String(!!s?.muted));
  }
  function open(){if(!panel.classList.contains('hidden'))return;opener=document.activeElement;priorApp=app.inert;priorModal=modal.inert;app.inert=true;modal.inert=true;panel.classList.remove('hidden');refresh();$('#musicVolume').focus();}
  function close(){panel.classList.add('hidden');app.inert=priorApp;modal.inert=priorModal;opener?.focus?.();}
  $('#menuSettingsBtn').addEventListener('click',open);$('#pauseSettingsBtn').addEventListener('click',open);$('#closeSettingsBtn').addEventListener('click',close);
  $('#musicVolume').addEventListener('input',ev=>window.IMMUNO_MUSIC?.setVolume(Number(ev.target.value)/100));
  $('#settingsSfxVolume').addEventListener('input',ev=>window.IMMUNO_SOUND?.setVolume(Number(ev.target.value)/100));
  $('#musicMuteBtn').addEventListener('click',()=>window.IMMUNO_MUSIC?.setMuted(!window.IMMUNO_MUSIC.muted));
  $('#settingsSfxMuteBtn').addEventListener('click',()=>window.IMMUNO_SOUND?.setMuted(!window.IMMUNO_SOUND.muted));
  $('#testSfxBtn').addEventListener('click',()=>window.IMMUNO_SOUND?.unlock().then(()=>window.IMMUNO_SOUND.play('place',{ui:true})));
  window.addEventListener('keydown',ev=>{
    if(panel.classList.contains('hidden'))return;
    // Capture before the game's ESC/Space handlers so settings never resumes combat.
    if(ev.code==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();close();return;}
    if(ev.code==='Tab'){
      const items=[...panel.querySelectorAll('button,input')].filter(el=>!el.disabled),i=items.indexOf(document.activeElement);
      if(ev.shiftKey&&i<=0){ev.preventDefault();items.at(-1)?.focus();}else if(!ev.shiftKey&&(i===items.length-1||i<0)){ev.preventDefault();items[0]?.focus();}
    }
    ev.stopImmediatePropagation();
  },true);
  window.IMMUNO_SETTINGS={refresh,close};refresh();
})();
