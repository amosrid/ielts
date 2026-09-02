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

        let activeAffirmationMode = 'voice'; // 'voice' | 'type_voice'
        let affirmationAudioChunks = [];
        let affirmationAudioBlob = null;
        let affirmationMediaRecorder = null;
        let affirmationRecTimerInterval = null;
        let affirmationRecDuration = 0;

        function setAffirmationMode(mode) {
            activeAffirmationMode = mode;
            SoundFX.play('click');
            renderDailyAffirmationUI();
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
                // Render Compact Smart Completed State
                const res = state.todayResult;
                const parsed = res.parsedResult || null;
                const flawedWords = (parsed && parsed.flawedWords) ? parsed.flawedWords : [];
                
                // Build visual sentence heatmap
                let sentenceHeatmapHtml = currentAff.en;
                if (flawedWords.length > 0) {
                    sentenceHeatmapHtml = currentAff.en.split(/(\s+)/).map(token => {
                        const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
                        const isFlawed = flawedWords.some(fw => fw.word && fw.word.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanToken);
                        if (isFlawed) {
                            return `<span class="bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/40 inline-block shadow-sm">${token}</span>`;
                        }
                        return `<span class="text-slate-100 font-bold">${token}</span>`;
                    }).join('');
                } else {
                    sentenceHeatmapHtml = `<span class="text-emerald-300 font-bold">${currentAff.en}</span>`;
                }

                bodyEl.innerHTML = `
                    <div class="space-y-3.5">
                        <!-- Compact Completion Header -->
                        <div class="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div class="space-y-1">
                                <div class="flex items-center space-x-2">
                                    <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/40">
                                        <i class="fa-solid fa-check"></i>
                                    </span>
                                    <span class="text-xs font-mono font-bold text-emerald-400">Ritual Afirmasi Hari Ini Selesai</span>
                                    <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">+30 XP</span>
                                </div>
                                <div class="text-sm font-serif italic text-slate-100 font-bold border-l-2 border-amber-500 pl-2.5">
                                    "${currentAff.en}"
                                </div>
                            </div>
                            <div class="flex items-center gap-2 self-end sm:self-auto">
                                <button onclick="speakWord('${currentAff.en.replace(/'/g, "\\'")}', 'en-GB')" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-mono font-bold rounded-xl border border-slate-800 transition-all flex items-center gap-1.5" title="Dengarkan Suara">
                                    <i class="fa-solid fa-volume-high"></i>
                                    <span>Dengar</span>
                                </button>
                                <button onclick="toggleCompletedAffirmationDetail()" id="btn-toggle-aff-detail" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-mono font-bold rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5">
                                    <i class="fa-solid fa-chart-pie"></i>
                                    <span id="btn-toggle-aff-detail-text">Lihat Hasil Audit ▼</span>
                                </button>
                            </div>
                        </div>

                        <!-- Collapsible Detailed Audit Box -->
                        <div id="aff-completed-detail-box" class="hidden space-y-3.5 p-4 rounded-2xl bg-slate-950 border border-slate-800 widget-fadein">
                            <!-- Quick Score Badges -->
                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                                <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span class="text-slate-400 text-[11px]">Proyeksi Vokal:</span>
                                    <span class="text-amber-400 font-bold">${res.energyLevel || 'Lantang & Berenergi'}</span>
                                </div>
                                <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span class="text-slate-400 text-[11px]">IELTS Delivery:</span>
                                    <span class="text-cyan-400 font-bold">${res.deliveryBand || 'Band 7.0'}</span>
                                </div>
                                <div class="col-span-2 sm:col-span-1 bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span class="text-slate-400 text-[11px]">Akurasi Pelafalan:</span>
                                    <span class="text-emerald-400 font-bold">${(parsed && parsed.accuracyScore !== undefined) ? parsed.accuracyScore + '%' : '90%'}</span>
                                </div>
                            </div>

                            <!-- Visual Sentence Heatmap -->
                            <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                <div class="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                                    <i class="fa-solid fa-wave-square"></i> Visual Sentence Heatmap:
                                </div>
                                <p class="text-sm font-sans leading-relaxed tracking-wide">
                                    ${sentenceHeatmapHtml}
                                </p>
                            </div>

                            <!-- Precision Fix Cards for Flawed Words -->
                            ${flawedWords.length > 0 ? `
                                <div class="space-y-2">
                                    <div class="text-[10px] font-mono font-bold text-rose-400 uppercase flex items-center gap-1.5">
                                        <i class="fa-solid fa-triangle-exclamation"></i> Kata yang Perlu Perbaikan Fonetik:
                                    </div>
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        ${flawedWords.map(fw => `
                                            <div class="p-3 rounded-xl bg-slate-900 border border-rose-500/30 space-y-1.5">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-xs font-mono font-bold text-rose-400">❌ "${fw.word}"</span>
                                                    <span class="text-[10px] font-mono bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 font-bold">Lidah: [${fw.phonetic || fw.word}]</span>
                                                </div>
                                                <p class="text-xs text-slate-300 font-sans leading-relaxed">${fw.issue || 'Perhatikan artikulasi konsonan dan intonasi.'}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : `
                                <div class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs font-mono text-emerald-300">
                                    <i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
                                    <span>Luar biasa! Seluruh kata diucapkan dengan artikulasi tajam & bersih tanpa kesalahan pelafalan.</span>
                                </div>
                            `}

                            <!-- AI Coach Insight -->
                            ${(parsed && parsed.coachInsight) ? `
                                <div class="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
                                    <div class="text-[10px] font-mono font-bold text-indigo-400 uppercase flex items-center gap-1">
                                        <i class="fa-solid fa-wand-magic-sparkles"></i> Catatan Motivasi AI Coach:
                                    </div>
                                    <p class="text-xs text-slate-200 font-sans leading-relaxed">${parsed.coachInsight}</p>
                                </div>
                            ` : ''}

                            <!-- Collapsible Transcription -->
                            ${(parsed && parsed.transcription) ? `
                                <div class="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                    <span class="text-slate-500">Transkripsi Audio:</span> "${parsed.transcription}"
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                // Active State with Dual Mode Switcher
                bodyEl.innerHTML = `
                    <div class="space-y-4">
                        <!-- Mode Selector Tabs -->
                        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div class="flex items-center space-x-2 font-mono text-xs">
                                <button onclick="setAffirmationMode('voice')" class="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${activeAffirmationMode === 'voice' ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}">
                                    <i class="fa-solid fa-microphone"></i>
                                    <span>Mode 1: Suara Kilat (Langsung Bicara)</span>
                                </button>
                                <button onclick="setAffirmationMode('type_voice')" class="px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${activeAffirmationMode === 'type_voice' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'}">
                                    <i class="fa-solid fa-keyboard"></i>
                                    <span>Mode 2: Mode Fokus (Ketik + Rekam)</span>
                                </button>
                            </div>
                            <span class="text-[10px] font-mono text-amber-400 font-bold">
                                ${activeAffirmationMode === 'voice' ? '+30 XP' : '+50 XP Bonus'}
                            </span>
                        </div>

                        <!-- Target Affirmation Box -->
                        <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 shadow-inner">
                            <div class="text-[10px] font-mono font-bold text-amber-400 uppercase flex items-center justify-between">
                                <span><i class="fa-solid fa-quote-left mr-1.5"></i> Target Afirmasi Hari Ini:</span>
                                <button onclick="speakWord('${currentAff.en.replace(/'/g, "\\'")}', 'en-GB')" class="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-bold" title="Dengarkan pelafalan">
                                    <i class="fa-solid fa-volume-high"></i> Dengarkan Native
                                </button>
                            </div>
                            <div class="text-base sm:text-lg font-serif italic text-white font-bold leading-snug border-l-4 border-amber-500 pl-3.5" id="target-affirmation-text">
                                "${currentAff.en}"
                            </div>
                            <div class="text-xs text-slate-400 font-sans pl-3.5">
                                💡 ${currentAff.id_trans || ''}
                            </div>
                        </div>

                        ${activeAffirmationMode === 'type_voice' ? `
                            <!-- Step 1 Typing Container -->
                            <div class="space-y-1.5" id="affirmation-step1-container">
                                <div class="flex justify-between text-xs font-mono">
                                    <label for="input-affirmation-type" class="text-slate-300 font-bold">1. Ketik ulang kalimat di atas untuk mengasah muscle memory:</label>
                                    <span id="affirmation-type-status" class="text-slate-400 text-[11px]">0% Cocok</span>
                                </div>
                                <textarea id="input-affirmation-type" oninput="onAffirmationTypingInput(event)" rows="2" placeholder="Mulai ketik kalimat afirmasi di sini..." class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-sans focus:outline-none focus:border-indigo-500 transition-all leading-relaxed resize-none shadow-inner"></textarea>
                            </div>
                        ` : ''}

                        <!-- Audio Voice Recording Toolbar -->
                        <div id="affirmation-recording-toolbar" class="space-y-3 pt-1 ${activeAffirmationMode === 'type_voice' ? 'opacity-40 pointer-events-none transition-all duration-300' : ''}">
                            <div class="flex flex-wrap justify-between items-center gap-2">
                                <div class="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                                    <i class="fa-solid fa-microphone-lines"></i> ${activeAffirmationMode === 'type_voice' ? '2. Ucapkan dengan Lantang & Berenergi:' : 'Ucapkan dengan Lantang & Berenergi:'}
                                </div>
                                <span id="aff-rec-status" class="text-[10px] font-mono text-slate-400">
                                    ${activeAffirmationMode === 'type_voice' ? 'Selesaikan ketik terlebih dahulu' : 'Tekan tombol untuk mulai merekam'}
                                </span>
                            </div>

                            <div class="flex flex-wrap items-center gap-3">
                                <button onclick="startAffirmationVoiceRec()" id="btn-aff-rec-start" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2">
                                    <i class="fa-solid fa-microphone"></i>
                                    <span>Mulai Rekam Suara Lantang</span>
                                </button>
                                <button onclick="stopAffirmationVoiceRec()" id="btn-aff-rec-stop" class="hidden px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md animate-pulse flex items-center gap-2">
                                    <i class="fa-solid fa-stop"></i>
                                    <span>Stop & Evaluasi AI Examiner</span>
                                </button>
                                <span id="aff-rec-timer" class="text-xs font-mono text-amber-400 font-bold"></span>
                                <audio id="aff-audio-preview" controls class="hidden h-8 max-w-[200px]"></audio>
                            </div>

                            <!-- Realtime AI Evaluation Output Box -->
                            <div id="aff-voice-eval-result" class="hidden p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-sans text-slate-200 leading-relaxed shadow-lg space-y-3"></div>
                        </div>
                    </div>
                `;
            }
        }

        function toggleCompletedAffirmationDetail() {
            const box = document.getElementById('aff-completed-detail-box');
            const btnText = document.getElementById('btn-toggle-aff-detail-text');
            if (!box) return;
            if (box.classList.contains('hidden')) {
                box.classList.remove('hidden');
                if (btnText) btnText.innerText = 'Tutup Hasil Audit ▲';
            } else {
                box.classList.add('hidden');
                if (btnText) btnText.innerText = 'Lihat Hasil Audit ▼';
            }
        }

        function onAffirmationTypingInput(e) {
            const typed = (e.target.value || '').trim();
            const currentAff = getTodayAffirmation();
            const target = currentAff.en.trim();

            const statusEl = document.getElementById('affirmation-type-status');
            const recToolbar = document.getElementById('affirmation-recording-toolbar');
            const recStatus = document.getElementById('aff-rec-status');

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
                if (statusEl) statusEl.innerHTML = '<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check mr-1"></i> 100% Cocok! Mikrofon Aktif</span>';
                if (recToolbar) {
                    recToolbar.classList.remove('opacity-40', 'pointer-events-none');
                }
                if (recStatus) recStatus.innerText = 'Siap merekam suara lantang';
            } else {
                if (statusEl) statusEl.innerText = `${matchRatio}% Cocok`;
                if (recToolbar) {
                    recToolbar.classList.add('opacity-40', 'pointer-events-none');
                }
                if (recStatus) recStatus.innerText = 'Selesaikan ketik terlebih dahulu';
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
            if (recStatus) recStatus.innerHTML = '<span class="text-rose-400 font-bold animate-pulse"><i class="fa-solid fa-circle-dot mr-1"></i> Merekam... Ucapkan dengan LANTANG, TEGAS & BERTENAGA!</span>';
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

            if (recStatus) recStatus.innerHTML = '<span class="text-indigo-400 font-bold"><i class="fa-solid fa-spinner animate-spin mr-1"></i> Gemini AI Examiner sedang menganalisis audio & fonetik...</span>';
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="py-5 text-center text-amber-300 font-mono text-xs space-y-2.5">
                        <i class="fa-solid fa-bolt text-2xl animate-bounce text-amber-400"></i>
                        <div class="font-bold text-slate-100 text-sm">AI sedang mengevaluasi proyeksi vokal, artikulasi, dan energi kalimat Anda...</div>
                        <div class="text-[11px] text-slate-400">Memeriksa akhiran kata (-s/-ed), kejernihan vokal, dan intonasi diafragma...</div>
                    </div>
                `;
            }

            const targetAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const systemPrompt = `Anda adalah Penguji Vokal & Fonetik IELTS Senior (Strict & Constructive Phonetic Examiner).
Kandidat sedang melafalkan kalimat afirmasi harian:
Target Kalimat: "${currentAff.en}"
Target Aksen: ${targetAccent}

🚨 ATURAN EVALUASI:
1. Periksa kualitas audio. Jika hening atau tidak terdengar, accuracyScore = 0, deliveryBand = 'Band 2.0', transcription = '[Audio hening / tidak jelas]'.
2. Nilai kelantangan vokal: 'Sangat Lantang & Berenergi' | 'Sedang (Perlu Lebih Yakin)' | 'Terlalu Pelan / Lemah / Datar'.
3. Lakukan audit fonetik pada SETIAP kata. Masukkan HANYA kata yang SALAH/KURANG TEPAT ke dalam array 'flawedWords'. JANGAN masukkan kata yang sudah benar ke flawedWords!
4. Berikan 'coachInsight' dalam 1-2 kalimat bahasa Indonesia yang tajam, memotivasi, dan berenergi tinggi.

WAJIB KELUARKAN HANYA OBJEK JSON VALID TANPA TEKS LAIN:
{
  "transcription": "Teks persis apa yang Anda dengar",
  "deliveryBand": "Band 7.0",
  "energyLevel": "Sangat Lantang & Berenergi",
  "accuracyScore": 85,
  "flawedWords": [
    {
      "word": "kata_yang_salah",
      "issue": "Penjelasan singkat kesalahan (misal: akhiran /s/ tergesa-gesa)",
      "phonetic": "Panduan ejaan lidah Indonesia A-Z (misal: mis-TEIKS)"
    }
  ],
  "coachInsight": "1-2 kalimat insight motivasi dan tips vokal"
}`;

            try {
                const userQuery = `Halo Examiner, ini rekaman audio afirmasi saya: "${currentAff.en}". Tolong nilai artikulasi, akhiran kata, dan kelantangan vokal saya.`;
                const response = await callGeminiAPI(userQuery, systemPrompt, affirmationAudioBlob);

                let parsed = extractJsonFromLLM(response);
                if (!parsed || !parsed.deliveryBand) {
                    // Fallback parser if JSON fails
                    let energyLevel = "Sedang (Perlu Lebih Yakin)";
                    let deliveryBand = "Band 6.0";
                    if (/sangat lantang|penuh energi|tegas|percaya diri/i.test(response)) {
                        energyLevel = "Sangat Lantang & Berenergi";
                    } else if (/terlalu pelan|berbisik|lemah|loyo/i.test(response)) {
                        energyLevel = "Terlalu Pelan / Kurang Berenergi";
                    }

                    const bandMatch = response.match(/Band\s*([0-9\.\+]+)/i);
                    if (bandMatch && bandMatch[1]) deliveryBand = `Band ${bandMatch[1]}`;

                    parsed = {
                        transcription: currentAff.en,
                        deliveryBand: deliveryBand,
                        energyLevel: energyLevel,
                        accuracyScore: 80,
                        flawedWords: [],
                        coachInsight: "Terus latih proyeksi vokal dan ketegasan artikulasi konsonan akhir setiap hari!"
                    };
                }

                // Update State
                const state = getAffirmationState();
                const todayStr = new Date().toISOString().split('T')[0];
                state.lastCompletedDate = todayStr;
                state.todayResult = {
                    en: currentAff.en,
                    id_trans: currentAff.id_trans,
                    energyLevel: parsed.energyLevel || "Lantang & Berenergi",
                    deliveryBand: parsed.deliveryBand || "Band 7.0",
                    feedback: response,
                    parsedResult: parsed
                };

                // Increment timesCompleted in deck
                const deckItem = (state.affirmationsDeck || []).find(a => a.id === currentAff.id);
                if (deckItem) {
                    deckItem.timesCompleted = (deckItem.timesCompleted || 0) + 1;
                }

                saveAffirmationState(state);

                // Reward XP (50 if type_voice, 30 if direct voice)
                const xpGain = activeAffirmationMode === 'type_voice' ? 50 : 30;
                addXP(xpGain);
                calculateStreak();
                SoundFX.play('levelup');
                triggerConfetti();

                // Re-render UI after small timeout
                setTimeout(() => {
                    renderDailyAffirmationUI();
                    showToast(`Luar biasa! Ritual afirmasi harian Anda berhasil diselesaikan (+${xpGain} XP)!`, "success");
                }, 1200);

            } catch (err) {
                if (resultBox) {
                    resultBox.innerHTML = `<div class="text-red-400 text-xs font-mono p-3.5 bg-red-950/40 rounded-xl border border-red-500/30">Gagal evaluasi AI: ${err.message}. Pastikan Gemini API Key aktif di Pengaturan.</div>`;
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
            readingSourceType: 'direct', // 'direct' | 'file' | 'url'
            readingFullText: '',
            readingTopic: 'General Academic',
            readingTitle: '',
            readingNotes: '',
            extractedVocabs: [],
            capturedVocabs: [],
            rawWritingText: '',
            writingEvaluation: null,
            factualAudit: null,
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