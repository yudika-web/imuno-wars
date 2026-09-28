# IMMUNOFRONT v0.3 — Interaction & Visual Repair

## Fokus

Build ini memperbaiki masalah UI yang berantakan pada ukuran layar tertentu dan membuat asset/unit yang ditempatkan terasa benar-benar terhubung dengan mekanik game.

## Perubahan utama

- Desktop unit sidebar dirombak dari kartu 2 kolom menjadi daftar 1 kolom yang lebih stabil.
- Layout utama menggunakan flex/grid berbasis viewport sehingga canvas tidak memaksa sidebar atau HUD keluar layar.
- Canvas tetap memakai buffer 1100×650 dengan `object-fit: contain`; koordinat pointer tetap memperhitungkan letterbox.
- Mouse/touch/stylus menggunakan `pointerdown`, `pointermove`, dan `pointerleave` yang sama.
- Placement menampilkan pulse, spawn lift, pose aksi, toast, dan inspector unit.
- Unit yang sudah ditempatkan dapat dipilih kembali untuk melihat HP dan fungsi/statusnya.
- Preview placement menampilkan ghost sprite dan range untuk unit damage.
- Tile hover merah menandai tile terisi **atau** energy tidak cukup.
- Eritrosit/Plasma/Dendritik/B Cell/Memory B/Helper T diprime supaya aksi pertama terjadi lebih cepat setelah placement.
- B Cell sekarang mengirim visual antibodi ke target dengan antigen yang sudah dikenal dan memberi antibody tag sementara.
- Trombosit pada luka menghapus wound tile, mendapat HP bonus, serta menampilkan fibrin/shield feedback.
- Lapisan kontras ditambahkan tepat di bawah grid untuk meningkatkan keterbacaan sprite di background yang ramai.

## Validasi

- `node --check` lolos untuk `js/game.js`, `data/game-data.js`, dan `data/sprite-data.js`.
- Semua 196 path asset yang direferensikan source ditemukan pada paket.
- Smoke test berbasis DOM/canvas mock lolos untuk placement, pointer mapping, produksi resource, B Cell tagging, clot wound feedback, projectile hit, seluruh ability, dan simulasi numerik 5 level.
- Pengujian screenshot browser penuh tidak tersedia di container ini karena Chromium headless tidak berhasil start; native-canvas test lama juga tidak dapat dijalankan karena dependensi `@napi-rs/canvas` tidak tersedia pada environment saat revisi.
