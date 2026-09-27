const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'js/audio.js'),'utf8'),data=fs.readFileSync(path.join(root,'data/audio-data.js'),'utf8');
function setup({unsupported=false,broken=false}={}){
 const active=new Set(),store=new Map(),elements=new Map(),events={};let context;
 function element(key){if(!elements.has(key))elements.set(key,{textContent:'',value:'',setAttribute(k,v){this[k]=v},addEventListener(k,fn){this[k]=fn}});return elements.get(key);}
 class Context{
  constructor(){context=this;this.currentTime=10;this.state='suspended';this.destination={};this.decodes=0;}
  resume(){this.state='running';return Promise.resolve();}
  createGain(){return {gain:{value:1},connect(){},disconnect(){}};}
  createDynamicsCompressor(){return {threshold:{},knee:{},ratio:{},attack:{},release:{},connect(){}};}
  async decodeAudioData(bytes){this.decodes++;const b=Buffer.from(bytes);if(b.toString('ascii',0,4)!=='RIFF')throw Error('bad WAV');return {duration:b.readUInt32LE(40)/b.readUInt32LE(28)};}
  createBufferSource(){const node={buffer:null,connect(){},disconnect(){},start(){active.add(node)},stop(){active.delete(node);node.onended?.()}};return node;}
 }
 const sandbox={console,Uint8Array,Map,Set,Promise,Number,Math,atob:s=>Buffer.from(s,'base64').toString('binary'),localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},document:{hidden:false,querySelector:element,addEventListener:(k,fn)=>events[k]=fn}};
 sandbox.window=sandbox;if(!unsupported)sandbox.AudioContext=Context;vm.createContext(sandbox);vm.runInContext(data,sandbox);if(broken)sandbox.IMMUNO_AUDIO_DATA.hit.wav='AAAA';vm.runInContext(source,sandbox);
 return {s:sandbox.IMMUNO_SOUND,sandbox,active,store,elements,events,get context(){return context;}};
}
(async()=>{
 const checks=[];const check=(name,fn)=>{fn();checks.push(name)};
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/audio/manifest.json')));
 check('21 PCM WAV files are valid, non-silent, clipped safely and embedded byte-for-byte',()=>{
  const sandbox={};sandbox.window=sandbox;vm.createContext(sandbox);vm.runInContext(data,sandbox);assert.equal(manifest.sounds.length,21);
  for(const sound of manifest.sounds){const b=fs.readFileSync(path.join(root,sound.file));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');assert.equal(b.readUInt16LE(20),1);assert.equal(b.readUInt16LE(22),1);assert.equal(b.readUInt32LE(24),22050);assert.equal(b.readUInt16LE(34),16);assert.equal(b.length,b.readUInt32LE(40)+44);let peak=0;for(let i=44;i<b.length;i+=2)peak=Math.max(peak,Math.abs(b.readInt16LE(i)));assert.ok(peak>1000&&peak<=21300,sound.name);assert.equal(b.readInt16LE(44),0);assert.equal(b.readInt16LE(b.length-2),0);assert.deepEqual(Buffer.from(sandbox.IMMUNO_AUDIO_DATA[sound.name].wav,'base64'),b);}
 });
 const t=setup();check('No autoplay or queued battle sound before user unlock',()=>{assert.equal(t.context,undefined);assert.equal(t.s.play('blaster'),false)});
 await t.s.unlock();check('Unlock decodes all audio once without fetch',()=>{assert.equal(t.context.decodes,21);assert.equal(t.context.state,'running');assert.equal(t.s.play('blaster'),true);});
 await t.s.unlock();check('Repeated interactions do not decode twice; per-sound rate limit works',()=>{assert.equal(t.context.decodes,21);assert.equal(t.s.play('blaster'),false);t.context.currentTime+=.1;assert.equal(t.s.play('blaster'),true)});
 check('Mixer never exceeds 12 active voices',()=>{for(let i=0;i<60;i++){t.context.currentTime+=.2;t.s.play('blaster')}assert.ok(t.active.size<=12);});
 check('Pause stops battle audio but still allows menu feedback',()=>{t.s.setPaused(true);assert.equal(t.active.size,0);assert.equal(t.s.play('heavy'),false);assert.equal(t.s.play('pause',{ui:true}),true);t.s.setPaused(false);});
 check('Mute and volume survive setting writes and block playback',()=>{t.s.setMuted(true);assert.equal(t.active.size,0);assert.equal(t.s.play('heavy'),false);assert.equal(t.store.get('immunofrontSfxMuted'),'true');t.s.setMuted(false);t.s.setVolume(0);assert.equal(t.s.play('heavy'),false);t.s.setVolume(.4);assert.equal(t.store.get('immunofrontSfxVolume'),'0.4');});
 check('Background-tab audio is silent',()=>{t.sandbox.document.hidden=true;assert.equal(t.s.play('place'),false);t.events.visibilitychange();assert.equal(t.active.size,0)});
 const unsupported=setup({unsupported:true});assert.equal(await unsupported.s.unlock(),false);checks.push('Unsupported Web Audio does not crash gameplay');
 const broken=setup({broken:true});await broken.s.unlock();check('One damaged audio asset does not block other effects',()=>{assert.equal(broken.s.play('hit'),false);assert.equal(broken.s.play('place'),true);});
 const report={passed:checks.length,checks,browserPlayback:false,note:'PCM and mixer control verified with mocked Web Audio. Device playback/listening test not performed.'};fs.writeFileSync(path.join(root,'docs/TEST_AUDIO_v0.8.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
