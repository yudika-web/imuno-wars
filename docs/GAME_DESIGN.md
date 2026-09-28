> Dokumen desain prototipe awal. Untuk implementasi terbaru, lihat CHANGELOG_v0.2.md dan ASSET_MANIFEST.md.

# IMMUNOFRONT: Battle in the Bloodstream

## 1. Ringkasan
IMMUNOFRONT adalah game edukasi **lane-defense / tower-defense berbasis grid 5×9**. Pemain mempertahankan jaringan tubuh dari bakteri, virus, dan patogen lain dengan membangun ekonomi metabolik sederhana, menempatkan komponen darah, lalu mengaktifkan respons imun innate dan adaptive.

Target prototipe ini adalah pengalaman 15–30 menit untuk 5 level yang secara bertahap mengajarkan: komponen darah, hemostasis, fagositosis, infeksi virus, antigen-antibodi, koordinasi imunitas innate/adaptive, inflamasi, dan immune memory.

> Catatan sains: beberapa proses biologi disederhanakan menjadi resource dan buff agar bisa dimainkan. Eritrosit **tidak menghasilkan oksigen**; eritrosit mengangkut O₂. “Immune Energy” adalah abstraksi kebutuhan metabolik sel.

---

## 2. Pilar desain
1. **Belajar melalui mekanik, bukan hanya teks.** Contoh: antibodi yang salah tidak mendapat bonus terhadap antigen yang tidak cocok.
2. **Strategi bertingkat.** Pemain memulai dari resource, lalu innate immunity, kemudian adaptive immunity.
3. **Informasi visual jelas.** Setiap tipe sel/patogen punya siluet, warna, dan ikon sendiri.
4. **Kesalahan tidak langsung menghukum fatal.** Respons yang “kurang tepat” masih bisa menang, tetapi lebih lambat/mahal.
5. **Boss sebagai ujian konsep.** Setiap boss memaksa pemain memakai konsep utama level.

---

## 3. Core loop
1. Bangun Eritrosit dan, mulai Level 2, Plasma.
2. Resource bertambah: O₂, Nutrient, dan Energy.
3. Tempatkan pertahanan pada lane yang terancam.
4. Sel Dendritik mengambil sampel antigen.
5. Saat 3 sampel antigen terkumpul, antibodi spesifik dapat diaktifkan dengan Immune Signal.
6. Gunakan buff pada momen tekanan tinggi.
7. Kalahkan seluruh wave dan boss tanpa membiarkan Tissue Health mencapai 0%.
8. Jawab kuis singkat untuk penguatan konsep.

---

## 4. Arena dan kontrol
- Grid: **5 baris × 9 kolom**.
- Patogen masuk dari kanan, bergerak ke kiri menuju jaringan.
- Klik kartu unit → klik tile untuk menempatkan unit.
- Space: pause/resume.
- Angka 1–9: memilih unit yang sudah terbuka.
- Tombol speed: 1× → 1.5× → 2×.
- Progress level disimpan dengan `localStorage`.

---

## 5. Resource
### Immune Energy
Resource pembelian utama. Dihasilkan oleh Eritrosit dan baseline metabolism. Musuh yang dikalahkan juga memberi Energy.

### Oxygen / O₂
Dihasilkan secara abstrak oleh Eritrosit untuk merepresentasikan suplai oksigen. Dalam konteks edukasi, Eritrosit sebenarnya **mengangkut** O₂.

### Nutrient
Dihasilkan oleh Plasma. O₂ + Nutrient secara berkala dikonversi menjadi bonus Energy.

### Immune Signal
Diperoleh dari sampling antigen dan eliminasi patogen. Digunakan untuk mengaktifkan antibodi.

### Tissue Health
HP markas. Patogen yang menembus sisi kiri menguranginya. Boss memberi kerusakan lebih besar.

---

## 6. Unit pemain
| Unit | Unlock | Cost | Peran gameplay | Konsep edukasi |
|---|---:|---:|---|---|
| Eritrosit | 1 | 50 | Resource generator | Transport O₂ |
| Trombosit | 1 | 75 | Barrier / tank | Hemostasis dan clotting |
| Neutrofil | 1 | 100 | DPS cepat | Responder awal terhadap banyak bakteri |
| Plasma | 2 | 75 | Support / resource | Cairan darah pembawa zat terlarut |
| Makrofag | 2 | 175 | Tank + execute | Fagositosis |
| Sel Dendritik | 3 | 150 | Scanner antigen | Antigen sampling/presentation |
| Natural Killer | 3 | 175 | Anti-virus/abnormal cell | Innate cytotoxic response |
| Cytotoxic T | 3 | 225 | Anti-infected-cell | Membunuh sel yang terinfeksi |
| B Cell | 4 | 180 | Support antibodi | Respons humoral |
| Helper T | 4 | 200 | Buff area | Koordinasi respons adaptif |
| Memory B | 5 | 210 | Auto-tag antigen dikenal | Immune memory |

### Detail mekanik unit
- **Eritrosit:** tiap 4 detik memberi O₂ dan Energy. Bonus jika berdekatan dengan Plasma.
- **Trombosit:** HP tinggi. Jika ditempatkan tepat pada tile luka, mendapat HP bonus dan luka dianggap tertutup.
- **Neutrofil:** damage bonus terhadap bakteri.
- **Plasma:** menghasilkan Nutrient dan memulihkan unit di tile sekitar.
- **Makrofag:** damage bonus terhadap bakteri; mengeksekusi patogen non-boss yang HP-nya sudah rendah.
- **Sel Dendritik:** setiap beberapa detik mengambil satu sampel antigen dari ancaman aktif.
- **Natural Killer:** damage bonus terhadap virus dan sel terinfeksi.
- **Cytotoxic T:** damage besar terhadap infected cell, lebih rendah terhadap target lain.
- **B Cell:** menambah produksi Immune Signal setelah antigen dikenal.
- **Helper T:** meningkatkan attack speed unit di sekitarnya.
- **Memory B:** secara periodik memberi antibody tag pada antigen yang sudah pernah dikenali.

---

## 7. Sistem antigen-antibodi
Setiap patogen punya satu signature antigen gameplay:
- ● Circle
- ◆ Diamond
- ▲ Triangle
- ✦ Star

### Alur
1. Sel Dendritik mengambil sampel.
2. Setelah 3 sampel signature yang sama, antigen dinyatakan “recognized”.
3. Pemain menghabiskan 15 Immune Signal untuk mengaktifkan antibodi yang sesuai.
4. Musuh dengan antigen cocok mendapat **Antibody Tag** selama 14 detik.
5. Target tagged menerima damage lebih besar.
6. Complement Cascade hanya bekerja bila ada target tagged.

### The Variant
Boss Level 4 berubah dari antigen ▲ menjadi ✦ saat HP mencapai 50%. Tag lama hilang dan pemain perlu mengenali antigen baru.

---

## 8. Buff aktif
| Buff | Unlock | Efek prototipe |
|---|---:|---|
| Oxygen Boost | 1 | Produksi Eritrosit ×2 selama 12 detik |
| Clot Barrier | 1 | Membuat barrier fibrin pada lane paling terancam |
| Cytokine Signal | 2 | Attack speed +35% selama 10 detik |
| Fever Response | 3 | Kecepatan musuh −35% selama 12 detik |
| Rapid Antigen Analysis | 4 | Langsung menyelesaikan sampling antigen aktif |
| Complement Cascade | 4 | Damage besar ke semua target yang antibody-tagged |
| Inflammatory Surge | 5 | Damage +55% selama 10 detik, Tissue Health −8 |

Inflammatory Surge sengaja mempunyai trade-off untuk menunjukkan bahwa inflamasi bermanfaat tetapi berlebihan dapat membebani jaringan.

---

## 9. Musuh reguler
- Bakteri Coccus — dasar, lambat.
- Bakteri Bacillus — sedikit lebih cepat.
- Toxin Bacteria — lebih kuat.
- Capsule Bacterium — armor lebih tinggi.
- Flagellated Bacteria — cepat.
- Free Virus — cepat dan rapuh.
- Shielded Virus — lebih tahan.
- Infected Cell — lambat, HP tinggi, prioritas Cytotoxic T.
- Bacteria Alpha — antigen ●.
- Bacteria Beta — antigen ◆.
- Virus Gamma — antigen ▲.

---

## 10. Rancangan 5 level
### Level 1 — The First Breach
**Topik:** luka, Eritrosit, Trombosit, Neutrofil.  
**Mekanik baru:** Energy, O₂, wound tile, clotting.  
**Boss:** Bacterial Colony.  
**Boss behavior:** HP tinggi dan memanggil Coccus.  
**Tujuan belajar:** membedakan transport O₂, hemostasis, dan respons neutrofil.

### Level 2 — Phagocyte Patrol
**Topik:** Plasma, Makrofag, fagositosis, kapsul bakteri.  
**Mekanik baru:** Nutrient, healing, plasma adjacency bonus, macrophage execute.  
**Boss:** Capsule Titan.  
**Boss behavior:** memiliki shield tambahan dan memanggil Capsule Bacterium.  
**Tujuan belajar:** memahami fagositosis dan fungsi plasma.

### Level 3 — Viral Hijack
**Topik:** infeksi virus dan sel terinfeksi.  
**Mekanik baru:** NK Cell, Cytotoxic T, Sel Dendritik, infected tile.  
**Boss:** Virus Factory.  
**Boss behavior:** memanggil Free Virus secara berkala.  
**Tujuan belajar:** virus memakai sel inang; Cytotoxic T menarget sel terinfeksi.

### Level 4 — Antigen Code
**Topik:** antigen, antibodi, B Cell, Helper T.  
**Mekanik baru:** antigen sampling, antibody activation, antibody tag, Complement Cascade.  
**Boss:** The Variant.  
**Boss behavior:** antigen berubah ▲ → ✦ pada 50% HP.  
**Tujuan belajar:** spesifisitas antigen-antibodi dan konsekuensi perubahan antigen.

### Level 5 — System Under Siege
**Topik:** koordinasi seluruh sistem dan immune memory.  
**Mekanik baru:** Memory B, Inflammatory Surge, kombinasi luka + infected tile + multi-pathogen.  
**Boss 1:** Biofilm Colossus.  
**Boss 2:** Viral Replication Core.  
**Final boss behavior:** Viral Burst memanggil beberapa Shielded Virus sekaligus.  
**Tujuan belajar:** innate + adaptive bekerja bersama; inflamasi memiliki biaya; memory mempercepat respons ulang.

---

## 11. Boss design
### Bacterial Colony
- HP 2,600.
- Summon Coccus setiap 7.5 detik.
- Menguji ekonomi awal + lane coverage.

### Capsule Titan
- HP 4,300 + shield 1,700.
- Armor 18%.
- Menguji sustained damage dan Makrofag.

### Virus Factory
- HP 5,600.
- Memanggil Free Virus setiap 5.8 detik.
- Menguji NK/Cytotoxic T dan kontrol jumlah musuh.

### The Variant
- HP 6,800.
- Antigen awal ▲, berubah ke ✦ di 50% HP.
- Damage pemain berkurang bila boss tidak antibody-tagged.
- Menguji sampling ulang dan pemilihan antibodi.

### Biofilm Colossus
- HP 7,600 + shield 2,600.
- Armor 32%.
- Menguji antibody tag + Complement dan damage berkelanjutan.

### Viral Replication Core
- HP 9,800.
- Memanggil 3 Shielded Virus per Viral Burst.
- Final exam untuk seluruh roster.

---

## 12. Onboarding dan feedback
- Intro modal tiap level menjelaskan 3 konsep utama.
- Bio Log di panel kanan memperbarui event penting.
- Banner besar dipakai untuk wave, mutation, antigen recognition, dan boss summon.
- Kuis satu pertanyaan setelah kemenangan memperkuat konsep tanpa menghambat progres.

---

## 13. Visual direction
- Gaya: **cartoon microscopic world + clean science UI**.
- Karakter mempunyai outline gelap, bentuk besar, ekspresi sederhana, dan siluet berbeda.
- Background organik abstrak, tidak gore dan tidak realistis.
- Antigen memakai shape language agar tetap terbaca bagi pengguna dengan perbedaan persepsi warna.
- UI menggunakan panel terang di atas arena biologis gelap untuk kontras tinggi.

---

## 14. Audio — ditunda ke fase terakhir
Belum diimplementasikan sesuai permintaan. Rencana kategori audio:
- UI click / select / error.
- Placement unit.
- Projectile/hit/fagocytosis.
- Antigen recognized / antibody active.
- Boss warning / mutation / viral burst.
- Musik menu, battle, boss, victory, defeat.

---

## 15. Struktur teknis
- `index.html` — markup saja.
- `css/game.css` — seluruh style.
- `data/game-data.js` — konfigurasi unit, musuh, buff, level, quiz.
- `js/game.js` — engine Canvas 2D, UI, combat, wave, persistence.
- `assets/...` — semua gambar WebP, satu file per aset.
- Tidak memakai framework atau dependency eksternal.

---

## 16. Scope prototipe vs produksi
### Sudah ada
- 5 level.
- 11 unit pemain.
- 11 musuh reguler/boss set.
- 6 boss encounter termasuk final boss.
- Resource system.
- 7 buff.
- Antigen-antibody system.
- Quiz dan local save.
- Desktop + responsive layout dasar.

### Disarankan untuk versi produksi
- Animasi sprite frame-by-frame.
- Pathogen infection mechanic yang benar-benar mengubah healthy cell menjadi infected cell.
- Upgrade tree dan encyclopedia/codex.
- Difficulty modes.
- Accessibility options (high contrast, reduced motion, font scaling).
- Touch UX khusus mobile.
- Audio dan haptic.
- Playtesting untuk balancing resource, boss HP, dan wave pacing.
- Review sains oleh tenaga pengajar/ahli biologi sebelum publikasi edukasi formal.
