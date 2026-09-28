// Deterministic logic + native-canvas integration tests. No test hooks ship in game.js.
// Run: node tools/test_game.cjs. Dependency: @napi-rs/canvas.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {createCanvas,Image}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs');
const elements=new Map(),warnings=[],events=[];
class Element{
 constructor(){this.style={};this.dataset={};this.innerHTML='';this.textContent='';this.events={};this.classes=new Set();this.classList={add:(x)=>this.classes.add(x),remove:(x)=>this.classes.delete(x),contains:(x)=>this.classes.has(x),toggle:(x,on)=>{on?this.classes.add(x):this.classes.delete(x)}};}
 setAttribute(n,v){this[n]=v;} addEventListener(n,f){this.events[n]=f;}
 querySelector(s){return get(s);}
 click(){this.events.click?.();this.onclick?.();}
}
function get(s){if(!elements.has(s))elements.set(s,new Element());return elements.get(s);}
const dynamicButtons=new Map();
function queryButtons(selector){
 const spec={'.unit-card':['#unitCards','unit'],'.ability-btn':['#abilityBar','ability'],'.antibody-btn':['#antibodyButtons','antigen']}[selector];
 if(!spec)return [];
 const matches=[...get(spec[0]).innerHTML.matchAll(new RegExp('data-'+spec[1]+'="([^\\"]+)"','g'))];
 return matches.map(match=>{const id=selector+':'+match[1];if(!dynamicButtons.has(id))dynamicButtons.set(id,new Element());const el=dynamicButtons.get(id);el.dataset[spec[1]]=match[1];return el;});
}
const canvas=createCanvas(1100,650);
// Native canvas accepts a missing ellipse argument that Chrome rejects. Enforce
// the browser contract so the v0.5 freeze cannot silently pass again.
const nativeContext=canvas.getContext('2d');
const minArgs={ellipse:7,arc:5,arcTo:5};
const strictContext=new Proxy(nativeContext,{get(target,key){
 const value=target[key];
 if(typeof value!=='function')return value;
 return (...args)=>{
  if(minArgs[key]){
   if(args.length<minArgs[key])throw new TypeError(`${key} requires ${minArgs[key]} arguments; got ${args.length}`);
   for(const v of args.slice(0,minArgs[key]))assert.ok(Number.isFinite(v),`${key}: non-finite coordinate`);
  }
  return value.apply(target,args);
 };
},set(target,key,value){target[key]=value;return true;}});
canvas.getContext=()=>strictContext;canvas.addEventListener=(n,f)=>events.push([n,f]);canvas.getBoundingClientRect=()=>({left:10,top:20,width:550,height:325});elements.set('#gameCanvas',canvas);
class LocalImage extends Image {set src(v){const bytes=fs.readFileSync(path.join(root,v));if(!bytes.length)throw new Error('Empty image: '+v);super.src=bytes;}get src(){return super.src;}}
const storage=new Map();let nextTimer=0;
const sandbox={console:{warn:(...v)=>warnings.push(v.join(' ')),log:console.log},document:{querySelector:get,querySelectorAll:queryButtons,addEventListener:()=>{}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},Image:LocalImage,performance:{now:()=>0},requestAnimationFrame:()=>{},setTimeout:()=>++nextTimer,clearTimeout:()=>{},Math:Object.create(Math)};
sandbox.Math.random=()=>.4;sandbox.window=sandbox;sandbox.addEventListener=()=>{};
vm.createContext(sandbox);
for(const file of ['data/game-data.js','data/sprite-data.js','data/sprite-metrics.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
let source=fs.readFileSync(process.env.GAME_SOURCE||path.join(root,'js/game.js'),'utf8');
source=source.replace('  // ---------- init ----------',`  window.TEST={state,images,startLevel,spawnEnemy,placeUnit,cellFromPointer,applyDamage,updateUnits,updateEnemies,updateEffects,updateWaveSystem,updateMetabolism,useAbility,activateAntibody,draw,drawSprite,fallbackAsset,preload,frame,togglePause:typeof togglePause==='function'?togglePause:null,handleCanvasPointer,getUnlocked,getQuiz,unlockThrough,saveQuiz,handleGameKey,handleUnitDrop,setUnitDock,chooseAntibody,updateHUD,winLevel,loseLevel,GRID};\n  // ---------- init ----------`);
vm.runInContext(source,sandbox);
const T=sandbox.TEST,S=sandbox.IMMUNO_SPRITES,D=sandbox.IMMUNO_DATA,checks=[];
function check(name,fn){fn();checks.push(name);}
function reset(level=5){T.startLevel(level);T.state.running=true;T.state.paused=false;T.state.energy=10000;T.state.intermissionUntil=999999;T.state.waveIndex=-1;get('#modal').classList.add('hidden');}
function place(type,row,col){T.state.selectedUnit=type;T.placeUnit(row,col);return T.state.units.at(-1);}
function enemy(type,row,x){T.spawnEnemy(type,row);let e=T.state.enemies.at(-1);e.x=x;return e;}
function snapshot(name){T.draw();fs.writeFileSync(path.join(out,name),canvas.toBuffer('image/png'));}
const keepAlive=setInterval(()=>{},100);
(async()=>{
 await T.preload();assert.equal(warnings.length,0,warnings.join('\n'));
 check('Loading reaches 100 percent and touch start enters menu before mission selection',()=>{
  assert.equal(get('#loadingProgress').value,100);assert.equal(get('#touchStartBtn').disabled,false);assert.ok(get('#loadingPanel').classList.contains('loaded'));
  const music={scene:'menu',paused:false,unlocked:false,setScene(v){this.scene=v},setPaused(v){this.paused=v},unlock(){this.unlocked=true}};sandbox.IMMUNO_MUSIC=music;
  get('#touchStartBtn').click();assert.equal(music.unlocked,true);assert.ok(get('#startScreen').classList.contains('active'));
  get('#startBtn').click();assert.ok(get('#levelScreen').classList.contains('active'));
 });
 check('Every referenced image decoded',()=>{for(const kind of ['characters','enemies'])for(const m of Object.values(S[kind]))for(const src of Object.values(m.frames))assert.ok(T.images[src],src);});
 check('Placed actors and first enemy render without stopping the loop',()=>{reset(1);place('rbc',0,0);enemy('coccus',0,900);T.draw();});
 check('All five levels render with their own backgrounds',()=>{for(let id=1;id<=5;id++){reset(id);assert.ok(T.images[D.levels[id-1].background]);T.draw();}});
 check('Pointer maps correctly at half scale and letterboxed ratio',()=>{let c=T.cellFromPointer({clientX:10+168*.5,clientY:20+146*.5});assert.equal(c.c,0);assert.equal(c.r,0);canvas.getBoundingClientRect=()=>({left:0,top:0,width:550,height:500});c=T.cellFromPointer({clientX:84,clientY:87.5+73});assert.equal(c.c,0);assert.equal(c.r,0);assert.equal(T.cellFromPointer({clientX:84,clientY:10}),null);});
 check('Placement charges once and prevents occupied tile placement',()=>{reset(1);T.state.energy=260;place('rbc',0,0);assert.equal(T.state.energy,210);place('rbc',0,0);assert.equal(T.state.units.length,1);assert.equal(T.state.energy,210);T.state.paused=true;place('neutrophil',0,1);assert.equal(T.state.units.length,1);});
 check('Production and support heal trigger their matching poses/effects',()=>{reset();const r=place('rbc',0,0),p=place('plasma',0,1);r.hp-=40;r.resourceTimer=4;p.resourceTimer=5;let oxygen=T.state.oxygen,nutrient=T.state.nutrient;T.updateUnits(.01);assert.equal(T.state.oxygen,oxygen+27);assert.equal(T.state.nutrient,nutrient+16);assert.equal(r.hp,r.maxHp-26);assert.ok(p.actionUntil>T.state.elapsed);assert.ok(T.state.effects.some(e=>e.name==='healing'));});
 check('Projectile applies damage on arrival, not launch',()=>{reset();const u=place('nk_cell',1,2),e=enemy('free_virus',1,u.x+130),hp=e.hp;T.updateUnits(.01);assert.equal(e.hp,hp);assert.equal(T.state.projectiles.length,1);T.updateEffects(.25);assert.ok(e.hp<hp);assert.ok(e.hurtUntil>T.state.elapsed);});
 check('Dead enemies cannot attack or summon; reward and defeat sprite occur once',()=>{reset();const u=place('platelet',0,3),e=enemy('boss_bacterial_colony',0,u.x+30);e.hp=0;e.summonTimer=0;let hp=u.hp,energy=T.state.energy;T.updateEnemies(.1);assert.equal(u.hp,hp);assert.equal(T.state.enemies.length,0);assert.equal(T.state.energy,energy+D.enemies[e.type].reward);assert.ok(T.state.effects.some(v=>v.type==='fallen'));T.updateEnemies(.1);assert.equal(T.state.energy,energy+D.enemies[e.type].reward);});
 check('Ranged toxin attack respects its reach and uses toxin VFX',()=>{reset();const u=place('platelet',0,2),e=enemy('toxin_bacteria',0,u.x+120);T.updateEnemies(.01);assert.ok(u.hp<u.maxHp);assert.ok(T.state.effects.some(v=>v.name==='toxin'));});
 check('Antibody activation is blocked during pause and applies after resume',()=>{reset();T.state.antigenSamples.circle=3;T.state.signal=30;const e=enemy('coccus',0,800);T.state.paused=true;T.activateAntibody('circle');assert.equal(T.state.signal,30);T.state.paused=false;T.activateAntibody('circle');assert.equal(T.state.signal,15);assert.ok(e.taggedUntil>T.state.elapsed);});
 check('All abilities execute; full lane cancels clot without overlap',()=>{reset();for(let c=0;c<9;c++)place('platelet',0,c);enemy('coccus',0,1000);T.useAbility('clot');assert.equal(T.state.barriers.length,0);assert.equal(T.state.cooldowns.clot,T.state.elapsed);reset();let e=enemy('coccus',0,700);e.taggedUntil=100;T.state.signal=100;for(const k of Object.keys(D.abilities))T.useAbility(k);assert.equal(T.state.barriers.length,1);assert.ok(T.state.buffs.cytokineUntil>0);assert.ok(T.state.buffs.feverUntil>0);assert.ok(T.state.buffs.inflammationUntil>0);assert.ok(T.state.effects.some(v=>v.type==='supportCameo'));T.draw();});
 check('Pause freezes simulation; restart resets speed and pause icon',()=>{reset();T.state.paused=true;const t=T.state.elapsed;T.frame(50);assert.equal(T.state.elapsed,t);get('#pauseBtn img').src='assets/ui/play.webp';T.startLevel(1);assert.equal(T.state.speed,1);assert.equal(get('#pauseBtn img').src,'assets/ui/pause.webp');});
 check('Invalid or blocked browser storage does not stop play or unlocks',()=>{
  storage.set('immunofrontUnlocked','invalid');storage.set('immunofrontQuiz','null');assert.equal(T.getUnlocked(),1);assert.deepEqual(Object.keys(T.getQuiz()),[]);
  const good=sandbox.localStorage;sandbox.localStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
  T.unlockThrough(3);assert.equal(T.getUnlocked(),3);T.saveQuiz(2,true);assert.equal(T.getQuiz()[2],true);T.startLevel(1);
  sandbox.localStorage=good;storage.clear();
 });
 check('Each level can complete waves and unlock the next level',()=>{for(let id=1;id<=5;id++){reset(id);T.state.waveIndex=D.levels[id-1].waves.length-1;T.state.waveActive=true;T.state.enemies=[];T.state.spawnQueue=[];T.updateWaveSystem();assert.equal(T.state.levelWon,true);assert.equal(T.state.running,false);T.draw();}assert.equal(storage.get('immunofrontUnlocked'),'5');});
 check('Every actor pose renders with strict Canvas signatures',()=>{
  reset();for(const kind of ['characters','enemies'])for(const [type,m] of Object.entries(S[kind]))for(const pose of Object.keys(m.frames))T.drawSprite(kind,type,pose,300,300);
  for(const m of Object.values(S.effects))for(const p of m.frames)assert.equal(T.images[p].width,256);
 });
 check('Missing action sprite uses idle, then portrait, then visible placeholder',()=>{
  const frames=S.characters.rbc.frames,base=D.units.rbc.asset;
  const saved=[frames.action,frames.idle,base].map(src=>[src,T.images[src]]);
  delete T.images[frames.action];assert.equal(T.fallbackAsset('characters','rbc','action'),frames.idle);T.drawSprite('characters','rbc','action',300,300);
  delete T.images[frames.idle];assert.equal(T.fallbackAsset('characters','rbc','action'),base);T.drawSprite('characters','rbc','action',300,300);
  delete T.images[base];assert.equal(T.fallbackAsset('characters','rbc','action'),undefined);T.drawSprite('characters','rbc','action',300,300);
  for(const [src,img]of saved)T.images[src]=img;
 });
 check('Pause cannot activate before begin or after victory',()=>{
  T.startLevel(1);T.togglePause();assert.equal(T.state.paused,false);
  get('#beginLevelBtn').onclick();T.togglePause();assert.equal(T.state.paused,true);T.togglePause();assert.equal(T.state.paused,false);
  T.state.running=false;T.togglePause();assert.equal(T.state.paused,false);
 });
 check('Secondary pointer, off-board input and locked abilities do not spend resources',()=>{
  reset(1);const energy=T.state.energy;T.state.selectedUnit='rbc';
  T.handleCanvasPointer({button:2});T.handleCanvasPointer({isPrimary:false});
  T.placeUnit(-1,0);T.placeUnit(0,9);T.placeUnit(NaN,0);assert.equal(T.state.energy,energy);assert.equal(T.state.units.length,0);
  T.useAbility('inflammation');assert.equal(T.state.tissue,100);assert.equal(T.state.cooldowns.inflammation,undefined);
 });
 check('Fixed simulation advances equally at 30 and 60 render frames per second',()=>{
  function run(fps,speed){reset();T.state.lastFrame=0;T.state.speed=speed;place('rbc',0,0);place('neutrophil',0,3);enemy('coccus',0,800);
   for(let i=1;i<=fps*10;i++)T.frame(i*1000/fps);
   return {elapsed:T.state.elapsed,energy:T.state.energy,hp:T.state.enemies.map(e=>e.hp),x:T.state.enemies.map(e=>e.x)};
  }
  for(const speed of [1,2]){const a=run(30,speed),b=run(60,speed);assert.ok(Math.abs(a.elapsed-b.elapsed)<1e-7);assert.equal(a.energy,b.energy);assert.deepEqual(a.hp,b.hp);assert.deepEqual(a.x,b.x);}
 });
 check('Hidden game screen does not advance combat',()=>{
  reset();get('#gameScreen').classList.remove('active');const elapsed=T.state.elapsed;T.frame(50);assert.equal(T.state.elapsed,elapsed);get('#gameScreen').classList.add('active');
 });
 check('All four gun units fire before applying damage',()=>{
  for(const type of ['neutrophil','macrophage','nk_cell','cytotoxic_t']){
   reset();const u=place(type,1,2),e=enemy('coccus',1,u.x+140),hp=e.hp;
   T.updateUnits(.01);assert.equal(e.hp,hp,type);assert.equal(T.state.projectiles.length,1,type);assert.equal(T.state.projectiles[0].source,type);assert.ok(T.state.effects.some(v=>v.type==='muzzle'));
   T.updateEffects(.23);assert.ok(e.hp<hp,type);assert.equal(T.state.projectiles.length,0);
  }
 });
 check('Both antibody weapons tag on impact instead of instantly',()=>{
  for(const type of ['b_cell','memory_b']){reset();const u=place(type,0,0),e=enemy('coccus',0,700);T.state.antigenSamples.circle=3;u.resourceTimer=7;
   T.updateUnits(.01);assert.equal(e.taggedUntil,0);assert.equal(T.state.projectiles[0].source,type);T.updateEffects(.3);assert.ok(e.taggedUntil>T.state.elapsed);
  }
 });
 check('Erythrocyte oxygen bubbles precede production and releases energy exactly once',()=>{
  reset();const u=place('rbc',0,0);u.resourceTimer=3.1;const energy=T.state.energy;
  T.updateUnits(.01);assert.ok(u.actionUntil>T.state.elapsed);assert.equal(T.state.energy,energy);
  u.resourceTimer=3.99;T.updateUnits(.02);assert.equal(T.state.energy,energy+18);assert.ok(T.state.effects.some(v=>v.type==='chargeRelease'));
  T.updateUnits(.01);assert.equal(T.state.energy,energy+18);
 });
 check('All 12 heroes have four decoded poses and shared stable anchors',()=>{
  const metrics=JSON.parse(fs.readFileSync(path.join(root,'assets/sprite-anchor-overrides.json'),'utf8'));
  assert.equal(Object.keys(S.characters).length,12);
  for(const [name,hero]of Object.entries(S.characters)){
   const idle=metrics[hero.frames.idle];assert.ok(idle,name);assert.equal(Object.keys(hero.frames).length,4);
   for(const src of Object.values(hero.frames)){assert.ok(T.images[src],src);assert.equal(T.images[src].width,256);assert.equal(metrics[src].centerX,idle.centerX);assert.equal(metrics[src].bottomY,idle.bottomY);assert.equal(metrics[src].contentH,idle.contentH);}
  }
 });
 check('ESC and Space open and close full pause UI and freeze placement',()=>{
  reset();let prevented=0;const energy=T.state.energy;
  T.handleGameKey({code:'Escape',key:'Escape',preventDefault(){prevented++}});
  assert.equal(T.state.paused,true);assert.equal(get('#pauseOverlay').classList.contains('hidden'),false);assert.equal(get('#gameLiveHUD').inert,true);
  place('rbc',0,0);assert.equal(T.state.energy,energy);T.useAbility('oxygen');assert.equal(T.state.cooldowns.oxygen,undefined);
  T.handleGameKey({code:'Space',key:' ',preventDefault(){prevented++}});assert.equal(T.state.paused,false);assert.equal(get('#pauseOverlay').classList.contains('hidden'),true);assert.equal(get('#gameLiveHUD').inert,false);assert.equal(prevented,2);
 });
 check('ESC respects mission modal, repeat keys and volume-input focus',()=>{
  T.startLevel(1);T.handleGameKey({code:'Escape',key:'Escape',preventDefault(){}});assert.equal(T.state.paused,false);
  reset();T.handleGameKey({code:'Escape',repeat:true,preventDefault(){}});assert.equal(T.state.paused,false);
  T.handleGameKey({code:'Escape',target:{tagName:'INPUT'},preventDefault(){}});assert.equal(T.state.paused,true);
  T.handleGameKey({code:'Space',target:{tagName:'INPUT'},preventDefault(){}});assert.equal(T.state.paused,true);T.togglePause();
 });
 check('Unit dock toggles and mouse drop uses normal placement cost exactly once',()=>{
  reset(1);T.state.energy=260;assert.equal(get('#unitCards').hidden,false);assert.equal(get('#unitToggleBtn')['aria-expanded'],'true');T.setUnitDock(true);assert.equal(get('#unitCards').hidden,false);T.setUnitDock(false);assert.equal(get('#unitCards').hidden,true);
  canvas.getBoundingClientRect=()=>({left:0,top:0,width:1100,height:650});
  const drop={clientX:168,clientY:146,dataTransfer:{getData:()=> 'rbc'},preventDefault(){}};
  T.handleUnitDrop(drop);assert.equal(T.state.units.length,1);assert.equal(T.state.energy,210);assert.equal(get('#unitCards').hidden,true);
  T.handleUnitDrop(drop);assert.equal(T.state.units.length,1);assert.equal(T.state.energy,210);
  T.setUnitDock(true);T.handleUnitDrop({...drop,clientX:368});assert.equal(T.state.units.length,2);assert.equal(get('#unitCards').hidden,false);
  T.togglePause();T.handleUnitDrop({...drop,clientX:268});assert.equal(T.state.units.length,2);T.togglePause();
 });
 check('Tap placement maps all 45 cells on wide, portrait and landscape viewports',()=>{
  for(const [width,height] of [[1920,1080],[2560,1080],[1366,768],[390,844],[844,390],[320,568]]){
   canvas.getBoundingClientRect=()=>({left:0,top:0,width,height});const scale=Math.min(width/1100,height/650),ox=(width-1100*scale)/2,oy=(height-650*scale)/2;
   for(let r=0;r<5;r++)for(let c=0;c<9;c++){const p=T.cellFromPointer({clientX:ox+(168+c*100)*scale,clientY:oy+(146+r*100)*scale});assert.equal(p.r,r);assert.equal(p.c,c);}
  }
  reset(1);canvas.getBoundingClientRect=()=>({left:0,top:0,width:390,height:844});T.state.energy=260;const scale=390/1100,oy=(844-650*scale)/2;
  T.handleCanvasPointer({clientX:168*scale,clientY:oy+146*scale,button:0,isPrimary:true,cancelable:true,preventDefault(){}});assert.equal(T.state.units.length,1);assert.equal(T.state.energy,210);
 });
 check('Antibody selected in pause resumes and spends signal once; invalid choice stays paused',()=>{
  reset();const e=enemy('coccus',0,700);T.state.signal=30;T.togglePause();T.chooseAntibody('circle');assert.equal(T.state.paused,true);assert.equal(T.state.signal,30);
  T.state.antigenSamples.circle=3;T.chooseAntibody('circle');assert.equal(T.state.paused,false);assert.equal(T.state.signal,15);assert.ok(e.taggedUntil>T.state.elapsed);
 });
 check('Restart and home dismiss pause UI without leaving live HUD inert',()=>{
  reset();T.togglePause();get('#restartBtn').click();assert.equal(T.state.paused,false);assert.equal(T.state.running,false);assert.equal(get('#pauseOverlay').classList.contains('hidden'),true);assert.equal(get('#gameLiveHUD').inert,false);
  reset();T.togglePause();get('#homeBtn').click();assert.equal(T.state.running,false);assert.equal(T.state.paused,false);assert.equal(get('#pauseOverlay').classList.contains('hidden'),true);assert.equal(get('#gameLiveHUD').inert,false);
 });
 check('Rendered unit-card click then arena tap places selected unit normally',()=>{
  reset(1);T.state.energy=260;get('#unitCards').scrollLeft=160;const card=queryButtons('.unit-card').find(b=>b.dataset.unit==='neutrophil');assert.ok(card);card.click();assert.equal(T.state.selectedUnit,'neutrophil');assert.equal(T.state.energy,260);assert.equal(get('#unitCards').hidden,false);assert.equal(get('#unitCards').scrollLeft,160);assert.match(get('#unitCards').innerHTML,/data-unit="neutrophil" aria-pressed="true"/);
  canvas.getBoundingClientRect=()=>({left:0,top:0,width:1100,height:650});T.handleCanvasPointer({clientX:268,clientY:146,button:0,cancelable:true,preventDefault(){}});
  assert.equal(T.state.units[0].type,'neutrophil');assert.equal(T.state.energy,160);
 });
 check('Rendered ability button works live and remains blocked during pause',()=>{
  reset(1);const ability=queryButtons('.ability-btn').find(b=>b.dataset.ability==='oxygen');assert.ok(ability);ability.click();assert.ok(T.state.buffs.oxygenUntil>T.state.elapsed);
  reset(1);T.togglePause();queryButtons('.ability-btn').find(b=>b.dataset.ability==='oxygen').click();assert.equal(T.state.buffs.oxygenUntil,0);T.togglePause();
 });
 check('Real mission buttons route music from briefing through combat, boss and pause',()=>{
  const music=sandbox.IMMUNO_MUSIC;T.startLevel(5);assert.equal(music.scene,'menu');get('#beginLevelBtn').click();assert.equal(music.scene,'battle');
  const boss=enemy('boss_capsule_titan',0,900);assert.equal(music.scene,'boss');T.togglePause();assert.equal(music.paused,true);T.togglePause();assert.equal(music.paused,false);
  boss.dead=true;T.updateHUD();assert.equal(music.scene,'battle');T.winLevel();assert.equal(music.scene,'menu');
  T.startLevel(1);get('#beginLevelBtn').click();T.loseLevel();assert.equal(music.scene,'menu');
  get('#loseLevels').click();assert.ok(get('#levelScreen').classList.contains('active'));storage.clear();
 });
 // A representative in-engine frame, with real rendering and varied unit states.
 reset(5);
 const layout=[['rbc','plasma','neutrophil','platelet'],['rbc','dendritic','nk_cell','macrophage'],['rbc','helper_t','cytotoxic_t','platelet'],['rbc','b_cell','memory_b','neutrophil'],['rbc','plasma','macrophage','platelet']];
 layout.forEach((row,r)=>row.forEach((type,c)=>place(type,r,c===3?5:c)));
 ['coccus','free_virus','shielded_virus','bacillus','boss_capsule_titan'].forEach((type,r)=>enemy(type,r,870-r*15));
 T.state.elapsed=5;T.state.effects=[];T.state.selectedPlacedId=null;T.state.units[0].actionUntil=6;T.state.units[0].resourceTimer=3.5;T.state.units[2].actionUntil=6;T.state.units[10].actionUntil=6;T.state.units[5].actionUntil=6;T.state.units[1].actionUntil=6;T.state.enemies[1].hurtUntil=6;T.state.enemies[2].shield=100;T.state.enemies[2].taggedUntil=10;
 T.state.projectiles.push({x:420,y:346,targetX:750,targetY:346,life:.12,maxLife:.22,item:'energy'});
 snapshot('preview-game-v0.9.png');
 // Simulate four minutes across all levels with ordinary damage and waves.
 check('Five seeded 45-second combat simulations remain numerically valid',()=>{for(let level=1;level<=5;level++){reset(level);T.state.intermissionUntil=0;for(let r=0;r<5;r++){place('rbc',r,0);place('neutrophil',r,3);place('platelet',r,5);}for(let i=0;i<900&&T.state.running;i++){let dt=.05;T.state.elapsed+=dt;T.updateEffects(dt);T.updateUnits(dt);T.updateEnemies(dt);if(T.state.running){T.updateWaveSystem();T.updateMetabolism(dt);}}assert.ok(Number.isFinite(T.state.energy));assert.ok(Number.isFinite(T.state.tissue));assert.ok(T.state.tissue>=0);T.draw();}});
 const report={passed:checks.length,checks,preloadedImages:Object.keys(T.images).length,browserTest:false,note:'Logic and actual canvas rendering tested using native canvas and a minimal DOM adapter. Strict browser Canvas argument checks included. Interactive browser test blocked by local-file access policy; no browser FPS or mobile-device claim.'};
 fs.writeFileSync(path.join(out,'TEST_REPORT_v0.9.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>clearInterval(keepAlive));
