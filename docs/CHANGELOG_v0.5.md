# IMMUNOFRONT v0.5 — Sprite Repair, Asset Cleanup & Battle Polish

## Fokus update
- Memperbaiki kasus unit karakter yang tidak tampak / tampak meleset di arena.
- Membersihkan artefak visual pada asset karakter dan musuh (pixel RGB liar pada area transparan dinormalisasi).
- Memoles animasi, UI, dan efek battle agar permainan terasa lebih hidup.

## Perbaikan teknis
- Menambahkan analisis bbox sprite saat preload untuk menentukan anchor visual berdasarkan konten aktual sprite, bukan pivot statis lama.
- Renderer sprite sekarang memiliki fallback aman ke asset dasar bila frame pose tertentu gagal dipakai.
- Ukuran render unit dan musuh dinaikkan agar lebih terbaca di arena.
- Feedback visual seleksi unit ditingkatkan: pulse selection + label nama di atas unit terpilih.
- Ambient particles ditambahkan ke arena untuk memberi kesan aliran darah yang aktif.
- Spawn musuh kini diberi efek masuk yang lebih terasa.
- Beberapa elemen UI diberi polish motion/shadow tambahan.

## Dampak yang terlihat pemain
- Asset karakter sekarang muncul konsisten di arena.
- Sprite tidak lagi mudah “tergeser” karena perbedaan bounding box antar-frame.
- Arena, toast, wave banner, dan kartu unit terasa lebih hidup.
