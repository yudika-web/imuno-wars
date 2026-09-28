// Run with Node.js, linkedom and @napi-rs/canvas installed. No browser required.
// Test-only instrumentation runs in an isolated VM; production game has no debug API.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const {parseHTML}=require('linkedom'),{createCanvas,Image}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),results=[];
function ok(name,fn){fn();results.push({name,status:'passed'});}
async function boot(store=new Map(),blocked=false){
 const {window,document}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8'));
 const board=createCanvas(1100,650),canvas=document.querySelector('#gameCanvas');canvas.getContext=()=>board.getContext('2d');canvas.width=1100;canvas.height=650;
 const create=document.createElement.bind(document);document.createElement=tag=>tag==='canvas'?createCanvas(128,128):create(tag);
 const failures=[];class LocalImage extends Image{set src(src){try{super.src=src.startsWith('data:')?Buffer.from(src.split(',')[1],'base64'):fs.readFileSync(path.join(root,src));}catch(e){failures.push(src);this.onerror?.(e);}}}
 const localStorage={getItem(k){if(blocked)throw Error('blocked');return store.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');store.set(k,String(v));},removeItem(k){if(blocked)throw Error('blocked');store.delete(k);}};
 const audio={volume:.55,muted:false,play(){},stopAll(){},setPaused(){},setScene(){},unlock(){return Promise.resolve();},setVolume(){},setMuted(){}};
 window.IMMUNO_SOUND=audio;window.IMMUNO_MUSIC=audio;
 const sandbox={window,document,localStorage,Image:LocalImage,performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},console,Map,Set,Math};
 const context=vm.createContext(sandbox);
 for(const f of ['data/game-data.js','data/sprite-data.js','data/sprite-metrics.js','js/campaign.js','js/progression.js','js/settings.js','js/game.js']){
  let code=fs.readFileSync(path.join(root,f),'utf8');
  if(f==='js/game.js')code=code.replace('// ---------- init ----------',`window.__test={state,startLevel,placeUnit,spawnEnemy,updateUnits,updateEnemies,updateEffects,updateWaveSystem,beginWave,winLevel,useAbility,damageMultiplierAgainst,draw,renderDatabook,renderUpgrades,renderLevelSelect,showScreen,confirmReset,togglePause};\n// ---------- init ----------`);
  vm.runInContext(code,context,{filename:f});
 }
 for(let i=0;i<10;i++)await new Promise(r=>setImmediate(r));
 assert.equal(failures.length,0,'all image references load');
 return {window,document,store,board,t:window.__test,p:window.IMMUNO_PROGRESS,d:window.IMMUNO_DATA};
}
(async()=>{
 const b=await boot(),{d,p,t,document}=b;
 ok('50 compatible levels; 17 units; 31 enemy types; milestones and four-pose fallback',()=>{
  assert.equal(d.levels.length,50);assert.equal(Object.keys(d.units).length,17);assert.equal(Object.keys(d.enemies).length,31);
  for(let i=0;i<50;i++){const l=d.levels[i];assert.equal(l.id,i+1);for(const k of ['title','subtitle','background','startEnergy','startOxygen','startNutrient','startSignal','wounds','infectedTiles','waves','facts','quiz'])assert(k in l);assert(l.quiz.answer>=0&&l.quiz.answer<l.quiz.options.length);for(const wave of l.waves)for(const g of wave){assert(d.enemies[g.type]);assert(g.count>0&&g.gap>0);}assert(l.waves.at(-1).some(g=>d.enemies[g.type].boss));}
  for(const k of ['mast_cell','interferon','eosinophil','basophil','treg'])assert.equal(Object.keys(b.window.IMMUNO_SPRITES.characters[k].frames).length,4);
  for(let id=10;id<=50;id+=10){assert.equal(d.levels[id-1].waves.at(-1)[0].type,'boss_chapter_'+id/10);if(id>10)assert(d.enemies['boss_chapter_'+id/10].hp>d.enemies['boss_chapter_'+(id/10-1)].hp);}
 });
 ok('Initial locks and Databook prevent premature discoveries',()=>{
  assert.equal(p.save.unlockedLevel,1);assert.equal(p.save.databookSeenCharacters.length,3);t.renderDatabook();assert.equal(document.querySelectorAll('#databookGrid .unseen').length,14);assert.equal(p.save.databookSeenEnemies.length,0);t.startLevel(50);assert.equal(t.state.level,null);
 });
 // Exercise real wave queue and victory plumbing with scripted damage, not a balance playthrough.
 ok('All 50 levels progress sequentially through real spawn/wave/victory functions',()=>{
  for(let id=1;id<=50;id++){
   t.startLevel(id);document.querySelector('#beginLevelBtn').onclick();
   for(let w=0;w<d.levels[id-1].waves.length;w++){
    t.beginWave(w);t.state.elapsed=t.state.spawnQueue.at(-1).time+.01;t.updateWaveSystem();assert(t.state.enemies.length>0);
    for(const e of t.state.enemies)e.hp=0;t.updateEnemies(0);t.updateWaveSystem();
   }
   assert(t.state.levelWon);assert.equal(p.save.unlockedLevel,Math.min(50,id+1));assert.equal(p.save.levelStars[id],3);
   const research=p.save.researchPoints;t.winLevel();assert.equal(p.save.researchPoints,research,'no duplicate victory payment');
  }
  assert.equal(Object.keys(p.save.levelStars).length,50);assert.equal(p.save.databookSeenEnemies.length,31);assert.equal(p.save.databookSeenCharacters.length,17);
 });
 const reloaded=await boot(b.store);
 ok('Reload retains unlocks, Riset, stars, scores and discoveries',()=>{assert.equal(JSON.stringify(reloaded.p.save),JSON.stringify(p.save));});
 ok('Upgrade cost, tier cap and immutable base stats',()=>{
  const base=JSON.stringify(d.units.neutrophil),before=p.save.researchPoints;
  for(let i=0;i<4;i++)assert(p.buy('neutrophil'));
  assert.equal(p.tier('neutrophil'),5);assert(!p.buy('neutrophil'));assert.equal(before-p.save.researchPoints,350);assert.equal(JSON.stringify(d.units.neutrophil),base);
  t.startLevel(50);document.querySelector('#beginLevelBtn').onclick();t.state.energy=10000;t.state.selectedUnit='neutrophil';assert(t.placeUnit(0,1));assert.equal(t.state.units[0].maxHp,p.stats('neutrophil').hp);assert(t.state.units[0].stats.damage>d.units.neutrophil.damage);
  t.spawnEnemy('coccus',0);let e=t.state.enemies[0];e.x=t.state.units[0].x+120;t.updateUnits(.1);t.updateEffects(.3);assert(e.hp<e.maxHp);
 });
 const upgradedReload=await boot(b.store);
 ok('Purchased upgrades persist after reload',()=>{assert.equal(upgradedReload.p.tier('neutrophil'),5);assert.equal(upgradedReload.p.save.researchPoints,p.save.researchPoints);});
 ok('Complement and five new roles affect combat',()=>{
  t.state.units=[];t.state.enemies=[];t.state.projectiles=[];t.state.energy=20000;
  const keys=['complement','mast_cell','interferon','eosinophil','basophil','treg'];
  keys.forEach((k,i)=>{t.state.selectedUnit=k;assert(t.placeUnit(i%5,i<5?2:3));});
  const cmp=t.state.units[0];t.spawnEnemy('helminth',0);let target=t.state.enemies[0];target.x=cmp.x+90;
  const plain=t.damageMultiplierAgainst(target,'complement');target.taggedUntil=t.state.elapsed+20;assert(t.damageMultiplierAgainst(target,'complement')>plain*2);
  assert(t.damageMultiplierAgainst(target,'eosinophil')>t.damageMultiplierAgainst(target,'neutrophil'));
  t.spawnEnemy('coccus',1);t.state.enemies.at(-1).x=t.state.units[1].x+110;
  t.spawnEnemy('coccus',4);t.state.enemies.at(-1).x=t.state.units[4].x+110;
  for(const u of t.state.units)u.resourceTimer=10;
  t.updateUnits(.1);assert(t.state.enemies[1].slowUntil>t.state.elapsed);assert(t.state.enemies[2].slowUntil>t.state.elapsed);assert(t.state.units[2].resistanceUntil>t.state.elapsed);
  const slowTarget=t.state.enemies[2],beforeX=slowTarget.x;t.updateEnemies(.1);assert(Math.abs((beforeX-slowTarget.x)-d.enemies.coccus.speed*.65*.1)<.001);
  t.spawnEnemy('coccus',2);const protectedUnit=t.state.units[2],attacker=t.state.enemies.at(-1);attacker.x=protectedUnit.x+30;const beforeHP=protectedUnit.hp;t.updateEnemies(0);assert(Math.abs((beforeHP-protectedUnit.hp)-d.enemies.coccus.damage*t.state.level.enemyDamageScale*.72)<.001);
  const hp=t.state.tissue;t.useAbility('inflammation');assert.equal(hp-t.state.tissue,3);
  t.draw();fs.writeFileSync(path.join(root,'docs/preview-canvas-v1.png'),b.board.toBuffer('image/png'));
 });
 ok('Databook, chapter grid and upgrade UI render full content',()=>{
  t.renderDatabook();assert.equal(document.querySelectorAll('#databookGrid .unseen').length,0);
  document.querySelector('[data-book-tab="enemies"]').onclick();assert.equal(document.querySelectorAll('#databookGrid .archive-card').length,31);
  t.renderUpgrades();assert.equal(document.querySelectorAll('[data-buy]').length,17);t.renderLevelSelect();assert.equal(document.querySelectorAll('.level-card').length,10);assert.equal(document.querySelectorAll('.chapter-tab').length,5);
 });
 ok('Reset requires two confirmations; cancel preserves data; final confirmation clears all progress',()=>{
  const prior=JSON.stringify(p.save);t.confirmReset();document.querySelector('#cancelReset').onclick();assert.equal(JSON.stringify(p.save),prior);
  t.confirmReset();document.querySelector('#confirmReset').onclick();assert.equal(JSON.stringify(p.save),prior);document.querySelector('#confirmReset').onclick();assert.equal(p.save.unlockedLevel,1);assert.equal(p.save.researchPoints,0);assert.equal(Object.keys(p.save.unitUpgrades).length,0);assert.equal(p.save.databookSeenEnemies.length,0);assert.equal(t.state.units.length,0);assert(document.querySelector('#startScreen').classList.contains('active'));
 });
 const resetReload=await boot(b.store);ok('Reset survives reload',()=>assert.equal(resetReload.p.save.unlockedLevel,1));
 const legacyStore=new Map([['immunofrontUnlocked','5'],['immunofrontQuiz','{"1":true,"2":false}']]);
 const migrated=await boot(legacyStore);ok('Legacy unlock and quiz migration',()=>{assert.equal(migrated.p.save.unlockedLevel,5);assert.equal(migrated.p.save.quizAnswers[1],true);assert.equal(migrated.p.save.quizAnswers[2],false);migrated.p.reset();});
 const migratedReset=await boot(legacyStore);ok('Reset cannot resurrect legacy save',()=>assert.equal(migratedReset.p.save.unlockedLevel,1));
 const blocked=await boot(new Map(),true);ok('Unavailable storage keeps session progress and shows message',()=>{blocked.p.complete(1,90,100);blocked.t.renderLevelSelect();assert.equal(blocked.p.save.unlockedLevel,2);assert.match(blocked.document.querySelector('#saveStatus').textContent,/selama sesi ini/);blocked.p.reset();assert.equal(blocked.p.save.unlockedLevel,1);});
 const invalid=await boot(new Map([['imunowarsSave','{"unlockedLevel":999,"researchPoints":-5,"unitUpgrades":{"rbc":100},"databookSeenEnemies":["unknown"]}']]));
 ok('Malformed and out-of-range save fields are normalized',()=>{assert.equal(invalid.p.save.unlockedLevel,50);assert.equal(invalid.p.save.researchPoints,0);assert.equal(invalid.p.tier('rbc'),5);assert.equal(invalid.p.save.databookSeenEnemies.length,0);assert(!invalid.p.buy('neutrophil'));});
 const report={version:'1.0.0',environment:'Node VM + linkedom DOM + native Canvas; browser layout not verified',tests:results,limitations:['Sequential completion uses scripted lethal damage to verify transitions, not 50 human balance playthroughs.','CSS responsive layout and audio playback require a real browser device test.']};
 fs.writeFileSync(path.join(root,'docs/TEST_REPORT_v1.0.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
