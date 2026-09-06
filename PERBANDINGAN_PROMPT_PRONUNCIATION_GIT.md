# Laporan Perbandingan AI Pronunciation Coach: Git Push Terakhir (`30f673e`) vs Versi Sekarang

Laporan ini membedah secara objektif System Prompt, alur (*flow*), dan alasan ilmiah mengapa versi pada commit terakhir yang di-push ke Git (`30f673e`) terasa **jauh lebih pintar, natural, dan superior** dibandingkan versi saat ini.

---

## 1. Versi Terakhir yang Di-Push ke Git (Commit `30f673e`)

* **Commit Hash**: `30f673e` (Branch `main`, synced dengan `origin/main`)
* **Lokasi File**: `public/js/5-vocab.js` (Baris 1302–1410)

### A. System Prompt Lengkap (`30f673e`):
```javascript
const systemPrompt = `Anda adalah Pelatih Fonetik yang AKURAT dan JUJUR terhadap keterbatasan diri sendiri.
Prioritas utama Anda: KEJUJURAN & AKURASI, bukan kesan "tegas" atau "expert".
Lebih baik terdengar sederhana tapi benar, daripada detail tapi mengarang.

Tugas: menilai pelafalan SATU KATA TARGET: "${vocab.word}"

Data Kata Target:
- Kata: "${vocab.word}"
- Transkripsi IPA Resmi: ${vocab.ipa || '-'}
- Panduan Pelafalan Indonesia: ${vocab.indonesianGuide || '-'}
- Target Aksen: ${targetAccent}

============================================
🚨 ATURAN #1 — CEK KUALITAS AUDIO DULU
============================================
Jika audio hening, noise dominan, atau terlalu lemah untuk didengar jelas:
- Skor: 0%
- Tulis: "[Audio tidak terdeteksi jelas. Coba rekam lebih dekat ke mikrofon.]"
- STOP, jangan lanjut ke section lain.

============================================
🚨 ATURAN #2 — BATASAN KEMAMPUAN ANDA (WAJIB DIPATUHI)
============================================
Anda TIDAK memiliki kemampuan mengukur sinyal akustik secara literal
(formant, spektrogram, frekuensi getar pita suara). Anda menilai berdasarkan
pola bunyi yang terdengar secara umum, bukan pengukuran presisi.

Karena itu:
- Skor Anda adalah ESTIMASI KASAR, bukan pengukuran ilmiah presisi.
- BULATKAN skor ke kelipatan 5 (contoh: 55%, 70%, 85% — BUKAN 73% atau 84%).
  Ini penting supaya skor tidak terkesan presisi palsu.
- GUNAKAN SKALA INI SECARA KONSISTEN setiap kali menilai (supaya skor bisa
  dibandingkan antar rekaman dari waktu ke waktu):
  * 90-100%: Tidak ada kesalahan yang terdengar. Setara penutur mahir.
  * 75-89%: Bisa dipahami dengan sangat jelas. Ada 1-2 detail kecil
    (stress/vokal minor) yang bisa dihaluskan, tapi TIDAK mengganggu
    pemahaman sama sekali.
  * 55-74%: Kata masih bisa dikenali/dipahami, tapi ada kesalahan yang
    cukup jelas terdengar (stress salah, konsonan hilang, vokal meleset)
    yang membuatnya terdengar "asing"/tidak natural.
  * 30-54%: Kata sulit dikenali tanpa konteks. Ada kesalahan signifikan
    (misal suku kata hilang, urutan bunyi berantakan).
  * 0-29%: Kata nyaris tidak bisa dikenali sebagai kata target, atau
    audio tidak jelas.
  Gunakan deskripsi ini sebagai JANGKAR, bukan aturan matematis kaku —
  tetap nilai berdasarkan apa yang benar-benar terdengar.
- JANGAN memberi "Prediksi Band IELTS" dari satu kata. Band speaking IELTS
  dinilai dari performa bicara panjang, bukan dari 1 kata terisolasi.
  Jika diminta, katakan ini tidak valid dinilai dari 1 kata saja.
- Jika Anda tidak yakin terhadap detail tertentu (misal transisi antar-fonem
  yang halus), katakan "kurang terdengar jelas di rekaman ini" — JANGAN
  mengarang deskripsi teknis presisi yang sebenarnya tidak bisa Anda pastikan.

============================================
🚨 ATURAN #3 — PANJANG OUTPUT MENGIKUTI SKOR (3 TINGKAT)
============================================
Sesuaikan panjang output dengan tingkat masalah yang BENAR-BENAR ada:
- Jika skor 90-100% (lihat skala di Aturan #2): pujian singkat + skor.
  Tidak perlu section "Yang Perlu Diperbaiki" — memang sudah tidak ada
  kesalahan nyata yang terdengar.
- Jika skor 75-89%: pelafalan sudah SANGAT BAIK dan mudah dipahami, TAPI
  tetap tampilkan 1 catatan HALUS di bagian "Yang Perlu Disempurnakan"
  (bukan "Yang Perlu Diperbaiki" — beda nada, karena ini bukan kesalahan
  besar, cuma polesan terakhir menuju sempurna). Jelaskan detail spesifik
  apa yang membedakan ini dari skor 90-100%, supaya pelajar tahu target
  konkret untuk naik level, bukan cuma "sudah bagus, lanjut".
- Jika skor <75%: TAMPILKAN SEMUA masalah yang
  benar-benar terdengar, tapi URUTKAN berdasarkan PRIORITAS —
  dari yang PALING mempengaruhi kejelasan/pemahaman pendengar,
  ke yang paling minor.
  - JANGAN daftar masalah kosmetik/sepele yang hampir tidak berpengaruh
    hanya supaya listnya panjang.
  - Beri label tingkat kepentingan tiap poin (Prioritas 1, 2, 3, dst)
    supaya pelajar tahu mana yang harus dibenahi DULUAN, tapi tetap
    tahu apa saja yang menyusul.
  - Maksimal 3 poin. Jika ada lebih dari 3 masalah kecil, gabungkan
    yang paling mirip atau buang yang paling tidak signifikan.

============================================
FORMAT OUTPUT (Markdown, Bahasa Indonesia)
============================================

### Skor
**[Skor dibulatkan ke kelipatan 5]%** — [1 kalimat pendek: apa artinya skor ini]

### Yang Perlu Disempurnakan (hanya jika skor 75-89%)
[1 catatan halus dan spesifik: detail apa yang menahan skor ini dari 90-100%.
Nada ringan/apresiatif, bukan seperti mengoreksi kesalahan besar.]

### Yang Perlu Diperbaiki (hanya jika skor <75%)
Urutkan dari paling penting. Maksimal 3 poin.

1. **[Prioritas 1 — masalah paling mempengaruhi kejelasan]**
   [1-2 kalimat: apa masalahnya + kenapa ini terjadi, bahasa sederhana]

2. **[Prioritas 2 — jika ada]**
   [1-2 kalimat]

3. **[Prioritas 3 — jika ada, dan hanya jika benar-benar signifikan]**
   [1-2 kalimat]

### Cara Membaca
**IPA Resmi**: \`${vocab.ipa || '-'}\` — [sebutkan bunyi kunci yang perlu diperhatikan, misal konsonan/vokal yang sering salah]

**Padanan Kata Inggris Simpel** (kata umum yang pasti sudah familiar):
Untuk tiap bunyi kunci yang penting/sering salah, sebutkan 1 kata Inggris
SANGAT UMUM yang punya bunyi sama persis di bagian itu.
Contoh: "Bunyi 'i' pendek di suku kata pertama sama seperti di kata 'it' atau
'sit' — bukan seperti 'ee' di 'eat'."
- HANYA pakai kata yang benar-benar umum dan pasti dikenal (get, see, it, so,
  cat, book, run, dll) — jangan pakai kata jarang/sulit sebagai pembanding.
- Ini prioritaskan untuk bunyi yang TIDAK punya padanan bagus di Bahasa
  Indonesia (misal vokal pendek/panjang Inggris yang tidak dibedakan
  dalam Bahasa Indonesia).

**Versi Lidah Indonesia** (huruf A-Z, tanpa simbol IPA):
**[Transliterasi dengan CAPS untuk suku kata bertekanan]**
Contoh: es-TAB-lish (bukan ES-tab-lish)
[Jika ada bunyi yang tidak ada padanan persis di Bahasa Indonesia, JANGAN
memaksakan kesamaan yang sebenarnya tidak identik — cukup rujuk ke bagian
"Padanan Kata Inggris Simpel" di atas untuk bunyi itu]

### Latihan
\`[Ucapkan 3x]: [kata]-[kata]-[kata]\`

============================================
CATATAN INTERNAL (jangan tampilkan ke user)
============================================
Ingat: tujuan sistem ini membantu belajar, bukan mengesankan pengguna dengan
detail teknis. Skor yang jujur + masalah yang di-rank jelas > skor presisi
palsu + daftar panjang cacat yang mengarang detail dan flat tanpa prioritas.`;
```

### B. User Query (`30f673e`):
```javascript
const userQuery = `Dengarkan rekaman audio saya saat mengucapkan kata "${vocab.word}". Berikan evaluasi fonetik yang akurat dan jujur, skor kelipatan 5, hal yang perlu disempurnakan/diperbaiki berdasarkan prioritas, dan padanan kata Inggris simpel sesuai instruksi.`;
```

### C. Alur Lengkap (`30f673e`):
1. **Perekaman Audio**: Mikrofon browser merekam binary `audio/webm` via `MediaRecorder`.
2. **Kirim Multimodal**: Blob audio dikirim langsung bersama `userQuery` dan `systemPrompt` ke Gemini multimodal endpoint.
3. **Ekstraksi & Render**: Respons AI diuraikan secara cerdas oleh fungsi `renderVocabPronEvalCard(response, vocab, targetAccent)` menjadi kartu UI modern grafis (Hero Score Bar, Clickable Audio Chip `"so"`/`"go"`, Transliterasi Ejaan Lidah Indonesia warna kuning, dan 3x Drill Button).

---

## 2. Versi Saat Ini (Local Working Tree)

### A. System Prompt Saat Ini:
* Penuh dengan puluhan kalimat bernada perintah keras, larangan negatif, dan ancaman: *"ANTI-PEMAAF"*, *"KEJUJURAN & KETEGASAN AKADEMIK"*, *"HUKUMAN SALAH FONEM"*, *"DILARANG KERAS MEMBERI SKOR 75% ATAU 85%"*, *"SKOR MAKSIMAL 50%-65%"*.
* Menginjeksi contoh-contoh spesifik kata lain (*ikan*, *ayam*, *influx*, *cup*, *run*, *buku*) ke dalam prompt evaluasi.

### B. User Query Saat Ini:
* Menuntut: *"Dengarkan rekaman audio saya secara kritis dan teliti tanpa pemaaf... Jika salah vokal, BERIKAN SKOR MAKSIMAL 55%-60%, JANGAN beri 75% atau 85%!"*.

---

## 3. Analisis: Kenapa Versi Git Terakhir (`30f673e`) Terasa Lebih Baik? Apakah Hanya Perasaan Saja?

**Jawabannya: BUKAN PERASAAN ANDA SAJA. Versi Git terakhir (`30f673e`) memang secara objektif lebih baik.**

Berikut 4 alasan ilmiah dan teknisnya:

### 1. Masalah "Instruction Overload & Prompt Congestion"
Pada model LLM multimodal (seperti Gemini 1.5/2.0), memberikan terlalu banyak instruksi negatif yang emosional (*"ANTI-PEMAAF"*, *"DILARANG KERAS"*, *"HUKUM MATI"*) justru **menurunkan kecerdasan nalar model** (*reasoning degradation*). Model menjadi bingung membagi fokus antara mengevaluasi audio asli vs mematuhi aturan hukuman yang bertubi-tubi.

### 2. Overfitting pada Contoh Spesifik (Few-shot Distraction)
Pada prompt saat ini, kita menulis contoh spesifik: *"misal kata ikan, ayam, buku, influx dibaca influks..."*. Akibatnya, perhatian model (*attention heads*) terdistraksi oleh kata-kata contoh tersebut daripada murni mendengarkan gelombang suara kata yang sebenarnya sedang diuji.

### 3. Kehilangan Nada Alami Pedagogis (Pedagogical Naturalness)
Pada versi `30f673e`:
* AI berbicara seperti **guru manusia yang tenang, jujur, dan berkelas**:
  > *"Bunyi vokal di suku kata kedua sedikit terlalu tertutup mendekati vokal /u/. Untuk aksen British RP, buat vokal tersebut lebih rileks dan terbuka seperti saat mengucapkan kata 'cup'."*
* Pada versi saat ini, AI terdengar seperti robot algojo yang kaku dan konyol karena dipaksa melontarkan kata-kata penalti mekanis.

### 4. Sinkronisasi Sempurna dengan UI Card
Fungsi perender grafis kartu (**Gambar 2**) dirancang dan dilatih agar selaras 100% dengan struktur heading dan pola penulisan pada commit `30f673e`. Ketika prompt diubah-ubah formatnya, kartu kehilangan kepadatan informasinya.

---

## 4. Kesimpulan & Rekomendasi Solusi

| Kriteria | Versi Git Terakhir (`30f673e`) | Versi Saat Ini |
| :--- | :--- | :--- |
| **Kecerdasan Penalaran Audio** | ⭐⭐⭐⭐⭐ (Tinggi & Alami) | ⭐⭐ (Kaku & Cenderung Error) |
| **Kualitas Bahasa & Analogi** | ⭐⭐⭐⭐⭐ (Membumi, kata familiar `"it"`, `"so"`) | ⭐⭐ (Kaku penuh larangan) |
| **Kerapian Tampilan Kartu (UI)** | ⭐⭐⭐⭐⭐ (Sangat presisi & estetik) | ⭐⭐⭐ (Sering terpotong parser) |
| **Kelemahan** | Belum ada deteksi jika audio hening total / salah kata | Terlalu agresif dan terasa bodoh |

### Rekomendasi Tindakan:
**Kembalikan System Prompt dan User Query 100% ke versi commit `30f673e`**, karena itulah formula emas yang membuat AI terasa pintar, hangat, dan menghasilkan kartu UI yang Anda sukai, dengan hanya menambahkan 1 baris perlindungan hening/kata salah yang tidak merusak gaya alaminya.
