# IMUNO WARS v1.1 — Kampanye 50 Level & Aset Baru

**Pembaruan v1.1.4:** tanda bulat gelap di kepala musuh dihilangkan dari arena. Sistem antigen dan antibodi tetap dapat digunakan melalui panel permainan.

**Pembaruan v1.1.3:** aura status, variasi proyektil, jejak cahaya, percikan benturan, dan gelombang kejut ditambahkan pada renderer arena. Rincian ada di `docs/CHANGELOG_v1.1.3_VFX.md`.

Game pertahanan 5 jalur × 9 kolom, 50 level dalam 5 bab, 17 unit penempatan (termasuk Komplemen), 31 tipe ancaman (11 boss), dan sistem antigen–antibodi. Seluruh gambar dan **21 SFX WAV asli hasil sintesis** disertakan; game dapat dimainkan offline.


## Kampanye, Riset, dan Databook v1.0

- Pilih satu dari lima tab Bab. Setiap bab memuat 10 kartu level. Level 1–5 mempertahankan konten asli sebagai pengenalan lintas sistem; level 6–50 memperdalam tema bab. Level kelipatan lima memakai gelombang, strategi, dan kuis khusus.
- Menang membuka level berikutnya, memberi **Riset**, dan menyimpan skor terbaik serta bintang: 3 bintang pada kesehatan jaringan ≥80%, 2 pada ≥45%, selebihnya 1. Kuis disimpan terpisah dari bintang.
- Hadiah pertama: 35 + 10 × nomor bab, ditambah 35 pada boss bab. Mengulang level tetap memberi 8 + 2 × nomor bab Riset.
- **Upgrade Pasukan** tersedia di menu dan pemilihan misi. Biaya Lv2–Lv5: 35, 70, 105, 140 Riset. Tiap tingkat menambah 8% HP, 7% damage, mengurangi 3,5% jeda serangan, dan menambah 2% jangkauan dari nilai dasar, untuk stat yang dimiliki unit. Stat dasar tidak diubah. Unit pendukung tanpa stat serangan tetap mendapat tambahan HP.
- Pasukan terbuka berdasarkan progres global, termasuk saat mengulang misi lama. Kemampuan aktif dan panel antibodi tetap mengikuti pengenalan mekanik per misi.
- **Databook → Pasukan Sel** terbuka saat syarat level tercapai. **Patogen** baru terbuka ketika tipe tersebut benar-benar muncul dalam pertempuran, termasuk panggilan boss.
- **Pengaturan Suara → Reset Progres** membutuhkan dua konfirmasi setelah tombol reset. Membatalkan salah satu tahap mempertahankan progres. Reset menghapus progres lama dan baru, lalu menulis save awal agar data lama tidak muncul lagi; pengaturan suara dipertahankan.

| Pasukan tambahan | Terbuka | Fungsi |
| --- | ---: | --- |
| Komplemen | 4 | Bonus serangan pada target bertanda antibodi; sprite lama dipakai |
| Sel Mast | 10 | Denyut damage kecil dan perlambatan area |
| Interferon | 21 | Sinyal protein, bukan sel: proteksi area 4 detik, damage diterima −28% |
| Eosinofil | 28 | Bonus damage terhadap parasit |
| Basofil | 35 | Perlambatan target selama 1,8 detik |
| Sel T Regulator | 43 | Biaya jaringan kemampuan inflamasi turun dari 8 menjadi 3; membantu pemulihan saat aktif |

### Aset dan batas verifikasi

**144 frame ilustrasi baru sudah terpasang**: lima karakter baru (20 frame), 17 bentuk elite (68), sembilan musuh (36), dan lima boss bab (20). Semua memiliki empat pose. Bentuk dasar aktif pada Lv1–3, bentuk elite pada Lv4–5. Perubahan tampil di arena, kartu pasukan, layar Upgrade, dan Databook, serta tetap sesuai setelah reload/reset.

Boss Benteng Luka, Raja Kapsul, Nukleus Replikasi, Pengubah Antigen, dan Krisis Sistemik tampil pada level 10, 20, 30, 40, dan 50. Sprite memakai WebP transparan. Eritrosit elite tetap menggunakan gelembung oksigen. Atlas sumber dan PNG resolusi sumber tersedia pada paket aset terpisah.

**20 kelompok uji integrasi lulus** (`docs/TEST_REPORT_v1.1.json`), termasuk preload semua aset, rendering 144 frame dengan renderer game, perpindahan bentuk seluruh 17 pasukan dari Lv1–5, save/reload/reset, dan alur gelombang 50 level. `docs/preview-canvas-v1.1.png` menampilkan hasil renderer game dengan seluruh elite dan lima boss sekaligus dalam skenario uji.

Keterbatasan: penyelesaian 50 level diuji dengan damage otomatis, bukan permainan penuh untuk menilai keseimbangan. Chromium tidak tersedia, sehingga tata letak CSS responsif, sentuhan di perangkat nyata, dan pemutaran audio belum diuji ulang di browser. Sistem musik/SFX dari v1.0 tetap disertakan.

### Struktur perluasan

- `data/game-data.js`: data deklaratif saja, termasuk lima level asli, bab, unit, musuh, dan milestone.
- `js/campaign.js`: generator deterministik level 6–50; fallback Canvas tetap tersedia sebagai kompatibilitas untuk data unit primitif, tetapi tidak digunakan oleh 17 pasukan saat ini. HP musuh naik bertahap hingga ×1,396, damage hingga ×1,176 pada level 50; stat dasar tidak dimutasi.
- `js/progression.js`: satu save `imunowarsSave` versi 1, sanitasi nilai, migrasi `immunofrontUnlocked` dan `immunofrontQuiz`, Riset, upgrade, dan penemuan. Musik/SFX tetap memiliki pengaturan sendiri.
- `js/game.js`: titik integrasi spawn, penempatan, kemenangan, UI baru, dan peran unit. Grid 5×9 serta loop tetap dipertahankan.
- `tests/verify-v1.1.cjs`: pengujian terisolasi dengan Node, `linkedom`, dan `@napi-rs/canvas`; tidak dimuat oleh game.

Save lokal terikat browser dan asal halaman (origin). Untuk migrasi otomatis, buka versi ini pada origin yang sama dengan versi lama. Menyalin ZIP tidak menyalin localStorage perangkat lain.

## Menyimpan progres lama

Jangan menekan Reset Progres untuk pindah versi. Gunakan browser dan origin/alamat lokal yang sama; jika membuka langsung melalui file, mengganti lokasi folder bisa memengaruhi akses save tergantung browser. Cadangkan folder lama sebelum menggantinya.

## Jalankan

1. Ekstrak **seluruh ZIP**. Jangan jalankan dari pratinjau ZIP.
2. Buka `immunofront_game/index.html` di browser modern.
3. Tunggu layar **MEMUAT** selesai, tekan **Sentuh untuk Mulai**, lalu **Mulai Misi**, pilih level, dan **Mulai Pertahanan**.
4. Pilih kartu pasukan di tepi atas, lalu klik/sentuh kotak arena. Mouse juga bisa menyeret kartu ke kotak arena.

Musik mulai setelah **Sentuh untuk Mulai**; SFX aktif setelah interaksi pertama sesuai aturan browser. Buka **Pengaturan Suara** pada menu utama atau **Musik & SFX** di Pause untuk mengatur volume dan bisu masing-masing kanal. Jika belum terdengar, sentuh layar sekali lagi serta periksa volume perangkat dan mute tab browser.

Bila browser/perangkat tidak dapat membuka folder HTML lokal, sajikan seluruh folder melalui server lokal:

```sh
cd immunofront_game
python -m http.server 8000
```

Lalu buka `http://localhost:8000`. Python hanya diperlukan untuk opsi server tersebut, bukan untuk membuka HTML langsung.

## Kontrol dan layar permainan

- Arena mengisi viewport dan mempertahankan rasio 1100:650 dengan `object-fit: contain`. Ruang kosong dapat muncul pada rasio layar berbeda; gambar tidak dipotong atau diregangkan.
- Energi dan kesehatan jaringan di pojok kiri atas, tombol Pause di kanan atas. Progress wave ada di kiri bawah; resource lengkap ada di Pause.
- **Kartu pasukan di tepi atas** terbuka saat misi dimulai dan tetap terbuka setelah memilih atau menempatkan unit. Tiap kartu menampilkan gambar, nama, biaya energi, dan sorotan pilihan aktif. Geser horizontal untuk melihat kartu lainnya; ikon kisi membuka/melipat daftar. **1–9** memilih sembilan unit pertama. Posisi geser dipertahankan saat kartu diperbarui.
- Ability bar tetap berada di tepi bawah dan bisa digeser jika ruang layar sempit.
- **ESC / Space** membuka atau menutup menu Pause penuh. Tombol **Lanjutkan**, **Ulangi**, **Kecepatan**, **Pilih Misi**, **Suara**, dan volume berada di menu tersebut.
- Catatan Misi, Strategi, detail unit, Boss, serta Antigen/Antibodi hanya terlihat melalui Pause. Panel Boss/Antibodi muncul saat relevan. Banner singkat tetap mengumumkan boss dan antigen baru.
- Antibodi yang sudah siap dapat dipilih di Pause untuk **mengaktifkan dan melanjutkan** permainan. Jika sampel/signal belum cukup, game tetap dijeda.
- Berpindah tab otomatis menjeda permainan dan menghentikan SFX. Lanjutkan secara manual saat kembali.

Progres, mute, dan volume disimpan di browser bila penyimpanan diizinkan. Jika storage diblokir, permainan tetap berjalan; progres sesi tidak dijamin bertahan setelah halaman ditutup.

## Eritrosit baru

Empat pose Eritrosit dibuat ulang dengan tangan terbuka, manset teal, dan gelembung oksigen biru muda. Aset aktif dan renderer tidak menggunakan aura api, kilatan listrik, atau partikel emas. Gelembung bergerak masuk/naik, dan indikator pengisian memakai warna sian. Produksi resource tetap sama seperti versi sebelumnya.

Atlas terbaru: `assets/source-atlases/erythrocyte-oxygen.png`. Pose runtime: `assets/characters/rbc_*.webp`. Galeri: `asset-gallery.html`. Semua karakter fantasi lain dari v0.7 tetap tersedia.

## Layar pembuka dan menu baru

- Gambar `start_screen.png` yang dikirim pengguna dipakai sebagai artwork layar pembuka, dikonversi ke `assets/menu/start-screen.webp`. Komposisi dan tulisan IMUNO WARS pada gambar dipertahankan; nama proyek kini menggunakan branding IMUNO WARS.
- Progress **MEMUAT** mengikuti penyelesaian seluruh gambar runtime, bukan timer buatan. **Sentuh untuk Mulai** baru aktif setelah pemuatan selesai. Jika ada gambar gagal, pesan menjelaskan penggunaan gambar cadangan.
- Gambar pembuka ditampilkan utuh dengan contain; ruang kosong pada rasio layar lain wajar.
- Menu utama memakai artwork baru `assets/menu/main-menu.webp`, tombol Mulai Misi, Cara Bermain, dan Pengaturan Suara, serta gelembung animasi ringan yang mengikuti preferensi reduced motion.
- Artwork menu dibuat menggunakan imagegen bawaan. Prompt final dan sumber referensi ada di `docs/IMAGE_PROMPT_v0.9.json`.
- Musik dimuat melalui media browser saat dibutuhkan; tidak menghambat kesiapan arena. File lokal MP3 disertakan tanpa perubahan.

## Audio

21 efek asli dibuat secara prosedural: klik UI, placement, gelembung oksigen, healing, scanner, empat jenis tembakan, antibodi, hit, shield, musuh kalah, wave, boss, ability, kebocoran pertahanan, menang, kalah, jeda, dan input tidak tersedia.

- File audio: `assets/audio/*.wav`, mono PCM16 22.05 kHz.
- Sumber generasi: `tools/generate_sfx.py` (NumPy + pustaka standar Python).
- Runtime: `js/audio.js`; bank tertanam `data/audio-data.js` tidak memakai fetch sehingga mendukung `file://`.
- Mixer membatasi 12 suara bersamaan, memakai cooldown per efek dan kompresor untuk mengurangi penumpukan.
- Buka `audio-gallery.html` untuk memutar setiap file secara terpisah.
- SFX adalah hasil sintesis digital. Musik memakai tiga file MP3 dari pengguna:
  - `assets/music/start_screen_and_menu.mp3` — pembuka setelah sentuhan pertama, menu, pilih misi, briefing dan hasil misi.
  - `assets/music/in_fight.mp3` — pertempuran biasa.
  - `assets/music/boss_fight.mp3` — selama ada boss hidup; kembali ke musik biasa sesudahnya.
- Satu elemen audio dipakai ulang sehingga musik tidak bertumpuk. Lagu berulang otomatis; pergantian situasi memulai track baru. Pause mempertahankan posisi lagu.
- Volume musik default 35%, SFX 55%; volume dan status bisu masing-masing tersimpan terpisah. Membuka Pengaturan Suara dari Pause tidak melanjutkan game. ESC menutup pengaturan terlebih dahulu.
- Tab tersembunyi menghentikan audio. Game tetap dijeda saat kembali; lanjutkan secara manual.
- Pembatasan autoplay ditangani tanpa menghentikan game. Pada perangkat/browser yang mengunci volume media ke volume sistem, gunakan juga kontrol volume perangkat.

## Patch dan validasi

Semua ID lama dipertahankan. Audit membandingkan 11 fungsi inti terhadap v0.7: penempatan, spawn, damage, unit/musuh, blocking, targeting, wave, metabolisme, antibodi, dan ability identik setelah panggilan suara diabaikan. Statistik serta komposisi wave tidak berubah.

**74 pemeriksaan otomatis lolos:**

- 9 smoke test mekanik.
- 35 tes renderer dan interaksi, termasuk ESC/Space, modal, jeda, drag/drop, tap seluruh 45 tile pada enam ukuran viewport, antibody/resume, serta kartu tetap terbuka setelah klik/drop dan posisi geser terjaga.
- 10 tes PCM dan mixer audio, termasuk mute/volume, rate limit, batas 12 suara, background tab, dan kegagalan decode.

- 14 tes lifecycle musik: autoplay, pergantian scene, race saat Pause/resume, mute, volume, background, serta kegagalan API/file.
- 6 tes pengaturan: kanal terpisah, modal, fokus, Tab, dan ESC.

Ketiga MP3 lolos decode penuh FFmpeg dan cocok byte-for-byte dengan unggahan pengguna. Laporan: `docs/TEST_REPORT_v0.9.json`, `docs/TEST_MUSIC_v0.9.json`, `docs/TEST_SETTINGS_v0.9.json`, `docs/MUSIC_ASSETS_v0.9.json`, `docs/TEST_AUDIO_v0.8.json`.

```sh
node tools/test_logic_smoke.cjs
node tools/test_game.cjs
node tools/test_audio.cjs
node tools/test_music.cjs
node tools/test_settings.cjs
```

Tes renderer memerlukan `@napi-rs/canvas`; game tidak memerlukan Node. Tes mixer memakai Web Audio tiruan untuk menguji alur kontrol, bukan pemutaran pada perangkat nyata.

**Batas validasi:** browser interaktif di lingkungan pengerjaan tidak diizinkan mengakses file lokal. Layout CSS dan input telah diaudit/diperiksa secara simulasi, tetapi screenshot UI browser, FPS, dan pemutaran suara pada perangkat nyata belum diuji. `docs/preview-game-v0.9.png` merupakan render arena dari engine, bukan screenshot HUD browser. Kampanye tidak diklaim telah ditamatkan oleh pemain manusia.

## Mengolah aset ulang

Urutan pengolahan ulang jika semua atlas diimpor kembali:

```sh
node tools/import_fantasy_sprites.cjs
node tools/import_oxygen_sprite.cjs
python tools/build_sprite_metrics.py
python tools/generate_sfx.py
```

Import sprite memerlukan `sharp`, metadata memerlukan Pillow, dan audio memerlukan NumPy. Jalankan import oksigen **setelah** atlas fantasi lama agar Eritrosit tidak kembali ke desain v0.7. Atlas lama serta dokumen v0.2–v0.7 dipertahankan sebagai arsip. Jangan jalankan generator aset prototipe lama.

Paket playable menyertakan pratinjau v1.1; tangkapan layar dokumentasi versi lama tidak disertakan untuk mengurangi ukuran unduhan.


## v1.1.2 — Menu compact game UI
- Menu utama disusun ulang agar muat satu layar tanpa scroll pada viewport umum desktop/mobile.
- Lima ikon menu baru ditambahkan dalam format WebP transparan.
- Tombol menu memakai layout kartu game 2 kolom, dengan tombol Mulai Misi sebagai aksi utama.
- Konflik CSS lama pada ukuran ikon, lebar teks, dan margin label diperbaiki.
- Struktur ID tombol lama dipertahankan agar fungsi JavaScript tetap kompatibel.
