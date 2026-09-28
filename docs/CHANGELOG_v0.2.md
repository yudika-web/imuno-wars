# Perubahan v0.2

## Visual

Sprite dipisahkan memakai connected components kanal alpha; anggota tubuh yang melewati grid tetap utuh. Noise transparan kecil dibersihkan. Pose memakai kanvas 256×256 dan pivot (128, 224). Seluruh pose satu karakter memakai skala sama. Renderer memakai referenceHeight per karakter untuk menyamakan ukuran tubuh, bukan memperbesar seluruh kanvas secara seragam.

Suffix: `_idle`, `_action` (sekutu), `_attack` (musuh), `_hurt`, `_victory` (sekutu), `_defeat` (musuh reguler). Untuk boss, metadata defeat menunjuk hurt/linglung. Portrait tanpa suffix dipakai kartu. Efek memakai suffix `_00` sampai `_03`.

Idle memiliki gerak naik-turun ringan; aksi 0,42 detik; respons damage 0,16 detik; efek 0,6 detik; kalah memudar 0,75 detik. Tidak ada penambahan audio. Pose dan VFX mengikuti waktu simulasi, sehingga jeda dan kecepatan game tetap konsisten.

## Mekanik dan koreksi

- Damage tembakan NK/Cytotoxic T diterapkan pada saat proyektil sampai (0,22 detik); proyektil mengikuti target yang sama. Jika target lebih dulu mati, tembakan tidak menghasilkan reward/damage tambahan.
- Neutrofil dan Makrofag tetap memberi damage langsung melalui aksi fagosit.
- Musuh dengan HP nol diproses sebelum bergerak, menyerang atau memanggil minion. Reward hanya diberikan sekali.
- Toxin Bacteria memakai jarak serang 145 piksel sesuai peran ranged; musuh lain menyerang pada jarak 58 piksel.
- Aktivasi antibodi diblokir saat pause atau misi tidak berjalan.
- Clot Barrier tidak lagi ditempatkan menumpuk pada unit saat lane penuh; cooldown dibatalkan jika tidak ada kotak kosong.
- Pointer memperhitungkan letterbox canvas; rasio gambar dipertahankan pada layout sempit. Ikon pause direset saat restart; progress wave mencapai 100% saat menang.
- Ekonomi, HP, damage dasar, unlock dan daftar wave tetap mengikuti prototipe. Angka produksi yang tampil adalah resource yang sudah langsung masuk.

## Validasi

14 kelompok pemeriksaan otomatis lulus. Semua gambar runtime dimuat oleh native canvas decoder; seluruh file WebP juga didekode ulang oleh Pillow. Lima simulasi combat seeded masing-masing 45 detik selesai tanpa angka invalid. Alur kemenangan/unlock setiap level diuji dengan skenario wave selesai. Ini tidak setara dengan pengujian keseimbangan penuh atau browser end-to-end.

Browser pengujian tidak tersedia, dan pengunduhan browser tidak menghasilkan arsip yang valid. Pengujian dilakukan melalui engine asli di Node dengan DOM adapter minimal dan @napi-rs/canvas. Tidak ada hook debug pada game yang dikirim; test menambahkan hook hanya saat dijalankan.
