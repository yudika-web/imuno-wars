(() => {
  'use strict';
  const D=window.IMMUNO_DATA;
  // Deterministic generator: authored levels 1–5 are preserved byte-for-byte in content.
  function generateCampaign(){
    const originals=D.levels.slice(0,5);
    for(let id=6;id<=50;id++){
      const chapter=D.chapters[Math.floor((id-1)/10)],step=(id-1)%10;
      const pool=chapter.pool.filter(k=>(D.enemies[k].firstLevel||1)<=id);
      const regular=['boss_bacterial_colony','boss_capsule_titan','boss_virus_factory','boss_variant','boss_biofilm_colossus','boss_viral_core'];
      const count=5+Math.floor((id-6)/10),waves=[];
      for(let w=0;w<3;w++)waves.push([{type:pool[(step+w)%pool.length],count:count+w,gap:Math.max(.95,1.8-(id-6)*.012)},{type:pool[(step+w+1)%pool.length],count:3+Math.floor(step/4),gap:1.5}]);
      waves.push([{type:regular[(id-6)%regular.length],count:1,gap:1}]);
      const base=originals[chapter.id-1],authored=D.milestones[id];
      const level={id,title:`${chapter.name} ${step+1}`,subtitle:chapter.theme,background:base.background,
        startEnergy:470+chapter.id*30+step*5,startOxygen:60,startNutrient:45,startSignal:30,
        wounds:chapter.id===1?[{r:1,c:7},{r:3,c:7}]:[],infectedTiles:chapter.id===3?[{r:2,c:7}]:[],
        waves,facts:[chapter.fact,chapter.theme],quiz:JSON.parse(JSON.stringify(chapter.quiz)),
        chapter:chapter.id,hint:chapter.theme,enemyHpScale:1+(id-6)*.009,enemyDamageScale:1+(id-6)*.004};
      if(authored)Object.assign(level,JSON.parse(JSON.stringify(authored)));
      D.levels.push(level);
    }
  }
  generateCampaign();
  // Explicit Canvas fallback, with four poses; no missing image requests.
  function primitive(u,pose){
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    const action=pose==='action',hurt=pose==='hurt',victory=pose==='victory';
    g.strokeStyle=u.color;g.lineWidth=4;
    if(action||victory){g.beginPath();g.arc(64,62,53,0,Math.PI*2);g.stroke();}
    g.fillStyle=hurt?'#f08096':u.color;g.beginPath();g.ellipse(64,67,39,hurt?32:40,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#17334d';g.stroke();g.fillStyle='#17334d';
    for(const x of [52,77]){g.beginPath();g.arc(x,58,victory?3:4,0,Math.PI*2);g.fill();}
    g.font='bold 17px sans-serif';g.textAlign='center';g.fillText(u.short,64,88);
    g.strokeStyle='#ffffff';g.lineWidth=5;g.beginPath();g.moveTo(90,79);g.lineTo(action?119:102,victory?23:action?57:95);g.stroke();
    if(action){g.fillStyle='#fff2b1';g.beginPath();g.arc(116,55,8,0,Math.PI*2);g.fill();}
    return c.toDataURL('image/png');
  }
  for(const [key,u] of Object.entries(D.units))if(u.primitive){
    const frames=Object.fromEntries(['idle','action','hurt','victory'].map(p=>[p,primitive(u,p)]));
    window.IMMUNO_SPRITES.characters[key]={pivot:[64,112],referenceHeight:100,frames};u.asset=frames.idle;
  }
  for(const [key,e] of Object.entries(D.enemies))if(e.spriteAlias)window.IMMUNO_SPRITES.enemies[key]=window.IMMUNO_SPRITES.enemies[e.spriteAlias];
})();
