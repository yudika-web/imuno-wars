# v0.6 — Stability Fix

## P0: loop berhenti saat karakter pertama digambar

`drawActor()` mengirim enam argumen ke `ctx.ellipse()`. Parameter `startAngle` hilang. Browser memerlukan tujuh argumen, sehingga TypeError muncul sebelum `requestAnimationFrame(frame)` berikutnya dijadwalkan. Diperbaiki dengan `rotation=0, startAngle=0, endAngle=Math.PI*2`.

Renderer native pada tes lama menerima bentuk yang salah ini. Tes kini menerapkan pemeriksaan jumlah argumen dan nilai numerik Canvas. Menjalankan tes pada sumber v0.5 mereproduksi TypeError, sedangkan v0.6 lolos.

## Stabilitas dan performa

- Langkah simulasi tetap, render terpisah dari frekuensi pembaruan HUD.
- Tidak menggambar arena tersembunyi pada menu.
- Metadata alpha sprite prahitung, tanpa pemindaian pixel saat preload.
- Pemilihan fallback berdasarkan gambar yang benar-benar telah dimuat.
- Indikator preload dan fallback bila penyimpanan browser diblokir.
- Guard input, guard jeda, dan jeda saat tab tidak terlihat.
- Rasio arena mobile, judul awal, serta reduced motion.

Semua artwork asli dipertahankan; update ini memperbaiki kode dan metadata rendering. Tidak mengubah biaya, statistik, wave, atau keseimbangan unit.

## Bukti dan keterbatasan

Lihat `TEST_REPORT_v0.6.json` dan `preview-game-v0.6.png`. Preview dibuat oleh renderer engine. Browser interaktif tidak dapat mengakses file lokal karena kebijakan lingkungan; FPS browser dan layout perangkat nyata belum diuji.
