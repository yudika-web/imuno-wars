# v0.8 — Oxygen, SFX & Fullscreen HUD

- Generate ulang empat pose Eritrosit menjadi desain gelembung oksigen. Renderer mengganti partikel emas/cincin energi dengan gelembung sian berkilau.
- Generate 21 SFX WAV sintetis dan implementasikan bank offline, lazy unlock melalui interaksi pengguna, mute, volume, cooldown per suara, serta batas 12 voice.
- Arena memakai seluruh viewport; semua HUD menjadi overlay yang tidak membentuk kolom pembatas canvas.
- HUD live terdiri dari resource/kesehatan, progress wave, Pause, strip Pasukan yang bisa dilipat, dan ability bar.
- Menu Pause penuh membuka Catatan Misi, Strategi, unit inspector, Boss, Antigen/Antibodi, serta kontrol Resume/Restart/Speed/Home/audio.
- ESC dan Space membuka/menutup Pause dengan guard modal dan penanganan fokus. HUD di belakang menu menjadi inert.
- Mouse mendukung drag & drop; tap kartu lalu tile tetap bekerja. Pointer mapping menghitung letterbox pada setiap ukuran layar.
- Pilihan antibodi valid dari Pause mengaktifkan dan melanjutkan permainan; pilihan yang belum siap tidak melanjutkan.
- 11 fungsi gameplay inti identik dengan v0.7 setelah hook suara diabaikan; statistik dan wave tetap.

52 pemeriksaan otomatis lolos. Tes audio memakai validasi PCM serta mixer tiruan; browser/perangkat nyata belum diuji karena pembatasan akses file lokal. Lihat laporan v0.8 untuk batas validasi lengkap.
