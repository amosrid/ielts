# RINGKASAN AUDIT SISTEM — IeltsGo

Dokumen ini merupakan intisari dari file [SYSTEM_AUDIT_IELTSGO.md](file:///c:/Users/amosp/Downloads/food-business-app-3/SYSTEM_AUDIT_IELTSGO.md) yang mengaudit keseluruhan 12.338 baris kode aplikasi `public/ielts-roadmap.html`.

---

## BAGIAN A: DAFTAR ISI RINGKAS

### LANGKAH 1 — PETA STRUKTUR (Structure Map)
- **A. HTML Head, CSS & Config (Lines 1–856)** — Berisi inisialisasi dokumen HTML5, konfigurasi Tailwind CSS, styling custom, animasi keyframes, serta stylesheet tema dark dan light mode.
- **B. Sticky Header & Player HUD (Lines 857–942)** — Menampilkan identitas aplikasi, level dan title pemain, progress bar XP, persentase penyelesaian roadmap, serta tombol aksi cepat desktop dan mobile.
- **C. Navigation Sidebar (Lines 944–1059)** — Menyediakan navigasi menu utama responsif untuk Dashboard, accordion 5 fase Roadmap & Boss Arena, Vocab Logger, Speaking Lab, Synthesis Lab, dan AI Glitch Lab.
- **D. Dashboard Tab (Lines 1062–1422)** — Merupakan command center terpadu yang menampilkan hero banner progress, widget afirmasi harian, snapshot 5 fase, statistik bank kosakata, status speaking lab, lencana, dan shortcut aksi cepat.
- **E. Roadmap Phase Tabs (Lines 1425–2146)** — Memuat antarmuka pembelajaran terstruktur untuk Fase 1 (SVO), Fase 2 (Time Systems), Fase 3 (Clause Combos), Fase 4 (Advanced Precision), dan Fase 5 (Output Automation) beserta kartu tantangan Mini-Boss tiap fase.
- **F. Boss Arena (Lines 2147–2365)** — Menyediakan simulasi ujian IELTS 60 menit dengan timer hitung mundur, grafik data SVG Task 1, editor esai, checklist 14 stage, dan evaluasi penguji AI.
- **G. AI Glitch Lab (Lines 2366–2440)** — Workspace interaktif untuk analisis tata bahasa mendalam berbasis 5 Pilar Kritis (Why, How, Analogi, Glitch Fix, Retrieval Drill) dan arena latihan retrival.
- **H. IELTS Speaking Lab (Lines 2441–2894)** — Studio latihan berbicara multimodal yang mencakup Part 1 (Shadowing), Part 2 (Cue Card 2 menit), dan Part 3 (Diskusi Analitis) dengan integrasi audio recorder, TTS, visualizer canvas, dan filter kosakata.
- **I. Vocabulary Logger (Lines 2895–3058)** — Antarmuka pencatatan dan peninjauan kosakata berbasis Spaced Repetition (SM-2) lengkap dengan filter level CEFR (A1–C2), bilah pencarian, dan pengurutan kartu kata.
- **J. Synthesis Lab UI (Lines 3063–3655)** — Antarmuka alur 6 tahap pembelajaran terintegrasi (Reading Log, Synthesis Writing/OCR, Transformasi 3-Tier, Spontaneous Speak, Upgraded Script, Targeted Respeak) serta kartu laporan akhir dan modal logbook.
- **K. Other Modals (Lines 3658–4411)** — Kumpulan 10 jendela modal dialog untuk Master Prompt AI, Quest Stage MCQ + Menulis, Ujian Mini-Boss, Konfigurasi API Key Gemini, Galeri Badges, Master Card Vocab, Review Flashcard SM-2, Reset Progress, dan Manajemen Dek Afirmasi.
- **L. JavaScript — Core Engine (Lines 4415–5578)** — Blok skrip dasar yang mendefinisikan synthesizer efek suara Web Audio (SoundFX), data dictionary 14 stage (`STAGE_DATA`), prompt menulis quest, konfigurasi mini-boss, array pencapaian, dan parser markdown.
- **M. JavaScript — State Persistence & Config (Lines 5580–5998)** — Mengatur penyimpanan dan pemulihan status game ke localStorage, pengujian konektivitas API Key Gemini secara live, manajemen modal prompt, sistem XP/leveling, dan navigasi fase.
- **N. JavaScript — UI Sync & Quest System (Lines 6000–6889)** — Mengontrol sinkronisasi antarmuka HUD, peluncuran kembang api (confetti), alur quest dua tahap (MCQ & penulisan esai dengan verifikasi AI), generator prompt remediasi, dan evaluasi mini-boss fase.
- **O. JavaScript — Boss Arena & Offline Engine (Lines 6891–7144)** — Mengelola timer speedrun 60 menit, auto-save draf esai, simulator diagnostik heuristik tata bahasa offline berbasis regex, ekstraktor JSON LLM, dan konversi audio Blob ke Base64.
- **P. JavaScript — Gemini API & AI Glitch Lab (Lines 7146–7564)** — Menangani pengiriman request HTTP ke Google Generative Language API dengan mekanisme retry, pemrosesan analisis 5 pilar glitch lab, penilaian latihan retrival, dan penilaian esai Boss Arena.
- **Q. JavaScript — Speaking Lab Engine (Lines 7566–9048)** — Mengontrol engine speaking lab komprehensif: scaffolding grammar & kosakata, generator prompt, playback Web Speech TTS, perekam MediaRecorder & visualisasi osiloskop canvas, timer persiapan, penyimpanan kata salah ucap ke Vocab Bank, dan evaluasi AI multimodal.
- **R. JavaScript — UI Utilities & Streak (Lines 9049–9353)** — Mengelola drawer menu burger mobile, persistensi tema dark/light mode, pelacak streak belajar harian berbasis tanggal kalender, dan fungsi perender utama Dashboard.
- **S. JavaScript — Vocabulary Engine (Lines 9354–10510)** — Mengatur siklus hidup Vocab Bank, klasifikasi CEFR dan panduan fonetik alfabet Indonesia via AI, modal master kartu kata, audio coach fonetik langsung via Gemini, dan evaluasi Active Recall teknik Feynman.
- **T. JavaScript — Review, Affirmation & Synthesis Engine (Lines 10510–12338)** — Mengimplementasikan ujian tantangan Fast-Track Mastery, sesi review flashcard algoritma SM-2, ritual afirmasi vokal harian 2-step, serta engine 6-step Synthesis Lab dan riwayat logbook zero-blob.

---

### LANGKAH 2 — EKSTRAKSI PROMPT MENTAH (Verbatim Prompt Extraction)
- **2.1 STAGE MASTER AI PROMPTS (`STAGE_DATA[stageId].aiPrompt`)** — Kumpulan 14 prompt instruksi eksternal verbatim untuk masing-masing stage dari Stage 1-1 hingga Stage 5-2.
- **2.2 STAGE QUEST WRITING EXAMINER (Line 6459–6487)** — Prompt sistem ketat pemeriksa tata bahasa tulisan pada Step 2 Quest Stage dengan output wajib `# 🚦 VERDICT: PASSED` atau `FAILED`.
- **2.3 QUEST REMEDIATION PROMPT (Line 6599–6613)** — Template prompt belajar mandiri 4 langkah yang dirakit dinamis berdasarkan kalimat pengguna dan hasil evaluasi examiner.
- **2.4 MINI-BOSS DIAGNOSTIC (Line 6765–6791)** — Prompt evaluasi diagnostik paragraf mini-boss fase untuk mengidentifikasi keunggulan, kelemahan spesifik per stage, rencana remediasi, dan model paragraf Band 8.5+.
- **2.5 AI GLITCH LAB — 5-PILLAR ANALYSIS (Line 7232–7248)** — Prompt analisis tata bahasa 5 pilar (Why, How, Analogi, Glitch Analysis & Fix, serta Latihan Retrival).
- **2.6 AI GLITCH LAB — DRILL EVALUATION (Line 7319–7332)** — Prompt penilai jawaban latihan retrival di Glitch Lab yang menghasilkan skor penguasaan dan status MASTERED/NEEDS PRACTICE.
- **2.7 BOSS ARENA SPEEDRUN (Line 7475–7484)** — Prompt resmi penguji IELTS Writing untuk menilai esai 60 menit berdasarkan 4 kriteria standar dan checklist 14 stage.
- **2.8 SPEAKING LAB — PROMPT GENERATION (3 prompts)** — Tiga prompt pembuat topik berbicara (Part 1 Shadowing, Part 2 Cue Card, Part 3 Diskusi) dengan injeksi aturan grammar terbuka dan daftar kosakata target.
- **2.9 SPEAKING LAB — MULTIMODAL AI EXAMINER (Line 8776–8880)** — Prompt penguji vokal resmi IELTS multimodal (~120 baris) dengan aturan ketat tanpa pemanis, audit fonetik cara baca alfabet Indonesia (larangan simbol IPA), audit akhiran (+s/+ed), dan skor 4 rubrik.
- **2.10 SPEAKING REMEDIATION PROMPT (Line 8695–8736)** — Template perakit prompt remediasi fonetik 4 langkah yang diekstraksi dari kesalahan nyata pada laporan rekaman suara pengguna.
- **2.11 VOCAB BANK — WORD ANALYSIS (Line 9679–9712)** — Prompt leksikografer untuk mengklasifikasi kata bahasa Inggris (deteksi non-Inggris/typo, CEFR, definisi ID/EN, cara baca alfabet Indonesia, IPA Cambridge, analogi ELI5, dan sinonim).
- **2.12 VOCAB BANK — PHONETIC COACH (Line 10233–10273)** — Prompt pelatih fonetik tegas untuk membedah audio pengucapan satu kata target dengan audit stres suku kata, presisi fonem, dan panduan posisi mulut.
- **2.13 VOCAB BANK — EXTERNAL STUDY PROMPT (Line 10310–10329)** — Template prompt komprehensif yang dapat disalin ke chatbot eksternal untuk bedah kolokasi, penggunaan esai Task 2, dan nuansa kata.
- **2.14 VOCAB BANK — FEYNMAN TECHNIQUE EVAL (Line 10370–10393)** — Prompt penilai penjelasan konsep kata ala Feynman (ELI5) yang mengkategorikan pemahaman ke tingkat mastery, partial, atau unlearned beserta penyesuaian interval SRS.
- **2.15 VOCAB BANK — FAST-TRACK CHALLENGE GENERATOR (Line 10490–10497)** — Prompt pembuat 1 soal tantangan spontan tingkat tinggi untuk menguji kelayakan bypass review kata.
- **2.16 VOCAB BANK — FAST-TRACK ANSWER EVAL (Line 10539–10554)** — Prompt penilai ketat standar Band 7.5+ atas jawaban ujian spontan fast-track mastery.
- **2.17 DAILY AFFIRMATION — VOCAL EVAL (Line 11097–11130)** — Prompt audit vokal ketat untuk ritual afirmasi harian yang memeriksa artikulasi kata, akhiran morfologis (+s/+ed), kegugupan, dan kelantangan suara.
- **2.18 AFFIRMATION DECK — AI GENERATOR (Line 11307–11313)** — Prompt pembuat kalimat afirmasi mindset IELTS Band 8.0+ dalam bahasa Inggris beserta terjemahan bahasa Indonesia.
- **2.19 SYNTHESIS LAB — HANDWRITING OCR (Line 11633–11636)** — Prompt transkripsi OCR berpresisi tinggi untuk membaca foto tulisan tangan esai siswa.
- **2.20 SYNTHESIS LAB — 3-TIER + ANTI-GIBBERISH (Line 11685–11728)** — Prompt transformasi tulisan 3-Tier yang dilengkapi Anti-Hallucination & Gibberish Guard untuk menolak teks acak/sampah serta menyusun Tier 1, Tier 2, Tier 3, dan anchor berbicara.
- **2.21 SYNTHESIS LAB — SPONTANEOUS SPEAKING EVAL (Line 11980–12001)** — Prompt penguji berbicara spontan Step 4 yang mentranskripsi rekaman, memberi label kelancaran, catatan evaluasi L1 Indonesia, naskah berbicara ter-upgrade, dan tips intonasi.
- **2.22 SYNTHESIS LAB — FINAL RESPEAK + ACCENT AUDIT (Line 12054–12090)** — Prompt evaluasi komparatif Attempt 1 vs Attempt 2 yang menghasilkan 3 bagian audit aksen fonetik terstruktur, delta peningkatan, dan skor akhir IELTS/CEFR tanpa inflasi nilai.

---

### LANGKAH 3 — AUDIT PER BAGIAN (Per-Section Audit)
- ⚠️ **3.1 HTML Head & CSS (L1–856)** — Menganalisis layer presentasi dan styling; mengandung celah inkonsistensi penomoran versi di berbagai tempat serta duplikasi selektor modal pada CSS light mode.
- **3.2 Sticky Header & Sidebar (L857–1059)** — Menganalisis header sticky dan sidebar navigasi yang memiliki pemisahan kontrol desktop dan mobile yang bersih.
- ⚠️ **3.3 Dashboard (L1062–1422)** — Menganalisis alur data render dashboard; mengandung celah nilai penyebut total stage yang di-hardcode menjadi angka statis 14.
- ⚠️ **3.4 Roadmap Phase Tabs (L1425–2365)** — Menganalisis kartu stage 5 fase; mengandung celah duplikasi markup navigator phase pill, notasi LaTeX mentah di tag HTML, dan pemblokiran tooltip native checkbox oleh CSS.
- ⚠️ **3.5 Quest Modal System (L6225–6587)** — Menganalisis alur modal quest dua tahap; mengandung celah logika deteksi verdict PASSED/FAILED yang berisiko false negative serta penggunaan kelas warna Tailwind dinamis yang rentan gagal kompilasi JIT.
- ⚠️ **3.6 Gemini API Engine (L7148–7216)** — Menganalisis modul pengiriman request API Gemini multimodal; mengandung celah inkonsistensi gaya scoping variabel teks prompt (lokal `let` vs properti global `window`).
- ⚠️ **3.7 Speaking Lab Engine (L7566–9017)** — Menganalisis engine laboratorium speaking multimodal; mengandung celah keberadaan simbol IPA pada mock fallback offline yang melanggar prompt sistem, kerapuhan regex ekstraksi skrip retest, dan potensi error restart cepat SpeechRecognition.
- ⚠️ **3.8 Vocab Bank Engine (L9354–10510)** — Menganalisis engine bank kosakata dan active recall; mengandung celah data seed kata ke-5 yang tidak lengkap, pemicuan request AI tidak disengaja saat modal ditutup saat merekam, dan kapitalisasi seluruh kata pada template contoh stres suku kata.
- ⚠️ **3.9 Synthesis Lab Engine (L11346–12338)** — Menganalisis engine 6-step Synthesis Lab; berhasil menerapkan anti-gibberish guard dan zero-blob storage, namun memiliki celah validasi audio Step 4 yang terlalu longgar.
- **3.10 Affirmation Engine (L10728–11345)** — Menganalisis engine afirmasi harian 2-step dengan pelacakan streak dan validasi pengetikan yang bersih dan terisolasi baik.
- ⚠️ **3.11 Audio & UI Utilities** — Menganalisis utilitas pendukung; mengandung celah ketiadaan `AudioContext.resume()` pada SoundFX, efek samping selektor luas pada `updateAudioIcons()`, dan race condition timeout pada `showToast()`.

---

### LANGKAH 4 — KONSISTENSI ANTAR BAGIAN (Cross-Section Consistency)
- ⚠️ **4.1 Prompt Strictness Consistency** — Mengevaluasi keseragaman ketegasan prompt AI; menemukan celah ketiadaan Anti-Gibberish Guard pada prompt Quest Stage Writing, Boss Arena, dan Mini-Boss.
- ⚠️ **4.2 Phonetic Guide Format Consistency** — Mengevaluasi keselarasan format transkripsi fonetik; menemukan kontradiksi di mana mock offline Speaking Lab memakai simbol IPA meskipun dilarang oleh prompt penguji.
- ⚠️ **4.3 State Management Consistency** — Mengevaluasi sinkronisasi state aplikasi; mencatat properti `playerState` yang tidak terinisialisasi pada deklarasi, penyimpanan draf yang tertinggal saat reset progres, dan hardcoding angka pembagi tahapan.
- **4.4 Rubric & Scoring Consistency** — Memeriksa struktur pembagian poin XP di seluruh fitur dan mengonfirmasi bahwa nilai XP telah berjenjang secara konsisten sesuai beban tugas.
- **4.5 localStorage Key Registry** — Memetakan 15 key localStorage yang digunakan dan memverifikasi tidak adanya tabrakan nama key berkat prefix `ielts_`.
- ⚠️ **4.6 Summary of Critical Cross-Section Issues** — Merangkum 10 daftar temuan masalah lintas bagian dengan klasifikasi prioritas High, Medium, dan Low.

---

## BAGIAN B: DAFTAR CELAH, PRIORITAS & STATUS PERBAIKAN

Berikut adalah seluruh poin celah, kelemahan, dan bug yang ditemukan dalam audit sistem, lengkap dengan status pengerjaannya:

---

### PRIORITAS TINGGI

1. **Ketiadaan Anti-Gibberish Guard pada Prompt Quest, Boss Arena, dan Mini-Boss** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 4 — 4.1 Prompt Strictness Consistency & 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Proteksi anti-halusinasi dan penolakan teks sampah (`isInvalid: true`) sebelumnya hanya diimplementasikan pada Synthesis Lab, sedangkan pada Quest Stage Writing, Boss Arena, dan Mini-Boss tidak tersedia guard serupa.
   - **Status**: **✅ TERSELESAIKAN** — Ditambahkan aturan non-negotiable Anti-Hallucination & Gibberish Guard pada prompt sistem Quest (`submitQuestModalAnswer`), Mini-Boss (`submitMiniBossEssay`), dan Boss Arena (`evaluateBossEssay`).

2. **Pengecekan Ketersediaan Audio Step 4 Synthesis Lab Terlalu Longgar** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.9 Synthesis Lab Engine & 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Validasi Step 4 sebelumnya mengizinkan proses berlanjut tanpa rekaman audio selama input teks tulisan terisi.
   - **Status**: **✅ TERSELESAIKAN** — Validasi audio guard telah diamankan secara ketat.

3. **Logika Deteksi Kelulusan (PASS/FAILED) Quest Menulis Berisiko False Negative** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.5 Quest Modal System*
   - **Masalah**: Evaluasi kelulusan memeriksa `aiResponse.toLowerCase().includes('failed')` secara global jika string judul eksak tidak cocok sempurna.
   - **Status**: **✅ TERSELESAIKAN** — Logika dirombak menggunakan regex terstruktur (`/VERDICT:\s*PASSED/i`, `/VERDICT:\s*FAILED/i`) dan threshold evaluasi Band score ($\ge 6.5$), menghilangkan false negative kegagalan.

4. **Pemicuan Evaluasi AI Tidak Disengaja Saat Modal Vocab Card Ditutup Saat Merekam** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.8 Vocab Bank Engine & 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Fungsi `closeVocabCard()` memanggil `stopVocabPronTest()` yang menghentikan MediaRecorder, dan event `onstop` secara otomatis langsung menembak `submitVocabDeepEval()`.
   - **Status**: **✅ TERSELESAIKAN** — Fungsi `closeVocabCard()` sekarang memanggil `stopVocabPronTest(false)` dan event `onstop` memeriksa flag `_triggerAI` sebelum mengirim request ke API Gemini.

5. **Potensi Error `InvalidStateError` pada Restart Cepat SpeechRecognition** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.7 Speaking Lab Engine*
   - **Masalah**: Fungsi `startLiveSpeechRecognition()` tidak memiliki pengecekan status atau penanganan error jika pengguna menghentikan dan memulai kembali perekaman secara cepat.
   - **Status**: **✅ TERSELESAIKAN** — Ditambahkan penghentian paksa (`abort()`) pada instance aktif sebelum memulai yang baru, serta pembersihan referensi pada handler `onend`.

---

### PRIORITAS SEDANG

6. **Properti `speakingHistory` dan `miniBossResults` Tidak Terinisialisasi di `playerState` Awal** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.11, Langkah 4 — 4.3 State Management Consistency & 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Objek `playerState` pada deklarasi awal dan fungsi `executeResetProgress()` tidak menyertakan properti `speakingHistory: {}` dan `miniBossResults: {}`.
   - **Status**: **✅ TERSELESAIKAN** — Diinisialisasi secara eksplisit pada deklarasi awal, saat `loadSaveData()`, dan pada `executeResetProgress()`.

7. **Kontradiksi Penggunaan Simbol IPA pada Mock Fallback Offline Speaking Lab** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.7 Speaking Lab Engine, Langkah 4 — 4.2 & 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Prompt penguji AI secara mutlak melarang simbol fonetik IPA, namun respons simulasi offline mock justru memuat simbol IPA (`ɪ`, `ə`, `ɑː`, `ʊ`).
   - **Status**: **✅ TERSELESAIKAN** — Seluruh simbol IPA pada respon mock offline Speaking Lab diganti 100% menjadi ejaan fonetik alfabet Indonesia yang ramah lidah lokal (misal: `RE-zi-dents ↘`, `PAA-ks ↘`, `ke-MYUU-ne-ti`).

8. **Inkonsistensi Data Objek Seed Vocab Bank Ke-5 (`substantiate`)** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.8 Vocab Bank Engine*
   - **Masalah**: Data awal `vocab_seed_5` (`substantiate`) tidak menyertakan field tracking Feynman dan SRS.
   - **Status**: **✅ TERSELESAIKAN** — Dilengkapi field `dateAdded`, `feynmanLevel`, `feynmanStatus`, `feynmanLastExplanation`, `feynmanFeedback`, dan `consecutiveMasteryCount`.

9. **Efek Samping Selektor Luas pada `updateAudioIcons()` Mengubah Tombol TTS** — [✅ TERSELESAIKAN]
   - **Section asal**: *Langkah 3 — 3.11 Audio & UI Utilities & Langkah 4 — 4.6 Summary of Critical Cross-Section Issues*
   - **Masalah**: Selektor `document.querySelectorAll('#btn-audio-mute i, .fa-volume-high, .fa-volume-xmark')` bersifat terlalu generik.
   - **Status**: **✅ TERSELESAIKAN** — Selektor diisolasi khusus hanya untuk `#btn-audio-mute i` dan `#btn-audio-mute-mobile i`.

10. **SoundFX Tidak Menangani Autoplay Web Audio yang Tersuspensi** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.11 Audio & UI Utilities*
    - **Masalah**: `SoundFX.init()` menginstansiasi `AudioContext` tanpa memeriksa dan memanggil `ctx.resume()` saat statusnya `suspended`.
    - **Status**: **✅ TERSELESAIKAN** — Ditambahkan pemanggilan `this.ctx.resume()` otomatis di dalam `SoundFX.play()` jika AudioContext dalam status tersuspensi.

11. **Penyusunan Kelas Warna Tailwind Dinamis Berisiko Gagal di-Compile** — [ℹ️ ARSITEKTUR AMAN]
    - **Section asal**: *Langkah 3 — 3.5 Quest Modal System*
    - **Masalah**: Kode membangun kelas Tailwind melalui interpolasi string.
    - **Catatan**: Aplikasi menggunakan CDN Tailwind lengkap di browser yang memproses kelas secara runtime.

12. **Penyusunan Denominator Tahapan dan Fase Di-hardcode Statis** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.3 Dashboard, Langkah 4 — 4.3 & 4.6 Summary of Critical Cross-Section Issues*
    - **Masalah**: Nilai total tahapan di-hardcode dengan angka pembagi statis `/14` dan `/3, /4, /3, /2, /2`.
    - **Status**: **✅ TERSELESAIKAN** — Dihitung secara dinamis dari dictionary `STAGE_DATA` di dalam `updateUI()` dan `renderDashboard()`.

13. **Kerapuhan Regex Parsing pada Ekstraksi Skrip Latihan Ulang Speaking** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.7 Speaking Lab Engine*
    - **Masalah**: Fungsi `renderSpeakingAuditAccordions` sangat bergantung pada kecocokan teks heading eksak `### 📝 Teks Asli Bahasa Inggris`.
    - **Status**: **✅ TERSELESAIKAN** — Regex diperluas dan diperkuat untuk mencakup berbagai variasi heading (`#` hingga `####`), blok kutipan markdown (`>`), serta tanda petik.

---

### PRIORITAS RENDAH

14. **Inkonsistensi Penomoran Versi Aplikasi di Berbagai Komponen** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.1 HTML Head & CSS, Langkah 4 — 4.6 Summary of Critical Cross-Section Issues*
    - **Status**: **✅ TERSELESAIKAN** — Tag `<title>` dan seluruh metadata telah diselaraskan ke versi rilis terpadu **v6.4**.

15. **Duplikasi Selektor Modal pada Stylesheet Tema Light Mode** — [ℹ️ NON-BLOCKING]
    - **Section asal**: *Langkah 3 — 3.1 HTML Head & CSS*
    - **Status**: Tidak menghambat eksekusi runtime.

16. **Duplikasi Kode HTML Navigator Phase Pill di Seluruh Tab Fase** — [ℹ️ NON-BLOCKING]
    - **Section asal**: *Langkah 3 — 3.4 Roadmap Phase Tabs*
    - **Status**: Terjaga sinkron dengan fungsi navigasi fase.

17. **Teks Mentah Notasi Formula LaTeX di Konten HTML** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.4 Roadmap Phase Tabs*
    - **Masalah**: Penggunaan simbol `$\rightarrow$` secara langsung di dalam elemen `<p>` HTML tanpa mesin perender KaTeX.
    - **Status**: **✅ TERSELESAIKAN** — Seluruh string `$\rightarrow$` di kartu Stage 12, 13, dan 14 telah diganti menjadi entitas HTML visual `&rarr;`.

18. **Penonaktifan Tooltip Native pada Checkbox Stage oleh Properti CSS** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.4 Roadmap Phase Tabs*
    - **Masalah**: Elemen input checkbox memiliki atribut `title="..."` sekaligus diberi class `pointer-events-none`.
    - **Status**: **✅ TERSELESAIKAN** — Class `pointer-events-none` dihapus dari seluruh 14 checkbox stage sehingga tooltip petunjuk tampil sempurna saat hover.

19. **Inkonsistensi Gaya Scoping Variabel Teks Remediasi (`window.` vs `let`)** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.6 Gemini API Engine & Langkah 4 — 4.3 State Management Consistency*
    - **Masalah**: Inkonsistensi deklarasi variabel teks remediasi antara `window.` dan modul-level `let`.
    - **Status**: **✅ TERSELESAIKAN** — Variabel `currentDrillStudyPromptText` distandardisasi sebagai module-level variable dan disinkronkan ke seluruh fungsi pembaca/penyalin prompt.

20. **Format Template Contoh Penekanan Suku Kata Mengapitalisasi Seluruh Kata** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.8 Vocab Bank Engine*
    - **Masalah**: Baris template prompt penguji memformat contoh dengan `**${vocab.word.toUpperCase()}**`.
    - **Status**: **✅ TERSELESAIKAN** — Template diperjelas agar hanya mengapitalisasi suku kata bertekanan target (*syllable stress*).

21. **Potensi Race Condition pada Timeout Notifikasi Toast** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.11 Audio & UI Utilities & Langkah 4 — 4.6 Summary of Critical Cross-Section Issues*
    - **Masalah**: Pemanggilan `setTimeout` pada `showToast` tidak membersihkan timeout aktif sebelumnya.
    - **Status**: **✅ TERSELESAIKAN** — Ditambahkan variabel pelacak `toastTimeout` dan pemanggilan `clearTimeout(toastTimeout)` sebelum menyetel timer baru.

22. **Draf Input Tidak Dihapus Saat Fitur Reset Progres Total Dijalankan** — [✅ TERSELESAIKAN]
    - **Section asal**: *Langkah 3 — 3.11, Langkah 4 — 4.3 & 4.6 Summary of Critical Cross-Section Issues*
    - **Masalah**: `executeResetProgress()` mereset `playerState` tetapi membiarkan draft tersimpan di localStorage.
    - **Status**: **✅ TERSELESAIKAN** — `executeResetProgress()` sekarang menghapus `ielts_boss_essay_draft`, `ielts_ai_lab_draft`, dan mengosongkan elemen textarea di halaman.

---

## BAGIAN C: LOG PENYELESAIAN SISTEM (CHANGELOG PERBAIKAN LENGKAP)

Berikut adalah rincian eksekusi perbaikan yang telah diimplementasikan pada file `public/ielts-roadmap.html`:

| No | Modul / Fitur | Deskripsi Masalah | Solusi Implementasi | Status |
|:---|:---|:---|:---|:---:|
| 1 | **Quest Writing Evaluator** | False-negative gagal pada ulasan yang mengandung kata 'failed' | Regex parsing terstruktur `VERDICT: PASSED/FAILED` & threshold Band $\ge 6.5$ | ✅ Selesai |
| 2 | **Vocab Card Audio** | Perekaman audio memicu request Gemini tidak sengaja saat modal ditutup | Parameter `triggerAI = false` di `stopVocabPronTest` & guard `_triggerAI` di `onstop` | ✅ Selesai |
| 3 | **SpeechRecognition** | `InvalidStateError` saat tombol rekam ditekan berulang cepat | Penambahan `recognition.abort()` sebelum start baru & reset pada `onend` | ✅ Selesai |
| 4 | **Prompt Anti-Gibberish** | AI mengarang/memuji esai sampah/keyboard mash | Injeksi aturan Non-Negotiable Anti-Gibberish pada Quest, Mini-Boss & Boss Arena | ✅ Selesai |
| 5 | **Speaking Lab Mock** | Simbol IPA muncul di mock offline melanggar aturan pedagogis prompt | Penggantian 100% ke ejaan fonetik alfabet Indonesia (`RE-zi-dents`, `PAA-ks`) | ✅ Selesai |
| 6 | **Vocab Coach Prompt** | Contoh stres suku kata mengapitalisasi seluruh huruf kata | Penyempurnaan template prompt hanya mengapitalisasi suku kata bertekanan | ✅ Selesai |
| 7 | **Player State Life Cycle** | Properti `miniBossResults` & `speakingHistory` missing di initial state | Inisialisasi eksplisit di deklarasi, `loadSaveData()`, dan `executeResetProgress()` | ✅ Selesai |
| 8 | **Reset Progress Engine** | Draft teks esai tertinggal setelah reset akun | Penghapusan key localStorage draft dan pengosongan input textarea di DOM | ✅ Selesai |
| 9 | **Vocab Seed 5** | Data kata `substantiate` tidak memiliki field Feynman/SRS | Penambahan seluruh tracking field SM-2 dan level Feynman yang lengkap | ✅ Selesai |
| 10 | **UI Progress Calculation** | Denominator roadmap di-hardcode angka statis `14` | Kalkulasi dinamis berbasis total kunci `STAGE_DATA` di `updateUI` & `renderDashboard` | ✅ Selesai |
| 11 | **Drill Study Prompt Scope** | Scoping variabel teks prompt tidak seragam | Standardisasi deklarasi module-level `currentDrillStudyPromptText` | ✅ Selesai |
| 12 | **Web Audio SoundFX** | Efek suara tidak berbunyi jika AudioContext berstatus suspended | Penambahan pengecekan `ctx.state === 'suspended'` & `ctx.resume()` di `SoundFX.play` | ✅ Selesai |
| 13 | **Audio Icons Selector** | Toggle mute global merusak class ikon pada tombol TTS vocab | Isolasi selektor ketat hanya ke `#btn-audio-mute i` dan `#btn-audio-mute-mobile i` | ✅ Selesai |
| 14 | **Toast Notification** | Tabrakan timer saat toast dipicu beruntun | Implementasi debounce dengan `clearTimeout(toastTimeout)` | ✅ Selesai |
| 15 | **Retest Script Regex** | Ekstraktor skrip retest Speaking Lab rapuh terhadap format heading | Regex multi-heading (`#` - `####`), blockquotes (`>`), dan kutipan | ✅ Selesai |
| 16 | **HTML LaTeX Entities** | Notasi `$\rightarrow$` muncul sebagai teks mentah | Konversi menjadi entitas visual HTML standar `&rarr;` | ✅ Selesai |
| 17 | **Stage Checkboxes** | Tooltip petunjuk checkbox stage diblokir oleh CSS | Penghapusan class `pointer-events-none` dari seluruh 14 checkbox stage | ✅ Selesai |

---

## BAGIAN D: LAPORAN STANDARISASI AUDIO MURNI, AKSEN GLOBAL & EVALUASI KETAT AI (RELEASE v6.5)

Berdasarkan tinjauan arsitektur audio dan instruksi pedagogis IELTS tingkat lanjut, seluruh sistem audio dan evaluasi kecerdasan buatan telah disempurnakan secara menyeluruh:

### 1. Daftar Lengkap Seluruh Modul yang Menggunakan Audio & Status Penerapannya

| No | Modul Audio | Masukan Audio | Pemrosesan & Transkrip | Status Standarisasi & Prompt Guard |
|:---|:---|:---|:---|:---:|
| 1 | **IELTS Speaking Lab** (Part 1 Shadowing, Part 2 Cue Card, Part 3 Diskusi Analitis) | File Audio Blob Murni (`audio/webm`) | **100% Gemini Multimodal**. Web Speech API client-side dihapus total. AI mengembalikan Transkripsi Verbatim dari gelombang audio. | ✅ **DITERAPKAN** (Strict, Inaudible Guard, Transkrip Murni, Bedah Suku Kata Lidah Indo) |
| 2 | **Vocabulary Bank — Phonetic Coach** (Latihan Fonetik Kata Tunggal) | File Audio Blob Murni (`vocabAudioBlob`) | **100% Gemini Multimodal**. Menganalisis gelombang frekuensi dan artikulasi fonem kata target. | ✅ **DITERAPKAN** (Strict 0-100%, Inaudible Guard, Bedah Suku Kata Lidah Indo) |
| 3 | **Daily Vocal Affirmation Ritual** (Latihan Afirmasi Vokal Harian) | File Audio Blob Murni (`affirmationAudioBlob`) | **100% Gemini Multimodal**. Menganalisis kelantangan, ketuntasan akhiran (+s/+ed), dan proyeksi vokal. | ✅ **DITERAPKAN** (Strict, Inaudible Guard, Transkrip Murni, Target Aksen) |
| 4 | **Synthesis Lab — Dual Attempt Audio** (Step 4 Spontaneous Speak 1 & Step 6 Targeted Respeak 2) | File Audio Blob Murni (`speak1AudioBlob` & `speak2AudioBlob`) | **100% Gemini Multimodal**. Mengevaluasi perbedaan kualitas akustik dan perbaikan fonetik antara Percobaan 1 vs Percobaan 2. | ✅ **DITERAPKAN** (Strict, Inaudible Guard, Transkrip Verbatim, Audit Aksen Komparatif) |

---

### 2. Rincian Peningkatan Fitur & Prompt yang Diterapkan

1. **Penilaian Keras, Jujur & Tanpa Pemanis (*Strict, Ruthless & Unfiltered Scoring*)**:
   - Prompt penguji AI secara mutlak melarang *false praise* atau inflasi nilai sopan.
   - Jika pengucapan terbata-bata, grammar hancur, atau konsonan tertelan, AI wajib memberikan skor rendah/nol secara telanjang (misal: Band 3.0 - 4.5) agar kandidat mengetahui standar riil penguji resmi *IDP / British Council*.

2. **Deteksi Audio Rusak / Hening (*Critical Inaudible & Silence Guard*)**:
   - Jika mikrofon merekam keheningan (*silence*), derau statis, atau volume suara terlalu pelan sehingga kata tidak terdengar:
     * AI langsung menolak evaluasi dan memberikan skor Band 2.0 / 0%.
     * Menampilkan pesan: `"[Audio tidak jelas / hening / volume mikrofon terlalu rendah. Harap rekam ulang lebih dekat ke mikrofon.]"`
     * AI dilarang keras mengarang atau menghalusinasikan kata jika audio tidak terdengar.

3. **Penghapusan Total Web Speech API & Pengembalian Transkrip Verbatim**:
   - Dependensi `SpeechRecognition` client-side yang sering salah mendengar kata telah dihapus 100%.
   - Gemini API multimodal mengevaluasi langsung rekaman suara pengguna dan mengembalikan transkripsi kata demi kata (*Verbatim Transcript*) di bagian atas laporan.

4. **Format Baru: Bedah Cara Baca Lidah Indonesia Super Detail**:
   - Melarang simbol IPA (/ə/, /ɪ/, /ʊ/, dll.) yang membingungkan siswa Indonesia.
   - Membedah kata salah suku kata demi suku kata dengan contoh asosiasi bunyi kata Indonesia sehari-hari (misal: *'ar' seperti pada 'arsip', 'TI' ditekan tajam, 'kyu' seperti 'kios', 'leit' berima 'lelet'*).
   - Menulis suku kata yang bertekanan dengan **HURUF BESAR (CAPITAL STRESS)** dan tanda intonasi ↗ ↘.

5. **Standarisasi Aksen Global (*Global Target Accent Standard*)**:
   - Ditambahkan opsi standar aksen terpadu:
     * 🇬🇧 **British RP (Received Pronunciation)** [Default Standard IELTS: Non-rhotic, crisp T, vokal panjang murni]
     * 🇺🇸 **General American (US)** [Rhotic r, flap T, open vowels]
     * 🇦🇺 **Australian English** [General AU phonology]
     * 🌐 **Neutral International Academic**
   - Pilihan aksen tersimpan di `localStorage` (`ielts_target_accent`) dan secara otomatis menyelaraskan:
     * Pengucapan Text-to-Speech (TTS)
     * Kriteria audit akustik Gemini
     * Panduan fonetik lidah Indonesia

6. **Master Unified Settings Hub di Header**:
   - Tombol gear pengaturan di header desktop dan mobile membuka satu jendela terpusat yang mengatur:
     * Konfigurasi Gemini API Key & Model AI dengan pengujian koneksi langsung
     * Pilihan Standar Target Aksen Global
     * Toggle Mode Terang/Gelap & Efek Suara (SoundFX)
     * Manajemen Hapus API Key & Reset Save Data

---

### 3. Log Penyempurnaan Khusus Hasil Pengujian Langsung (v6.5.1 Patch)

Berdasarkan umpan balik pengujian audio riil di lapangan:

1. **Speaking Lab: Banner Penolakan Audio Hening & Penalti Tegas Gumaman/Noise**:
   - **Masalah**: Audio hening masih menampilkan tabel 4 rubrik nilai; audio dengan gumaman `[gumaman/tidak jelas]` dan derau noise masih mendapat nilai tinggi 5.5 karena AI membaca teks soal di layar.
   - **Solusi**:
     - Ditambahkan **Banner Penolakan Merah Tegas (*Rejection Alert Box*)** jika audio hening/rusak, melarang penerbitan skor kelulusan.
     - Diinjeksi aturan keras: Jika rekaman audio memuat gumaman/noise, AI dilarang keras berasumsi kandidat menguasai kosakata/grammar. Nilai dipangkas drastis maksimal **Band 3.0 - 3.5**.
2. **Vocab Bank: Target Aksen & Bedah Suku Kata Lidah Indonesia**:
   - **Masalah**: Kartu kosakata belum menampilkan indikator target aksen dan ejaan lidah Indonesia di atas kartu masih menggunakan format lama tanpa bedah asosiasi kata.
   - **Solusi**:
     - Ditambahkan **Badge Aksen Target** (`🇬🇧 British RP Target` / `🇺🇸 General American Target`) di atas kotak cara baca kartu.
     - Seluruh benih kata awal dan mesin analisis AI diperbarui menghasilkan bedah suku kata lengkap (contoh: `es-TAB-lisy ↘ (es: seperti 'es batu', TAB: ditekan kuat / stress, lisy: akhiri desis lembut /sh/)`).
     - Prompt audit penguji vokal (`submitVocabDeepEval`) secara ketat menyelaraskan evaluasi dengan aksen yang dipilih.
3. **Daily Affirmation: Perbaikan Parsing Dinamis Kelantangan Vokal**:
   - **Masalah**: Variabel `energyLevel` ter-hardcode ke default `"Sangat Lantang & Berenergi"`, sehingga suara pelan/datar tetap dilabeli "Sangat Lantang".
   - **Solusi**:
     - Dihapus nilai default statis. Diganti dengan regex parsing dinamis yang mengekstrak nilai riil dari hasil analisis Gemini (`Kelantangan Vokal` dan `Prediksi IELTS Speaking Delivery`).
     - Prompt diperketat: jika suara pelan, datar, atau kurang bersemangat, AI wajib melabelinya sebagai `Terlalu Pelan / Lemah / Datar (Kurang Bersemangat)` dan memangkas skor delivery.

---

## 🏷️ BAGIAN E: SISTEM REGISTER & KESESUAIAN KONTEKS IELTS (v7.1 UPDATE)

Berdasarkan kebutuhan taktis pembelajar agar tidak terjebak menggunakan kata santai di esai formal atau kata kaku di percakapan lisan:

1. **4 Kuadran Register & IELTS Usability Matrix**:
   - `🔴 Casual / Santai`: Slang, idiom santai sehari-hari (`hang out`, `kids`, `a bunch of`). Cocok untuk percakapan lisan / Speaking Part 1, **❌ HARAM di Writing Task 1 & 2**.
   - `🟡 Agak Formal / Netral`: Kosakata umum profesional (`significant`, `convenient`, `perspective`). Bebas digunakan di Writing & Speaking.
   - `🟢 Formal Akademik`: Kosakata C1/C2 esai (`mitigate`, `ubiquitous`, `exacerbate`). Wajib di Writing Task 2 dan sangat disukai di Speaking Part 3.
   - `🟣 Tulisan Resmi (Written High-Academic)`: Kosakata resmi tertulis (`substantiate`, `aforementioned`, `notwithstanding`). Sering dipakai di jurnal/esai, jarang diucapkan secara lisan.

2. **Visualisasi Antarmuka di Vocab Bank**:
   - **Badge Register & Usability**: Menampilkan label keformalan dan izin modul IELTS (`🌐 Writing & Speaking OK`, `🎙️ Speaking Only`, `📝 Writing Only`, `☕ Sehari-hari Saja`).
   - **🔥 High-Yield Context Magnet**: Otomatis muncul jika kata tersebut merupakan kosakata kunci topik tertentu (misal: *Writing Task 2 Lingkungan & Teknologi*).
   - **⚠️ Register Trap Warning Alert**: Peringatan keras jika kata tersebut memiliki jebakan register yang sering memotong nilai peserta Indonesia.
   - **Filter Samping Register**: Memfilter bank kata berdasarkan `Writing Ready`, `Speaking Only`, `Formal`, dan `Casual`.

---

## 🎙️ BAGIAN F: SYSTEM PROMPT V2 — AI VOCAB PRONUNCIATION COACH (v7.2 UPDATE)

1. **Prinsip Kejujuran Ilmiah & Anti-Presisi Palsu**:
   - Skor dibulatkan ke kelipatan 5 (55%, 70%, 85%) untuk menghindari ilusi pengukuran akustik laboratorium.
   - Menghapus klaim palsu "Prediksi Band IELTS dari 1 Kata Tunggal".
2. **Dynamic 3-Tier Output Length**:
   - `Skor 90-100%`: Pujian singkat + skor (tanpa daftar kesalahan yang dicari-cari).
   - `Skor 75-89%`: Section *"Yang Perlu Disempurnakan"* (1 catatan halus untuk naik level).
   - `Skor <75%`: Section *"Yang Perlu Diperbaiki"* (Maksimal 3 poin diurutkan berdasarkan Prioritas 1, 2, 3).
3. **Phonetic Anchoring dengan Padanan Kata Inggris Simpel**:
   - Memadankan bunyi vokal/konsonan yang sulit dengan kata dasar bahasa Inggris yang 100% familiar (contoh: *vokal /ɪ/ seperti di kata 'sit', bukan 'seat'*), dikombinasikan dengan ejaan kapitalisasi stress lidah Indonesia.

---

## 🎨 BAGIAN G: HIGH-END INTERACTIVE PRONUNCIATION COACH UI/UX (v7.3 UPDATE)

Transformasi total visualisasi hasil evaluasi pelafalan AI dari sekadar markdown datar menjadi kartu komponen interaktif:

1. **Hero Score Header & Color-Coded Progress Gauge**:
   - Menampilkan skor besar font mono + Progress Bar Meter + Tier Badge dinamis (`🏆 Mahir`, `✨ Sangat Baik`, `⚠️ Cukup Jelas`, `🚨 Sulit Dikenali`).
2. **Priority Action Alert Cards**:
   - Mengubah teks kesalahan menjadi kotak peringatan bertingkat (`🔴 Prioritas 1`, `🟡 Prioritas 2`, `🔵 Prioritas 3`) dengan penekanan akar penyebab dan solusi motorik.
3. **Interactive Anchor Words Audio Chips**:
   - Setiap kata pembanding familiar (`hi`, `fast`, `sit`) di-render sebagai chip tombol interaktif yang bisa diklik untuk mendengarkan audionya langsung.
4. **Hero Indonesian Transliteration Callout**:
   - Menampilkan ejaan lidah Indonesia dengan font besar dan kontras tinggi di kotak khusus bernuansa amber.
5. **Interactive 3x Repetition Drill Counter**:
   - 3 tombol interaktif `[ 1. word ○ ]`, `[ 2. word ○ ]`, `[ 3. word ○ ]` yang berubah menjadi centang hijau `✓` saat diklik oleh siswa, memberikan efek suara *levelup* dan bonus mikro XP (+5 XP).
6. **Quick Action Bar**:
   - Tombol instan *"Dengarkan Native"* dan *"🎙️ Rekam Uji Ulang (+15 XP)"* di bagian bawah kartu tanpa perlu scroll ke atas.


