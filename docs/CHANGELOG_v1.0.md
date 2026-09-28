# IMUNO WARS v1.0 — Kampanye & Progres

Berbasis arsip `IMUNO_WARS_playable_v0.9_menu_music.zip`.

- 50 level, lima tab bab; generator deterministik terpisah dari data-only `game-data.js`. Lima level asli dan bossnya dipertahankan, sembilan milestone tambahan ditulis khusus.
- Lima boss bab (level 10/20/30/40/50) dengan HP/damage meningkat; enam boss lama tetap dipakai di tengah kampanye.
- Sembilan tipe musuh baru, masing-masing tiga pada bab 3–5. Memakai ulang aset dengan statistik, deskripsi, dan waktu pengenalan tersendiri.
- Komplemen menjadi unit penempatan menggunakan sprite yang telah ada. Lima unit baru: Sel Mast, Interferon, Eosinofil, Basofil, Sel T Regulator.
- Fallback Canvas empat pose untuk lima unit baru, lengkap warna/label/pivot/referenceHeight. **Ilustrasi final lima karakter belum dibuat dan masih perlu digambar.**
- Riset dari kemenangan, tier upgrade Lv1–Lv5, biaya meningkat, badge di kartu dan detail stat di inspector. Multiplier diterapkan pada salinan stat saat penempatan.
- Save lokal terversi `imunowarsSave`, migrasi otomatis progres dan kuis v0.9, fallback sesi jika storage tidak tersedia. Simpan saat menang, menjawab kuis, membeli upgrade, membuka karakter, dan spawn musuh pertama.
- Reset Progres di Pengaturan Suara; dua konfirmasi, pembatalan aman, membersihkan save lama serta memori permainan, kembali ke menu. Preferensi audio tetap disimpan.
- Databook dua tab; karakter mengikuti progres global, patogen mengikuti spawn aktual. Siluet dan ikon terkunci/terbuka memakai aset yang sudah tersedia.
- Grid, requestAnimationFrame/fixed-step, antrean gelombang, antigen-antibodi, audio dan latar v0.9 dipertahankan. Tambahan perlambatan/proteksi/burst memakai jalur combat yang sudah ada.

## Verifikasi

Lihat `TEST_REPORT_v1.0.json` dan `tests/verify-v1.cjs`. Uji memakai VM JavaScript, DOM terisolasi, serta render Canvas native. Penyelesaian 50 level menggunakan eliminasi terprogram untuk menguji transisi, bukan penilaian keseimbangan kesulitan. Uji browser nyata tidak tersedia: browser remote menolak akses localhost dan browser lokal tidak tersedia. Periksa tampilan responsif, sentuhan, serta audio pada perangkat tujuan sebelum rilis publik.
