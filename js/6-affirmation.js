/* ============================================================
   IELTS GO — Daily Affirmation Ritual · Deck Manager
   ============================================================ */

        function getAffirmationState() {
            try {
                const raw = localStorage.getItem('ielts_daily_affirmation_v1');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (!parsed.affirmationsDeck || parsed.affirmationsDeck.length === 0) {
                        parsed.affirmationsDeck = [...DEFAULT_AFFIRMATIONS];
                    }
                    return parsed;
                }
            } catch (e) {
                console.warn("Affirmation state parse error:", e);
            }
            return {
                lastCompletedDate: null,
                currentDate: null,
                todayAffirmationId: 'aff_1',
                todayResult: null,
                affirmationsDeck: [...DEFAULT_AFFIRMATIONS]
            };
        }

        function saveAffirmationState(state) {
            try {
                localStorage.setItem('ielts_daily_affirmation_v1', JSON.stringify(state));
            } catch (e) {
                console.warn("Save affirmation state error:", e);
            }
        }

        function getTodayAffirmation() {
            const state = getAffirmationState();
            const todayStr = new Date().toISOString().split('T')[0];
            const deck = state.affirmationsDeck || DEFAULT_AFFIRMATIONS;

            // If day changed or todayAffirmationId is missing/deleted, pick one
            let todayAff = deck.find(a => a.id === state.todayAffirmationId);
            if (!todayAff || state.currentDate !== todayStr) {
                // Pick next in rotation based on date hash or timesCompleted
                const sortedByLeast = [...deck].sort((a, b) => (a.timesCompleted || 0) - (b.timesCompleted || 0));
                todayAff = sortedByLeast[0] || deck[0];
                state.currentDate = todayStr;
                state.todayAffirmationId = todayAff.id;
                saveAffirmationState(state);
            }
            return todayAff;
        }

        function renderDailyAffirmationUI() {
            const bodyEl = document.getElementById('affirmation-card-body');
            const countEl = document.getElementById('affirmation-deck-count');
            if (!bodyEl) return;

            const state = getAffirmationState();
            const todayStr = new Date().toISOString().split('T')[0];
            const isCompletedToday = state.lastCompletedDate === todayStr;
            const currentAff = getTodayAffirmation();
            const deck = state.affirmationsDeck || [];

            if (countEl) countEl.innerText = deck.length;

            if (isCompletedToday && state.todayResult) {
                // Render Completed / Locked State
                const res = state.todayResult;
                bodyEl.innerHTML = `
                    <div class="space-y-3.5">
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5">
                            <div class="flex flex-wrap justify-between items-center gap-2">
                                <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                    <i class="fa-solid fa-circle-check text-emerald-500"></i> Ritual Afirmasi Hari Ini Selesai!
                                </span>
                                <span class="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30 font-bold">+30 XP Diperoleh</span>
                            </div>
                            <div class="text-sm sm:text-base font-serif italic text-slate-800 dark:text-slate-100 font-bold border-l-4 border-amber-500 pl-3 leading-relaxed">
                                "${res.en || currentAff.en}"
                            </div>
                            <div class="text-xs text-slate-600 dark:text-slate-400 font-sans pl-3">
                                💡 ${res.id_trans || currentAff.id_trans || ''}
                            </div>
                        </div>

                        <!-- AI Evaluation Summary -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                            <div class="bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span class="text-slate-500 dark:text-slate-400 text-[11px]">🔊 Level Energi Vokal:</span>
                                <span class="text-amber-700 dark:text-amber-300 font-bold">${res.energyLevel || 'Sangat Lantang'}</span>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-950/90 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span class="text-slate-500 dark:text-slate-400 text-[11px]">🎯 IELTS Speaking Delivery:</span>
                                <span class="text-sky-700 dark:text-cyan-300 font-bold">${res.deliveryBand || 'Band 8.0+'}</span>
                            </div>
                        </div>

                        ${res.feedback ? `
                        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-indigo-500/30 text-xs font-sans text-slate-700 dark:text-slate-200 leading-relaxed space-y-1">
                            <div class="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1">
                                <i class="fa-solid fa-sparkles"></i> Catatan Motivasi AI Coach:
                            </div>
                            <div>${renderMiniChatMarkdown(res.feedback)}</div>
                        </div>` : ''}

                        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                            <span>⏳ Tersedia kembali besok pukul 00:00.</span>
                            <span class="text-amber-600 dark:text-amber-400/90 font-bold"><i class="fa-solid fa-bolt mr-1"></i> Mindset Terkunci!</span>
                        </div>
                    </div>
                `;
            } else {
                // Render Active 2-Step Ritual
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <!-- Step Navigation Indicator -->
                        <div class="flex items-center space-x-2 text-xs font-mono">
                            <span id="badge-step-1" class="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-keyboard"></i> Step 1: Ketik Afirmasi
                            </span>
                            <i class="fa-solid fa-arrow-right text-slate-400 text-[10px]"></i>
                            <span id="badge-step-2" class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 font-bold flex items-center gap-1.5">
                                <i class="fa-solid fa-microphone-lines"></i> Step 2: Ucapkan Lantang
                            </span>
                        </div>

                        <!-- Target Affirmation Box -->
                        <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div class="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center justify-between">
                                <span><i class="fa-solid fa-quote-left mr-1.5"></i> Target Afirmasi Hari Ini:</span>
                                <button onclick="speakWord('${currentAff.en.replace(/'/g, "\\'")}', 'en-GB')" class="text-xs text-sky-600 dark:text-indigo-300 hover:underline flex items-center gap-1 font-bold" title="Dengarkan pelafalan">
                                    <i class="fa-solid fa-volume-high"></i> Dengarkan
                                </button>
                            </div>
                            <div class="text-base sm:text-lg font-serif italic text-slate-800 dark:text-slate-100 font-bold leading-snug border-l-4 border-amber-500 pl-3" id="target-affirmation-text">
                                "${currentAff.en}"
                            </div>
                            <div class="text-xs text-slate-600 dark:text-slate-400 font-sans pl-3">
                                💡 ${currentAff.id_trans || ''}
                            </div>
                        </div>

                        <!-- Step 1: Typing Input -->
                        <div class="space-y-1.5" id="affirmation-step1-container">
                            <div class="flex justify-between text-xs font-mono">
                                <label for="input-affirmation-type" class="text-slate-700 dark:text-slate-300 font-bold">Ketik ulang kalimat di atas:</label>
                                <span id="affirmation-type-status" class="text-slate-500 dark:text-slate-400 text-[11px]">0% Cocok</span>
                            </div>
                            <textarea id="input-affirmation-type" oninput="onAffirmationTypingInput(event)" rows="2" placeholder="Mulai ketik kalimat afirmasi di sini..." class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-sans focus:outline-none focus:border-amber-500 transition-all leading-relaxed resize-none"></textarea>
                        </div>

                        <!-- Step 2: Voice Audio Recorder Section (Hidden until typed) -->
                        <div id="affirmation-step2-container" class="opacity-40 pointer-events-none transition-all duration-300 space-y-3 pt-2 border-t border-slate-800/80">
                            <div class="flex flex-wrap justify-between items-center gap-2">
                                <div class="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                                    <i class="fa-solid fa-microphone"></i> Ucapkan dengan Lantang & Berenergi:
                                </div>
                                <span id="aff-rec-status" class="text-[10px] font-mono text-slate-400">Menunggu Step 1 Selesai</span>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">
                                <button onclick="startAffirmationVoiceRec()" id="btn-aff-rec-start" disabled class="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <i class="fa-solid fa-microphone"></i>
                                    <span>Mulai Rekam Suara Lantang</span>
                                </button>
                                <button onclick="stopAffirmationVoiceRec()" id="btn-aff-rec-stop" class="hidden px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md animate-pulse flex items-center gap-2">
                                    <i class="fa-solid fa-stop"></i>
                                    <span>Stop & Analisis Gemini AI</span>
                                </button>
                                <span id="aff-rec-timer" class="text-xs font-mono text-slate-400 font-bold"></span>
                                <audio id="aff-audio-preview" controls class="hidden h-8 max-w-[200px]"></audio>
                            </div>

                            <!-- Realtime AI Evaluation Output Box -->
                            <div id="aff-voice-eval-result" class="hidden p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 text-xs font-sans text-slate-200 leading-relaxed shadow-inner space-y-2"></div>
                        </div>
                    </div>
                `;
            }
        }

        function onAffirmationTypingInput(e) {
            const typed = (e.target.value || '').trim();
            const currentAff = getTodayAffirmation();
            const target = currentAff.en.trim();

            const statusEl = document.getElementById('affirmation-type-status');
            const step2Cont = document.getElementById('affirmation-step2-container');
            const btnRecStart = document.getElementById('btn-aff-rec-start');
            const recStatus = document.getElementById('aff-rec-status');
            const badge1 = document.getElementById('badge-step-1');
            const badge2 = document.getElementById('badge-step-2');

            // Normalize strings for matching (lowercase, ignore extra punctuation/spaces)
            const cleanTyped = typed.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');

            let matchRatio = 0;
            if (cleanTarget.length > 0) {
                let matchChars = 0;
                const minLen = Math.min(cleanTyped.length, cleanTarget.length);
                for (let i = 0; i < minLen; i++) {
                    if (cleanTyped[i] === cleanTarget[i]) matchChars++;
                }
                matchRatio = Math.round((matchChars / cleanTarget.length) * 100);
            }

            if (cleanTyped === cleanTarget || matchRatio >= 95) {
                if (statusEl) statusEl.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> 100% Cocok! Lanjut Step 2</span>';
                if (step2Cont) {
                    step2Cont.classList.remove('opacity-40', 'pointer-events-none');
                }
                if (btnRecStart) {
                    btnRecStart.disabled = false;
                }
                if (recStatus) recStatus.innerText = 'Siap merekam suara lantang';
                if (badge1) badge1.className = 'px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5';
                if (badge2) badge2.className = 'px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5 animate-pulse';
            } else {
                if (statusEl) statusEl.innerText = `${matchRatio}% Cocok`;
                if (step2Cont) {
                    step2Cont.classList.add('opacity-40', 'pointer-events-none');
                }
                if (btnRecStart) {
                    btnRecStart.disabled = true;
                }
                if (recStatus) recStatus.innerText = 'Menunggu Step 1 Selesai';
                if (badge1) badge1.className = 'px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1.5';
                if (badge2) badge2.className = 'px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 font-bold flex items-center gap-1.5';
            }
        }

        async function startAffirmationVoiceRec() {
            SoundFX.play('click');
            affirmationAudioChunks = [];
            affirmationAudioBlob = null;
            affirmationRecDuration = 0;

            const btnStart = document.getElementById('btn-aff-rec-start');
            const btnStop = document.getElementById('btn-aff-rec-stop');
            const recStatus = document.getElementById('aff-rec-status');
            const recTimer = document.getElementById('aff-rec-timer');
            const audioPreview = document.getElementById('aff-audio-preview');
            const evalResult = document.getElementById('aff-voice-eval-result');

            if (btnStart) btnStart.classList.add('hidden');
            if (btnStop) btnStop.classList.remove('hidden');
            if (recStatus) recStatus.innerHTML = '<span class="text-rose-400 font-bold animate-pulse"><i class="fa-solid fa-circle-dot mr-1"></i> Merekam... Ucapkan dengan LANTANG & TEGAS!</span>';
            if (audioPreview) audioPreview.classList.add('hidden');
            if (evalResult) {
                evalResult.classList.add('hidden');
                evalResult.innerHTML = '';
            }

            if (recTimer) recTimer.innerText = '00:00';
            if (affirmationRecTimerInterval) clearInterval(affirmationRecTimerInterval);
            affirmationRecTimerInterval = setInterval(() => {
                affirmationRecDuration++;
                const mins = String(Math.floor(affirmationRecDuration / 60)).padStart(2, '0');
                const secs = String(affirmationRecDuration % 60).padStart(2, '0');
                if (recTimer) recTimer.innerText = `${mins}:${secs}`;
            }, 1000);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                affirmationMediaRecorder = new MediaRecorder(stream);
                affirmationMediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) affirmationAudioChunks.push(e.data);
                };
                affirmationMediaRecorder.onstop = () => {
                    affirmationAudioBlob = new Blob(affirmationAudioChunks, { type: 'audio/webm' });
                    stream.getTracks().forEach(t => t.stop());

                    if (audioPreview) {
                        audioPreview.src = URL.createObjectURL(affirmationAudioBlob);
                        audioPreview.classList.remove('hidden');
                    }

                    submitAffirmationVoiceEval();
                };
                affirmationMediaRecorder.start();
            } catch (err) {
                console.warn("Affirmation Mic Access Error:", err);
                showToast("Akses mikrofon tidak diizinkan atau tidak tersedia.", "error");
                stopAffirmationVoiceRec();
            }
        }

        function stopAffirmationVoiceRec() {
            const btnStart = document.getElementById('btn-aff-rec-start');
            const btnStop = document.getElementById('btn-aff-rec-stop');
            const recStatus = document.getElementById('aff-rec-status');

            if (affirmationRecTimerInterval) {
                clearInterval(affirmationRecTimerInterval);
                affirmationRecTimerInterval = null;
            }

            if (btnStart) btnStart.classList.remove('hidden');
            if (btnStop) btnStop.classList.add('hidden');
            if (recStatus) recStatus.innerText = 'Selesai merekam';

            if (affirmationMediaRecorder && affirmationMediaRecorder.state === 'recording') {
                affirmationMediaRecorder.stop();
            }
        }

        async function submitAffirmationVoiceEval() {
            const currentAff = getTodayAffirmation();
            if (!currentAff || !affirmationAudioBlob) return;

            const resultBox = document.getElementById('aff-voice-eval-result');
            const recStatus = document.getElementById('aff-rec-status');

            if (recStatus) recStatus.innerHTML = '<span class="text-indigo-400 font-bold"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Gemini AI sedang menilai kelantangan suara & energi vokal...</span>';
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="py-4 text-center text-amber-300 font-mono text-xs space-y-2">
                        <i class="fa-solid fa-bolt text-2xl animate-bounce text-amber-400"></i>
                        <div class="font-bold text-slate-100">AI sedang mengevaluasi proyeksi vokal, artikulasi, dan energi kalimat Anda...</div>
                        <div class="text-[11px] text-slate-400">Memeriksa apakah afirmasi diucapkan dengan lantang, tegas, dan percaya diri...</div>
                    </div>
                `;
            }

            const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const systemPrompt = `Anda adalah Penguji Vokal & Fonetik IELTS Senior yang SANGAT KETAT, TEGAS, DAN JUJUR TANPA KOMPROMI (Strict, Ruthless & Unfiltered Phonetic Examiner).
Pengguna sedang melakukan ritual harian melafalkan kalimat afirmasi bahasa Inggris:
Target Kalimat: "${currentAff.en}"
Target Aksen: ${targetAccent}

🚨 ATURAN KRITIS ANTI-HALUSINASI & KUALITAS AUDIO (CRITICAL INAUDIBLE GUARD):
- Jika audio terdeteksi HENING (silence), tidak ada suara manusia, atau volume mikrofon sangat kecil sehingga kata tidak terdengar:
  * LANGSUNG BERIKAN SKOR ARTIKULASI: 0% dan Prediksi Band 2.0!
  * Tuliskan transkripsi: "[Audio tidak jelas / hening / volume mikrofon terlalu rendah. Harap rekam ulang.]"
  * JANGAN PERNAH MENGARANG TRANSKRIPSI!

🚨 ATURAN KELANTANGAN & ENERGI VOKAL (VOCAL PROJECTION & ENERGY RADAR):
- JIKA PENGGUNA BICARA PELAN, BERBISIK, DATAR, ATAU KURANG BERSEMANGAT:
  * Tuliskan pada bagian Kelantangan Vokal: [Terlalu Pelan / Lemah / Datar (Kurang Bersemangat)]
  * DILARANG KERAS MENYEBUT 'Sangat Lantang & Penuh Energi' jika suaranya biasa saja, tidak ada proyeksi diafragma, atau tidak bersemangat!
- JIKA PENGGUNA BICARA NORMAL / SEDANG:
  * Tuliskan pada bagian Kelantangan Vokal: [Sedang (Perlu Lebih Yakin & Bersemangat)]
- HANYA JIKA PENGGUNA BICARA DENGAN SUARA SANGAT LANTANG, TEGAS, BERTENAGA, DAN PENUH KEYAKINAN:
  * Tuliskan pada bagian Kelantangan Vokal: [Sangat Lantang & Penuh Energi]

🚨 ATURAN UTAMA PENILAIAN TEGAS (NO SUGARCOATING / NO POLITE INFLATION):
1. AUDIT FONETIK KATA PER KATA & AKHIRAN MORFOLOGIS RIGID (+S / +ED):
   - Periksa setiap kata dalam kalimat. Jika pengguna memotong akhiran kata (misal: 'completed' diucapkan 'kuhm-plee-td', 'elevates' diucapkan tanpa akhiran /s/, 'opportunities' tanpa akhiran /z/), salah vokal, salah konsonan, atau salah penekanan suku kata (syllable stress), WAJIB DITULIS DAN DIKRITIK SEBAGAI KESALAHAN!
2. AUDIT KEGUGUPAN & KELANCARAN (FLUENCY & NERVOUSNESS RADAR):
   - Deteksi apakah ada getaran suara karena ragu, nada loyo/berbisik, terbata-bata (stuttering), mengulang awal kata, atau jeda canggung di tengah kalimat.
3. SKOR ASLI TANPA PEMANIS:
   - JIKA BURUK, NILAI BURUK! Jika ada kata yang salah lafal atau pengucapan terdengar ragu/gugup, BERIKAN SKOR RENDAH (20% - 50% / Band 3.5 - 5.0). Dilarang memberi pujian palsu.

WAJIB FORMAT OUTPUT DALAM BAHASA INDONESIA YANG TAJAM, BLAK-BLAKAN, DAN EDUKATIF SEBAGAI BERIKUT:

### 🎙️ Transkripsi Audio Murni (Didengar Langsung oleh AI)
"[Tuliskan persis apa yang Anda dengar dari audio kandidat]"

### 🛑 1. Audit Kata Per Kata & Kesalahan Pelafalan (Word-by-Word Breakdown)
(Periksa setiap kata dalam kalimat target. Tuliskan kata mana yang diucapkan SALAH atau KURANG TEPAT, dengan panduan ejaan alfabet Indonesia A-Z):
- ❌ **"[Kata yang Salah]"** -> Terdengar: [Deskripsi bunyi salah] -> Cara Baca Lidah Indo: [Panduan ejaan alfabet Indonesia tanpa IPA]
- ✅ **"[Kata yang Sempurna]"** -> Artikulasi dan vokal jelas.

### 🛑 2. Audit Khusus Akhiran +S/-ES & +ED
- **Status Akhiran Morfologis**: [Audit apakah akhiran -s/-es dan -ed diucapkan tuntas]

### ⏱️ 3. Audit Kegugupan, Kelancaran & Proyeksi Suara
- **Tingkat Kelancaran & Kegugupan**: [Tegas & Yakin / Ada Keraguan / Terbata-bata / Terlalu Gugup]
- **Kelantangan Vokal**: [Sangat Lantang & Penuh Energi / Sedang (Perlu Lebih Yakin) / Terlalu Pelan / Lemah / Datar]
- **Catatan Aliran Suara**: [Komentar jujur tentang jeda, nada, atau intonasi]

### 🎯 4. Skor Asli Tanpa Basa-Basi (Unfiltered Score)
- **Skor Artikulasi Fonetik**: [Skor 0 - 100%] (Wajib realistis, berikan 20-50% jika ada kata salah atau terbata-bata!)
- **Prediksi IELTS Speaking Delivery**: [Band X.X, contoh: Band 4.5 (Hesitant, broken syllable stress)]

### 👄 5. Panduan Perbaikan Posisi Mulut & Solusi Latihan
[Instruksi langkah konkret perbaikan bentuk bibir, lidah, dan cara melatih kalimat ini]`;

            try {
                const userQuery = `Halo Coach, saya baru saja mengucapkan afirmasi harian: "${currentAff.en}". Tolong dengarkan audio rekaman saya dan berikan evaluasi kelantangan, skor artikulasi, estimasi IELTS delivery band, dan pesan motivasi dalam Bahasa Indonesia.`;
                const response = await callGeminiAPI(userQuery, systemPrompt, affirmationAudioBlob);

                // Parse energy level & delivery band dynamically from AI response
                let energyLevel = "Sedang (Perlu Lebih Yakin)";
                let deliveryBand = "Band 4.5";
                if (response) {
                    // Extract Kelantangan Vokal
                    const energyMatch = response.match(/(?:Kelantangan Vokal|Proyeksi Vokal)[\s\:\*]+([^\n\r]+)/i);
                    if (energyMatch && energyMatch[1]) {
                        energyLevel = energyMatch[1].replace(/[\*\[\]]/g, '').trim();
                    } else {
                        if (/terlalu pelan|berbisik|lemah|loyo|kurang berenergi/i.test(response)) {
                            energyLevel = "Terlalu Pelan / Kurang Berenergi";
                        } else if (/sedang|cukup|datar/i.test(response)) {
                            energyLevel = "Sedang (Kurang Bersemangat)";
                        } else if (/sangat lantang|penuh energi|tegas|percaya diri/i.test(response)) {
                            energyLevel = "Sangat Lantang & Berenergi";
                        }
                    }

                    // Extract Delivery Band
                    const bandMatch = response.match(/(?:Prediksi IELTS Speaking Delivery|Estimated Delivery Band|Speaking Delivery)[\s\:\*]+Band\s*([0-9\.\+]+)/i) || response.match(/Band\s*([0-9\.\+]+)/i);
                    if (bandMatch && bandMatch[1]) {
                        deliveryBand = `Band ${bandMatch[1]}`;
                    }
                }

                // Update State
                const state = getAffirmationState();
                const todayStr = new Date().toISOString().split('T')[0];
                state.lastCompletedDate = todayStr;
                state.todayResult = {
                    en: currentAff.en,
                    id_trans: currentAff.id_trans,
                    energyLevel: energyLevel,
                    deliveryBand: deliveryBand,
                    feedback: response
                };

                // Increment timesCompleted in deck
                const deckItem = (state.affirmationsDeck || []).find(a => a.id === currentAff.id);
                if (deckItem) {
                    deckItem.timesCompleted = (deckItem.timesCompleted || 0) + 1;
                }

                saveAffirmationState(state);

                // Reward XP & Streak
                addXP(30);
                calculateStreak();
                SoundFX.play('levelup');
                triggerConfetti();

                // Re-render UI after small timeout
                setTimeout(() => {
                    renderDailyAffirmationUI();
                    showToast("Luar biasa! Ritual afirmasi harian Anda berhasil diklaim (+30 XP)!", "success");
                }, 1500);

            } catch (err) {
                if (resultBox) {
                    resultBox.innerHTML = `<div class="text-red-400 text-xs font-mono p-3 bg-red-950/40 rounded-xl border border-red-500/30">Gagal evaluasi AI: ${err.message}. Pastikan Gemini API Key aktif.</div>`;
                }
                if (recStatus) recStatus.innerText = 'Selesai merekam';
            }
        }

        // =========================================================================
        // AFFIRMATIONS DECK MANAGER (MODAL & STATS)
        // =========================================================================
        function openAffirmationsManager() {
            SoundFX.play('click');
            document.getElementById('modal-affirmations-manager').classList.remove('hidden');
            toggleAffirmationAddForm(false);
            renderAffirmationsManagerList();
        }

        function closeAffirmationsManager() {
            document.getElementById('modal-affirmations-manager').classList.add('hidden');
            renderDailyAffirmationUI();
        }

        function renderAffirmationsManagerList() {
            const listEl = document.getElementById('affirmations-deck-list');
            const totalEl = document.getElementById('modal-deck-total');
            if (!listEl) return;

            const state = getAffirmationState();
            const deck = state.affirmationsDeck || [];
            if (totalEl) totalEl.innerText = deck.length;

            if (deck.length === 0) {
                listEl.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs font-mono">Belum ada afirmasi di deck.</div>`;
                return;
            }

            listEl.innerHTML = deck.map((aff, idx) => `
                <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div class="space-y-1 flex-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">#${idx + 1}</span>
                            <span class="text-xs font-mono text-emerald-400 font-bold">
                                <i class="fa-solid fa-chart-simple mr-1"></i> Diucapkan & Diketik: ${aff.timesCompleted || 0}x
                            </span>
                        </div>
                        <div class="text-xs font-serif italic text-white font-bold">"${aff.en}"</div>
                        <div class="text-[11px] text-slate-400 font-sans">${aff.id_trans || '-'}</div>
                    </div>
                    <div class="flex items-center space-x-2 self-end sm:self-auto">
                        <button onclick="speakWord('${aff.en.replace(/'/g, "\\'")}', 'en-GB')" class="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white rounded-lg border border-slate-800 transition-all text-xs" title="Dengarkan Suara">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                        ${deck.length > 1 ? `
                        <button onclick="deleteAffirmation('${aff.id}')" class="p-2 bg-slate-900 hover:bg-red-950/80 text-red-400 hover:text-red-300 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-all text-xs" title="Hapus dari Deck">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>` : ''}
                    </div>
                </div>
            `).join('');
        }

        function toggleAffirmationAddForm(show) {
            const form = document.getElementById('affirmation-add-form');
            if (!form) return;
            if (show === undefined) {
                form.classList.toggle('hidden');
            } else if (show) {
                form.classList.remove('hidden');
            } else {
                form.classList.add('hidden');
            }
        }

        function saveNewCustomAffirmation() {
            const enInput = document.getElementById('input-new-affirmation-en');
            const idInput = document.getElementById('input-new-affirmation-id');
            const enVal = (enInput ? enInput.value : '').trim();
            const idVal = (idInput ? idInput.value : '').trim();

            if (!enVal) {
                showToast("Silakan masukkan kalimat afirmasi bahasa Inggris.", "error");
                return;
            }

            const state = getAffirmationState();
            const newId = 'aff_' + Date.now();
            state.affirmationsDeck.push({
                id: newId,
                en: enVal,
                id_trans: idVal || 'Afirmasi kustom pribadi',
                timesCompleted: 0,
                dateCreated: Date.now()
            });

            saveAffirmationState(state);
            SoundFX.play('correct');
            showToast("Afirmasi baru berhasil ditambahkan ke Deck!", "success");

            if (enInput) enInput.value = '';
            if (idInput) idInput.value = '';
            toggleAffirmationAddForm(false);
            renderAffirmationsManagerList();
            renderDailyAffirmationUI();
        }

        function deleteAffirmation(affId) {
            const state = getAffirmationState();
            if (state.affirmationsDeck.length <= 1) {
                showToast("Minimal harus ada 1 afirmasi di dalam deck.", "error");
                return;
            }

            state.affirmationsDeck = state.affirmationsDeck.filter(a => a.id !== affId);
            saveAffirmationState(state);
            SoundFX.play('click');
            showToast("Afirmasi dihapus dari deck.", "info");
            renderAffirmationsManagerList();
            renderDailyAffirmationUI();
        }

        async function generateNewAffirmationWithAI() {
            const btn = document.getElementById('btn-generate-ai-affirmation');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> <span>Menciptakan Afirmasi IELTS...</span>`;
            }

            const prompt = `Generate 1 powerful, inspiring, high-level IELTS & English mindset affirmation sentence for a student aiming for Band 8.0+.
Return ONLY a valid JSON object in this exact format:
{
  "en": "English affirmation sentence (10-18 words, uplifting, academic tone)",
  "id_trans": "Indonesian translation of the sentence"
}`;

            try {
                const response = await callGeminiAPI("Generate one elite IELTS affirmation.", prompt);
                const data = extractJsonFromLLM(response);

                if (data && data.en) {
                    const state = getAffirmationState();
                    const newId = 'aff_' + Date.now();
                    state.affirmationsDeck.push({
                        id: newId,
                        en: data.en,
                        id_trans: data.id_trans || '',
                        timesCompleted: 0,
                        dateCreated: Date.now()
                    });
                    saveAffirmationState(state);
                    SoundFX.play('levelup');
                    showToast("Afirmasi baru dari AI berhasil ditambahkan ke deck!", "success");
                    renderAffirmationsManagerList();
                    renderDailyAffirmationUI();
                } else {
                    showToast("Gagal mengurai respons AI. Coba lagi.", "error");
                }
            } catch (err) {
                showToast("Gagal menghasilkan afirmasi: " + err.message, "error");
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Afirmasi Baru (Gemini AI)</span>`;
                }
            }
        }

        // =========================================================================
        // IeltsGo v7.3 — SYNTHESIS LAB ENGINE (4-Skill Integrated English & IELTS)
        // =========================================================================

        const synthesisState = {
            currentStep: 1,
            mode: 'ielts', // 'ielts' | 'general'
            inputMode: 'ocr', // 'ocr' | 'type'
            respeakMode: 'script', // 'script' | 'anchors'
            readingTitle: '',
            readingNotes: '',
            capturedVocabs: [],
            rawWritingText: '',
            writingEvaluation: null,
            speak1MediaRecorder: null,
            speak1AudioChunks: [],
            speak1AudioBlob: null,
            speak1TimerInterval: null,
            speak1Seconds: 0,
            speak1Transcript: '',
            speak1Evaluation: null,
            upgradedSpeakingScript: '',
            speak2MediaRecorder: null,
            speak2AudioChunks: [],
            speak2AudioBlob: null,
            speak2TimerInterval: null,
            speak2Seconds: 0,
            speak2Transcript: '',
            speak2Evaluation: null,
            finalReportCard: null,
            activeLogbookFilter: 'all'
        };
