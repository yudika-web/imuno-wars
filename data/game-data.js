/* IMUNO WARS — data only. No rendering logic in this file. */
window.IMMUNO_DATA = {
  meta: {
    title: 'IMUNO WARS: Battle in the Bloodstream',
    version: '0.8.1-squad-cards',
    language: 'id'
  },
  units: {
    rbc: {name:'Eritrosit', short:'RBC', cost:50, hp:220, role:'resource', asset:'assets/characters/rbc.webp', unlock:1, description:'Mengangkut O₂ dan menghasilkan resource untuk respons imun.'},
    platelet: {name:'Trombosit', short:'PLT', cost:75, hp:900, role:'barrier', asset:'assets/characters/platelet.webp', unlock:1, description:'Membentuk penghalang bekuan untuk menahan patogen.'},
    neutrophil: {name:'Neutrofil', short:'NEU', cost:100, hp:420, damage:22, cooldown:1.05, range:275, role:'dps', asset:'assets/characters/neutrophil.webp', unlock:1, description:'Respons cepat; efektif menghadapi banyak bakteri.'},
    plasma: {name:'Plasma', short:'PLS', cost:75, hp:260, role:'support', asset:'assets/characters/plasma.webp', unlock:2, description:'Membawa nutrisi, membantu suplai dan regenerasi.'},
    macrophage: {name:'Makrofag', short:'MAC', cost:175, hp:850, damage:35, cooldown:1.55, range:205, role:'tank', asset:'assets/characters/macrophage.webp', unlock:2, description:'Tank fagosit; mendapat sinyal imun ketika menelan patogen.'},
    dendritic: {name:'Sel Dendritik', short:'DEN', cost:150, hp:360, role:'scanner', asset:'assets/characters/dendritic.webp', unlock:3, description:'Mengambil sampel antigen untuk membuka respons adaptif.'},
    nk_cell: {name:'Natural Killer', short:'NK', cost:175, hp:470, damage:32, cooldown:1.0, range:235, role:'anti-virus', asset:'assets/characters/nk_cell.webp', unlock:3, description:'Menyerang sel abnormal dan efektif pada ancaman virus.'},
    cytotoxic_t: {name:'Cytotoxic T', short:'CTL', cost:225, hp:500, damage:52, cooldown:1.2, range:245, role:'infected-cell', asset:'assets/characters/cytotoxic_t.webp', unlock:3, description:'Sangat efektif pada sel tubuh yang terinfeksi.'},
    b_cell: {name:'B Cell', short:'B', cost:180, hp:350, role:'antibody', asset:'assets/characters/b_cell.webp', unlock:4, description:'Menghasilkan antibodi setelah antigen dikenali.'},
    helper_t: {name:'Helper T', short:'Th', cost:200, hp:400, role:'buffer', asset:'assets/characters/helper_t.webp', unlock:4, description:'Menguatkan unit imun di area sekitar.'},
    memory_b: {name:'Memory B', short:'MB', cost:210, hp:390, role:'memory', asset:'assets/characters/memory_b.webp', unlock:5, description:'Mempercepat penandaan antigen yang sudah dipelajari.'}
  },
  enemies: {
    coccus: {name:'Bakteri Coccus', hp:135, speed:25, damage:22, attackCooldown:1.35, reward:14, kind:'bacteria', antigen:'circle', asset:'assets/enemies/coccus.webp'},
    bacillus: {name:'Bakteri Bacillus', hp:165, speed:32, damage:19, attackCooldown:1.2, reward:15, kind:'bacteria', antigen:'diamond', asset:'assets/enemies/bacillus.webp'},
    toxin_bacteria: {name:'Toxin Bacteria', hp:215, speed:22, damage:29, attackCooldown:1.55, reward:20, kind:'bacteria', antigen:'circle', ranged:true, asset:'assets/enemies/toxin_bacteria.webp'},
    capsule_bacterium: {name:'Capsule Bacterium', hp:360, speed:20, damage:29, attackCooldown:1.4, reward:28, kind:'bacteria', antigen:'diamond', armor:0.28, asset:'assets/enemies/capsule_bacterium.webp'},
    flagellated_bacteria: {name:'Flagellated Bacteria', hp:170, speed:48, damage:19, attackCooldown:1.0, reward:20, kind:'bacteria', antigen:'triangle', asset:'assets/enemies/flagellated_bacteria.webp'},
    free_virus: {name:'Virus Bebas', hp:125, speed:40, damage:20, attackCooldown:1.0, reward:16, kind:'virus', antigen:'triangle', asset:'assets/enemies/free_virus.webp'},
    shielded_virus: {name:'Shielded Virus', hp:260, speed:30, damage:23, attackCooldown:1.1, reward:24, kind:'virus', antigen:'star', armor:0.18, asset:'assets/enemies/shielded_virus.webp'},
    infected_cell: {name:'Sel Terinfeksi', hp:430, speed:13, damage:35, attackCooldown:1.5, reward:38, kind:'infected', antigen:'triangle', asset:'assets/enemies/infected_cell.webp'},
    bacteria_alpha: {name:'Bacteria Alpha', hp:260, speed:27, damage:24, attackCooldown:1.25, reward:23, kind:'bacteria', antigen:'circle', asset:'assets/enemies/bacteria_alpha.webp'},
    bacteria_beta: {name:'Bacteria Beta', hp:320, speed:24, damage:28, attackCooldown:1.35, reward:26, kind:'bacteria', antigen:'diamond', asset:'assets/enemies/bacteria_beta.webp'},
    virus_gamma: {name:'Virus Gamma', hp:235, speed:38, damage:23, attackCooldown:1.0, reward:24, kind:'virus', antigen:'triangle', asset:'assets/enemies/virus_gamma.webp'},
    boss_bacterial_colony: {name:'BOSS — Bacterial Colony', hp:2600, speed:13, damage:55, attackCooldown:1.2, reward:180, kind:'boss', subtype:'bacteria', antigen:'circle', boss:true, asset:'assets/enemies/boss_bacterial_colony.webp', summon:'coccus', summonEvery:7.5},
    boss_capsule_titan: {name:'BOSS — Capsule Titan', hp:4300, shield:1700, speed:11, damage:70, attackCooldown:1.15, reward:240, kind:'boss', subtype:'bacteria', antigen:'diamond', boss:true, armor:0.18, asset:'assets/enemies/boss_capsule_titan.webp', summon:'capsule_bacterium', summonEvery:9},
    boss_virus_factory: {name:'BOSS — Virus Factory', hp:5600, speed:7, damage:65, attackCooldown:1.3, reward:280, kind:'boss', subtype:'infected', antigen:'triangle', boss:true, asset:'assets/enemies/boss_virus_factory.webp', summon:'free_virus', summonEvery:5.8},
    boss_variant: {name:'BOSS — The Variant', hp:6800, speed:10, damage:74, attackCooldown:1.05, reward:320, kind:'boss', subtype:'virus', antigen:'triangle', boss:true, variant:true, asset:'assets/enemies/boss_variant.webp', summon:'virus_gamma', summonEvery:7},
    boss_biofilm_colossus: {name:'BOSS — Biofilm Colossus', hp:7600, shield:2600, speed:8, damage:82, attackCooldown:1.15, reward:350, kind:'boss', subtype:'bacteria', antigen:'diamond', boss:true, biofilm:true, armor:0.32, asset:'assets/enemies/boss_biofilm_colossus.webp', summon:'bacteria_beta', summonEvery:6.5},
    boss_viral_core: {name:'FINAL BOSS — Viral Replication Core', hp:9800, speed:6, damage:92, attackCooldown:1.0, reward:500, kind:'boss', subtype:'infected', antigen:'star', boss:true, finalBoss:true, asset:'assets/enemies/boss_viral_core.webp', summon:'shielded_virus', summonEvery:4.8}
  },
  abilities: {
    oxygen: {name:'Oxygen Boost', unlock:1, cooldown:28, icon:'assets/icons/buff_oxygen.webp', description:'Produksi Eritrosit ×2 selama 12 detik.'},
    clot: {name:'Clot Barrier', unlock:1, cooldown:34, icon:'assets/icons/buff_clot.webp', description:'Membuat penghalang fibrin sementara pada lane paling terancam.'},
    cytokine: {name:'Cytokine Signal', unlock:2, cooldown:36, icon:'assets/icons/buff_cytokine.webp', description:'Kecepatan serang sel imun +35% selama 10 detik.'},
    fever: {name:'Fever Response', unlock:3, cooldown:38, icon:'assets/icons/buff_fever.webp', description:'Kecepatan patogen −35% selama 12 detik.'},
    analysis: {name:'Rapid Antigen Analysis', unlock:4, cooldown:42, icon:'assets/icons/buff_analysis.webp', description:'Menganalisis antigen ancaman yang sedang aktif.'},
    complement: {name:'Complement Cascade', unlock:4, cooldown:45, icon:'assets/icons/buff_complement.webp', description:'Damage besar pada patogen yang sudah ditandai antibodi.'},
    inflammation: {name:'Inflammatory Surge', unlock:5, cooldown:52, icon:'assets/icons/buff_inflammation.webp', description:'Damage +55% selama 10 detik, tetapi Tissue Health −8.'}
  },
  levels: [
    {
      id:1, title:'The First Breach', subtitle:'Luka kecil membuka jalan bagi bakteri.', background:'assets/backgrounds/level1_skin_wound.webp',
      startEnergy:260, startOxygen:30, startNutrient:0, startSignal:0,
      wounds:[{r:1,c:6},{r:3,c:7}], infectedTiles:[],
      waves:[
        [{type:'coccus',count:5,gap:1.4}],
        [{type:'bacillus',count:5,gap:1.25},{type:'coccus',count:4,gap:1.0}],
        [{type:'toxin_bacteria',count:3,gap:2.0},{type:'bacillus',count:6,gap:1.0}],
        [{type:'boss_bacterial_colony',count:1,gap:1}]
      ],
      facts:[
        'Eritrosit mengangkut oksigen; di game O₂ diterjemahkan menjadi resource agar alur metabolik mudah dimainkan.',
        'Trombosit membantu hemostasis dan pembentukan bekuan pada luka.',
        'Neutrofil termasuk responder awal pada banyak infeksi bakteri.'
      ],
      quiz:{q:'Komponen darah mana yang paling langsung berperan membentuk bekuan pada luka?', options:['Eritrosit','Trombosit','B Cell'], answer:1}
    },
    {
      id:2, title:'Phagocyte Patrol', subtitle:'Kapsul bakteri membuat pertahanan innate bekerja lebih keras.', background:'assets/backgrounds/level2_capillary.webp',
      startEnergy:300, startOxygen:35, startNutrient:20, startSignal:0,
      wounds:[], infectedTiles:[],
      waves:[
        [{type:'capsule_bacterium',count:4,gap:1.8},{type:'bacillus',count:4,gap:1.0}],
        [{type:'flagellated_bacteria',count:7,gap:.85}],
        [{type:'toxin_bacteria',count:4,gap:1.6},{type:'capsule_bacterium',count:4,gap:1.4}],
        [{type:'boss_capsule_titan',count:1,gap:1}]
      ],
      facts:['Makrofag melakukan fagositosis terhadap partikel dan patogen.', 'Plasma adalah bagian cair darah yang membawa banyak zat terlarut, termasuk nutrisi dan protein.', 'Kapsul dapat membantu sebagian bakteri menghindari fagositosis.'],
      quiz:{q:'Apa fungsi utama fagositosis dalam level ini?', options:['Mengangkut O₂','Menelan dan mencerna patogen','Membentuk antigen'], answer:1}
    },
    {
      id:3, title:'Viral Hijack', subtitle:'Virus membajak sel tubuh dan mengubah medan tempur.', background:'assets/backgrounds/level3_tissue.webp',
      startEnergy:330, startOxygen:40, startNutrient:30, startSignal:10,
      wounds:[], infectedTiles:[{r:1,c:6},{r:3,c:6}],
      waves:[
        [{type:'free_virus',count:8,gap:.9}],
        [{type:'infected_cell',count:3,gap:2.2},{type:'free_virus',count:6,gap:.9}],
        [{type:'shielded_virus',count:5,gap:1.35},{type:'infected_cell',count:3,gap:1.8}],
        [{type:'boss_virus_factory',count:1,gap:1}]
      ],
      facts:['Virus bereplikasi dengan memanfaatkan mesin sel inang.', 'Cytotoxic T Cell terutama membunuh sel tubuh yang terinfeksi, bukan sekadar “menembak virus”.', 'Natural Killer Cell dapat mengenali dan membunuh sebagian sel abnormal atau terinfeksi.'],
      quiz:{q:'Target utama Cytotoxic T Cell dalam prototipe ini adalah…', options:['Sel tubuh yang terinfeksi','Eritrosit','Plasma'], answer:0}
    },
    {
      id:4, title:'Antigen Code', subtitle:'Kenali antigen, aktifkan B Cell, dan tandai target dengan antibodi.', background:'assets/backgrounds/level4_lymphnode.webp',
      startEnergy:360, startOxygen:45, startNutrient:35, startSignal:20,
      wounds:[], infectedTiles:[],
      waves:[
        [{type:'bacteria_alpha',count:5,gap:1.2},{type:'bacteria_beta',count:4,gap:1.3}],
        [{type:'virus_gamma',count:7,gap:1.0}],
        [{type:'bacteria_alpha',count:4,gap:1.0},{type:'bacteria_beta',count:4,gap:1.0},{type:'virus_gamma',count:4,gap:1.0}],
        [{type:'boss_variant',count:1,gap:1}]
      ],
      facts:['Antigen adalah struktur yang dapat dikenali oleh sistem imun.', 'Antibodi memiliki spesifisitas terhadap target molekuler tertentu.', 'B Cell dapat berdiferensiasi menjadi sel penghasil antibodi setelah aktivasi yang sesuai.'],
      quiz:{q:'Mengapa satu antibodi tidak selalu efektif pada semua antigen?', options:['Karena antibodi bersifat spesifik','Karena eritrosit menghalanginya','Karena semua antigen identik'], answer:0}
    },
    {
      id:5, title:'System Under Siege', subtitle:'Seluruh sistem imun bekerja bersama menghadapi serangan gabungan.', background:'assets/backgrounds/level5_systemic.webp',
      startEnergy:410, startOxygen:55, startNutrient:45, startSignal:30,
      wounds:[{r:0,c:7},{r:4,c:7}], infectedTiles:[{r:2,c:6}],
      waves:[
        [{type:'capsule_bacterium',count:4,gap:1.2},{type:'shielded_virus',count:4,gap:1.2}],
        [{type:'bacteria_alpha',count:5,gap:1.0},{type:'virus_gamma',count:5,gap:1.0},{type:'infected_cell',count:2,gap:1.7}],
        [{type:'boss_biofilm_colossus',count:1,gap:1}],
        [{type:'boss_viral_core',count:1,gap:1}]
      ],
      facts:['Respons imun yang efektif membutuhkan koordinasi komponen innate dan adaptive.', 'Inflamasi membantu pertahanan, tetapi inflamasi berlebihan dapat merusak jaringan.', 'Memory B dan T Cell mendukung respons lebih cepat ketika antigen yang sama ditemui kembali.'],
      quiz:{q:'Apa keuntungan utama immune memory?', options:['Respons berikutnya dapat lebih cepat dan spesifik','Membuat darah berhenti mengalir','Mengubah eritrosit menjadi antibodi'], answer:0}
    }
  ],
  antigens: {
    circle:{label:'●', name:'Antigen ●', icon:'assets/icons/antigen_circle.webp'},
    diamond:{label:'◆', name:'Antigen ◆', icon:'assets/icons/antigen_diamond.webp'},
    triangle:{label:'▲', name:'Antigen ▲', icon:'assets/icons/antigen_triangle.webp'},
    star:{label:'✦', name:'Antigen ✦', icon:'assets/icons/antigen_star.webp'}
  }
};

Object.entries({rbc:'Oxygen Bubbles',platelet:'Fibrin Shield',neutrophil:'Rune Blaster',plasma:'Healing Lantern',macrophage:'Vacuum Cannon',dendritic:'Prism Scanner',nk_cell:'Pulse Rifle',cytotoxic_t:'Arc Cannon',b_cell:'Antibody Launcher',helper_t:'Support Scepter',memory_b:'Memory Rifle'}).forEach(([key,weapon])=>window.IMMUNO_DATA.units[key].weapon=weapon);
