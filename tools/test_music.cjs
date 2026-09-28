const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),code=fs.readFileSync(path.join(root,'js/music.js'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
function setup({unsupported=false,store=new Map()}={}){
 const nodes=[],events={},status={};
 class Audio {
  constructor(src){this.src=src;this.paused=true;this.calls=0;this.handlers={};this.currentTime=0;nodes.push(this);}
  set src(v){this._src=v;this.currentTime=0;this.paused=true;}get src(){return this._src;}
  addEventListener(k,fn){this.handlers[k]=fn;}
  pause(){this.paused=true;}
  play(){this.calls++;if(this.reject){const error=this.reject;this.reject=null;return Promise.reject(error);}this.paused=false;return this.defer?new Promise(r=>this.resolve=r):Promise.resolve();}
 }
 const sandbox={console,Promise,Number,Math,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},document:{hidden:false,querySelector:()=>status,addEventListener:(k,fn)=>events[k]=fn}};
 sandbox.window=sandbox;if(!unsupported)sandbox.Audio=Audio;vm.createContext(sandbox);vm.runInContext(code,sandbox);return {m:sandbox.IMMUNO_MUSIC,sandbox,nodes,events,status,store};
}
(async()=>{
 const checks=[],check=(name,fn)=>{fn();checks.push(name);};
 const t=setup(),a=t.nodes[0];check('No music autoplay before explicit start gesture',()=>{assert.equal(a.calls,0);assert.ok(a.loop);});
 t.m.unlock();await tick();check('Start gesture plays menu using one reusable audio element',()=>{assert.equal(t.nodes.length,1);assert.ok(a.src.endsWith('start_screen_and_menu.mp3'));assert.equal(a.paused,false);});
 t.m.setScene('battle');await tick();t.m.setScene('boss');await tick();check('Battle and boss switch on the same element without overlapping music',()=>{assert.equal(t.nodes.length,1);assert.ok(a.src.endsWith('boss_fight.mp3'));assert.equal(a.paused,false);});
 a.currentTime=27;const calls=a.calls;for(let i=0;i<100;i++)t.m.setScene('boss');check('Repeated HUD updates never restart the current track',()=>{assert.equal(a.calls,calls);assert.equal(a.currentTime,27);});
 t.m.setPaused(true);check('Pause stops playback without rewinding',()=>{assert.equal(a.paused,true);assert.equal(a.currentTime,27);});t.m.setPaused(false);await tick();assert.equal(a.currentTime,27);
 t.sandbox.document.hidden=true;t.events.visibilitychange();check('Background tab silences music',()=>assert.equal(a.paused,true));t.m.setPaused(true);t.sandbox.document.hidden=false;t.events.visibilitychange();check('Returning to a paused game does not resume music',()=>assert.equal(a.paused,true));t.m.setPaused(false);await tick();
 t.m.setMuted(true);t.m.setVolume(.17);check('Music mute and volume persist independently of SFX',()=>{assert.equal(a.paused,true);assert.equal(t.store.get('immunofrontMusicMuted'),'true');assert.equal(t.store.get('immunofrontMusicVolume'),'0.17');assert.equal(t.store.has('immunofrontSfxMuted'),false);});const restored=setup({store:t.store});assert.equal(restored.m.volume,.17);assert.equal(restored.m.muted,true);
 t.m.setMuted(false);await tick();t.m.setVolume(0);assert.equal(a.paused,true);t.m.setVolume(.5);await tick();assert.equal(a.paused,false);
 const b=setup();b.nodes[0].reject={name:'NotAllowedError'};b.m.unlock();await tick();check('Autoplay rejection is caught and reported',()=>assert.match(b.status.textContent,/Sentuh/));b.events.pointerdown();await tick();assert.equal(b.nodes[0].paused,false);
 const slow=setup(),sa=slow.nodes[0];sa.defer=true;slow.m.unlock();slow.m.setPaused(true);sa.resolve();await tick();check('Late play resolution cannot bypass Pause',()=>assert.equal(sa.paused,true));
 const rapid=setup(),ra=rapid.nodes[0];ra.defer=true;rapid.m.unlock();rapid.m.setPaused(true);rapid.m.setPaused(false);ra.defer=false;ra.resolve();await tick();await tick();check('Rapid pause and resume during pending playback recovers music',()=>assert.equal(ra.paused,false));
 const switcher=setup(),ss=switcher.nodes[0];ss.defer=true;switcher.m.unlock();switcher.m.setScene('boss');ss.defer=false;ss.resolve();await tick();await tick();check('Pending play followed by scene change settles on the latest track',()=>{assert.ok(ss.src.endsWith('boss_fight.mp3'));assert.equal(ss.paused,false);});
 const err=setup();err.nodes[0].handlers.error();err.m.unlock();check('Missing music file does not throw or block controls',()=>assert.match(err.status.textContent,/gagal dimuat/));
 const noAudio=setup({unsupported:true});noAudio.m.unlock();noAudio.m.setScene('boss');noAudio.m.setVolume(.2);check('Unsupported music API is nonfatal',()=>assert.match(noAudio.status.textContent,/tidak didukung/));
 const report={passed:checks.length,checks,browserPlayback:false,note:'Media lifecycle tested with a controllable HTMLAudio adapter. Actual device playback and autoplay behavior require a browser/device check.'};fs.writeFileSync(path.join(root,'docs/TEST_MUSIC_v0.9.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
