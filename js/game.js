(() => {
  'use strict';

  const DATA = window.IMMUNO_DATA;
  const SPRITES = window.IMMUNO_SPRITES;
  const sfx=(name,options)=>window.IMMUNO_SOUND?.play(name,options);
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const canvas = $('#gameCanvas');
  const ctx = canvas.getContext('2d');

  const GRID = { x: 118, y: 96, cols: 9, rows: 5, tw: 100, th: 100 };
  const ANTIGENS = ['circle', 'diamond', 'triangle', 'star'];
  const images = {};
  const spriteMetrics = window.IMMUNO_SPRITE_METRICS || {};
  let assetsReady = false;
  let accumulator = 0;
  let lastHUDFrame = 0;

  const screens = {
    splash: $('#splashScreen'),
    start: $('#startScreen'),
    levels: $('#levelScreen'),
    game: $('#gameScreen'),
    upgrades: $('#upgradeScreen'),
    databook: $('#databookScreen')
  };

  const state = {
    level: null,
    levelIndex: 0,
    running: false,
    paused: false,
    speed: 1,
    selectedUnit: null,
    energy: 0,
    oxygen: 0,
    nutrient: 0,
    signal: 0,
    tissue: 100,
    units: [],
    enemies: [],
    projectiles: [],
    effects: [],
    barriers: [],
    elapsed: 0,
    baselineTimer: 0,
    metabolismTimer: 0,
    waveIndex: -1,
    spawnQueue: [],
    waveActive: false,
    intermissionUntil: 0,
    levelWon: false,
    antigenSamples: {circle:0, diamond:0, triangle:0, star:0},
    activeAntibody: null,
    antibodyUntil: 0,
    cooldowns: {},
    buffs: {oxygenUntil:0, cytokineUntil:0, feverUntil:0, inflammationUntil:0},
    wounds: new Set(),
    infectedTiles: new Set(),
    log: [],
    lastFrame: performance.now(),
    hoverCell: null,
    spawnSerial: 0,
    selectedPlacedId: null
  };

  // ---------- persistence ----------
  const PROGRESS=window.IMMUNO_PROGRESS;
  const getUnlocked=()=>PROGRESS.save.unlockedLevel;
  const unlockThrough=n=>PROGRESS.unlockThrough(n);
  const getQuiz=()=>PROGRESS.save.quizAnswers;
  const saveQuiz=(id,correct)=>PROGRESS.saveQuiz(id,correct);
  let selectedChapter=Math.ceil(getUnlocked()/10),databookTab='characters';

  // ---------- image preloading ----------
  function collectImagePaths(){
    const p = new Set([
      'assets/menu/start-screen.webp','assets/menu/main-menu.webp',
      'assets/icons/energy.webp','assets/icons/oxygen.webp','assets/icons/nutrient.webp','assets/icons/signal.webp','assets/icons/health.webp',
      'assets/effects/tile_normal.webp','assets/effects/tile_wound.webp','assets/effects/tile_infected.webp','assets/effects/tile_plasma.webp',
      'assets/effects/projectile.webp','assets/effects/antibody_tag.webp','assets/effects/hit.webp','assets/effects/clot_barrier.webp'
    ]);
    Object.values(DATA.units).forEach(v=>p.add(v.asset));
    Object.values(DATA.enemies).forEach(v=>p.add(v.asset));
    Object.values(DATA.abilities).forEach(v=>p.add(v.icon));
    Object.values(DATA.antigens).forEach(v=>p.add(v.icon));
    DATA.levels.forEach(v=>p.add(v.background));
    for(const kind of ['characters','enemies','elites']) Object.values(SPRITES[kind]||{}).forEach(v=>Object.values(v.frames).forEach(src=>p.add(src)));
    Object.values(SPRITES.effects).forEach(v=>v.frames.forEach(src=>p.add(src)));
    Object.values(SPRITES.items).forEach(src=>p.add(src));
    return [...p];
  }
  async function preload(){
    const paths=collectImagePaths(),failed=[];
    let loaded=0;
    await Promise.all(paths.map(src => new Promise(resolve => {
      const img=new Image();
      const done=()=>{
        loaded++;
        setText($('#loadingStatus'),`Memuat aset ${loaded}/${paths.length}…`);
        $('#loadingProgress').value=Math.round(loaded/paths.length*100);
        resolve();
      };
      img.onload=()=>{images[src]=img;done();};
      img.onerror=()=>{failed.push(src);console.warn('Asset gagal dimuat:',src);done();};
      img.src=src;
    })));
    return failed;
  }

  // ---------- UI navigation ----------
  function showScreen(name){
    Object.values(screens).forEach(s=>s.classList.remove('active'));
    screens[name].classList.add('active');
    if(name!=='game'){window.IMMUNO_SOUND?.stopAll();setPauseUI(false);window.IMMUNO_MUSIC?.setPaused(false);window.IMMUNO_MUSIC?.setScene('menu');}
    if(name==='levels') renderLevelSelect();
    if(name==='upgrades')renderUpgrades();
    if(name==='databook')renderDatabook();
    if(name==='game') draw();
  }

  function saveNotice(){return PROGRESS.storageUnavailable?'Progres hanya tersimpan selama sesi ini karena penyimpanan browser tidak tersedia.':'Progres tersimpan otomatis di browser ini.';}
  function bossMissionArt(level){
    return `assets/campaign/boss/bab-${String(Math.ceil(level.id/10)).padStart(2,'0')}.webp`;
  }
  function missionThumbnail(level,status){
    if(level.id%10===0){
      return `<div class="level-thumb boss-thumb" style="background-image:url('${bossMissionArt(level)}')"><span class="level-number">${String(level.id).padStart(2,'0')}</span><span class="level-status">${status}</span></div>`;
    }
    const step=(level.id-1)%10;
    const threats=[...new Set(level.waves.flat().map(group=>group.type))].filter(type=>DATA.enemies[type]&&!DATA.enemies[type].boss);
    const lead=DATA.enemies[threats[step%threats.length]]?.asset||DATA.enemies.coccus.asset;
    const support=DATA.enemies[threats[(step+1)%threats.length]]?.asset||lead;
    return `<div class="level-thumb mission-thumb scene-${step}" style="--mission-bg:url('${level.background}')"><div class="mission-scenery"></div><div class="mission-orbit"></div><img class="mission-threat" src="${lead}" alt="" loading="lazy"><img class="mission-support" src="${support}" alt="" loading="lazy"><span class="level-number">${String(level.id).padStart(2,'0')}</span><span class="level-status">${status}</span></div>`;
  }
  function renderLevelSelect(){
    setText($('#saveStatus'),saveNotice());
    $('#chapterTabs').innerHTML=DATA.chapters.map(c=>`<button class="chapter-tab ${c.id===selectedChapter?'active':''}" aria-pressed="${c.id===selectedChapter}" data-chapter="${c.id}"><small>BAB ${String(c.id).padStart(2,'0')}</small><strong>${c.name}</strong><span>${(c.id-1)*10+1}–${c.id*10} · ${DATA.levels.filter(l=>Math.ceil(l.id/10)===c.id && PROGRESS.save.levelStars[l.id]>0).length}/10 selesai</span></button>`).join('');
    $$('#chapterTabs button').forEach(b=>b.onclick=()=>{selectedChapter=Number(b.dataset.chapter);renderLevelSelect();});
    const chapter=DATA.chapters[selectedChapter-1];
    const chapterLevels=DATA.levels.filter(l=>Math.ceil(l.id/10)===selectedChapter);
    const completed=chapterLevels.filter(l=>PROGRESS.save.levelStars[l.id]>0).length;
    const spotlight=chapterLevels.find(l=>l.id<=getUnlocked() && !PROGRESS.save.levelStars[l.id]) || [...chapterLevels].reverse().find(l=>l.id<=getUnlocked()) || chapterLevels[0];
    const spotlightLocked=spotlight.id>getUnlocked();
    $('#chapterEyebrow').textContent=`BAB ${String(selectedChapter).padStart(2,'0')} · ${spotlightLocked?'BELUM TERBUKA':completed===10?'BAB TUNTAS':'MISI BERIKUTNYA'}`;
    $('#chapterHeroTitle').textContent=spotlight.title;
    $('#chapterHeroDescription').textContent=chapter.theme;
    $('#chapterHeroProgress').textContent=`${completed}/10 MISI SELESAI`;
    $('.chapter-hero').style.backgroundImage=spotlight.id%10===0
      ?`linear-gradient(90deg,#211627f5 0,#261729d9 38%,#270f2180 66%,#190c1b15),url('${bossMissionArt(spotlight)}')`
      :'';
    $('#chapterPlayBtn').disabled=spotlightLocked;
    $('#chapterPlayBtn').innerHTML=spotlightLocked?'Buka bab sebelumnya':'Mainkan level '+spotlight.id+' <span aria-hidden="true">▶</span>';
    $('#chapterPlayBtn').onclick=()=>startLevel(spotlight.id);
    $('#chapterSummary').textContent=chapter.theme+' • Riset: '+PROGRESS.save.researchPoints;
    $('#levelGrid').innerHTML=chapterLevels.map(l=>{
      const locked=l.id>getUnlocked(),stars=PROGRESS.save.levelStars[l.id]||0;
      const thumb=missionThumbnail(l,locked?'TERKUNCI':l.id%10===0?'BOSS BAB':stars?'SELESAI':'SIAP');
      return `<button class="level-card ${locked?'locked':''} ${l.id===spotlight.id&&!locked?'featured':''} ${l.id%10===0?'boss-mission':''}" data-level="${l.id}" ${locked?'disabled':''} aria-label="Level ${l.id}: ${l.title}${locked?', terkunci':''}">${thumb}<div class="level-body"><h2>${l.title}</h2><div class="level-stars" aria-label="${stars} bintang">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><small>Skor ${PROGRESS.save.bestScore[l.id]||0}${getQuiz()[l.id]?' · Kuis ✓':''}</small></div></button>`;
    }).join('');
    $$('.level-card').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.level)));
  }
  // Upgrade art is resolved on demand so purchases, reload and reset agree everywhere.
  function spriteMeta(kind,type){
    if(kind==='characters'&&PROGRESS.tier(type)>=4&&SPRITES.elites?.[type])return SPRITES.elites[type];
    return SPRITES[kind]?.[type];
  }
  function unitPortrait(type){return spriteMeta('characters',type)?.frames.idle||DATA.units[type].asset;}
  function statText(t){return `HP ${t.hp} · Damage ${t.damage||'—'} · Jeda ${t.cooldown||'—'} dtk · Jangkauan ${t.range||'—'} · Energi ${t.cost}`;}
  function renderUpgrades(){
    $('#researchBalance').textContent=PROGRESS.save.researchPoints;
    $('#upgradeSaveStatus').textContent=saveNotice();
    $('#upgradeGrid').innerHTML=Object.entries(DATA.units).filter(([,u])=>u.unlock<=getUnlocked()).map(([k,u])=>{
      const t=PROGRESS.stats(k),cost=PROGRESS.upgradeCost(k),next=t.tier<5?`HP +8%, damage +7%, jeda −3,5%, jangkauan +2% dari stat dasar.`:'Tingkat maksimum tercapai.';
      return `<article class="archive-card"><img class="portrait" src="${unitPortrait(k)}" alt="${u.name}"><h2>${u.name}</h2><span class="tier-badge">${t.tier>1?'<img src="assets/items/upgrade_star.webp" alt="">':''}Lv${t.tier} / 5</span><p>${u.description}</p><p class="stats">${statText(t)}</p><small>${next} Stat yang tidak dimiliki unit tidak ditambahkan.</small><p class="small-note">${t.tier>=4?'Bentuk elite aktif':'Bentuk elite terbuka pada Lv4'}</p><button class="primary-btn" data-buy="${k}" ${t.tier===5||PROGRESS.save.researchPoints<cost?'disabled':''}>${t.tier===5?'Maksimum':`Upgrade · ${cost} Riset`}</button></article>`;
    }).join('');
    $$('[data-buy]').forEach(b=>b.onclick=()=>{if(PROGRESS.buy(b.dataset.buy)){sfx('ui_click',{ui:true});renderUpgrades();}});
  }
  function renderDatabook(){
    const characters=databookTab==='characters',entries=Object.entries(characters?DATA.units:DATA.enemies);
    $$('[data-book-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bookTab===databookTab)));
    $('#databookGrid').innerHTML=entries.map(([k,t])=>{
      const open=characters?t.unlock<=getUnlocked():PROGRESS.save.databookSeenEnemies.includes(k);
      const asset=characters?unitPortrait(k):(spriteMeta('enemies',k)?.frames.idle||t.asset);
      return `<article class="archive-card ${open?'':'unseen'}"><img class="portrait" src="${asset}" alt="${open?t.name:'Siluet terkunci'}"><img class="entry-status" src="assets/icons/${open?'check':'locked'}.webp" alt="${open?'Terbuka':'Terkunci'}"><h2>${open?t.name:'???'}</h2>${t.boss?'<span class="tier-badge">BOSS</span>':''}<p>${open?t.description:characters?`Terbuka pada level ${t.unlock}.`:'Temui dalam pertempuran untuk membuka catatan.'}</p>${open&&characters?`<p class="stats">Lv${PROGRESS.tier(k)} · ${statText(PROGRESS.stats(k))}</p><small>${t.weapon}</small>`:''}</article>`;
    }).join('');
    const count=entries.filter(([k,u])=>characters?u.unlock<=getUnlocked():PROGRESS.save.databookSeenEnemies.includes(k)).length;
    $('#databookCount').textContent=`${count} / ${entries.length} ditemukan · ${saveNotice()}`;
  }
  function confirmReset(stage=1){
    window.IMMUNO_SETTINGS?.close();
    showModal(`<h2>${stage===1?'Reset Progres?':'Konfirmasi Terakhir'}</h2><p>Semua progres level, bintang, skor, jawaban kuis, upgrade, Riset, dan Databook akan dihapus. Tindakan ini tidak bisa dikembalikan. Pengaturan suara tetap tersimpan.</p><div class="modal-actions"><button id="cancelReset" class="secondary-btn">Batal</button><button id="confirmReset" class="danger-btn">${stage===1?'Lanjutkan Reset':'Ya, Hapus Semua Progres'}</button></div>`,false);
    $('#cancelReset').onclick=closeModal;
    $('#confirmReset').onclick=()=>{
      if(stage===1)return confirmReset(2);
      PROGRESS.reset();state.running=false;state.paused=false;state.level=null;state.units=[];state.enemies=[];state.projectiles=[];state.effects=[];state.barriers=[];state.spawnQueue=[];state.levelWon=false;selectedChapter=1;
      window.IMMUNO_SOUND?.setPaused(false);closeModal();showScreen('start');renderLevelSelect();
    };
  }

  // ---------- modal ----------
  function showModal(html, closable=true){
    $('#modalContent').innerHTML = html;
    $('#modal').classList.remove('hidden');
    $('#modalCloseBtn').style.display = closable ? 'block' : 'none';
  }
  function closeModal(){ $('#modal').classList.add('hidden'); }

  function guideModal(){
    showModal(`<h2>Panduan Bermain</h2>
      <p>IMUNO WARS adalah prototipe lane-defense 5×9. Klik kartu unit, lalu klik tile arena untuk menempatkannya. Patogen datang dari kanan dan mencoba mencapai jaringan di kiri.</p>
      <div class="guide-grid">
        <div class="guide-box"><h4>⚡ Ekonomi</h4><p>Eritrosit menghasilkan O₂ dan energi. Plasma menambah nutrisi dan meningkatkan suplai Eritrosit di dekatnya.</p></div>
        <div class="guide-box"><h4>🛡 Innate immunity</h4><p>Trombosit menahan lane, Neutrofil memberi damage cepat, Makrofag tank sekaligus fagosit.</p></div>
        <div class="guide-box"><h4>🧬 Adaptive immunity</h4><p>Sel Dendritik mengambil sampel antigen. Setelah 3 sampel, antibodi yang cocok dapat diaktifkan menggunakan Immune Signal.</p></div>
        <div class="guide-box"><h4>🎯 Tujuan</h4><p>Habisi semua wave sambil menjaga Tissue Health di atas 0%. Gunakan buff pada saat tekanan tinggi.</p></div>
      </div>
      <h3>Catatan edukasi</h3>
      <p>Mekanik disederhanakan untuk gameplay. Eritrosit tidak “menciptakan” oksigen; ia mengangkut O₂. Energi di game adalah abstraksi kebutuhan metabolik sel.</p>
      <div class="modal-actions"><button class="primary-btn" id="guideDone">Mengerti</button></div>`);
    $('#guideDone').onclick = closeModal;
  }

  // ---------- level setup ----------
  function startLevel(levelId){
    if(!Number.isInteger(levelId)||levelId<1||levelId>getUnlocked()||levelId>50)return;
    window.IMMUNO_SOUND?.stopAll();window.IMMUNO_SOUND?.setPaused(false);
    window.IMMUNO_MUSIC?.setScene('menu');window.IMMUNO_MUSIC?.setPaused(false);
    setPauseUI(false);setUnitDock(true);
    const level = DATA.levels[levelId-1];
    state.level = level;
    state.levelIndex = levelId-1;
    state.running = false;
    state.paused = false;
    state.speed = 1;
    state.selectedUnit = 'rbc';
    state.energy = level.startEnergy;
    state.oxygen = level.startOxygen;
    state.nutrient = level.startNutrient;
    state.signal = level.startSignal;
    state.tissue = 100;
    state.units = [];
    state.enemies = [];
    state.projectiles = [];
    state.effects = [];
    state.barriers = [];
    state.elapsed = 0;
    state.baselineTimer = 0;
    state.metabolismTimer = 0;
    state.waveIndex = -1;
    state.spawnQueue = [];
    state.waveActive = false;
    state.intermissionUntil = 0;
    state.levelWon = false;
    state.antigenSamples = {circle:0, diamond:0, triangle:0, star:0};
    state.activeAntibody = null;
    state.antibodyUntil = 0;
    state.cooldowns = {};
    state.buffs = {oxygenUntil:0, cytokineUntil:0, feverUntil:0, inflammationUntil:0};
    state.wounds = new Set(level.wounds.map(v=>`${v.r},${v.c}`));
    state.infectedTiles = new Set(level.infectedTiles.map(v=>`${v.r},${v.c}`));
    state.log = [];
    state.spawnSerial = 0;
    state.selectedPlacedId = null;
    state.lastFrame = performance.now();
    state.hoverCell = null;
    accumulator = 0;
    lastHUDFrame = 0;
    $('#pauseOverlay').classList.add('hidden');
    $('#pauseBtn').setAttribute('aria-pressed','false');
    showScreen('game');
    renderStaticGameUI();
    level.facts.forEach(f=>addLog(f));
    updateHUD();
    draw();
    showModal(`<span class="result-badge">LEVEL ${level.id}</span>
      <h2>${level.title}</h2><p>${level.subtitle}</p>
      <div class="intro-facts">${level.facts.map(f=>`<div class="fact-chip">${f}</div>`).join('')}</div>
      <p><strong>Objektif:</strong> pertahankan Tissue Health sampai seluruh wave dan BOSS dikalahkan.</p>
      <div class="modal-actions"><button class="primary-btn" id="beginLevelBtn">Mulai Pertahanan</button></div>`, false);
    $('#beginLevelBtn').onclick = () => {
      closeModal();
      state.running = true;
      window.IMMUNO_MUSIC?.setScene('battle');
      sfx('ui_click',{ui:true});
      state.lastFrame = performance.now();
      accumulator = 0;
      state.intermissionUntil = state.elapsed + 0.45;
      banner('Gelombang pertama mendekat');
    };
  }

  function renderStaticGameUI(){
    $('#missionTitle').textContent = `Level ${state.level.id} — ${state.level.title}`;
    $('#missionSubtitle').textContent = state.level.subtitle;
    $('#speedLabel').textContent = '1×';
    $('#pauseBtn img').src = 'assets/ui/pause.webp';
    $('#pauseBtn').title = 'Jeda';
    renderUnitCards();
    renderAbilityBar();
    renderAntibodyPanel();
    $('#bossPanel').classList.add('hidden');
    $('#hintText').textContent = state.level.hint || (state.level.id===1 ? 'Bangun 2–3 Eritrosit lebih dulu, lalu lindungi lane dengan Neutrofil.' : state.level.id===2 ? 'Pasangkan Plasma di dekat Eritrosit dan gunakan Makrofag pada lane berat.' : state.level.id===3 ? 'Gunakan Cytotoxic T untuk Sel Terinfeksi dan Sel Dendritik untuk mulai membaca antigen.' : state.level.id===4 ? 'Kumpulkan 3 sampel antigen, lalu aktifkan antibodi yang sesuai.' : 'Kombinasikan semua sistem. Simpan Complement untuk target yang sudah antibody-tagged.');
  }

  function renderUnitCards(){
    const deckScroll=$('#unitCards').scrollLeft||0;
    const units = Object.entries(DATA.units).filter(([,u])=>u.unlock<=getUnlocked());
    $('#unitCards').innerHTML = units.map(([key,u],index) => `<button draggable="true" class="unit-card ${state.selectedUnit===key?'selected':''}" data-unit="${key}" aria-pressed="${state.selectedUnit===key}" title="${u.name} • ${u.cost} energi — ${u.description}">
      <span class="role-dot role-${u.role}"></span><img draggable="false" src="${unitPortrait(key)}" alt="${u.name}">
      <span class="unit-card-copy"><strong>${u.name}</strong><span class="unit-role">${u.weapon||roleLabel(u.role)}</span></span><span class="unit-hotkey">${index<9?index+1:''}</span>
      <span class="cost"><img src="assets/icons/energy.webp" alt="Energy">${u.cost}</span><span class="card-tier">Lv${PROGRESS.tier(key)}</span>
    </button>`).join('');
    $$('.unit-card').forEach(btn=>btn.addEventListener('click',()=>{
      sfx('ui_click',{ui:true});
      state.selectedUnit=btn.dataset.unit;
      state.selectedPlacedId=null;
      renderUnitCards();
      updateUnitInspector();
      updateHUD();
      draw();
    }));
    $$('.unit-card').forEach(btn=>btn.addEventListener('dragstart',ev=>{
      if(!state.running||state.paused||!ev.dataTransfer){ev.preventDefault();return;}
      state.selectedUnit=btn.dataset.unit;state.selectedPlacedId=null;
      ev.dataTransfer.setData('application/x-immunofront-unit',btn.dataset.unit);ev.dataTransfer.effectAllowed='copy';
      updateUnitInspector();
    }));
    $('#unitCards').scrollLeft=deckScroll;
    $('#selectedUnitText').textContent = DATA.units[state.selectedUnit]?.name || 'Pilih unit';
    $('#unitToggleBtn').setAttribute('aria-label',`Pasukan: ${DATA.units[state.selectedUnit]?.name||'pilih unit'}. Buka atau lipat daftar.`);
    updateUnitInspector();
  }

  function roleLabel(role){
    return ({resource:'Resource',barrier:'Barrier',dps:'Damage',support:'Support',tank:'Tank / Fagosit',scanner:'Scanner',
      'anti-virus':'Anti-virus','infected-cell':'Anti-terinfeksi',antibody:'Antibodi',buffer:'Buffer',memory:'Memory'})[role] || role;
  }

  function selectedPlacedUnit(){
    return state.units.find(u=>!u.dead&&u.id===state.selectedPlacedId)||null;
  }

  function updateUnitInspector(){
    const box=$('#unitInspector');
    if(!box||!state.level)return;
    const placed=selectedPlacedUnit();
    if(placed){
      const t=placed.stats||PROGRESS.stats(placed.type);
      const hp=Math.max(0,Math.round(placed.hp));
      let status='Siap bertahan';
      if(t.damage) status=`Jangkauan ${t.range} • Damage ${t.damage}`;
      else if(placed.type==='rbc') status=`Mengisi energi • ${Math.min(100,Math.floor(placed.resourceTimer/4*100))}%`;
      else if(placed.type==='plasma') status='Nutrisi + heal tetangga setiap 5 dtk';
      else if(placed.type==='dendritic') status='Memindai antigen setiap 4,2 dtk';
      else if(placed.type==='b_cell') status='Membuat signal + menandai target antigen';
      setHTML(box,`<strong>${t.name} • Lv${t.tier} • Tile ${placed.row+1}-${placed.col+1}</strong><span>HP ${hp}/${placed.maxHp} • ${status}</span>`);
      box.classList.add('inspecting');
      return;
    }
    const t=PROGRESS.stats(state.selectedUnit||'rbc');
    if(!t){box.innerHTML='<strong>Pilih unit</strong><span>Lalu klik tile arena untuk menempatkannya.</span>';return;}
    box.classList.remove('inspecting');
    setHTML(box,`<strong>${t.name} • Lv${t.tier} • ${t.cost} Energi</strong><span>${t.description}</span><span>${statText(t)}</span>`);
  }

  function renderAbilityBar(){
    const entries = Object.entries(DATA.abilities).filter(([,a])=>a.unlock<=state.level.id);
    $('#abilityBar').innerHTML = entries.map(([k,a])=>`<button class="ability-btn" data-ability="${k}" title="${a.name}: ${a.description}" aria-label="${a.name}"><img src="${a.icon}" alt="${a.name}"><span class="ability-name">${({oxygen:'O₂ Boost',clot:'Perisai',cytokine:'Sitokin',fever:'Demam',analysis:'Pindai',complement:'Complement',inflammation:'Surge'})[k]}</span><span class="cooldown-holder"></span></button>`).join('');
    $$('.ability-btn').forEach(btn=>btn.addEventListener('click',()=>useAbility(btn.dataset.ability)));
  }

  function renderAntibodyPanel(){
    const panel=$('#antibodyPanel');
    if(state.level.id<4){panel.classList.add('hidden');return;}
    panel.classList.remove('hidden');
    $('#antibodyButtons').innerHTML = ANTIGENS.map(k=>{
      const a=DATA.antigens[k], count=state.antigenSamples[k], known=count>=3, active=state.activeAntibody===k&&state.elapsed<state.antibodyUntil;
      return `<button class="antibody-btn ${known?'':'locked'} ${active?'active':''}" data-antigen="${k}" title="${known?'Aktifkan & lanjutkan — biaya 15 signal':'Butuh 3 sampel'}"><span class="sample-count">${Math.min(3,count)}/3</span><img src="${a.icon}" alt="${a.name}">${a.label}</button>`;
    }).join('');
    $$('.antibody-btn').forEach(btn=>btn.addEventListener('click',()=>chooseAntibody(btn.dataset.antigen)));
  }

  // ---------- wave system ----------
  function beginWave(index){
    sfx('wave');
    state.waveIndex=index;
    state.waveActive=true;
    state.spawnQueue=[];
    let t=state.elapsed+0.35;
    const groups=state.level.waves[index];
    groups.forEach((g,gi)=>{
      for(let i=0;i<g.count;i++){
        state.spawnQueue.push({time:t,type:g.type});
        t += g.gap;
      }
      t += gi===groups.length-1?0:1.2;
    });
    banner(index===state.level.waves.length-1 ? 'BOSS WAVE' : `WAVE ${index+1}`);
    addLog(index===state.level.waves.length-1 ? 'Sinyal bahaya meningkat: ancaman BOSS terdeteksi.' : `Wave ${index+1} dimulai.`);
  }

  function spawnEnemy(type, row=null, summoned=false){
    const tpl=DATA.enemies[type];
    if(!tpl) return;
    if(row===null) row=Math.floor(Math.random()*GRID.rows);
    PROGRESS.seenEnemy(type);
    const maxHp=Math.round(tpl.hp*(state.level.enemyHpScale||1));
    const enemy={
      id:++state.spawnSerial,type,row,x:GRID.x+GRID.cols*GRID.tw+55,y:GRID.y+row*GRID.th+GRID.th/2,
      hp:maxHp,maxHp,shield:tpl.shield||0,maxShield:tpl.shield||0,attackTimer:0,summonTimer:tpl.summonEvery||0,
      taggedUntil:0,antigen:tpl.antigen,mutated:false,dead:false, summoned
    };
    if(tpl.boss) enemy.x += 25;
    state.enemies.push(enemy);
    burst('toxin',enemy.x,enemy.y,52);
    if(state.activeAntibody===enemy.antigen && state.elapsed<state.antibodyUntil) enemy.taggedUntil=state.antibodyUntil;
    if(tpl.boss){ sfx('boss');addLog(`${tpl.name} memasuki pembuluh.`); updateBossPanel(); }
  }

  function updateWaveSystem(){
    if(state.levelWon) return;
    if(!state.waveActive && state.elapsed>=state.intermissionUntil){
      if(state.waveIndex+1<state.level.waves.length) beginWave(state.waveIndex+1);
    }
    while(state.spawnQueue.length && state.spawnQueue[0].time<=state.elapsed){
      const item=state.spawnQueue.shift(); spawnEnemy(item.type);
    }
    if(state.waveActive && state.spawnQueue.length===0 && state.enemies.length===0){
      state.waveActive=false;
      if(state.waveIndex>=state.level.waves.length-1){ winLevel(); }
      else {
        state.intermissionUntil=state.elapsed+4.5;
        banner('Wave bersih — +75 Energy');
        state.energy+=75;
        resourcePop('vesicle_chest',GRID.x+GRID.cols*GRID.tw/2,GRID.y+GRID.rows*GRID.th/2,75);
        addLog('Wave dibersihkan. Sistem memperoleh waktu singkat untuk pulih.');
      }
    }
  }

  // ---------- placement ----------
  function cellFromPointer(ev){
    const r=canvas.getBoundingClientRect();
    // Account for object-fit:contain letterboxing at every viewport size.
    const scale=Math.min(r.width/canvas.width,r.height/canvas.height);
    const x=(ev.clientX-r.left-(r.width-canvas.width*scale)/2)/scale;
    const y=(ev.clientY-r.top-(r.height-canvas.height*scale)/2)/scale;
    const c=Math.floor((x-GRID.x)/GRID.tw), row=Math.floor((y-GRID.y)/GRID.th);
    if(c<0||c>=GRID.cols||row<0||row>=GRID.rows)return null;
    return {r:row,c,x:GRID.x+c*GRID.tw+GRID.tw/2,y:GRID.y+row*GRID.th+GRID.th/2};
  }
  function unitAt(r,c){ return state.units.find(u=>!u.dead&&u.row===r&&u.col===c)||null; }
  function occupied(r,c){ return !!unitAt(r,c)||state.barriers.some(b=>!b.dead&&b.row===r&&b.col===c); }
  function initialActivity(type){
    if(type==='rbc')return {resourceTimer:2.8,scanTimer:0};
    if(type==='plasma')return {resourceTimer:3.7,scanTimer:0};
    if(type==='dendritic')return {resourceTimer:0,scanTimer:3.1};
    if(type==='b_cell')return {resourceTimer:5.0,scanTimer:0};
    if(type==='memory_b')return {resourceTimer:4.2,scanTimer:0};
    if(type==='helper_t')return {resourceTimer:2.0,scanTimer:0};
    return {resourceTimer:0,scanTimer:0};
  }
  function placeUnit(r,c){
    if(!state.running || state.paused || !state.selectedUnit || !$('#modal').classList.contains('hidden'))return false;
    if(!Number.isInteger(r)||!Number.isInteger(c)||r<0||r>=GRID.rows||c<0||c>=GRID.cols)return false;
    const tpl=DATA.units[state.selectedUnit]?PROGRESS.stats(state.selectedUnit):null;
    if(!tpl||tpl.unlock>getUnlocked())return false;
    const existing=unitAt(r,c);
    if(existing){
      state.selectedPlacedId=existing.id;
      updateUnitInspector();
      toast(`${DATA.units[existing.type].name} dipilih. Tile sudah terisi.`);
      return false;
    }
    if(state.barriers.some(b=>!b.dead&&b.row===r&&b.col===c)){toast('Tile ditempati Clot Barrier.');return false;}
    if(state.energy<tpl.cost){toast(`Energy tidak cukup untuk ${tpl.name} (butuh ${tpl.cost}).`);return false;}
    state.energy-=tpl.cost;
    const key=`${r},${c}`;
    let hp=tpl.hp;
    let closedWound=false;
    if(state.selectedUnit==='platelet'&&state.wounds.has(key)){ hp=Math.round(hp*1.35); state.wounds.delete(key); closedWound=true; addLog('Trombosit menutup luka: Fibrin Clot terbentuk.'); }
    const primed=initialActivity(state.selectedUnit);
    const unit={
      id:`u${Date.now()}${Math.random()}`,type:state.selectedUnit,row:r,col:c,x:GRID.x+c*GRID.tw+GRID.tw/2,y:GRID.y+r*GRID.th+GRID.th/2,
      hp,maxHp:hp,stats:tpl,attackTimer:0,resourceTimer:primed.resourceTimer,scanTimer:primed.scanTimer,dead:false,actionUntil:state.elapsed+.75,spawnUntil:state.elapsed+.8
    };
    state.units.push(unit);
    state.selectedPlacedId=unit.id;
    if(state.selectedUnit==='dendritic') addLog('Sel Dendritik aktif dan mulai mencari sampel antigen.');
    if(state.selectedUnit==='b_cell') addLog('B Cell aktif; setelah antigen dikenali ia akan membantu menandai target.');
    if(closedWound){ burst('shield',unit.x,unit.y,105); resourcePop('fibrin',unit.x,unit.y,1); }
    else burst('healing',unit.x,unit.y,72);
    state.effects.push({type:'pulse',x:unit.x,y:unit.y,life:.7,maxLife:.7,size:42});
    sfx('place');
    toast(`${tpl.name} ditempatkan • aktif`);
    updateHUD();
    updateUnitInspector();
    return true;
  }

  // ---------- combat / systems ----------
  function unitAttackSpeedMultiplier(u){
    let m=1;
    if(state.elapsed<state.buffs.cytokineUntil)m*=1.35;
    const helper=state.units.some(h=>!h.dead&&h.type==='helper_t'&&Math.abs(h.x-u.x)<=155&&Math.abs(h.row-u.row)<=1);
    if(helper)m*=1.22;
    return m;
  }
  function damageMultiplierAgainst(enemy,uType){
    const tpl=DATA.enemies[enemy.type];
    let m=1;
    const tagged=enemy.taggedUntil>state.elapsed;
    if(tagged)m*=1.5;
    if(state.elapsed<state.buffs.inflammationUntil)m*=1.55;
    if(uType==='nk_cell'&&(tpl.kind==='virus'||tpl.kind==='infected'||tpl.subtype==='virus'||tpl.subtype==='infected'))m*=1.55;
    if(uType==='cytotoxic_t')m*= (tpl.kind==='infected'||tpl.subtype==='infected') ? 2.25 : 0.65;
    if(uType==='neutrophil'&&(tpl.kind==='bacteria'||tpl.subtype==='bacteria'))m*=1.18;
    if(uType==='macrophage'&&(tpl.kind==='bacteria'||tpl.subtype==='bacteria'))m*=1.15;
    if(uType==='complement'&&tagged)m*=1.8;
    if(uType==='eosinophil'&&tpl.kind==='parasite')m*=2.2;
    if(tpl.variant && !tagged)m*=0.68;
    return m;
  }
  function applyDamage(enemy, amount, uType=''){ 
    if(enemy.dead||enemy.hp<=0)return;
    sfx(enemy.shield>0?'shield':'hit');
    enemy.hurtUntil=state.elapsed+.16;
    const tpl=DATA.enemies[enemy.type];
    let dmg=amount*damageMultiplierAgainst(enemy,uType);
    if(enemy.shield>0){
      const absorbed=Math.min(enemy.shield,dmg); enemy.shield-=absorbed; dmg-=absorbed;
      impactVFX(enemy.x,enemy.y,'#72e5ff',true);
      if(enemy.shield<=0&&enemy.maxShield>0){addLog(`${tpl.name}: lapisan pelindung pecah.`);burst('shield',enemy.x,enemy.y,tpl.boss?135:95);}
    }
    if(dmg>0){
      if(tpl.armor)dmg*=Math.max(.25,1-tpl.armor);
      enemy.hp-=dmg;
      impactVFX(enemy.x,enemy.y,WEAPON_COLORS[uType]||'#ffe397',false,tpl.boss);
    }
    if(tpl.variant&&!enemy.mutated&&enemy.hp<=enemy.maxHp*.5){
      enemy.mutated=true; enemy.antigen='star'; enemy.taggedUntil=0;
      burst('toxin',enemy.x,enemy.y,125);impactVFX(enemy.x,enemy.y,'#d77cff',false,true);
      banner('MUTATION DETECTED — Antigen ✦');
      addLog('The Variant mengubah signature antigen. Antibodi lama menjadi kurang efektif.');
      renderAntibodyPanel();
    }
  }
  function nearestEnemyForUnit(u,range){
    return state.enemies.filter(e=>!e.dead&&e.hp>0&&e.row===u.row&&e.x>=u.x-10&&e.x-u.x<=range).sort((a,b)=>a.x-b.x)[0]||null;
  }
  function updateUnits(dt){
    for(const u of state.units){
      if(u.dead)continue;
      const tpl=u.stats||PROGRESS.stats(u.type);
      u.attackTimer-=dt; u.resourceTimer+=dt; u.scanTimer+=dt;
      if(u.type==='rbc'){
        if(u.resourceTimer>=3.0)act(u,.14);
        if(u.resourceTimer>=4){
          u.resourceTimer=0;
          const adjacentPlasma=state.units.some(p=>!p.dead&&p.type==='plasma'&&Math.abs(p.row-u.row)+Math.abs(p.col-u.col)<=1);
          let boost=adjacentPlasma?1.35:1;
          if(state.elapsed<state.buffs.oxygenUntil)boost*=2;
          state.oxygen+=Math.round(20*boost); state.energy+=Math.round(18*boost);
          act(u,.6);state.effects.push({type:'chargeRelease',x:u.x,y:u.y,life:.55,maxLife:.55}); resourcePop('oxygen',u.x,u.y,Math.round(20*boost)); resourcePop('energy',u.x+14,u.y-6,Math.round(18*boost));
        }
      } else if(u.type==='plasma'){
        if(u.resourceTimer>=5){
          u.resourceTimer=0; state.nutrient+=16;
          state.units.forEach(a=>{if(!a.dead&&Math.abs(a.row-u.row)+Math.abs(a.col-u.col)<=1){a.hp=Math.min(a.maxHp,a.hp+14);burst('healing',a.x,a.y,70);}});
          act(u);resourcePop('nutrient',u.x,u.y,16);
        }
      } else if(u.type==='dendritic'){
        if(u.scanTimer>=4.2){
          u.scanTimer=0;
          const candidates=state.enemies.filter(e=>!e.dead).sort((a,b)=>a.x-b.x);
          const e=candidates[0]; if(e){sampleAntigen(e.antigen,1);act(u);burst('shield',e.x,e.y,70);}
        }
      } else if(u.type==='b_cell'){
        if(u.resourceTimer>=6.5){
          u.resourceTimer=0;
          const known=ANTIGENS.filter(k=>state.antigenSamples[k]>=3);
          if(known.length){
            state.signal+=4;act(u,.65);resourcePop('signal',u.x,u.y,4);
            const target=state.enemies.filter(e=>!e.dead&&known.includes(e.antigen)).sort((a,b)=>a.x-b.x)[0];
            if(target){
              fireWeapon(u,target,0,6);
            }
          }
        }
      } else if(u.type==='memory_b'){
        if(u.resourceTimer>=5.5){
          u.resourceTimer=0;
          const known=ANTIGENS.filter(k=>state.antigenSamples[k]>=3);
          if(known.length){
            const target=state.enemies.find(e=>!e.dead&&known.includes(e.antigen)&&e.taggedUntil<=state.elapsed);
            if(target){act(u);fireWeapon(u,target,0,7);}
          }
        }
      } else if(u.type==='helper_t'){
        if(u.resourceTimer>=3){u.resourceTimer=0;act(u);burst('shield',u.x,u.y,92);}
      } else if(u.type==='interferon'||u.type==='treg'){
        if(u.resourceTimer>=tpl.cooldown){
          u.resourceTimer=0;act(u);burst('shield',u.x,u.y,100);
          if(u.type==='interferon')state.units.forEach(a=>{if(!a.dead&&Math.hypot(a.x-u.x,a.y-u.y)<=tpl.range)a.resistanceUntil=state.elapsed+4;});
          else if(state.elapsed<state.buffs.inflammationUntil){state.tissue=Math.min(100,state.tissue+1);}
        }
      } else if(tpl.damage){
        const target=nearestEnemyForUnit(u,tpl.range);
        if(target&&u.attackTimer<=0){
          u.attackTimer=tpl.cooldown/unitAttackSpeedMultiplier(u);
          act(u);
          let dmg=tpl.damage;
          if(u.type==='macrophage'&&!DATA.enemies[target.type].boss&&target.hp/target.maxHp<=.28){dmg=target.hp+5;state.signal+=3;addLog('Makrofag melakukan fagositosis pada patogen yang melemah.');}
          // Every gun fires a visible projectile; damage is applied on arrival.
          fireWeapon(u,target,dmg);
          if(u.type==='basophil')target.slowUntil=Math.max(target.slowUntil||0,state.elapsed+1.8);
          if(u.type==='mast_cell')state.enemies.forEach(e=>{if(!e.dead&&Math.hypot(e.x-target.x,e.y-target.y)<115){e.slowUntil=Math.max(e.slowUntil||0,state.elapsed+2);if(e!==target)applyDamage(e,dmg*.5,u.type);}});
        }
      }
    }
    state.units=state.units.filter(u=>!u.dead);
  }

  const WEAPON_COLORS={neutrophil:'#65f0ff',macrophage:'#44e6c5',nk_cell:'#bf8aff',cytotoxic_t:'#78b5ff',b_cell:'#ffe177',memory_b:'#dba3ff',eosinophil:'#ffbc77',basophil:'#d785ef',mast_cell:'#fba873',complement:'#fff29a',interferon:'#69cfff'};
  function fireWeapon(u,target,damage,tagDuration=0){
    sfx(({neutrophil:'blaster',macrophage:'heavy',nk_cell:'pulse',cytotoxic_t:'arc',b_cell:'antibody',memory_b:'antibody'})[u.type]);
    const life=tagDuration ? .28 : .22;
    const color=WEAPON_COLORS[u.type]||'#7aeede';
    state.projectiles.push({x:u.x+30,y:u.y+2,targetId:target.id,targetX:target.x,targetY:target.y,damage,source:u.type,life,maxLife:life,item:tagDuration?'antibody':'energy',tagDuration,color});
    state.effects.push({type:'muzzle',x:u.x+42,y:u.y+2,color,life:.18,maxLife:.18});
    emitSparks(u.x+42,u.y+2,color,3,45);
  }

  function findBlockingUnit(enemy){
    const all=[...state.units,...state.barriers].filter(u=>!u.dead&&u.row===enemy.row&&u.x<enemy.x+4);
    if(!all.length)return null;
    all.sort((a,b)=>b.x-a.x);
    return enemy.x-all[0].x<(DATA.enemies[enemy.type].ranged?145:58)?all[0]:null;
  }
  function updateEnemies(dt){
    const dead=[];
    for(const e of state.enemies){
      if(e.dead)continue;
      // Lethal damage must stop movement, attacks and boss summons immediately.
      if(e.hp<=0){e.dead=true;dead.push(e);continue;}
      const tpl=DATA.enemies[e.type];
      e.attackTimer-=dt;
      if(tpl.summonEvery){
        e.summonTimer-=dt;
        if(e.summonTimer<=0){
          act(e);
          e.summonTimer=tpl.summonEvery;
          const type=tpl.summon;
          const count=tpl.finalBoss?3:tpl.boss?2:1;
          for(let i=0;i<count;i++)spawnEnemy(type,Math.floor(Math.random()*GRID.rows),true);
          banner(tpl.finalBoss?'VIRAL BURST':'BOSS memanggil patogen');
        }
      }
      const blocker=findBlockingUnit(e);
      if(blocker){
        if(e.attackTimer<=0){
          e.attackTimer=tpl.attackCooldown;
          act(e);blocker.hurtUntil=state.elapsed+.16;
          if(blocker.type==='platelet')act(blocker,.6);
          blocker.hp-=tpl.damage*(state.level.enemyDamageScale||1)*((blocker.resistanceUntil||0)>state.elapsed?.72:1);
          burst(tpl.ranged?'toxin':'antibody_impact',blocker.x,blocker.y,64);
          impactVFX(blocker.x,blocker.y,tpl.ranged?'#b670d8':'#ff8991',false,!!tpl.boss);
          if(blocker.hp<=0){blocker.dead=true;fallen('characters',blocker);}
        }
      } else {
        const slow=((state.elapsed<state.buffs.feverUntil)?0.65:1)*((e.slowUntil||0)>state.elapsed?.65:1);
        e.x-=tpl.speed*slow*dt;
      }
      if(e.x<GRID.x-48){
        e.dead=true;
        const impact=tpl.boss?30:tpl.kind==='infected'?16:10;
        state.tissue=Math.max(0,state.tissue-impact);
        sfx('breach');
        hitEffect(GRID.x-35,e.y,'#ff6977');
        addLog(`${tpl.name} menembus pertahanan: Tissue Health −${impact}.`);
      }
      if(e.hp<=0&&!e.dead){ e.dead=true; dead.push(e); }
    }
    for(const e of dead) onEnemyKilled(e);
    state.enemies=state.enemies.filter(e=>!e.dead);
    state.barriers=state.barriers.filter(b=>!b.dead&&b.expires>state.elapsed);
    if(state.tissue<=0&&!state.levelWon) loseLevel();
  }

  function onEnemyKilled(e){
    sfx('enemy_down');
    const tpl=DATA.enemies[e.type];
    state.energy+=tpl.reward;
    if(tpl.kind==='bacteria'||tpl.kind==='virus'||tpl.kind==='infected') state.signal+=2;
    if(tpl.boss){
      banner(`${tpl.name.replace('BOSS — ','').replace('FINAL BOSS — ','')} dikalahkan`);
      addLog(`${tpl.name} berhasil dieliminasi.`);
    }
    fallen('enemies',e);resourcePop('energy',e.x,e.y,tpl.reward);
    impactVFX(e.x,e.y,tpl.boss?'#ffcf8b':'#9eeede',false,!!tpl.boss);
    if(tpl.boss)burst('antibody_impact',e.x,e.y,140);
  }

  function sampleAntigen(k,n){
    sfx('scan');
    const before=state.antigenSamples[k];
    state.antigenSamples[k]=Math.min(3,before+n);
    state.signal+=3*n;
    if(before<3&&state.antigenSamples[k]>=3){
      addLog(`${DATA.antigens[k].name} dikenali. Antibodi yang cocok kini dapat diaktifkan.`);
      banner(`${DATA.antigens[k].label} ANTIGEN RECOGNIZED`);
    }
    renderAntibodyPanel();
  }

  function activateAntibody(k){
    if(!state.running||state.paused)return;
    if(state.antigenSamples[k]<3){toast('Antigen belum dikenali. Kumpulkan 3 sampel dengan Sel Dendritik.');return;}
    if(state.signal<15){toast('Immune Signal belum cukup (butuh 15).');return;}
    sfx('antibody');
    state.signal-=15; state.activeAntibody=k; state.antibodyUntil=state.elapsed+14;
    let count=0;
    state.enemies.forEach(e=>{if(e.antigen===k){e.taggedUntil=state.antibodyUntil;burst('antibody_impact',e.x,e.y,82);count++;}});
    state.units.filter(u=>['b_cell','memory_b'].includes(u.type)).forEach(u=>act(u));
    addLog(`Antibodi ${DATA.antigens[k].label} aktif: ${count} target cocok ditandai.`);
    banner(`ANTIBODY ${DATA.antigens[k].label} ACTIVE`);
    renderAntibodyPanel();
  }

  // ---------- abilities ----------
  function useAbility(key){
    if(!state.running||state.paused)return;
    const a=DATA.abilities[key];
    if(!a||a.unlock>state.level.id)return;
    if(state.elapsed<(state.cooldowns[key]||0)){sfx('invalid');toast('Buff masih cooldown.');return;}
    sfx('ability');
    state.cooldowns[key]=state.elapsed+a.cooldown;
    if(key==='oxygen'){
      state.buffs.oxygenUntil=state.elapsed+12; banner('OXYGEN BOOST'); addLog('Suplai O₂ meningkat sementara.');
    } else if(key==='clot'){
      const threat=[0,1,2,3,4].map(r=>({r,score:state.enemies.filter(e=>e.row===r).reduce((s,e)=>s+(GRID.x+GRID.cols*GRID.tw-e.x+300),0)})).sort((a,b)=>b.score-a.score)[0].r;
      let col=8; while(col>=0&&occupied(threat,col))col--;
      if(col<0){state.cooldowns[key]=state.elapsed;toast('Lane penuh; Clot Barrier tidak ditempatkan.');return;}
      const x=GRID.x+col*GRID.tw+GRID.tw/2,y=GRID.y+threat*GRID.th+GRID.th/2;
      state.barriers.push({type:'clot_barrier',row:threat,col,x,y,hp:1350,maxHp:1350,dead:false,expires:state.elapsed+14});
      burst('shield',x,y,110);
      banner('FIBRIN CLOT'); addLog(`Clot Barrier terbentuk pada lane ${threat+1}.`);
    } else if(key==='cytokine'){
      state.buffs.cytokineUntil=state.elapsed+10; banner('CYTOKINE SIGNAL'); addLog('Sinyal sitokin meningkatkan tempo serangan sel imun.');
    } else if(key==='fever'){
      state.buffs.feverUntil=state.elapsed+12; banner('FEVER RESPONSE'); addLog('Patogen melambat sementara. Ini adalah abstraksi gameplay dari efek demam.');
    } else if(key==='analysis'){
      const active=[...new Set(state.enemies.map(e=>e.antigen))];
      active.forEach(k=>sampleAntigen(k,3)); state.signal+=8; banner('RAPID ANTIGEN ANALYSIS');
    } else if(key==='complement'){
      const tagged=state.enemies.filter(e=>e.taggedUntil>state.elapsed);
      if(!tagged.length){state.cooldowns[key]=state.elapsed;toast('Tidak ada target antibody-tagged. Cooldown dibatalkan.');return;}
      state.effects.push({type:'supportCameo',x:tagged[0].x-100,y:tagged[0].y,life:.85,maxLife:.85});
      tagged.forEach(e=>{
        const tpl=DATA.enemies[e.type];
        const ratio=tpl.boss?0.18:0.38;
        applyDamage(e,e.maxHp*ratio,'complement_ability');
        hitEffect(e.x,e.y,'#ffe26a');
      });
      banner('COMPLEMENT CASCADE'); addLog(`Complement menyerang ${tagged.length} target yang sudah ditandai antibodi.`);
    } else if(key==='inflammation'){
      const loss=state.units.some(u=>!u.dead&&u.type==='treg')?3:8;
      state.buffs.inflammationUntil=state.elapsed+10;state.tissue=Math.max(1,state.tissue-loss);banner('LONJAKAN INFLAMASI');addLog(`Damage meningkat, biaya jaringan −${loss}${loss===3?' (diredam Sel T Regulator)':''}.`);
    }
    updateHUD();
  }

  // ---------- misc systems ----------
  function updateMetabolism(dt){
    state.baselineTimer+=dt; state.metabolismTimer+=dt;
    if(state.baselineTimer>=1){state.baselineTimer=0;state.energy+=2;}
    if(state.metabolismTimer>=4){
      state.metabolismTimer=0;
      if(state.oxygen>=10&&state.nutrient>=8){state.oxygen-=10;state.nutrient-=8;state.energy+=14;}
    }
    if(state.activeAntibody&&state.elapsed>=state.antibodyUntil){state.activeAntibody=null;renderAntibodyPanel();}
  }

  function updateEffects(dt){
    state.projectiles.forEach(p=>{
      p.life-=dt;
      const target=state.enemies.find(e=>e.id===p.targetId&&!e.dead&&e.hp>0);
      if(target){p.targetX=target.x;p.targetY=target.y;}
      if(p.life<=0&&target&&state.running){
        if(p.tagDuration){target.taggedUntil=Math.max(target.taggedUntil||0,state.elapsed+p.tagDuration);burst('antibody_impact',target.x,target.y,72);impactVFX(target.x,target.y,p.color);}
        else applyDamage(target,p.damage,p.source);
      }
    });state.projectiles=state.projectiles.filter(p=>p.life>0);
    state.effects.forEach(e=>{e.life-=dt;if(e.type==='spark'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=e.gravity*dt;}});
    state.effects=state.effects.filter(e=>e.life>0);
  }

  function addLog(msg){
    state.log.unshift(msg); state.log=state.log.slice(0,9);
    $('#bioLog').innerHTML=state.log.map(x=>`<div class="log-entry">${x}</div>`).join('');
  }
  function toast(msg){
    const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function banner(msg){
    const el=$('#waveBanner');el.textContent=msg;el.classList.add('show');clearTimeout(banner._t);banner._t=setTimeout(()=>el.classList.remove('show'),1600);
  }
  function act(actor,duration=.42){actor.actionUntil=state.elapsed+duration;}
  function burst(name,x,y,size=80){state.effects.push({type:'vfx',name,x,y,size,life:.6,maxLife:.6});}
  // Short-lived canvas particles share the game's simulation clock, so pause and speed work normally.
  function emitSparks(x,y,color,count=7,speed=100){
    if(state.effects.length>230)return;
    for(let i=0;i<count;i++){
      const angle=i*Math.PI*2/count+Math.random()*.5,velocity=speed*(.55+Math.random()*.7),life=.25+Math.random()*.25;
      state.effects.push({type:'spark',x,y,vx:Math.cos(angle)*velocity,vy:Math.sin(angle)*velocity,gravity:35,color,r:1.5+Math.random()*2,life,maxLife:life});
    }
  }
  function impactVFX(x,y,color,shield=false,large=false){
    state.effects.push({type:'shockwave',x,y,color,shield,life:large?.42:.28,maxLife:large?.42:.28,size:large?55:shield?36:27});
    emitSparks(x,y,color,large?11:shield?8:6,large?155:100);
  }
  function resourcePop(item,x,y,value){if(item==='oxygen')sfx('oxygen');if(item==='nutrient')sfx('heal');state.effects.push({type:'resource',item,value,x,y:y-15,life:1.1,maxLife:1.1});}
  function fallen(kind,actor){
    if(!SPRITES[kind][actor.type])return;
    state.effects.push({type:'fallen',kind,actor:actor.type,x:actor.x,y:actor.y,life:.75,maxLife:.75});
  }
  function hitEffect(x,y,color){burst('antibody_impact',x,y,85);impactVFX(x,y,color);}

  // ---------- victory / defeat ----------
  function winLevel(){
    if(state.levelWon)return; state.levelWon=true;state.running=false;
    window.IMMUNO_MUSIC?.setScene('menu');
    sfx('victory');
    const result=PROGRESS.complete(state.level.id,state.tissue,state.elapsed);
    selectedChapter=Math.ceil(Math.min(50,state.level.id+1)/10);
    const q=state.level.quiz;
    showModal(`<span class="result-badge">MISSION COMPLETE</span><h2>${state.level.title} selesai</h2>
      <p class="reward-line">${'★'.repeat(result.stars)} · Skor ${result.score} · +${result.reward} Riset</p><p>Tissue Health tersisa <strong>${Math.round(state.tissue)}%</strong>. Sebelum lanjut, jawab satu pertanyaan cepat.</p>
      <h3>${q.q}</h3><div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option" data-answer="${i}">${o}</button>`).join('')}</div>
      <div id="quizFeedback"></div>
      <div class="modal-actions"><button class="secondary-btn" id="backLevelsBtn">Pilih Level</button>${state.level.id<50?'<button class="primary-btn" id="nextLevelBtn">Level Berikutnya</button>':'<button class="primary-btn" id="finishBtn">Selesai</button>'}</div>`,false);
    $$('.quiz-option').forEach(btn=>btn.onclick=()=>{
      const ans=Number(btn.dataset.answer),correct=ans===q.answer;
      $$('.quiz-option').forEach((b,i)=>{b.disabled=true;if(i===q.answer)b.classList.add('correct');});
      if(!correct)btn.classList.add('wrong');
      $('#quizFeedback').innerHTML=correct?'<p><strong>Benar.</strong> Konsep utama level berhasil dikenali.</p>':'<p>Jawaban yang benar ditandai hijau. Coba kaitkan kembali dengan mekanik yang baru dimainkan.</p>';
      saveQuiz(state.level.id,correct);
    });
    $('#backLevelsBtn').onclick=()=>{closeModal();showScreen('levels');};
    if($('#nextLevelBtn'))$('#nextLevelBtn').onclick=()=>{closeModal();startLevel(state.level.id+1);};
    if($('#finishBtn'))$('#finishBtn').onclick=()=>{closeModal();showScreen('levels');};
  }
  function loseLevel(){
    window.IMMUNO_MUSIC?.setScene('menu');
    sfx('defeat');
    state.running=false;
    showModal(`<span class="result-badge" style="background:#fff0f1;color:#a64150">TISSUE FAILURE</span><h2>Pertahanan runtuh</h2><p>Patogen menembus terlalu banyak lane dan Tissue Health mencapai 0%.</p><p>Strategi cepat: perbanyak Eritrosit di awal, letakkan tank/barrier pada lane dengan tekanan tinggi, lalu simpan buff untuk gelombang BOSS.</p><div class="modal-actions"><button class="secondary-btn" id="loseLevels">Pilih Level</button><button class="primary-btn" id="retryBtn">Ulangi Level</button></div>`,false);
    $('#retryBtn').onclick=()=>{closeModal();startLevel(state.level.id);};
    $('#loseLevels').onclick=()=>{closeModal();showScreen('levels');};
  }

  // ---------- HUD ----------
  function setText(el,value){ if(el&&el.textContent!==String(value))el.textContent=String(value); }
  function setHTML(el,value){ if(el&&el.innerHTML!==value)el.innerHTML=value; }
  function updateHUD(){
    $('#energyValue').textContent=Math.floor(state.energy);
    $('#oxygenValue').textContent=Math.floor(state.oxygen);
    $('#nutrientValue').textContent=Math.floor(state.nutrient);
    $('#signalValue').textContent=Math.floor(state.signal);
    $('#healthValue').textContent=`${Math.round(state.tissue)}%`;
    const total=state.level?.waves.length||4;
    const waveNumber=Math.max(1,state.waveIndex+1);
    $('#waveText').textContent=(state.waveIndex<0 && !state.waveActive) ? `Persiapan / ${total} wave` : `Wave ${waveNumber}/${total}`;
    const pct=state.levelWon?100:Math.max(0,Math.min(100,((Math.max(0,state.waveIndex)+(state.waveActive?0.55:state.waveIndex<0?0:1))/total)*100));
    $('#waveProgressBar').style.width=`${pct}%`;
    const count=state.enemies.length;
    const nextIn=Math.max(0,state.intermissionUntil-state.elapsed);
    $('#threatText').textContent = state.levelWon ? 'Semua ancaman dinetralisir' :
      (state.running && !state.waveActive && nextIn>0.05) ? `Wave berikutnya dalam ${nextIn.toFixed(1)} dtk` :
      count>10 ? `Threat: kritis • ${count} patogen` :
      count>5 ? `Threat: tinggi • ${count} patogen` :
      count>0 ? `Threat: aktif • ${count} patogen` : 'Threat: stabil';
    // cooldowns
    $$('.ability-btn').forEach(btn=>{
      const k=btn.dataset.ability,end=state.cooldowns[k]||0,remain=Math.max(0,end-state.elapsed),holder=btn.querySelector('.cooldown-holder');
      btn.classList.toggle('cooling',remain>0);
      setHTML(holder,remain>0?`<span class="cooldown-mask">${Math.ceil(remain)}</span>`:'');
    });
    $$('.unit-card').forEach(btn=>{
      const t=DATA.units[btn.dataset.unit];
      if(t) btn.classList.toggle('unaffordable',state.energy<t.cost);
    });
    updateUnitInspector();
    updateBossPanel();
  }
  function updateBossPanel(){
    const boss=state.enemies.find(e=>DATA.enemies[e.type].boss&&!e.dead);
    if(state.running)window.IMMUNO_MUSIC?.setScene(boss?'boss':'battle');
    const panel=$('#bossPanel');
    if(!boss){panel.classList.add('hidden');return;}
    panel.classList.remove('hidden');
    const tpl=DATA.enemies[boss.type],pct=Math.max(0,boss.hp/boss.maxHp*100),shield=boss.maxShield?` • Shield ${Math.ceil(Math.max(0,boss.shield))}`:'';
    setHTML(panel,`<h3>BOSS</h3><div class="boss-name">${tpl.name}</div><div class="boss-hp"><div style="width:${pct}%"></div></div><div class="boss-meta"><span>HP ${Math.ceil(Math.max(0,boss.hp))}/${boss.maxHp}${shield}</span><span>${DATA.antigens[boss.antigen].label}</span></div>`);
  }

  // ---------- rendering ----------
  function drawImageSafe(src,x,y,w,h,alpha=1){
    const im=images[src]; if(!im)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,x,y,w,h);ctx.restore();
  }
  function actorHeight(kind,type){
    if(kind==='characters') return type==='macrophage'?94:type==='platelet'?86:80;
    return DATA.enemies[type].boss?116:82;
  }
  function fallbackAsset(kind,type,pose){
    const meta=spriteMeta(kind,type);
    const base=kind==='characters'?DATA.units[type]?.asset:DATA.enemies[type]?.asset;
    return [meta?.frames?.[pose],meta?.frames?.idle,base].find(src=>src&&images[src]);
  }
  function drawSprite(kind,type,pose,x,footY,alpha=1){
    const src=fallbackAsset(kind,type,pose);
    if(!src){
      // Keep the board playable if an entire actor's images are missing.
      ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=kind==='characters'?'#61d3bd':'#eb788e';
      ctx.beginPath();ctx.arc(x,footY-30,27,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#17324d';ctx.textAlign='center';ctx.font='bold 11px system-ui';
      ctx.fillText((DATA.units[type]?.short||DATA.enemies[type]?.name||'?').slice(0,12),x,footY-26);ctx.restore();return;
    }
    const m=spriteMetrics[src];
    if(!m){ drawImageSafe(src,x-36,footY-72,72,72,alpha); return; }
    const scale=actorHeight(kind,type)/Math.max(1,m.contentH);
    if(spriteMeta(kind,type)?.flipX){
      ctx.save();ctx.translate(x,footY);ctx.scale(-1,1);
      drawImageSafe(src,-m.centerX*scale,-m.bottomY*scale,m.fullW*scale,m.fullH*scale,alpha);
      ctx.restore();
    }else drawImageSafe(src,x-m.centerX*scale,footY-m.bottomY*scale,m.fullW*scale,m.fullH*scale,alpha);
  }
  function drawActor(kind,a){
    const allied=kind==='characters',tpl=allied?DATA.units[a.type]:DATA.enemies[a.type];
    const active=(a.actionUntil||0)>state.elapsed;
    const hurt=(a.hurtUntil||0)>state.elapsed;
    const pose=allied&&state.levelWon?'victory':hurt?'hurt':active?(allied?'action':'attack'):'idle';
    const bob=pose==='idle'?Math.sin(state.elapsed*(allied?2.7:7)+a.x*.037)*1.6:0;
    const spawnLift=allied&&a.spawnUntil>state.elapsed ? Math.sin(Math.max(0,Math.min(1,(a.spawnUntil-state.elapsed)/.8))*Math.PI)*7 : 0;
    const footY=a.y+32-spawnLift;
    ctx.save();ctx.fillStyle='rgba(60,24,55,.15)';ctx.beginPath();ctx.ellipse(a.x,footY,allied?25:tpl.boss?42:25,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
    // Auras follow live buffs and status; RBC keeps its oxygen-bubble identity.
    const aura=allied?(a.type==='rbc'?'#8de9f9':a.resistanceUntil>state.elapsed?'#7bdcff':state.buffs.cytokineUntil>state.elapsed?'#aaf2a1':a.type==='helper_t'?'#68e4bf':null)
      :a.shield>0?'#7bdcff':a.taggedUntil>state.elapsed?'#ffe28a':tpl.boss?'#f39ac7':null;
    if(aura){
      const phase=state.elapsed*3+a.x*.03, radius=(tpl.boss?48:34)+Math.sin(phase)*2;
      ctx.save();ctx.globalAlpha=allied&&a.type==='rbc'?.22:.28;ctx.strokeStyle=aura;ctx.shadowColor=aura;ctx.shadowBlur=15;ctx.lineWidth=3;
      ctx.beginPath();ctx.ellipse(a.x,a.y-8,radius,radius*.78,0,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=.15;ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(a.x,footY-2,radius+5,9,0,0,Math.PI*2);ctx.fill();ctx.restore();
      if(allied&&a.type==='rbc')for(let i=0;i<3;i++){
        const t=(state.elapsed*.24+i/3)%1,ang=i*2.4+state.elapsed*.4;
        oxygenBubble(a.x+Math.cos(ang)*(26+7*t),a.y-17+Math.sin(ang)*17-t*8,2+i%2,.3+t*.3);
      }
    }
    if(allied&&a.type==='helper_t'){
      ctx.beginPath();ctx.ellipse(a.x,a.y+8,65,30,0,0,Math.PI*2);ctx.strokeStyle='rgba(52,174,143,.26)';ctx.lineWidth=2;ctx.stroke();
    }
    if(allied&&a.type==='plasma')drawImageSafe(SPRITES.items.plasma_pool,a.x-37,footY-20,74,32,.5);
    if(allied&&a.type==='rbc'&&active){
      // Separate round oxygen bubbles, gently drifting inward/up; no fire aura.
      for(let i=0;i<6;i++){
        const q=(state.elapsed*.7+i/6)%1,angle=i*Math.PI/3;
        const radius=49*(1-q)+15;
        oxygenBubble(a.x+Math.cos(angle)*radius,a.y-15+Math.sin(angle)*radius*.6-q*15,3+i%3,Math.sin(q*Math.PI)*.75);
      }
    }
    const recoil=allied&&active&&WEAPON_COLORS[a.type]?-Math.sin(Math.min(1,Math.max(0,((a.actionUntil-state.elapsed)/.42)))*Math.PI)*2.5:0;
    drawSprite(kind,a.type,pose,a.x+recoil,footY+bob);
    if(hurt){ctx.save();ctx.globalAlpha=Math.max(0,(a.hurtUntil-state.elapsed)/.16)*.46;ctx.strokeStyle=allied?'#ff818d':'#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a.x,a.y-12,tpl.boss?48:31,0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(allied&&a.type==='rbc'){
      const charge=Math.min(1,a.resourceTimer/4);ctx.fillStyle='rgba(8,24,38,.7)';ctx.fillRect(a.x-20,footY+7,40,3);ctx.fillStyle='#8ceaff';ctx.fillRect(a.x-20,footY+7,40*charge,3);
    }
    if(a.hp<a.maxHp||tpl.boss)healthBar(a.x-(tpl.boss?44:29),footY+6,tpl.boss?88:58,a.hp/a.maxHp,allied?'#70cf91':tpl.boss?'#ef6577':'#f0a856');
    if(!allied){
      if(a.taggedUntil>state.elapsed)drawImageSafe('assets/effects/antibody_tag.webp',a.x+16,a.y-51,30,30);
      if(a.shield>0){ctx.beginPath();ctx.ellipse(a.x,a.y-6,tpl.boss?59:41,tpl.boss?56:40,0,0,Math.PI*2);ctx.strokeStyle='rgba(74,202,245,.7)';ctx.lineWidth=3;ctx.stroke();}
    }
  }
  function oxygenBubble(x,y,r,alpha=1){
    ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.lineWidth=1.2;
    ctx.fillStyle='rgba(106,221,253,.25)';ctx.strokeStyle='#b4f5ff';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#f0ffff';ctx.beginPath();ctx.arc(x-r*.3,y-r*.35,Math.max(.7,r*.2),0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawFrontierStrip(hostile){
    const x=hostile?1028:36,center=x+31,top=GRID.y,height=GRID.rows*GRID.th;
    ctx.save();
    const glow=ctx.createLinearGradient(x,0,x+62,0);
    if(hostile){glow.addColorStop(0,'#33183eb8');glow.addColorStop(.65,'#481c58e8');glow.addColorStop(1,'#170f32ee');}
    else{glow.addColorStop(0,'#153f4fe8');glow.addColorStop(.5,'#196a70e8');glow.addColorStop(1,'#164654b8');}
    roundRect(ctx,x,top,62,height,15);ctx.fillStyle=glow;ctx.fill();ctx.lineWidth=2;
    ctx.strokeStyle=hostile?'#ed82d8a6':'#8fe9d6a6';ctx.stroke();
    ctx.fillStyle=hostile?'#fc9de1':'#b8fff2';
    for(let lane=0;lane<GRID.rows;lane++){
      const cy=top+GRID.th*(lane+.5);
      ctx.globalAlpha=lane===2?.8:.52;
      ctx.beginPath();ctx.arc(center,cy,9,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=hostile?'#4e1d56':'#155263';
      ctx.beginPath();
      if(hostile){ctx.moveTo(center-5,cy);ctx.lineTo(center+3,cy-5);ctx.lineTo(center+3,cy+5);}
      else{ctx.moveTo(center-3,cy-5);ctx.lineTo(center+5,cy);ctx.lineTo(center-3,cy+5);}
      ctx.closePath();ctx.fill();ctx.fillStyle=hostile?'#fc9de1':'#b8fff2';
    }
    ctx.globalAlpha=1;
    const plaqueY=top+height/2;
    ctx.save();ctx.translate(center,plaqueY);ctx.rotate(-Math.PI/2);
    roundRect(ctx,-59,-17,118,34,12);ctx.fillStyle=hostile?'#381c48f5':'#0d4450f5';ctx.fill();
    ctx.strokeStyle=hostile?'#ff93d8':'#a6fff1';ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle=hostile?'#ffe0f6':'#e3fff8';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.letterSpacing='1.2px';
    ctx.fillText(hostile?'PATOGEN':'JARINGAN',0,1);
    ctx.restore();ctx.restore();
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(!state.level){ctx.fillStyle='#19384a';ctx.fillRect(0,0,canvas.width,canvas.height);return;}
    const bg=images[state.level.background];
    if(bg)ctx.drawImage(bg,0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(21,21,38,.07)';ctx.fillRect(0,0,canvas.width,canvas.height);
    // Calm the busy background exactly under the playable grid so units remain readable.
    ctx.save();roundRect(ctx,GRID.x-8,GRID.y-8,GRID.cols*GRID.tw+16,GRID.rows*GRID.th+16,20);
    ctx.fillStyle='rgba(255,236,228,.49)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=2;ctx.stroke();ctx.restore();

    // subtle ambient particles so the bloodstream feels alive
    for(let i=0;i<16;i++){
      const px=(i*79 + (state.elapsed*22*(i%3+1)))%(canvas.width+120)-60;
      const py=58 + (i*37)%520 + Math.sin(state.elapsed*0.9+i)*9;
      const r=3 + (i%4)*1.6;
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2);
      ctx.fillStyle=i%3===0?'rgba(255,255,255,.10)':i%3===1?'rgba(127,232,226,.09)':'rgba(255,216,147,.08)';
      ctx.fill();
    }

    // Illustrated frontier strips make the defend and spawn sides immediately distinct.
    drawFrontierStrip(false);drawFrontierStrip(true);

    // grid tiles
    for(let r=0;r<GRID.rows;r++)for(let c=0;c<GRID.cols;c++){
      const x=GRID.x+c*GRID.tw,y=GRID.y+r*GRID.th,key=`${r},${c}`;
      let tile='assets/effects/tile_normal.webp';
      if(state.wounds.has(key))tile='assets/effects/tile_wound.webp';
      else if(state.infectedTiles.has(key))tile='assets/effects/tile_infected.webp';
      if(tile!=='assets/effects/tile_normal.webp')drawImageSafe(tile,x+2,y+2,GRID.tw-4,GRID.th-4,.72);
      else{ctx.fillStyle=(r+c)%2?'rgba(255,253,235,.07)':'rgba(111,50,94,.035)';ctx.fillRect(x,y,GRID.tw,GRID.th);}
      ctx.strokeStyle='rgba(114,52,86,.18)';ctx.lineWidth=1;ctx.strokeRect(x,y,GRID.tw,GRID.th);
    }
    // hover
    if(state.hoverCell){
      const {r,c}=state.hoverCell,tpl=state.selectedUnit?DATA.units[state.selectedUnit]:null;
      const blocked=occupied(r,c)||(tpl&&state.energy<tpl.cost);
      ctx.fillStyle=blocked?'rgba(235,94,106,.24)':'rgba(114,229,208,.22)';ctx.fillRect(GRID.x+c*GRID.tw+3,GRID.y+r*GRID.th+3,GRID.tw-6,GRID.th-6);
      ctx.strokeStyle=blocked?'#ef6b76':'#7be5d1';ctx.lineWidth=3;ctx.strokeRect(GRID.x+c*GRID.tw+4,GRID.y+r*GRID.th+4,GRID.tw-8,GRID.th-8);
    }

    // placement / selection feedback
    if(state.hoverCell&&state.selectedUnit){
      const {r,c}=state.hoverCell, tpl=DATA.units[state.selectedUnit];
      const cx=GRID.x+c*GRID.tw+GRID.tw/2,cy=GRID.y+r*GRID.th+GRID.th/2;
      const blocked=occupied(r,c)||state.energy<tpl.cost;
      if(tpl.damage&&!blocked){
        ctx.save();ctx.beginPath();ctx.arc(cx,cy,Math.min(tpl.range,310),0,Math.PI*2);ctx.fillStyle='rgba(111,225,202,.055)';ctx.fill();ctx.strokeStyle='rgba(111,225,202,.33)';ctx.setLineDash([7,7]);ctx.stroke();ctx.restore();
      }
      if(!blocked)drawSprite('characters',state.selectedUnit,'idle',cx,cy+32,.48);
    }
    const selected=selectedPlacedUnit();
    if(selected){
      const tpl=selected.stats||PROGRESS.stats(selected.type);
      ctx.save();ctx.beginPath();ctx.arc(selected.x,selected.y+3,38+Math.sin(state.elapsed*6)*2,0,Math.PI*2);ctx.strokeStyle='rgba(255,225,104,.92)';ctx.lineWidth=3;ctx.stroke();
      if(tpl.damage){ctx.beginPath();ctx.arc(selected.x,selected.y,Math.min(tpl.range,310),0,Math.PI*2);ctx.strokeStyle='rgba(255,225,104,.26)';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.stroke();}
      const label=tpl.name; ctx.setLineDash([]); ctx.font='800 12px system-ui'; ctx.textAlign='center';
      const w=ctx.measureText(label).width+18; roundRect(ctx,selected.x-w/2,selected.y-84,w,22,10); ctx.fillStyle='rgba(18,45,64,.82)'; ctx.fill();
      ctx.fillStyle='#eefaff'; ctx.fillText(label,selected.x,selected.y-69);
      ctx.restore();
    }

    // barriers
    for(const b of state.barriers){
      drawImageSafe('assets/effects/clot_barrier.webp',b.x-41,b.y-41,82,82);
      healthBar(b.x-35,b.y+37,70,b.hp/b.maxHp,'#d59bcb');
    }

    // Paint actors by lane/foot position so neighboring rows overlap naturally.
    const actors=[...state.units.filter(a=>!a.dead).map(a=>({kind:'characters',a})),...state.enemies.filter(a=>!a.dead).map(a=>({kind:'enemies',a}))];
    actors.sort((a,b)=>a.a.y-b.a.y||a.a.x-b.a.x);
    for(const {kind,a} of actors)drawActor(kind,a);

    for(const p of state.projectiles)drawProjectile(p);
    for(const ef of state.effects){
      const a=Math.max(0,ef.life/ef.maxLife);
      if(ef.type==='supportCameo'){
        drawSprite('characters','complement','action',ef.x,ef.y+32,Math.min(1,a*3));
      }else if(ef.type==='muzzle'){
        ctx.save();ctx.globalAlpha=a;ctx.fillStyle=ef.color;ctx.shadowColor=ef.color;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(ef.x-7,ef.y);ctx.lineTo(ef.x+15,ef.y-7*a);ctx.lineTo(ef.x+8,ef.y);ctx.lineTo(ef.x+15,ef.y+7*a);ctx.closePath();ctx.fill();ctx.restore();
      }else if(ef.type==='chargeRelease'){
        for(let i=0;i<6;i++)oxygenBubble(ef.x-28+i*11+Math.sin(i)*6,ef.y+8-(1-a)*(42+i*3),3+i%3,a*.8);
      }else if(ef.type==='vfx'){
        const frames=SPRITES.effects[ef.name].frames;
        const frame=Math.min(frames.length-1,Math.floor((1-a)*frames.length));
        drawImageSafe(frames[frame],ef.x-ef.size/2,ef.y-ef.size/2,ef.size,ef.size,Math.min(1,a*4));
      }else if(ef.type==='resource'){
        const y=ef.y-(1-a)*43;
        drawImageSafe(SPRITES.items[ef.item],ef.x-13,y-13,26,26,Math.min(1,a*3));
        ctx.save();ctx.globalAlpha=Math.min(1,a*3);ctx.textAlign='left';ctx.font='800 15px system-ui';ctx.lineWidth=4;ctx.strokeStyle='#fff9e9';ctx.strokeText('+'+ef.value,ef.x+14,y+5);ctx.fillStyle='#51334e';ctx.fillText('+'+ef.value,ef.x+14,y+5);ctx.restore();
      }else if(ef.type==='fallen'){
        drawSprite(ef.kind,ef.actor,ef.kind==='enemies'?'defeat':'hurt',ef.x,ef.y+32+(1-a)*8,Math.min(1,a*2));
      }else if(ef.type==='pulse'){
        const q=1-a,r=ef.size+q*34;ctx.save();ctx.globalAlpha=Math.min(1,a*2);ctx.beginPath();ctx.arc(ef.x,ef.y,r,0,Math.PI*2);ctx.strokeStyle='rgba(122,239,214,.95)';ctx.lineWidth=3;ctx.stroke();ctx.restore();
      }else if(ef.type==='spark'){
        ctx.save();ctx.globalAlpha=a;ctx.fillStyle=ef.color;ctx.shadowColor=ef.color;ctx.shadowBlur=8;
        ctx.beginPath();ctx.arc(ef.x,ef.y,ef.r*a+.5,0,Math.PI*2);ctx.fill();ctx.restore();
      }else if(ef.type==='shockwave'){
        const q=1-a;ctx.save();ctx.globalAlpha=a*.75;ctx.strokeStyle=ef.color;ctx.lineWidth=ef.shield?4:3;
        ctx.shadowColor=ef.color;ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(ef.x,ef.y,8+ef.size*q,(8+ef.size*q)*.75,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }

    // active buff labels
    const buffLabels=[];
    if(state.elapsed<state.buffs.oxygenUntil)buffLabels.push('O₂ BOOST');
    if(state.elapsed<state.buffs.cytokineUntil)buffLabels.push('CYTOKINE');
    if(state.elapsed<state.buffs.feverUntil)buffLabels.push('FEVER');
    if(state.elapsed<state.buffs.inflammationUntil)buffLabels.push('INFLAMMATION');
    if(state.activeAntibody&&state.elapsed<state.antibodyUntil)buffLabels.push(`Ab ${DATA.antigens[state.activeAntibody].label}`);
    if(buffLabels.length){
      ctx.font='800 12px system-ui';ctx.textAlign='left';let xx=GRID.x;
      for(const b of buffLabels){const w=ctx.measureText(b).width+18;ctx.fillStyle='rgba(9,30,45,.78)';roundRect(ctx,xx,55,w,26,9);ctx.fill();ctx.fillStyle='#eafcff';ctx.fillText(b,xx+9,73);xx+=w+7;}
    }
  }
  function drawProjectile(p){
    const q=Math.max(0,Math.min(1,1-p.life/p.maxLife));
    const x=p.x+(p.targetX-p.x)*q,y=p.y+(p.targetY-p.y)*q,color=p.color||'#74e9ff';
    const angle=Math.atan2(p.targetY-p.y,p.targetX-p.x),heavy=p.source==='macrophage'||p.source==='mast_cell';
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineCap='round';ctx.shadowColor=color;ctx.shadowBlur=14;
    for(let i=3;i>0;i--){ctx.globalAlpha=(4-i)*.12;ctx.beginPath();ctx.arc(-i*11,Math.sin(q*13-i)*2,heavy?4:2.5,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    if(p.item==='antibody'){
      ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(0,0);ctx.lineTo(8,-8);ctx.moveTo(0,0);ctx.lineTo(8,8);ctx.stroke();
      ctx.fillStyle='#fff9d8';ctx.beginPath();ctx.arc(-5,0,2,0,Math.PI*2);ctx.fill();
    }else if(['nk_cell','cytotoxic_t','complement'].includes(p.source)){
      ctx.lineWidth=heavy?5:3;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(7,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-1,-6);ctx.lineTo(-4,0);ctx.lineTo(-1,6);ctx.closePath();ctx.fill();
    }else if(heavy){
      ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
    }else{
      ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(0,0);ctx.stroke();
      ctx.beginPath();ctx.arc(4,0,4,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle='#fff';ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(0,0,1.8,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function healthBar(x,y,w,ratio,color){ctx.fillStyle='rgba(12,35,50,.75)';roundRect(ctx,x,y,w,7,4);ctx.fill();ctx.fillStyle=color;roundRect(ctx,x+1,y+1,Math.max(0,(w-2)*ratio),5,3);ctx.fill();}
  function roundRect(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

  // ---------- main loop ----------
  const FIXED_STEP=1/60;
  function frame(now){
    const raw=Math.max(0,Math.min(.1,(now-state.lastFrame)/1000));
    state.lastFrame=now;
    if(screens.game.classList.contains('active')){
      if(state.running&&!state.paused){
        accumulator+=raw*state.speed;
        let steps=0;
        while(accumulator+1e-9>=FIXED_STEP&&steps<12&&state.running){
          state.elapsed+=FIXED_STEP;
          updateEffects(FIXED_STEP);updateUnits(FIXED_STEP);updateEnemies(FIXED_STEP);
          if(state.running){updateWaveSystem();if(state.running)updateMetabolism(FIXED_STEP);}
          accumulator-=FIXED_STEP;steps++;
        }
        accumulator=Math.max(0,Math.min(accumulator,FIXED_STEP));
        if(now-lastHUDFrame>=100||!state.running){updateHUD();lastHUDFrame=now;}
      }else{
        accumulator=0;
        if(!state.paused)updateEffects(raw);
      }
      draw();
    }else accumulator=0;
    requestAnimationFrame(frame);
  }
  function setUnitDock(open){
    $('.unit-sidebar').classList.toggle('collapsed',!open);
    $('#unitCards').hidden=!open;
    $('#unitToggleBtn').setAttribute('aria-expanded',String(open));
  }
  function setPauseUI(paused){
    $('#pauseOverlay').classList.toggle('hidden',!paused);
    $('#gameLiveHUD').inert=paused;
    $('#pauseBtn').setAttribute('aria-expanded',String(paused));
    $('#pauseBtn').setAttribute('aria-pressed',String(paused));
    if(paused){
      updateHUD();renderAntibodyPanel();
      setText($('#pauseResources'),`Energi ${Math.floor(state.energy)} · O₂ ${Math.floor(state.oxygen)} · Nutrisi ${Math.floor(state.nutrient)} · Signal ${Math.floor(state.signal)}`);
    }
  }
  function togglePause(){
    if(!state.running||!screens.game.classList.contains('active')||!$('#modal').classList.contains('hidden'))return;
    state.paused=!state.paused;accumulator=0;state.lastFrame=performance.now();
    window.IMMUNO_SOUND?.setPaused(state.paused);window.IMMUNO_MUSIC?.setPaused(state.paused);sfx('pause',{ui:true});
    $('#pauseBtn img').src=state.paused?'assets/ui/play.webp':'assets/ui/pause.webp';
    $('#pauseBtn').title=state.paused?'Lanjutkan':'Menu jeda (ESC / Space)';
    setPauseUI(state.paused);
    if(state.paused)$('#resumeBtn').focus?.();else $('#pauseBtn').focus?.();
    draw();
  }
  function chooseAntibody(key){
    if(state.paused){
      if(state.antigenSamples[key]<3){toast('Butuh 3 sampel antigen.');return;}
      if(state.signal<15){toast('Butuh 15 Immune Signal.');return;}
      togglePause();
    }
    activateAntibody(key);
  }
  function handleGameKey(ev){
    if(ev.repeat||!screens.game.classList.contains('active')||!$('#modal').classList.contains('hidden'))return;
    if(state.paused&&ev.code==='Tab'){
      const items=$$('#pauseOverlay button, #pauseOverlay input').filter(el=>!el.disabled&&el.getClientRects().length);
      if(items.length){const index=items.indexOf(document.activeElement);if(ev.shiftKey&&(index<=0)){ev.preventDefault();items[items.length-1].focus();}else if(!ev.shiftKey&&(index<0||index===items.length-1)){ev.preventDefault();items[0].focus();}}
      return;
    }
    if(ev.code==='Escape'){ev.preventDefault();togglePause();return;}
    if(['INPUT','TEXTAREA','SELECT'].includes(ev.target?.tagName)||ev.target?.isContentEditable)return;
    if(ev.code==='Space'){ev.preventDefault();togglePause();return;}
    if(state.paused)return;
    if(/^[1-9]$/.test(ev.key)){
      const keys=Object.keys(DATA.units).filter(k=>DATA.units[k].unlock<=getUnlocked()),key=keys[Number(ev.key)-1];
      if(key){state.selectedUnit=key;state.selectedPlacedId=null;renderUnitCards();updateHUD();draw();sfx('ui_click',{ui:true});}
    }
  }
  function handleUnitDrop(ev){
    const key=ev.dataTransfer?.getData('application/x-immunofront-unit');
    if(!DATA.units[key]||DATA.units[key].unlock>getUnlocked()||state.paused||!state.running)return;
    ev.preventDefault();const cell=cellFromPointer(ev);if(!cell)return;
    state.selectedUnit=key;placeUnit(cell.r,cell.c);renderUnitCards();draw();
  }

  // ---------- events ----------
  $('#touchStartBtn').addEventListener('click',()=>{if(!assetsReady)return;window.IMMUNO_MUSIC?.unlock();showScreen('start');$('#startBtn').focus?.();});
  $('#openUpgradeBtn').onclick=()=>showScreen('upgrades');
  $('#levelUpgradeBtn').onclick=()=>showScreen('upgrades');
  $('#openDatabookBtn').onclick=()=>showScreen('databook');
  $('#upgradeBackBtn').onclick=()=>showScreen('levels');
  $('#databookBackBtn').onclick=()=>showScreen('start');
  $('#resetProgressBtn').onclick=()=>confirmReset();
  $$('[data-book-tab]').forEach(b=>b.onclick=()=>{databookTab=b.dataset.bookTab;renderDatabook();});
  $('#backSplashBtn').addEventListener('click',()=>showScreen('splash'));
  $('#startBtn').addEventListener('click',()=>{if(assetsReady)showScreen('levels');});
  $('#openGuideBtn').addEventListener('click',guideModal);
  $('#levelBackBtn').addEventListener('click',()=>showScreen('start'));
  $('#modalCloseBtn').addEventListener('click',closeModal);
  $('#homeBtn').addEventListener('click',()=>{state.running=false;state.paused=false;window.IMMUNO_SOUND?.setPaused(false);showScreen('levels');});
  $('#restartBtn').addEventListener('click',()=>startLevel(state.level.id));
  $('#pauseBtn').addEventListener('click',togglePause);
  $('#resumeBtn').addEventListener('click',togglePause);
  $('#unitToggleBtn').addEventListener('click',()=>{setUnitDock($('#unitCards').hidden);sfx('ui_click',{ui:true});});
  $('#speedBtn').addEventListener('click',()=>{
    state.speed=state.speed===1?1.5:state.speed===1.5?2:1;$('#speedLabel').textContent=`${state.speed}×`;
  });
  function handleCanvasPointer(ev){
    if(ev.button!==undefined&&ev.button!==0)return;
    if(ev.isPrimary===false)return;
    if(ev.cancelable)ev.preventDefault();
    const c=cellFromPointer(ev);
    state.hoverCell=c;
    if(!c)return;
    placeUnit(c.r,c.c);
  }
  canvas.addEventListener('pointermove',ev=>{state.hoverCell=cellFromPointer(ev);});
  canvas.addEventListener('pointerleave',()=>state.hoverCell=null);
  canvas.addEventListener('pointerdown',handleCanvasPointer,{passive:false});
  canvas.addEventListener('contextmenu',ev=>ev.preventDefault());
  canvas.addEventListener('dragover',ev=>{
    if(state.running&&!state.paused&&Array.from(ev.dataTransfer?.types||[]).includes('application/x-immunofront-unit')){ev.preventDefault();ev.dataTransfer.dropEffect='copy';state.hoverCell=cellFromPointer(ev);}
  });
  canvas.addEventListener('drop',handleUnitDrop);
  window.addEventListener('dragend',()=>{state.hoverCell=null;});
  window.addEventListener('keydown',handleGameKey);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&state.running&&!state.paused)togglePause();
    state.lastFrame=performance.now();accumulator=0;
  });

  // ---------- init ----------
  preload().then(failed=>{
    assetsReady=true;
    $('#startBtn').disabled=false;
    $('#touchStartBtn').disabled=false;$('#touchStartBtn').classList.remove('hidden');
    $('#loadingPanel').classList.add('loaded');
    $('#loadingProgress').value=100;
    setText($('#loadingStatus'),failed.length?`${failed.length} aset gagal dimuat. Ekstrak seluruh ZIP; gambar cadangan digunakan sementara.`:'Semua aset siap • dapat dimainkan offline');
    renderLevelSelect();state.lastFrame=performance.now();requestAnimationFrame(frame);
  }).catch(err=>{
    console.error('Game gagal disiapkan:',err);
    setText($('#loadingStatus'),'Game gagal disiapkan. Ekstrak seluruh ZIP, lalu buka kembali index.html.');
  });
})();
