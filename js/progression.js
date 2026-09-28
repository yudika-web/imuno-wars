(() => {
  'use strict';
  const D=window.IMMUNO_DATA,KEY='imunowarsSave',session=new Map();let unavailable=false;
  function readSave(key){if(session.has(key))return session.get(key);try{return localStorage.getItem(key);}catch{unavailable=true;return null;}}
  function writeSave(key,value){session.set(key,value);try{localStorage.setItem(key,value);}catch{unavailable=true;}}
  const fresh=()=>({version:1,unlockedLevel:1,levelStars:{},bestScore:{},quizAnswers:{},researchPoints:0,unitUpgrades:{},databookSeenCharacters:[],databookSeenEnemies:[]});
  const number=(n,min,max)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Math.floor(Number(n)))):min;
  function parse(s){try{const o=JSON.parse(s);return o&&typeof o==='object'&&!Array.isArray(o)?o:null;}catch{return null;}}
  function normalize(raw){
    const s=fresh();s.unlockedLevel=number(raw.unlockedLevel,1,50);s.researchPoints=number(raw.researchPoints,0,10000000);
    for(const l of D.levels){const k=l.id;if(raw.levelStars?.[k])s.levelStars[k]=number(raw.levelStars[k],0,3);if(raw.bestScore?.[k])s.bestScore[k]=number(raw.bestScore[k],0,10000000);if(typeof raw.quizAnswers?.[k]==='boolean')s.quizAnswers[k]=raw.quizAnswers[k];}
    for(const k of Object.keys(D.units))if(raw.unitUpgrades?.[k])s.unitUpgrades[k]=number(raw.unitUpgrades[k],1,5);
    s.databookSeenEnemies=Array.isArray(raw.databookSeenEnemies)?[...new Set(raw.databookSeenEnemies.filter(k=>D.enemies[k]))]:[];
    s.databookSeenCharacters=Object.keys(D.units).filter(k=>D.units[k].unlock<=s.unlockedLevel);
    return s;
  }
  const raw=parse(readSave(KEY));
  let save=normalize(raw||{unlockedLevel:readSave('immunofrontUnlocked'),quizAnswers:parse(readSave('immunofrontQuiz'))||{}});
  function persist(){writeSave(KEY,JSON.stringify(save));}
  function unlockThrough(n){save.unlockedLevel=Math.max(save.unlockedLevel,number(n,1,50));save.databookSeenCharacters=Object.keys(D.units).filter(k=>D.units[k].unlock<=save.unlockedLevel);persist();}
  const tier=k=>save.unitUpgrades[k]||1;
  function stats(k){const t=D.units[k],n=tier(k)-1;return {...t,tier:n+1,hp:Math.round(t.hp*(1+.08*n)),damage:t.damage?+(t.damage*(1+.07*n)).toFixed(2):0,cooldown:t.cooldown?+(t.cooldown*(1-.035*n)).toFixed(3):0,range:t.range?Math.round(t.range*(1+.02*n)):0};}
  const upgradeCost=k=>tier(k)>=5?0:35*tier(k);
  function buy(k){if(!D.units[k]||D.units[k].unlock>save.unlockedLevel||tier(k)>=5||save.researchPoints<upgradeCost(k))return false;save.researchPoints-=upgradeCost(k);save.unitUpgrades[k]=tier(k)+1;persist();return true;}
  function complete(id,tissue,elapsed){
    const stars=tissue>=80?3:tissue>=45?2:1,first=!save.levelStars[id];
    const score=Math.max(0,Math.round(tissue*100+id*100+Math.max(0,1800-elapsed)*2));
    const reward=first?35+Math.ceil(id/10)*10+(id%10===0?35:0):8+Math.ceil(id/10)*2;
    save.levelStars[id]=Math.max(save.levelStars[id]||0,stars);save.bestScore[id]=Math.max(save.bestScore[id]||0,score);save.researchPoints+=reward;unlockThrough(id+1);return {stars,score,reward,first};
  }
  function seenEnemy(k){if(D.enemies[k]&&!save.databookSeenEnemies.includes(k)){save.databookSeenEnemies.push(k);persist();}}
  function reset(){
    for(const key of [KEY,'immunofrontUnlocked','immunofrontQuiz']){session.delete(key);try{localStorage.removeItem(key);}catch{unavailable=true;}}
    save=fresh();unlockThrough(1); // Fresh versioned save prevents legacy progress from returning.
  }
  persist();
  window.IMMUNO_PROGRESS={get save(){return save;},get storageUnavailable(){return unavailable;},readSave,writeSave,unlockThrough,tier,stats,upgradeCost,buy,complete,seenEnemy,reset,saveQuiz(id,correct){save.quizAnswers[id]=!!correct;persist();}};
})();
