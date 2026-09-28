window.IMMUNO_DATA = {
  "meta": {
    "title": "IMUNO WARS: Battle in the Bloodstream",
    "version": "1.1.0-new-art",
    "language": "id"
  },
  "units": {
    "rbc": {
      "name": "Eritrosit",
      "short": "RBC",
      "cost": 50,
      "hp": 220,
      "role": "resource",
      "asset": "assets/characters/rbc.webp",
      "unlock": 1,
      "description": "Mengangkut O₂ dan menghasilkan resource untuk respons imun.",
      "weapon": "Oxygen Bubbles"
    },
    "platelet": {
      "name": "Trombosit",
      "short": "PLT",
      "cost": 75,
      "hp": 900,
      "role": "barrier",
      "asset": "assets/characters/platelet.webp",
      "unlock": 1,
      "description": "Membentuk penghalang bekuan untuk menahan patogen.",
      "weapon": "Fibrin Shield"
    },
    "neutrophil": {
      "name": "Neutrofil",
      "short": "NEU",
      "cost": 100,
      "hp": 420,
      "damage": 22,
      "cooldown": 1.05,
      "range": 275,
      "role": "dps",
      "asset": "assets/characters/neutrophil.webp",
      "unlock": 1,
      "description": "Respons cepat; efektif menghadapi banyak bakteri.",
      "weapon": "Rune Blaster"
    },
    "plasma": {
      "name": "Plasma",
      "short": "PLS",
      "cost": 75,
      "hp": 260,
      "role": "support",
      "asset": "assets/characters/plasma.webp",
      "unlock": 2,
      "description": "Membawa nutrisi, membantu suplai dan regenerasi.",
      "weapon": "Healing Lantern"
    },
    "macrophage": {
      "name": "Makrofag",
      "short": "MAC",
      "cost": 175,
      "hp": 850,
      "damage": 35,
      "cooldown": 1.55,
      "range": 205,
      "role": "tank",
      "asset": "assets/characters/macrophage.webp",
      "unlock": 2,
      "description": "Tank fagosit; mendapat sinyal imun ketika menelan patogen.",
      "weapon": "Vacuum Cannon"
    },
    "dendritic": {
      "name": "Sel Dendritik",
      "short": "DEN",
      "cost": 150,
      "hp": 360,
      "role": "scanner",
      "asset": "assets/characters/dendritic.webp",
      "unlock": 3,
      "description": "Mengambil sampel antigen untuk membuka respons adaptif.",
      "weapon": "Prism Scanner"
    },
    "nk_cell": {
      "name": "Natural Killer",
      "short": "NK",
      "cost": 175,
      "hp": 470,
      "damage": 32,
      "cooldown": 1,
      "range": 235,
      "role": "anti-virus",
      "asset": "assets/characters/nk_cell.webp",
      "unlock": 3,
      "description": "Menyerang sel abnormal dan efektif pada ancaman virus.",
      "weapon": "Pulse Rifle"
    },
    "cytotoxic_t": {
      "name": "Cytotoxic T",
      "short": "CTL",
      "cost": 225,
      "hp": 500,
      "damage": 52,
      "cooldown": 1.2,
      "range": 245,
      "role": "infected-cell",
      "asset": "assets/characters/cytotoxic_t.webp",
      "unlock": 3,
      "description": "Sangat efektif pada sel tubuh yang terinfeksi.",
      "weapon": "Arc Cannon"
    },
    "b_cell": {
      "name": "B Cell",
      "short": "B",
      "cost": 180,
      "hp": 350,
      "role": "antibody",
      "asset": "assets/characters/b_cell.webp",
      "unlock": 4,
      "description": "Menghasilkan antibodi setelah antigen dikenali.",
      "weapon": "Antibody Launcher"
    },
    "helper_t": {
      "name": "Helper T",
      "short": "Th",
      "cost": 200,
      "hp": 400,
      "role": "buffer",
      "asset": "assets/characters/helper_t.webp",
      "unlock": 4,
      "description": "Menguatkan unit imun di area sekitar.",
      "weapon": "Support Scepter"
    },
    "memory_b": {
      "name": "Memory B",
      "short": "MB",
      "cost": 210,
      "hp": 390,
      "role": "memory",
      "asset": "assets/characters/memory_b.webp",
      "unlock": 5,
      "description": "Mempercepat penandaan antigen yang sudah dipelajari.",
      "weapon": "Memory Rifle"
    },
    "complement": {
      "name": "Komplemen",
      "short": "CMP",
      "cost": 230,
      "hp": 430,
      "damage": 54,
      "cooldown": 2.2,
      "range": 300,
      "role": "burst",
      "unlock": 4,
      "description": "Protein komplemen membantu eliminasi patogen; serangan berlipat pada target bertanda antibodi.",
      "weapon": "Cascade Cannon",
      "color": "#ffd36e",
      "asset": "assets/characters/complement_idle.webp",
      "primitive": false
    },
    "mast_cell": {
      "name": "Sel Mast",
      "short": "MST",
      "cost": 160,
      "hp": 480,
      "damage": 14,
      "cooldown": 2.8,
      "range": 230,
      "role": "area-debuff",
      "unlock": 10,
      "description": "Sel mast melepaskan mediator inflamasi; denyut lokal memperlambat patogen berdekatan.",
      "weapon": "Histamine Censer",
      "color": "#ee91b8",
      "asset": "assets/characters/mast_cell_idle.webp"
    },
    "interferon": {
      "name": "Interferon",
      "short": "IFN",
      "cost": 190,
      "hp": 380,
      "damage": 0,
      "cooldown": 6,
      "range": 160,
      "role": "resistance",
      "unlock": 21,
      "description": "Interferon adalah protein sinyal, bukan sel; memberi resistensi sementara pada pasukan sekitar.",
      "weapon": "Signal Aegis",
      "color": "#79dcff",
      "asset": "assets/characters/interferon_idle.webp"
    },
    "eosinophil": {
      "name": "Eosinofil",
      "short": "EOS",
      "cost": 200,
      "hp": 540,
      "damage": 34,
      "cooldown": 1.5,
      "range": 270,
      "role": "anti-parasite",
      "unlock": 28,
      "description": "Eosinofil berperan dalam respons terhadap parasit; granula memberi bonus damage pada parasit.",
      "weapon": "Granule Lance",
      "color": "#ffb574",
      "asset": "assets/characters/eosinophil_idle.webp"
    },
    "basophil": {
      "name": "Basofil",
      "short": "BAS",
      "cost": 185,
      "hp": 410,
      "damage": 19,
      "cooldown": 2.6,
      "range": 290,
      "role": "control",
      "unlock": 35,
      "description": "Basofil melepaskan mediator imun; tembakan memperlambat gerak target sementara.",
      "weapon": "Mediator Bell",
      "color": "#bc99fa",
      "asset": "assets/characters/basophil_idle.webp"
    },
    "treg": {
      "name": "Sel T Regulator",
      "short": "TREG",
      "cost": 220,
      "hp": 520,
      "damage": 0,
      "cooldown": 5,
      "range": 160,
      "role": "regulation",
      "unlock": 43,
      "description": "Sel T regulator membatasi respons imun; mengurangi biaya jaringan dari kemampuan inflamasi.",
      "weapon": "Balance Scepter",
      "color": "#86e7bb",
      "asset": "assets/characters/treg_idle.webp"
    }
  },
  "enemies": {
    "coccus": {
      "name": "Bakteri Coccus",
      "hp": 135,
      "speed": 25,
      "damage": 22,
      "attackCooldown": 1.35,
      "reward": 14,
      "kind": "bacteria",
      "antigen": "circle",
      "asset": "assets/enemies/coccus.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "bacillus": {
      "name": "Bakteri Bacillus",
      "hp": 165,
      "speed": 32,
      "damage": 19,
      "attackCooldown": 1.2,
      "reward": 15,
      "kind": "bacteria",
      "antigen": "diamond",
      "asset": "assets/enemies/bacillus.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "toxin_bacteria": {
      "name": "Toxin Bacteria",
      "hp": 215,
      "speed": 22,
      "damage": 29,
      "attackCooldown": 1.55,
      "reward": 20,
      "kind": "bacteria",
      "antigen": "circle",
      "ranged": true,
      "asset": "assets/enemies/toxin_bacteria.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "capsule_bacterium": {
      "name": "Capsule Bacterium",
      "hp": 360,
      "speed": 20,
      "damage": 29,
      "attackCooldown": 1.4,
      "reward": 28,
      "kind": "bacteria",
      "antigen": "diamond",
      "armor": 0.28,
      "asset": "assets/enemies/capsule_bacterium.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "flagellated_bacteria": {
      "name": "Flagellated Bacteria",
      "hp": 170,
      "speed": 48,
      "damage": 19,
      "attackCooldown": 1,
      "reward": 20,
      "kind": "bacteria",
      "antigen": "triangle",
      "asset": "assets/enemies/flagellated_bacteria.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "free_virus": {
      "name": "Virus Bebas",
      "hp": 125,
      "speed": 40,
      "damage": 20,
      "attackCooldown": 1,
      "reward": 16,
      "kind": "virus",
      "antigen": "triangle",
      "asset": "assets/enemies/free_virus.webp",
      "description": "Virus memerlukan sel inang untuk bereplikasi; antibodi dan respons seluler bekerja pada tahap berbeda."
    },
    "shielded_virus": {
      "name": "Shielded Virus",
      "hp": 260,
      "speed": 30,
      "damage": 23,
      "attackCooldown": 1.1,
      "reward": 24,
      "kind": "virus",
      "antigen": "star",
      "armor": 0.18,
      "asset": "assets/enemies/shielded_virus.webp",
      "description": "Virus memerlukan sel inang untuk bereplikasi; antibodi dan respons seluler bekerja pada tahap berbeda."
    },
    "infected_cell": {
      "name": "Sel Terinfeksi",
      "hp": 430,
      "speed": 13,
      "damage": 35,
      "attackCooldown": 1.5,
      "reward": 38,
      "kind": "infected",
      "antigen": "triangle",
      "asset": "assets/enemies/infected_cell.webp",
      "description": "Sel terinfeksi dapat dikenali dan dihancurkan oleh respons sitotoksik."
    },
    "bacteria_alpha": {
      "name": "Bacteria Alpha",
      "hp": 260,
      "speed": 27,
      "damage": 24,
      "attackCooldown": 1.25,
      "reward": 23,
      "kind": "bacteria",
      "antigen": "circle",
      "asset": "assets/enemies/bacteria_alpha.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "bacteria_beta": {
      "name": "Bacteria Beta",
      "hp": 320,
      "speed": 24,
      "damage": 28,
      "attackCooldown": 1.35,
      "reward": 26,
      "kind": "bacteria",
      "antigen": "diamond",
      "asset": "assets/enemies/bacteria_beta.webp",
      "description": "Bakteri adalah organisme bersel tunggal; neutrofil dan makrofag membantu menyingkirkannya."
    },
    "virus_gamma": {
      "name": "Virus Gamma",
      "hp": 235,
      "speed": 38,
      "damage": 23,
      "attackCooldown": 1,
      "reward": 24,
      "kind": "virus",
      "antigen": "triangle",
      "asset": "assets/enemies/virus_gamma.webp",
      "description": "Virus memerlukan sel inang untuk bereplikasi; antibodi dan respons seluler bekerja pada tahap berbeda."
    },
    "boss_bacterial_colony": {
      "name": "BOSS — Bacterial Colony",
      "hp": 2600,
      "speed": 13,
      "damage": 55,
      "attackCooldown": 1.2,
      "reward": 180,
      "kind": "boss",
      "subtype": "bacteria",
      "antigen": "circle",
      "boss": true,
      "asset": "assets/enemies/boss_bacterial_colony.webp",
      "summon": "coccus",
      "summonEvery": 7.5,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "boss_capsule_titan": {
      "name": "BOSS — Capsule Titan",
      "hp": 4300,
      "shield": 1700,
      "speed": 11,
      "damage": 70,
      "attackCooldown": 1.15,
      "reward": 240,
      "kind": "boss",
      "subtype": "bacteria",
      "antigen": "diamond",
      "boss": true,
      "armor": 0.18,
      "asset": "assets/enemies/boss_capsule_titan.webp",
      "summon": "capsule_bacterium",
      "summonEvery": 9,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "boss_virus_factory": {
      "name": "BOSS — Virus Factory",
      "hp": 5600,
      "speed": 7,
      "damage": 65,
      "attackCooldown": 1.3,
      "reward": 280,
      "kind": "boss",
      "subtype": "infected",
      "antigen": "triangle",
      "boss": true,
      "asset": "assets/enemies/boss_virus_factory.webp",
      "summon": "free_virus",
      "summonEvery": 5.8,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "boss_variant": {
      "name": "BOSS — The Variant",
      "hp": 6800,
      "speed": 10,
      "damage": 74,
      "attackCooldown": 1.05,
      "reward": 320,
      "kind": "boss",
      "subtype": "virus",
      "antigen": "triangle",
      "boss": true,
      "variant": true,
      "asset": "assets/enemies/boss_variant.webp",
      "summon": "virus_gamma",
      "summonEvery": 7,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "boss_biofilm_colossus": {
      "name": "BOSS — Biofilm Colossus",
      "hp": 7600,
      "shield": 2600,
      "speed": 8,
      "damage": 82,
      "attackCooldown": 1.15,
      "reward": 350,
      "kind": "boss",
      "subtype": "bacteria",
      "antigen": "diamond",
      "boss": true,
      "biofilm": true,
      "armor": 0.32,
      "asset": "assets/enemies/boss_biofilm_colossus.webp",
      "summon": "bacteria_beta",
      "summonEvery": 6.5,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "boss_viral_core": {
      "name": "FINAL BOSS — Viral Replication Core",
      "hp": 9800,
      "speed": 6,
      "damage": 92,
      "attackCooldown": 1,
      "reward": 500,
      "kind": "boss",
      "subtype": "infected",
      "antigen": "star",
      "boss": true,
      "finalBoss": true,
      "asset": "assets/enemies/boss_viral_core.webp",
      "summon": "shielded_virus",
      "summonEvery": 4.8,
      "description": "Boss adalah personifikasi fantasi ancaman biologis untuk latihan koordinasi pertahanan."
    },
    "enveloped_virus": {
      "name": "Virus Berselubung",
      "hp": 240,
      "speed": 34,
      "damage": 25,
      "kind": "virus",
      "antigen": "triangle",
      "firstLevel": 21,
      "description": "Selubung lipid membantu sebagian virus memasuki sel; targetkan dengan respons antivirus.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/enveloped_virus_idle.webp",
      "armor": 0
    },
    "latent_cell": {
      "name": "Sel Infeksi Laten",
      "hp": 490,
      "speed": 14,
      "damage": 34,
      "kind": "infected",
      "antigen": "star",
      "firstLevel": 24,
      "description": "Sebagian virus dapat bertahan laten di sel inang; pertahanan seluler membantu pengawasan.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/latent_cell_idle.webp",
      "armor": 0
    },
    "viral_swarm": {
      "name": "Kawanan Virus",
      "hp": 160,
      "speed": 47,
      "damage": 20,
      "kind": "virus",
      "antigen": "diamond",
      "firstLevel": 27,
      "description": "Banyak partikel virus dapat meningkatkan tekanan infeksi; jaga seluruh jalur.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/viral_swarm_idle.webp",
      "armor": 0
    },
    "helminth": {
      "name": "Parasit Cacing",
      "hp": 570,
      "speed": 16,
      "damage": 38,
      "kind": "parasite",
      "antigen": "circle",
      "firstLevel": 31,
      "description": "Parasit multiseluler dapat memicu respons eosinofil; gunakan granula anti-parasit.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/helminth_idle.webp",
      "armor": 0
    },
    "protozoan": {
      "name": "Protozoa",
      "hp": 310,
      "speed": 33,
      "damage": 30,
      "kind": "parasite",
      "antigen": "diamond",
      "firstLevel": 34,
      "description": "Sebagian protozoa menyebabkan infeksi; respons imun bergantung jenis parasit.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/protozoan_idle.webp",
      "armor": 0
    },
    "yeast": {
      "name": "Jamur Ragi",
      "hp": 390,
      "speed": 21,
      "damage": 33,
      "kind": "fungus",
      "antigen": "star",
      "firstLevel": 37,
      "description": "Jamur memiliki dinding sel khas; fagosit ikut membantu pertahanan antijamur.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/yeast_idle.webp",
      "armor": 0
    },
    "resistant_bacteria": {
      "name": "Bakteri Resisten",
      "hp": 560,
      "speed": 24,
      "damage": 40,
      "kind": "bacteria",
      "antigen": "diamond",
      "firstLevel": 41,
      "description": "Resistensi antibiotik tidak berarti kebal imun; kapsul game memberi pertahanan tambahan.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/resistant_bacteria_idle.webp",
      "armor": 0.22
    },
    "hyphae": {
      "name": "Jamur Hifa",
      "hp": 640,
      "speed": 16,
      "damage": 43,
      "kind": "fungus",
      "antigen": "circle",
      "firstLevel": 44,
      "description": "Hifa merupakan bentuk pertumbuhan sebagian jamur; tahan jalur dengan beberapa pasukan.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/hyphae_idle.webp",
      "armor": 0
    },
    "autoreactive_cell": {
      "name": "Sel Autoreaktif",
      "hp": 600,
      "speed": 21,
      "damage": 42,
      "kind": "autoreactive",
      "antigen": "star",
      "firstLevel": 47,
      "description": "Respons autoreaktif dapat menyerang jaringan sendiri; regulasi imun membantu membatasinya.",
      "attackCooldown": 1.4,
      "reward": 30,
      "asset": "assets/enemies/autoreactive_cell_idle.webp",
      "armor": 0
    },
    "boss_chapter_1": {
      "name": "BOSS BAB — Benteng Luka",
      "hp": 10500,
      "speed": 6,
      "damage": 96,
      "attackCooldown": 1.2,
      "reward": 180,
      "kind": "boss",
      "subtype": "bacteria",
      "antigen": "circle",
      "boss": true,
      "asset": "assets/enemies/boss_chapter_1_idle.webp",
      "summon": "coccus",
      "summonEvery": 11,
      "shield": 0,
      "armor": 0.08,
      "finalBoss": false,
      "chapterBoss": true,
      "firstLevel": 10,
      "description": "Ancaman puncak bab: Benteng Luka. Boss merupakan personifikasi fantasi untuk melatih koordinasi pertahanan."
    },
    "boss_chapter_2": {
      "name": "BOSS BAB — Raja Kapsul",
      "hp": 11900,
      "shield": 0,
      "speed": 6,
      "damage": 103,
      "attackCooldown": 1.15,
      "reward": 240,
      "kind": "boss",
      "subtype": "bacteria",
      "antigen": "diamond",
      "boss": true,
      "armor": 0.08,
      "asset": "assets/enemies/boss_chapter_2_idle.webp",
      "summon": "capsule_bacterium",
      "summonEvery": 10.5,
      "finalBoss": false,
      "chapterBoss": true,
      "firstLevel": 20,
      "description": "Ancaman puncak bab: Raja Kapsul. Boss merupakan personifikasi fantasi untuk melatih koordinasi pertahanan."
    },
    "boss_chapter_3": {
      "name": "BOSS BAB — Nukleus Replikasi",
      "hp": 13300,
      "speed": 6,
      "damage": 110,
      "attackCooldown": 1.3,
      "reward": 280,
      "kind": "boss",
      "subtype": "infected",
      "antigen": "triangle",
      "boss": true,
      "asset": "assets/enemies/boss_chapter_3_idle.webp",
      "summon": "free_virus",
      "summonEvery": 10,
      "shield": 0,
      "armor": 0.08,
      "finalBoss": false,
      "chapterBoss": true,
      "firstLevel": 30,
      "description": "Ancaman puncak bab: Nukleus Replikasi. Boss merupakan personifikasi fantasi untuk melatih koordinasi pertahanan."
    },
    "boss_chapter_4": {
      "name": "BOSS BAB — Pengubah Antigen",
      "hp": 14700,
      "speed": 6,
      "damage": 117,
      "attackCooldown": 1.05,
      "reward": 320,
      "kind": "boss",
      "subtype": "virus",
      "antigen": "triangle",
      "boss": true,
      "variant": true,
      "asset": "assets/enemies/boss_chapter_4_idle.webp",
      "summon": "virus_gamma",
      "summonEvery": 9.5,
      "shield": 0,
      "armor": 0.08,
      "finalBoss": false,
      "chapterBoss": true,
      "firstLevel": 40,
      "description": "Ancaman puncak bab: Pengubah Antigen. Boss merupakan personifikasi fantasi untuk melatih koordinasi pertahanan."
    },
    "boss_chapter_5": {
      "name": "BOSS BAB — Krisis Sistemik",
      "hp": 16100,
      "speed": 6,
      "damage": 124,
      "attackCooldown": 1,
      "reward": 500,
      "kind": "boss",
      "subtype": "infected",
      "antigen": "star",
      "boss": true,
      "finalBoss": true,
      "asset": "assets/enemies/boss_chapter_5_idle.webp",
      "summon": "shielded_virus",
      "summonEvery": 9,
      "shield": 0,
      "armor": 0.08,
      "chapterBoss": true,
      "firstLevel": 50,
      "description": "Ancaman puncak bab: Krisis Sistemik. Boss merupakan personifikasi fantasi untuk melatih koordinasi pertahanan."
    }
  },
  "abilities": {
    "oxygen": {
      "name": "Oxygen Boost",
      "unlock": 1,
      "cooldown": 28,
      "icon": "assets/icons/buff_oxygen.webp",
      "description": "Produksi Eritrosit ×2 selama 12 detik."
    },
    "clot": {
      "name": "Clot Barrier",
      "unlock": 1,
      "cooldown": 34,
      "icon": "assets/icons/buff_clot.webp",
      "description": "Membuat penghalang fibrin sementara pada lane paling terancam."
    },
    "cytokine": {
      "name": "Cytokine Signal",
      "unlock": 2,
      "cooldown": 36,
      "icon": "assets/icons/buff_cytokine.webp",
      "description": "Kecepatan serang sel imun +35% selama 10 detik."
    },
    "fever": {
      "name": "Fever Response",
      "unlock": 3,
      "cooldown": 38,
      "icon": "assets/icons/buff_fever.webp",
      "description": "Kecepatan patogen −35% selama 12 detik."
    },
    "analysis": {
      "name": "Rapid Antigen Analysis",
      "unlock": 4,
      "cooldown": 42,
      "icon": "assets/icons/buff_analysis.webp",
      "description": "Menganalisis antigen ancaman yang sedang aktif."
    },
    "complement": {
      "name": "Complement Cascade",
      "unlock": 4,
      "cooldown": 45,
      "icon": "assets/icons/buff_complement.webp",
      "description": "Damage besar pada patogen yang sudah ditandai antibodi."
    },
    "inflammation": {
      "name": "Inflammatory Surge",
      "unlock": 5,
      "cooldown": 52,
      "icon": "assets/icons/buff_inflammation.webp",
      "description": "Damage +55% selama 10 detik, tetapi Tissue Health −8."
    }
  },
  "levels": [
    {
      "id": 1,
      "title": "The First Breach",
      "subtitle": "Luka kecil membuka jalan bagi bakteri.",
      "background": "assets/backgrounds/level1_skin_wound.webp",
      "startEnergy": 260,
      "startOxygen": 30,
      "startNutrient": 0,
      "startSignal": 0,
      "wounds": [
        {
          "r": 1,
          "c": 6
        },
        {
          "r": 3,
          "c": 7
        }
      ],
      "infectedTiles": [],
      "waves": [
        [
          {
            "type": "coccus",
            "count": 5,
            "gap": 1.4
          }
        ],
        [
          {
            "type": "bacillus",
            "count": 5,
            "gap": 1.25
          },
          {
            "type": "coccus",
            "count": 4,
            "gap": 1
          }
        ],
        [
          {
            "type": "toxin_bacteria",
            "count": 3,
            "gap": 2
          },
          {
            "type": "bacillus",
            "count": 6,
            "gap": 1
          }
        ],
        [
          {
            "type": "boss_bacterial_colony",
            "count": 1,
            "gap": 1
          }
        ]
      ],
      "facts": [
        "Eritrosit mengangkut oksigen; di game O₂ diterjemahkan menjadi resource agar alur metabolik mudah dimainkan.",
        "Trombosit membantu hemostasis dan pembentukan bekuan pada luka.",
        "Neutrofil termasuk responder awal pada banyak infeksi bakteri."
      ],
      "quiz": {
        "q": "Komponen darah mana yang paling langsung berperan membentuk bekuan pada luka?",
        "options": [
          "Eritrosit",
          "Trombosit",
          "B Cell"
        ],
        "answer": 1
      }
    },
    {
      "id": 2,
      "title": "Phagocyte Patrol",
      "subtitle": "Kapsul bakteri membuat pertahanan innate bekerja lebih keras.",
      "background": "assets/backgrounds/level2_capillary.webp",
      "startEnergy": 300,
      "startOxygen": 35,
      "startNutrient": 20,
      "startSignal": 0,
      "wounds": [],
      "infectedTiles": [],
      "waves": [
        [
          {
            "type": "capsule_bacterium",
            "count": 4,
            "gap": 1.8
          },
          {
            "type": "bacillus",
            "count": 4,
            "gap": 1
          }
        ],
        [
          {
            "type": "flagellated_bacteria",
            "count": 7,
            "gap": 0.85
          }
        ],
        [
          {
            "type": "toxin_bacteria",
            "count": 4,
            "gap": 1.6
          },
          {
            "type": "capsule_bacterium",
            "count": 4,
            "gap": 1.4
          }
        ],
        [
          {
            "type": "boss_capsule_titan",
            "count": 1,
            "gap": 1
          }
        ]
      ],
      "facts": [
        "Makrofag melakukan fagositosis terhadap partikel dan patogen.",
        "Plasma adalah bagian cair darah yang membawa banyak zat terlarut, termasuk nutrisi dan protein.",
        "Kapsul dapat membantu sebagian bakteri menghindari fagositosis."
      ],
      "quiz": {
        "q": "Apa fungsi utama fagositosis dalam level ini?",
        "options": [
          "Mengangkut O₂",
          "Menelan dan mencerna patogen",
          "Membentuk antigen"
        ],
        "answer": 1
      }
    },
    {
      "id": 3,
      "title": "Viral Hijack",
      "subtitle": "Virus membajak sel tubuh dan mengubah medan tempur.",
      "background": "assets/backgrounds/level3_tissue.webp",
      "startEnergy": 330,
      "startOxygen": 40,
      "startNutrient": 30,
      "startSignal": 10,
      "wounds": [],
      "infectedTiles": [
        {
          "r": 1,
          "c": 6
        },
        {
          "r": 3,
          "c": 6
        }
      ],
      "waves": [
        [
          {
            "type": "free_virus",
            "count": 8,
            "gap": 0.9
          }
        ],
        [
          {
            "type": "infected_cell",
            "count": 3,
            "gap": 2.2
          },
          {
            "type": "free_virus",
            "count": 6,
            "gap": 0.9
          }
        ],
        [
          {
            "type": "shielded_virus",
            "count": 5,
            "gap": 1.35
          },
          {
            "type": "infected_cell",
            "count": 3,
            "gap": 1.8
          }
        ],
        [
          {
            "type": "boss_virus_factory",
            "count": 1,
            "gap": 1
          }
        ]
      ],
      "facts": [
        "Virus bereplikasi dengan memanfaatkan mesin sel inang.",
        "Cytotoxic T Cell terutama membunuh sel tubuh yang terinfeksi, bukan sekadar “menembak virus”.",
        "Natural Killer Cell dapat mengenali dan membunuh sebagian sel abnormal atau terinfeksi."
      ],
      "quiz": {
        "q": "Target utama Cytotoxic T Cell dalam prototipe ini adalah…",
        "options": [
          "Sel tubuh yang terinfeksi",
          "Eritrosit",
          "Plasma"
        ],
        "answer": 0
      }
    },
    {
      "id": 4,
      "title": "Antigen Code",
      "subtitle": "Kenali antigen, aktifkan B Cell, dan tandai target dengan antibodi.",
      "background": "assets/backgrounds/level4_lymphnode.webp",
      "startEnergy": 360,
      "startOxygen": 45,
      "startNutrient": 35,
      "startSignal": 20,
      "wounds": [],
      "infectedTiles": [],
      "waves": [
        [
          {
            "type": "bacteria_alpha",
            "count": 5,
            "gap": 1.2
          },
          {
            "type": "bacteria_beta",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "virus_gamma",
            "count": 7,
            "gap": 1
          }
        ],
        [
          {
            "type": "bacteria_alpha",
            "count": 4,
            "gap": 1
          },
          {
            "type": "bacteria_beta",
            "count": 4,
            "gap": 1
          },
          {
            "type": "virus_gamma",
            "count": 4,
            "gap": 1
          }
        ],
        [
          {
            "type": "boss_variant",
            "count": 1,
            "gap": 1
          }
        ]
      ],
      "facts": [
        "Antigen adalah struktur yang dapat dikenali oleh sistem imun.",
        "Antibodi memiliki spesifisitas terhadap target molekuler tertentu.",
        "B Cell dapat berdiferensiasi menjadi sel penghasil antibodi setelah aktivasi yang sesuai."
      ],
      "quiz": {
        "q": "Mengapa satu antibodi tidak selalu efektif pada semua antigen?",
        "options": [
          "Karena antibodi bersifat spesifik",
          "Karena eritrosit menghalanginya",
          "Karena semua antigen identik"
        ],
        "answer": 0
      }
    },
    {
      "id": 5,
      "title": "System Under Siege",
      "subtitle": "Seluruh sistem imun bekerja bersama menghadapi serangan gabungan.",
      "background": "assets/backgrounds/level5_systemic.webp",
      "startEnergy": 410,
      "startOxygen": 55,
      "startNutrient": 45,
      "startSignal": 30,
      "wounds": [
        {
          "r": 0,
          "c": 7
        },
        {
          "r": 4,
          "c": 7
        }
      ],
      "infectedTiles": [
        {
          "r": 2,
          "c": 6
        }
      ],
      "waves": [
        [
          {
            "type": "capsule_bacterium",
            "count": 4,
            "gap": 1.2
          },
          {
            "type": "shielded_virus",
            "count": 4,
            "gap": 1.2
          }
        ],
        [
          {
            "type": "bacteria_alpha",
            "count": 5,
            "gap": 1
          },
          {
            "type": "virus_gamma",
            "count": 5,
            "gap": 1
          },
          {
            "type": "infected_cell",
            "count": 2,
            "gap": 1.7
          }
        ],
        [
          {
            "type": "boss_biofilm_colossus",
            "count": 1,
            "gap": 1
          }
        ],
        [
          {
            "type": "boss_viral_core",
            "count": 1,
            "gap": 1
          }
        ]
      ],
      "facts": [
        "Respons imun yang efektif membutuhkan koordinasi komponen innate dan adaptive.",
        "Inflamasi membantu pertahanan, tetapi inflamasi berlebihan dapat merusak jaringan.",
        "Memory B dan T Cell mendukung respons lebih cepat ketika antigen yang sama ditemui kembali."
      ],
      "quiz": {
        "q": "Apa keuntungan utama immune memory?",
        "options": [
          "Respons berikutnya dapat lebih cepat dan spesifik",
          "Membuat darah berhenti mengalir",
          "Mengubah eritrosit menjadi antibodi"
        ],
        "answer": 0
      }
    }
  ],
  "antigens": {
    "circle": {
      "label": "●",
      "name": "Antigen ●",
      "icon": "assets/icons/antigen_circle.webp"
    },
    "diamond": {
      "label": "◆",
      "name": "Antigen ◆",
      "icon": "assets/icons/antigen_diamond.webp"
    },
    "triangle": {
      "label": "▲",
      "name": "Antigen ▲",
      "icon": "assets/icons/antigen_triangle.webp"
    },
    "star": {
      "label": "✦",
      "name": "Antigen ✦",
      "icon": "assets/icons/antigen_star.webp"
    }
  },
  "chapters": [
    {
      "id": 1,
      "name": "Luka & Hemostasis",
      "theme": "Tutup luka dan lindungi jalur suplai.",
      "pool": [
        "coccus",
        "bacillus",
        "toxin_bacteria"
      ],
      "fact": "Trombosit membantu pembentukan sumbat hemostasis.",
      "quiz": {
        "q": "Apa peran utama trombosit pada luka?",
        "options": [
          "Membentuk sumbat hemostasis",
          "Menghasilkan virus",
          "Mengganti antibodi"
        ],
        "answer": 0
      }
    },
    {
      "id": 2,
      "name": "Fagositosis & Bakteri",
      "theme": "Hadapi kapsul dan kelompok bakteri.",
      "pool": [
        "capsule_bacterium",
        "flagellated_bacteria",
        "toxin_bacteria",
        "bacteria_alpha",
        "bacteria_beta"
      ],
      "fact": "Fagositosis berarti menelan partikel dan mencernanya di dalam sel.",
      "quiz": {
        "q": "Sel mana merupakan fagosit?",
        "options": [
          "Eritrosit",
          "Makrofag",
          "Trombosit"
        ],
        "answer": 1
      }
    },
    {
      "id": 3,
      "name": "Infeksi Virus",
      "theme": "Putus rantai infeksi dan lindungi sel.",
      "pool": [
        "free_virus",
        "shielded_virus",
        "infected_cell",
        "virus_gamma",
        "enveloped_virus",
        "latent_cell",
        "viral_swarm"
      ],
      "fact": "Interferon memberi sinyal untuk membentuk keadaan antivirus pada sel.",
      "quiz": {
        "q": "Interferon terutama berfungsi sebagai…",
        "options": [
          "Sel pengangkut O₂",
          "Sinyal pertahanan antivirus",
          "Bakteri pelindung"
        ],
        "answer": 1
      }
    },
    {
      "id": 4,
      "name": "Antigen–Antibodi",
      "theme": "Kenali pola antigen pada ancaman beragam.",
      "pool": [
        "bacteria_alpha",
        "bacteria_beta",
        "virus_gamma",
        "helminth",
        "protozoan",
        "yeast"
      ],
      "fact": "Komplemen dapat bekerja bersama antibodi untuk membantu eliminasi patogen.",
      "quiz": {
        "q": "Apa yang memberi spesifisitas pada pengenalan antibodi?",
        "options": [
          "Warna darah",
          "Kecepatan aliran",
          "Kecocokan dengan antigen"
        ],
        "answer": 2
      }
    },
    {
      "id": 5,
      "name": "Sistem Terpadu",
      "theme": "Seimbangkan serangan, proteksi, dan regulasi.",
      "pool": [
        "capsule_bacterium",
        "shielded_virus",
        "infected_cell",
        "resistant_bacteria",
        "hyphae",
        "autoreactive_cell",
        "helminth"
      ],
      "fact": "Regulasi imun penting untuk membatasi kerusakan jaringan akibat respons berlebih.",
      "quiz": {
        "q": "Sel T regulator membantu…",
        "options": [
          "Membatasi respons imun berlebih",
          "Memperbanyak patogen",
          "Menghentikan semua pertahanan"
        ],
        "answer": 0
      }
    }
  ],
  "milestones": {
    "10": {
      "title": "Benteng Hemostasis",
      "hint": "Tempatkan trombosit pada luka; siapkan serangan di setiap jalur.",
      "facts": [
        "Trombosit membantu pembentukan sumbat hemostasis.",
        "Tempatkan trombosit pada luka; siapkan serangan di setiap jalur."
      ],
      "quiz": {
        "q": "Apa yang membantu menutup luka?",
        "options": [
          "Trombosit",
          "Virus",
          "Antigen"
        ],
        "answer": 0
      },
      "waves": [
        [
          {
            "type": "coccus",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "bacillus",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "coccus",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "toxin_bacteria",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_chapter_1",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "15": {
      "title": "Pengepungan Kapsul",
      "hint": "Gunakan Makrofag bersama Plasma untuk menghadapi kapsul.",
      "facts": [
        "Fagositosis berarti menelan partikel dan mencernanya di dalam sel.",
        "Gunakan Makrofag bersama Plasma untuk menghadapi kapsul."
      ],
      "quiz": {
        "q": "Kapsul dapat membantu bakteri…",
        "options": [
          "Mengangkut oksigen",
          "Menghindari fagositosis",
          "Menjadi antibodi"
        ],
        "answer": 1
      },
      "waves": [
        [
          {
            "type": "capsule_bacterium",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "flagellated_bacteria",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "capsule_bacterium",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "toxin_bacteria",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_capsule_titan",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "20": {
      "title": "Gerbang Fagosit",
      "hint": "Pisahkan pertahanan terhadap pelari cepat dan bakteri tebal.",
      "facts": [
        "Fagositosis berarti menelan partikel dan mencernanya di dalam sel.",
        "Pisahkan pertahanan terhadap pelari cepat dan bakteri tebal."
      ],
      "quiz": {
        "q": "Fagositosis berarti…",
        "options": [
          "Menelan dan mencerna partikel",
          "Membekukan darah",
          "Menghasilkan antigen"
        ],
        "answer": 0
      },
      "waves": [
        [
          {
            "type": "flagellated_bacteria",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "bacteria_beta",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "flagellated_bacteria",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "capsule_bacterium",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_chapter_2",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "25": {
      "title": "Sinyal dari Sel Inang",
      "hint": "Interferon melindungi pasukan; Cytotoxic T menarget sel terinfeksi.",
      "facts": [
        "Interferon memberi sinyal untuk membentuk keadaan antivirus pada sel.",
        "Interferon melindungi pasukan; Cytotoxic T menarget sel terinfeksi."
      ],
      "quiz": {
        "q": "Virus bereplikasi dengan…",
        "options": [
          "Membentuk trombosit",
          "Memakai mesin sel inang",
          "Menjadi plasma"
        ],
        "answer": 1
      },
      "waves": [
        [
          {
            "type": "enveloped_virus",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "latent_cell",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "enveloped_virus",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "shielded_virus",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_virus_factory",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "30": {
      "title": "Pabrik Replikasi",
      "hint": "Perkuat tiap jalur dan simpan kemampuan untuk gelombang boss.",
      "facts": [
        "Interferon memberi sinyal untuk membentuk keadaan antivirus pada sel.",
        "Perkuat tiap jalur dan simpan kemampuan untuk gelombang boss."
      ],
      "quiz": {
        "q": "Target penting Cytotoxic T adalah…",
        "options": [
          "Oksigen",
          "Trombosit",
          "Sel tubuh terinfeksi"
        ],
        "answer": 2
      },
      "waves": [
        [
          {
            "type": "viral_swarm",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "latent_cell",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "viral_swarm",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "shielded_virus",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_chapter_3",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "35": {
      "title": "Jejak Parasit",
      "hint": "Eosinofil menghadapi parasit, Basofil membantu menahan laju.",
      "facts": [
        "Komplemen dapat bekerja bersama antibodi untuk membantu eliminasi patogen.",
        "Eosinofil menghadapi parasit, Basofil membantu menahan laju."
      ],
      "quiz": {
        "q": "Eosinofil berperan pada respons terhadap…",
        "options": [
          "Parasit tertentu",
          "Pengangkutan oksigen",
          "Pembekuan utama"
        ],
        "answer": 0
      },
      "waves": [
        [
          {
            "type": "helminth",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "protozoan",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "helminth",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "bacteria_alpha",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_variant",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "40": {
      "title": "Kunci Spesifik",
      "hint": "Tandai antigen lalu manfaatkan tembakan Komplemen.",
      "facts": [
        "Komplemen dapat bekerja bersama antibodi untuk membantu eliminasi patogen.",
        "Tandai antigen lalu manfaatkan tembakan Komplemen."
      ],
      "quiz": {
        "q": "Komplemen merupakan…",
        "options": [
          "Kumpulan protein imun",
          "Jenis eritrosit",
          "Sel saraf"
        ],
        "answer": 0
      },
      "waves": [
        [
          {
            "type": "yeast",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "protozoan",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "yeast",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "helminth",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_chapter_4",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "45": {
      "title": "Keseimbangan Jaringan",
      "hint": "Tempatkan T Regulator sebelum memakai lonjakan inflamasi.",
      "facts": [
        "Regulasi imun penting untuk membatasi kerusakan jaringan akibat respons berlebih.",
        "Tempatkan T Regulator sebelum memakai lonjakan inflamasi."
      ],
      "quiz": {
        "q": "Inflamasi berlebihan dapat…",
        "options": [
          "Selalu menguntungkan",
          "Merusak jaringan",
          "Menghilangkan semua antigen"
        ],
        "answer": 1
      },
      "waves": [
        [
          {
            "type": "resistant_bacteria",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "hyphae",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "resistant_bacteria",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "infected_cell",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_biofilm_colossus",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    },
    "50": {
      "title": "Pertahanan Terakhir",
      "hint": "Gabungkan suplai, antibodi, proteksi Interferon, dan regulasi.",
      "facts": [
        "Regulasi imun penting untuk membatasi kerusakan jaringan akibat respons berlebih.",
        "Gabungkan suplai, antibodi, proteksi Interferon, dan regulasi."
      ],
      "quiz": {
        "q": "Pertahanan yang efektif memerlukan…",
        "options": [
          "Hanya satu jenis sel",
          "Inflamasi tanpa batas",
          "Koordinasi dan regulasi"
        ],
        "answer": 2
      },
      "waves": [
        [
          {
            "type": "autoreactive_cell",
            "count": 8,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "hyphae",
            "count": 7,
            "gap": 1.6
          },
          {
            "type": "autoreactive_cell",
            "count": 4,
            "gap": 1.3
          }
        ],
        [
          {
            "type": "resistant_bacteria",
            "count": 9,
            "gap": 1.5
          }
        ],
        [
          {
            "type": "boss_chapter_5",
            "count": 1,
            "gap": 1
          }
        ]
      ]
    }
  }
};
