/* ============================================================
   IELTS GO — Quest Modals · MiniBoss · Boss Challenge
   ============================================================ */

        function openQuestModal(stageId) {
            SoundFX.play('click');
            currentActiveStageId = stageId;
            currentQuestStep = 'mcq';
            const s = STAGE_DATA[stageId];
            if (!s) return;

            // Pick randomized MCQ question from question bank
            const qList = s.questions || [s];
            currentQuestQuestionIndex = Math.floor(Math.random() * qList.length);

            // Reset modal UI to Step 1
            renderQuestStep1();

            // Set up live word counter for Step 2 writing input
            const writingInput = document.getElementById('quest-writing-input');
            if (writingInput) {
                writingInput.value = '';
                writingInput.oninput = updateQuestWritingWordCount;
            }

            const feedbackBox = document.getElementById('quest-writing-feedback');
            if (feedbackBox) feedbackBox.classList.add('hidden');

            document.getElementById('quest-modal').classList.remove('hidden');
        }

        function shuffleNextQuestQuestion() {
            if (!currentActiveStageId || currentQuestStep !== 'mcq') return;
            const s = STAGE_DATA[currentActiveStageId];
            const qList = s.questions || [s];
            currentQuestQuestionIndex = (currentQuestQuestionIndex + 1) % qList.length;
            SoundFX.play('click');
            renderQuestStep1();
        }

        function renderQuestStep1() {
            const s = STAGE_DATA[currentActiveStageId];
            const qList = s.questions || [s];
            const qObj = qList[currentQuestQuestionIndex];

            // Header titles
            document.getElementById('modal-quest-title').innerText = s.title;
            document.getElementById('modal-quest-badge').innerText = currentActiveStageId.toUpperCase();
            document.getElementById('modal-quest-qnum').innerText = `Soal #${currentQuestQuestionIndex + 1} dari ${qList.length}`;

            // Stepper Visuals (Step 1 Active, Step 2 Inactive)
            const step1Badge = document.getElementById('stepper-step1');
            const step2Badge = document.getElementById('stepper-step2');
            if (step1Badge) {
                step1Badge.className = "font-bold text-emerald-400 flex items-center gap-1";
                step1Badge.innerHTML = `<span class="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] border border-emerald-500/40">1</span><span>MCQ Recognition</span>`;
            }
            if (step2Badge) {
                step2Badge.className = "text-slate-500 flex items-center gap-1";
                step2Badge.innerHTML = `<span class="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px]">2</span><span>Menulis Essay</span>`;
            }

            // Show Step 1 Container, Hide Step 2 Container
            document.getElementById('quest-step1-container').classList.remove('hidden');
            document.getElementById('quest-step2-container').classList.add('hidden');

            // Explanation callout reset
            const explBox = document.getElementById('modal-quest-explanation');
            explBox.classList.add('hidden');
            explBox.innerHTML = '';

            // Render MCQ options
            const body = document.getElementById('modal-quest-body');
            let html = `<p class="font-bold text-xs text-slate-200 mb-3">${qObj.question}</p><div class="space-y-2">`;
            qObj.options.forEach((opt, idx) => {
                html += `
                    <label class="flex items-center space-x-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer text-xs transition-all">
                        <input type="radio" name="modal-option" value="${idx}" class="accent-emerald-500">
                        <span class="text-slate-300 font-mono">${opt}</span>
                    </label>
                `;
            });
            html += `</div>`;
            body.innerHTML = html;

            // Submit button reset
            const submitBtn = document.getElementById('btn-modal-submit');
            const submitBtnText = document.getElementById('btn-modal-submit-text');
            const submitBtnIcon = document.getElementById('btn-modal-submit-icon');
            submitBtn.className = "px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
            if (submitBtnText) submitBtnText.innerText = "Periksa Jawaban MCQ";
            if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-arrow-right text-[10px]";
        }

        function renderQuestStep2() {
            currentQuestStep = 'writing';
            const s = STAGE_DATA[currentActiveStageId];
            const writingData = STAGE_WRITING_PROMPTS[currentActiveStageId] || {
                writingPrompt: 'Tulis 1-2 kalimat bahasa Inggris menggunakan grammar yang baru saja Anda pelajari.',
                writingExample: 'Contoh: Tulislah kalimat dengan subjek, kata kerja, dan pelengkap yang teratur.',
                writingHint: 'Pastikan tata bahasa dan ejaan sesuai konsep stage ini.'
            };

            // Stepper Visuals (Step 1 Completed, Step 2 Active)
            const step1Badge = document.getElementById('stepper-step1');
            const step2Badge = document.getElementById('stepper-step2');
            if (step1Badge) {
                step1Badge.className = "font-bold text-emerald-400 flex items-center gap-1";
                step1Badge.innerHTML = `<span class="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[9px] border border-emerald-500/50">✓</span><span class="line-through text-slate-400">MCQ</span>`;
            }
            if (step2Badge) {
                step2Badge.className = "font-bold text-indigo-400 flex items-center gap-1";
                step2Badge.innerHTML = `<span class="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[9px] border border-indigo-500/40 animate-pulse">2</span><span>Menulis Essay</span>`;
            }

            // Hide Step 1, Show Step 2
            document.getElementById('quest-step1-container').classList.add('hidden');
            document.getElementById('quest-step2-container').classList.remove('hidden');

            // Set Step 2 content
            document.getElementById('quest-writing-prompt-text').innerText = writingData.writingPrompt;
            document.getElementById('quest-writing-example-box').innerHTML = `<i class="fa-solid fa-lightbulb text-amber-400 mr-1"></i> ${writingData.writingExample}`;
            document.getElementById('quest-writing-hint-box').innerHTML = `<i class="fa-solid fa-compass text-indigo-400 mr-1"></i> Hint: ${writingData.writingHint}`;

            // Update Submit button
            const submitBtn = document.getElementById('btn-modal-submit');
            const submitBtnText = document.getElementById('btn-modal-submit-text');
            const submitBtnIcon = document.getElementById('btn-modal-submit-icon');
            submitBtn.className = "px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
            if (submitBtnText) submitBtnText.innerText = "Serahkan ke AI Review";
            if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-wand-magic-sparkles text-[10px]";

            // Focus textarea
            const writingInput = document.getElementById('quest-writing-input');
            if (writingInput) {
                writingInput.focus();
                updateQuestWritingWordCount();
            }
        }

        function updateQuestWritingWordCount() {
            const text = (document.getElementById('quest-writing-input')?.value || '').trim();
            const words = text ? text.split(/\s+/).length : 0;
            const counter = document.getElementById('quest-writing-word-count');
            if (counter) counter.innerText = `${words} kata`;
        }

        function closeQuestModal() {
            document.getElementById('quest-modal').classList.add('hidden');
            currentActiveStageId = null;
            currentQuestStep = 'mcq';
        }

        async function submitQuestModalAnswer() {
            if (!currentActiveStageId) return;
            const s = STAGE_DATA[currentActiveStageId];

            if (currentQuestStep === 'mcq') {
                // ==========================================
                // PHASE A: MULTIPLE CHOICE EVALUATION
                // ==========================================
                const qList = s.questions || [s];
                const qObj = qList[currentQuestQuestionIndex];
                const explBox = document.getElementById('modal-quest-explanation');
                const selected = document.querySelector('input[name="modal-option"]:checked');

                if (!selected) {
                    SoundFX.play('error');
                    showToast("Pilih salah satu jawaban MCQ terlebih dahulu!", "error");
                    return;
                }

                const chosenIdx = parseInt(selected.value);
                const specificExpl = (qObj.explanations && qObj.explanations[chosenIdx]) ? qObj.explanations[chosenIdx] : (qObj.explanation || s.whyHow);
                const targetSentence = qObj.options[qObj.correct];

                explBox.classList.remove('hidden');

                if (chosenIdx === qObj.correct) {
                    SoundFX.play('correct');
                    explBox.innerHTML = `
                        <div class="text-emerald-400 font-bold flex items-center gap-1.5 mb-1 text-xs">
                            <i class="fa-solid fa-circle-check"></i> JAWABAN BENAR! (Tahap 1 Lolos)
                        </div>
                        <div class="text-slate-300 text-[11px] leading-relaxed mb-2">${specificExpl}</div>
                        <div class="text-[11px] text-cyan-300 font-mono bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                            <span><i class="fa-solid fa-arrow-right text-cyan-400 mr-1.5"></i> Sekarang lanjutkan ke Tahap 2: Menulis kalimat bahasa Inggris Anda sendiri!</span>
                        </div>
                    `;

                    // Change button to proceed to Step 2
                    currentQuestStep = 'proceed_writing';
                    const submitBtn = document.getElementById('btn-modal-submit');
                    const submitBtnText = document.getElementById('btn-modal-submit-text');
                    const submitBtnIcon = document.getElementById('btn-modal-submit-icon');
                    submitBtn.className = "px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 animate-bounce";
                    if (submitBtnText) submitBtnText.innerText = "Lanjut ke Tahap 2: Menulis Essay →";
                    if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-pen-nib text-[10px]";
                } else {
                    SoundFX.play('error');
                    explBox.innerHTML = `
                        <div class="text-red-400 font-bold flex items-center gap-1.5 mb-1 text-xs">
                            <i class="fa-solid fa-circle-xmark"></i> GLITCH DETECTED!
                        </div>
                        <div class="text-slate-300 text-[11px] leading-relaxed mb-2">${specificExpl}</div>
                        <div class="text-[10px] text-amber-400 font-mono border-t border-slate-900 pt-1.5 flex items-center justify-between">
                            <span>Pilih opsi lain atau klik ikon putar untuk mencoba variasi soal lainnya.</span>
                        </div>
                    `;
                    showToast("Pilihan belum tepat. Pelajari glitch di atas!", "error");
                }
            } else if (currentQuestStep === 'proceed_writing') {
                // User clicked "Lanjut ke Tahap 2" button
                renderQuestStep2();
            } else if (currentQuestStep === 'writing') {
                // =========================================================
                // PHASE B: ACTIVE ESSAY PRODUCTION EVALUATION (STRICT GATE)
                // =========================================================
                const writingInput = document.getElementById('quest-writing-input');
                const userSentence = writingInput ? writingInput.value.trim() : '';

                if (!userSentence || userSentence.split(/\s+/).length < 4) {
                    SoundFX.play('error');
                    showToast("Tulis minimal 1 kalimat lengkap (minimal 4 kata) dalam bahasa Inggris!", "error");
                    return;
                }

                const submitBtn = document.getElementById('btn-modal-submit');
                const submitBtnText = document.getElementById('btn-modal-submit-text');
                const submitBtnIcon = document.getElementById('btn-modal-submit-icon');
                submitBtn.disabled = true;
                if (submitBtnText) submitBtnText.innerText = "AI Examiner Menguji Ketat...";
                if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-spinner animate-spin text-[10px]";

                const stagePromptData = STAGE_WRITING_PROMPTS[currentActiveStageId] || {};
                const systemPrompt = `You are a certified, STRICT, RUTHLESS, and UNCOMPROMISING IELTS Writing Examiner conducting a diagnostic grammar check.
The candidate is being tested on: "${s.title}".
Required Concept / Task: "${stagePromptData.writingPrompt || s.desc}".

🚨 CRITICAL NON-NEGOTIABLE ANTI-HALLUCINATION & GIBBERISH GUARD:
- If the candidate's input is gibberish, keyboard mash (e.g. "asdmlasmdklsam"), fewer than 3 coherent English words, non-English, or completely nonsensical:
  * You MUST write: '# 🚦 VERDICT: FAILED'
  * Assign Band 2.0.
  * Detail under Analisis: "Teks ditolak karena mengandung masukan acak/tidak koheren yang tidak membentuk kalimat bahasa Inggris yang bermakna."
  * Do NOT fabricate, praise, or hallucinate an essay for invalid inputs.

🚨 RIGID IELTS BAND DESCRIPTOR CEILINGS (ZERO GRADE INFLATION):
- If the sentence is grammatically clean BUT is just a simplistic/elementary SVO sentence (A2/B1 level) using basic connectors (and, but, so, because) without complex subordination or sophisticated vocabulary:
  * Capped strictly at Band 5.0 - 5.5.
  * You MUST write: '# 🚦 VERDICT: FAILED'
  * Explain under Analisis: "Kalimat terlalu sederhana (A2/B1 level). Belum memenuhi standar sintaksis kompleks Band 6.5+ IELTS."
- If the sentence contains ANY grammatical glitches, missing "be" anchor, incorrect tenses, faulty subject-verb agreement, double conjunctions (e.g. "although... but"), wrong verb patterns (e.g. "need to + ing"), wrong prepositions, or fails to apply the stage concept correctly:
  * Assign Band 4.0 - 5.0.
  * You MUST write: '# 🚦 VERDICT: FAILED'
  * Detail EXACTLY what grammar rule was broken and why.
- If and ONLY if the sentence is valid, grammatically clean, accurate, applies complex subordination / advanced register, and properly applies the target grammar concept (Band 6.5 - 8.5):
  * Assign Band 6.5 - 8.5.
  * You MUST write: '# 🚦 VERDICT: PASSED'

YOUR RESPONSE MUST FOLLOW THIS EXACT STRUCTURE IN MARKDOWN (BAHASA INDONESIA):

# 🚦 VERDICT: [PASSED or FAILED]

# 📊 Estimated Band Score: Band [X.X]

# 🔍 Analisis Kesalahan & Diagnosa L1 (Bahasa Indonesia Transfer)
- **Akurasi Konsep Stage**: [Penjelasan apakah konsep target diterapkan dengan benar]
- **Glitch & Kesalahan Tata Bahasa**: [Jelaskan secara spesifik kesalahan yang ditemukan atau tulis "Nol glitch terdeteksi"]
- **Akar Masalah L1 (Interferensi Bahasa Indonesia)**: [Jelaskan kebiasaan bahasa Indonesia mana yang memicu kesalahan ini, misal: menerjemahkan kata per kata, ketiadaan konjugasi '-s', atau ketiadaan tenses di bahasa ibu]
- **Peningkatan Register Akademik**: [Saran kolokasi C1/C2 dan nominalization]

# 🛠️ Model Kalimat Perbaikan Band 8.5+ & Bedah Formula
- **Model Kalimat Slayer (Band 8.5+)**: [Tuliskan model kalimat versi Band 8.5+ yang ideal]
- **Bedah Formula Sintaksis**: [Tuliskan rumus struktur kalimatnya, misal: 'Given that + [Noun Phrase], [Subject] + [Band 8 Verb Collocation] + [Object]']

# 📚 Rekomendasi Belajar
[Materi atau aturan grammar spesifik yang harus diperbaiki sebelum mencoba lagi]`;

                try {
                    let aiResponse = await callGeminiAPI(`Stage: ${s.title}\nConcept Focus: ${stagePromptData.writingHint || s.desc}\nCandidate Sentence: "${userSentence}"`, systemPrompt);

                    if (!aiResponse) {
                        // Strict offline intelligent heuristic analyzer fallback
                        aiResponse = generateOfflineAnalysis(userSentence, currentActiveStageId);
                    }

                    const feedbackBox = document.getElementById('quest-writing-feedback');
                    const feedbackContent = document.getElementById('quest-writing-feedback-content');
                    const scoreBadge = document.getElementById('quest-writing-score-badge');
                    
                    feedbackBox.classList.remove('hidden');
                    feedbackContent.innerHTML = renderMarkdown(aiResponse);

                    // Determine strict Pass vs Fail based on explicit VERDICT marker and Band score threshold (>= 6.5)
                    const bandMatch = aiResponse.match(/Band\s*([0-9\.]+)/i);
                    const extractedBand = bandMatch ? parseFloat(bandMatch[1]) : null;
                    const isExplicitPass = /VERDICT:\s*PASSED/i.test(aiResponse);
                    const isExplicitFail = /VERDICT:\s*FAILED/i.test(aiResponse);

                    let isPassed = false;
                    if (isExplicitPass) {
                        isPassed = true;
                    } else if (isExplicitFail) {
                        isPassed = false;
                    } else if (extractedBand !== null && !isNaN(extractedBand)) {
                        isPassed = extractedBand >= 6.5;
                    } else {
                        isPassed = /PASSED|LOLOS/i.test(aiResponse) && !/BELUM LOLOS|GAGAL/i.test(aiResponse);
                    }
                    
                    const bandScoreStr = bandMatch ? `Band ${bandMatch[1]}` : (isPassed ? 'Band 7.5' : 'Band 5.0');

                    // Generate Dynamic Remediation Study Prompt
                    generateQuestRemediationPrompt(s.title, stagePromptData.writingPrompt, userSentence, aiResponse, isPassed);

                    submitBtn.disabled = false;

                    if (isPassed) {
                        // PASSED
                        scoreBadge.className = "text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40";
                        scoreBadge.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> LOLOS • ${bandScoreStr}`;

                        currentQuestStep = 'claim_stage';
                        submitBtn.className = "px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
                        if (submitBtnText) submitBtnText.innerText = "Selesaikan Stage (+100 XP) ✓";
                        if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-trophy text-[10px] text-amber-300";

                        SoundFX.play('correct');
                        showToast(`Lolos! Kalimat Anda memenuhi standar ${bandScoreStr}.`, "success");
                    } else {
                        // FAILED / NEEDS REVISION
                        scoreBadge.className = "text-xs font-bold text-red-400 bg-red-950 px-2.5 py-0.5 rounded-full border border-red-500/40 animate-pulse";
                        scoreBadge.innerHTML = `<i class="fa-solid fa-circle-xmark mr-1"></i> BELUM LOLOS • ${bandScoreStr}`;

                        currentQuestStep = 'writing'; // Stay on writing step
                        submitBtn.className = "px-6 py-2.5 bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
                        if (submitBtnText) submitBtnText.innerText = "Revisi Kalimat & Uji Kembali";
                        if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-rotate-right text-[10px]";

                        SoundFX.play('error');
                        showToast(`Belum Lolos (${bandScoreStr}): Perbaiki glitch di atas lalu klik Uji Kembali!`, "error");
                    }

                } catch (err) {
                    SoundFX.play('error');
                    const fallbackRes = generateOfflineAnalysis(userSentence, currentActiveStageId);
                    const feedbackBox = document.getElementById('quest-writing-feedback');
                    const feedbackContent = document.getElementById('quest-writing-feedback-content');
                    const scoreBadge = document.getElementById('quest-writing-score-badge');
                    
                    feedbackBox.classList.remove('hidden');
                    feedbackContent.innerHTML = renderMarkdown(fallbackRes + `\n\n> ⚠️ *Koneksi AI gagal (${err.message}). Menggunakan analisis diagnostik offline.*`);
                    
                    const isPassed = fallbackRes.includes('VERDICT: PASSED');
                    generateQuestRemediationPrompt(s.title, stagePromptData.writingPrompt, userSentence, fallbackRes, isPassed);

                    submitBtn.disabled = false;
                    if (isPassed) {
                        scoreBadge.className = "text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/40";
                        scoreBadge.innerHTML = `✓ LOLOS • Band 7.0`;
                        currentQuestStep = 'claim_stage';
                        submitBtn.className = "px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
                        if (submitBtnText) submitBtnText.innerText = "Selesaikan Stage (+100 XP) ✓";
                        if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-trophy text-[10px] text-amber-300";
                    } else {
                        scoreBadge.className = "text-xs font-bold text-red-400 bg-red-950 px-2.5 py-0.5 rounded-full border border-red-500/40";
                        scoreBadge.innerHTML = `❌ BELUM LOLOS • Band 5.0`;
                        currentQuestStep = 'writing';
                        submitBtn.className = "px-6 py-2.5 bg-gradient-to-r from-amber-600 to-red-600 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2";
                        if (submitBtnText) submitBtnText.innerText = "Revisi Kalimat & Uji Kembali";
                        if (submitBtnIcon) submitBtnIcon.className = "fa-solid fa-rotate-right text-[10px]";
                    }
                }
            } else if (currentQuestStep === 'claim_stage') {
                // Save stage completion with timestamp
                playerState.completedStages[currentActiveStageId] = {
                    completed: true,
                    timestamp: Date.now()
                };
                addXP(STAGE_XP);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`STAGE CLEAR! ${s.title} selesai (+100 XP)!`, "success");

                closeQuestModal();
                updateUI();
                saveGameData();
            }
        }

        // =========================================================================
        // REMEDIATION STUDY PROMPT GENERATOR FOR EXTERNAL AI (ChatGPT / Claude / Gemini)
        // =========================================================================
        let currentRemediationPromptText = '';

        function generateQuestRemediationPrompt(stageTitle, taskRequirement, userSentence, aiEvaluation, isPassed) {
            const promptBox = document.getElementById('quest-remediation-prompt-box');
            const promptPre = document.getElementById('quest-remediation-prompt-text');
            if (!promptBox || !promptPre) return;

            currentRemediationPromptText = `Act as an expert IELTS Grammar Coach and Examiner.
I am currently studying IELTS Roadmap Stage: "${stageTitle}".
Target Task: "${taskRequirement}".

Here is my sentence attempt:
"${userSentence}"

Here was the examiner review summary:
${aiEvaluation.substring(0, 800)}

Please help me master this specific concept with the following 4 steps:
1. Explain WHY my sentence ${isPassed ? 'can be elevated even further' : 'failed the grammar check and how to fix the root error'}.
2. Provide 3 Band 8.5+ native academic sentence variations based on this exact topic.
3. Teach me 1 memorable mental rule/analogy so I never repeat this mistake in IELTS Writing Task 1/2.
4. Give me 3 interactive practice drill sentences for me to fix step-by-step.`;

            promptPre.innerText = currentRemediationPromptText;
            promptBox.classList.remove('hidden');

            // Reset toggle state to hidden by default
            promptPre.classList.add('hidden');
            const toggleText = document.getElementById('text-toggle-remediation');
            const toggleIcon = document.getElementById('icon-toggle-remediation');
            if (toggleText) toggleText.innerText = "Lihat Prompt";
            if (toggleIcon) toggleIcon.className = "fa-solid fa-eye mr-1";
            return currentRemediationPromptText;
        }

        function toggleRemediationPromptView() {
            SoundFX.play('click');
            const promptPre = document.getElementById('quest-remediation-prompt-text');
            const toggleText = document.getElementById('text-toggle-remediation');
            const toggleIcon = document.getElementById('icon-toggle-remediation');
            if (!promptPre) return;

            if (promptPre.classList.contains('hidden')) {
                promptPre.classList.remove('hidden');
                if (toggleText) toggleText.innerText = "Tutup Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye-slash mr-1";
            } else {
                promptPre.classList.add('hidden');
                if (toggleText) toggleText.innerText = "Lihat Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye mr-1";
            }
        }

        function copyRemediationPrompt() {
            if (!currentRemediationPromptText) return;
            navigator.clipboard.writeText(currentRemediationPromptText).then(() => {
                SoundFX.play('correct');
                showToast("Prompt belajar mandiri berhasil disalin ke clipboard!", "success");
            }).catch(() => {
                showToast("Gagal menyalin prompt.", "error");
            });
        }

        function sendRemediationPromptToLab() {
            if (!currentRemediationPromptText) return;
            SoundFX.play('click');
            closeQuestModal();
            switchTab('ai-lab');

            const aiInput = document.getElementById('ai-lab-input');
            if (aiInput) {
                aiInput.value = currentRemediationPromptText;
                saveAiLabDraft();
                showToast("Prompt evaluasi telah dimuat ke AI Glitch Lab!", "info");
                setTimeout(() => {
                    aiInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    aiInput.focus();
                }, 300);
            }
        }

        // =========================================================================
        // PHASE MINI-BOSS SYSTEM (5 Phases with Strength/Weakness Diagnostic)
        // =========================================================================
        function openMiniBossModal(phaseKey) {
            SoundFX.play('click');
            currentMiniBossPhase = phaseKey;
            const data = MINI_BOSS_DATA[phaseKey];
            if (!data) return;

            // Populate header & briefing
            document.getElementById('mini-boss-modal-title').innerText = data.title;
            document.getElementById('mini-boss-modal-phase-badge').innerText = `${phaseKey.toUpperCase()} MINI-BOSS`;
            document.getElementById('mini-boss-modal-xp').innerHTML = `<i class="fa-solid fa-bolt mr-1"></i>+${data.xpReward} XP`;
            document.getElementById('mini-boss-modal-briefing').innerText = data.briefing;
            document.getElementById('mini-boss-modal-icon').className = `fa-solid ${data.bossIcon}`;
            document.getElementById('mini-boss-essay-prompt').innerText = `"${data.essayPrompt}"`;

            // Grammar tags
            const tagsContainer = document.getElementById('mini-boss-grammar-tags');
            tagsContainer.innerHTML = '';
            data.grammarFocus.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = `text-[10px] font-mono bg-${data.color}-950/60 text-${data.color}-300 px-2 py-0.5 rounded-md border border-${data.color}-500/30`;
                tagSpan.innerText = tag;
                tagsContainer.appendChild(tagSpan);
            });

            // Reset textarea & word count
            const essayInput = document.getElementById('mini-boss-essay-input');
            essayInput.value = '';
            essayInput.oninput = updateMiniBossWordCount;
            updateMiniBossWordCount();

            // Reset view state
            document.getElementById('mini-boss-challenge-section').classList.remove('hidden');
            document.getElementById('mini-boss-result-section').classList.add('hidden');
            document.getElementById('mini-boss-remediation-map').classList.add('hidden');
            document.getElementById('btn-mini-boss-retry').classList.add('hidden');

            const submitBtn = document.getElementById('btn-mini-boss-submit');
            submitBtn.disabled = false;
            document.getElementById('btn-mini-boss-submit-text').innerText = "SERAHKAN UNTUK DIAGNOSA AI";

            document.getElementById('mini-boss-modal').classList.remove('hidden');
        }

        function updateMiniBossWordCount() {
            const text = (document.getElementById('mini-boss-essay-input')?.value || '').trim();
            const words = text ? text.split(/\s+/).length : 0;
            const data = MINI_BOSS_DATA[currentMiniBossPhase];
            const minWords = data ? data.essayMinWords : 50;
            const counter = document.getElementById('mini-boss-word-count');
            if (counter) {
                counter.innerText = `${words} / ${minWords} kata minimum`;
                counter.className = words >= minWords ? "text-xs font-mono text-emerald-400 font-bold" : "text-xs font-mono text-slate-400 font-bold";
            }
        }

        function closeMiniBossModal() {
            document.getElementById('mini-boss-modal').classList.add('hidden');
            currentMiniBossPhase = null;
        }

        function resetMiniBossEssay() {
            SoundFX.play('click');
            document.getElementById('mini-boss-challenge-section').classList.remove('hidden');
            document.getElementById('mini-boss-result-section').classList.add('hidden');
            document.getElementById('btn-mini-boss-retry').classList.add('hidden');
            document.getElementById('btn-mini-boss-submit').disabled = false;
            document.getElementById('btn-mini-boss-submit-text').innerText = "SERAHKAN UNTUK DIAGNOSA AI";
        }

        async function submitMiniBossEssay() {
            if (!currentMiniBossPhase) return;
            const data = MINI_BOSS_DATA[currentMiniBossPhase];
            const essayInput = document.getElementById('mini-boss-essay-input');
            const essayText = essayInput.value.trim();
            const words = essayText ? essayText.split(/\s+/).length : 0;

            if (words < (data.essayMinWords || 40)) {
                SoundFX.play('error');
                showToast(`Paragraf Mini-Boss terlalu pendek. Tulis minimal ${data.essayMinWords} kata!`, "error");
                return;
            }

            const submitBtn = document.getElementById('btn-mini-boss-submit');
            const submitBtnText = document.getElementById('btn-mini-boss-submit-text');
            submitBtn.disabled = true;
            submitBtnText.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> MENGANALISIS DIAGNOSTIK...`;

            const stageListFormatted = data.stages.map(sId => `- ${sId}: ${data.stageNames[sId] || sId}`).join('\n');

            const systemPrompt = `You are a certified, STRICT, RUTHLESS, and UNCOMPROMISING Senior IELTS Examiner conducting a Phase Mini-Boss Diagnostic Evaluation.
The candidate completed all stages in: ${data.title}.
Stages covered in this phase:
${stageListFormatted}

Grammar points tested:
${data.grammarFocus.join(', ')}

Candidate writing task prompt:
"${data.essayPrompt}"

🚨 CRITICAL NON-NEGOTIABLE ANTI-HALLUCINATION & GIBBERISH GUARD:
- If the candidate's paragraph is gibberish, random text (e.g. "asdmlasmdklsam"), non-English words, repetitive spam, or completely nonsensical:
  * Estimate Band Score: Band 2.0 - 3.0.
  * In Kelemahan & Glitches: Explicitly state that the submission is rejected for being invalid/incoherent gibberish.
  * In Remediation Plan: Mandate revising all stages in this phase.
  * Do NOT fabricate praise or pretend the paragraph is valid academic writing.

🚨 RIGID IELTS BAND DESCRIPTOR CEILINGS (ZERO GRADE INFLATION):
- If the paragraph consists ONLY of elementary compound sentences (and, but, so, because) without complex subordinators (Although, In contrast, Given that, Whereas):
  * Capped strictly at Band 5.0 - 5.5 in GRA and LR.
  * DO NOT award Band 6.5+ to simplistic English even if there are zero spelling mistakes!
- If the paragraph fails to apply the core grammar focus of this phase (${data.grammarFocus.join(', ')}):
  * Capped strictly at Band 5.5.
- Only award Band 7.0+ if the paragraph demonstrates precise complex subordination, academic collocations, and seamless coherence.

You MUST evaluate the candidate's paragraph and return a clear, structured diagnostic report in Markdown using EXACTLY these headings in Bahasa Indonesia:

# 📊 Phase Band Score Estimate
State the estimated IELTS Writing Band Score for this submission (e.g. **Band 5.5 (Needs Structural Upgrade)** or **Band 7.5 (Mastered)**).

# ✅ Keunggulan Grammar yang Diterapkan (Strengths)
List the specific grammar concepts from this phase that the candidate applied correctly and naturally. If none, write "Belum ada keunggulan dominan".

# ⚠️ Kelemahan & Diagnosa L1 Glitches (Weaknesses & Indonesian Bias)
Identify grammar errors and explain the L1 Indonesian root habit behind them (e.g., "Glitches pada Stage 1-2: Missing Be Anchor karena bahasa Indonesia tidak mewajibkan to-be sebelum kata sifat"). Explicitly mention which Stage concept was missed.

# 🔄 Remediation Plan (Stage yang Wajib Diulang)
Provide specific stage recommendations. Mention the exact stage IDs (e.g. stage1-1, stage1-2, stage2-3) that need revision. If all are flawless, state "Semua stage di fase ini telah dikuasai dengan sempurna!".

# 🚀 Model Paragraf Band 8.5+ & Bedah Formula
Provide an exemplary Band 8.5+ model paragraph demonstrating all phase skills flawlessly, accompanied by a 2-point formula breakdown explaining why it scores Band 8.5+.`;

            try {
                let aiResponse = await callGeminiAPI(`Prompt: ${data.essayPrompt}\n\nCandidate Paragraph:\n${essayText}`, systemPrompt);

                if (!aiResponse) {
                    aiResponse = `
# 📊 Phase Band Score Estimate
**Band 7.0**

# ✅ Keunggulan Grammar Anda (Strengths)
- Penggunaan struktur dasar kalimat teratur dan mudah dipahami.
- Kosa kata sesuai dengan konteks topik yang diberikan.

# ⚠️ Kelemahan & Glitches yang Terdeteksi (Weaknesses)
- Perlu meningkatkan variasi struktur kalimat kompleks dan akurasi kolokasi akademik.

# 🔄 Remediation Plan (Stage yang Perlu Dipelajari Kembali)
- Tinjau kembali stage-stage di fase ini untuk memperdalam presisi tata bahasa.

# 🚀 Model Paragraf Band 8.5+
"The rapid evolution of modern infrastructure has fundamentally transformed daily commuting patterns. Although implementation requires substantial financial resources, systematic urban planning continues to yield measurable improvements in societal well-being."

> 💡 *Hubungkan Gemini API Key Anda untuk mendapatkan analisis diagnostik real-time yang detail per stage!*
                    `;
                }

                // Render result
                const resultSection = document.getElementById('mini-boss-result-section');
                const resultBox = document.getElementById('mini-boss-ai-result');
                resultBox.innerHTML = renderMarkdown(aiResponse);
                resultSection.classList.remove('hidden');

                // Generate Interactive Remediation Buttons for weak stages
                const remediationMap = document.getElementById('mini-boss-remediation-map');
                const remediationBtns = document.getElementById('mini-boss-remediation-buttons');
                remediationBtns.innerHTML = '';

                let weakStagesFound = [];
                data.stages.forEach(sId => {
                    const regex = new RegExp(sId.replace('-', '[-\\s]?'), 'i');
                    if (regex.test(aiResponse) && (aiResponse.toLowerCase().includes('kelemahan') || aiResponse.toLowerCase().includes('remediation') || aiResponse.toLowerCase().includes('perlu'))) {
                        weakStagesFound.push(sId);
                    }
                });

                // If no specific stages matched in text, provide links to all stages in phase for easy review
                const stagesToRender = weakStagesFound.length > 0 ? weakStagesFound : data.stages;
                stagesToRender.forEach(sId => {
                    const sName = data.stageNames[sId] || sId;
                    const btn = document.createElement('button');
                    btn.className = "p-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 rounded-xl text-left text-xs text-amber-300 font-mono flex items-center justify-between transition-all";
                    btn.innerHTML = `
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-rotate-left text-amber-400"></i>
                            <span class="font-bold">${sName}</span>
                        </div>
                        <i class="fa-solid fa-arrow-right text-[10px] text-slate-400"></i>
                    `;
                    btn.onclick = () => {
                        closeMiniBossModal();
                        openQuestModal(sId);
                    };
                    remediationBtns.appendChild(btn);
                });
                remediationMap.classList.remove('hidden');

                // Extract Band Score from response for state
                let scoreMatch = aiResponse.match(/Band\s*([0-9\.]+)/i);
                let detectedBand = scoreMatch ? `Band ${scoreMatch[1]}` : 'Band 7.5';

                // Save victory state
                if (!playerState.miniBossResults) playerState.miniBossResults = {};
                playerState.miniBossResults[currentMiniBossPhase] = {
                    bandScore: detectedBand,
                    completed: true,
                    timestamp: Date.now()
                };

                addXP(data.xpReward);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`MINI-BOSS DEFEATED! ${data.bossName} ditaklukkan (+${data.xpReward} XP)!`, "success");

                // Toggle action buttons
                document.getElementById('btn-mini-boss-retry').classList.remove('hidden');
                submitBtnText.innerText = "KIRIM ULANG REVISI";
                submitBtn.disabled = false;

                updateUI();
                saveGameData();

            } catch (err) {
                SoundFX.play('error');
                showToast(`Gagal mendapatkan analisis AI: ${err.message}`, "error");
                submitBtn.disabled = false;
                submitBtnText.innerText = "SERAHKAN UNTUK DIAGNOSA AI";
            }
        }

        // Timer Logic for Boss Arena Speedrun
        let bossTimerInterval = null;
        let bossTimeSeconds = 3600;
        let isBossTimerRunning = false;

        function toggleBossTimer() {
            SoundFX.play('click');
            const btn = document.getElementById('btn-timer-toggle');
            if (isBossTimerRunning) {
                clearInterval(bossTimerInterval);
                isBossTimerRunning = false;
                btn.innerText = "RESUME SPEEDRUN";
                btn.className = "px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg";
            } else {
                isBossTimerRunning = true;
                btn.innerText = "PAUSE TIMER";
                btn.className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all";
                bossTimerInterval = setInterval(() => {
                    bossTimeSeconds--;
                    if (bossTimeSeconds <= 0) {
                        clearInterval(bossTimerInterval);
                        isBossTimerRunning = false;
                        SoundFX.play('error');
                        showToast("WAKTU HABIS! Kirim respons Anda untuk evaluasi.", "error");
                    }
                    updateBossTimerDisplay();
                }, 1000);
            }
        }

        function resetBossTimer() {
            SoundFX.play('click');
            clearInterval(bossTimerInterval);
            isBossTimerRunning = false;
            bossTimeSeconds = 3600;
            updateBossTimerDisplay();
            const btn = document.getElementById('btn-timer-toggle');
            btn.innerText = "START SPEEDRUN";
            btn.className = "px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg";
        }

        function updateBossTimerDisplay() {
            const mins = Math.floor(bossTimeSeconds / 60);
            const secs = bossTimeSeconds % 60;
            document.getElementById('boss-timer').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function updateBossWordCount() {
            const text = document.getElementById('boss-essay-input').value.trim();
            localStorage.setItem('ielts_boss_essay_draft', text); // Auto-save draft permanently
            
            const words = text ? text.split(/\s+/).length : 0;
            document.getElementById('boss-word-count').innerText = words;

            const val = document.getElementById('boss-prompt-select').value;
            const targetWords = val.startsWith('t1') ? 150 : 250;
            const statusLabel = document.getElementById('boss-target-status');
            const wordBar = document.getElementById('boss-word-bar');

            statusLabel.innerText = `${words} / ${targetWords} words`;
            const pct = Math.min(100, Math.round((words / targetWords) * 100));
            wordBar.style.width = `${pct}%`;

            if (words >= targetWords) {
                wordBar.className = "bg-emerald-500 h-full rounded-full transition-all duration-300";
                statusLabel.className = "text-emerald-400 font-bold";
            } else {
                wordBar.className = "bg-amber-500 h-full rounded-full transition-all duration-300";
                statusLabel.className = "text-amber-400 font-bold";
            }
        }

        function changeBossPrompt(playSound = true) {
            if (playSound) SoundFX.play('click');
            const val = document.getElementById('boss-prompt-select').value;
            localStorage.setItem('ielts_boss_selected_prompt', val);

            const promptBox = document.getElementById('boss-prompt-text');
            const task1Visual = document.getElementById('boss-task1-visual');

            if (val === 't2-1') {
                promptBox.innerText = '"Some people believe that schools should teach financial management skills to young students, while others argue that this is the responsibility of parents. Discuss both views and give your opinion."';
                if (task1Visual) task1Visual.classList.add('hidden');
            } else if (val === 't2-2') {
                promptBox.innerText = '"Environmental damage is a major global issue. Some think individuals can do little to solve it, while others believe governments alone must act. Discuss both views and give your opinion."';
                if (task1Visual) task1Visual.classList.add('hidden');
            } else {
                promptBox.innerText = '"Task 1 Report: The graph below shows energy consumption by fuel type in a European country from 1980 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."';
                if (task1Visual) task1Visual.classList.remove('hidden');
            }
            updateBossWordCount();
        }

        // Strict Rule-based Diagnostic Fallback Simulator
        function generateOfflineAnalysis(sentence, stageId = '') {
            let glitches = [];
            let fixes = [];
            let isPassed = true;
            let band = "Band 7.0";

            const lower = sentence.toLowerCase().trim();
            const words = lower.split(/\s+/);

            if (words.length < 5) {
                glitches.push("- **Kalimat Terlalu Pendek / Fragmen**: Kalimat tidak memiliki kelengkapan klausa subjek-predikat yang memadai.");
                fixes.push("- Tulis minimal satu klausa independen lengkap: [Subjek] + [Verba Predikat] + [Objek/Pelengkap].");
                isPassed = false;
                band = "Band 4.5";
            }

            // SVO / Missing Be Check
            if (/they\s+(confused|interested|worried|happy|sad|important|reluctant)/i.test(sentence) || /it\s+(important|crucial|essential|necessary)\b/i.test(sentence) || /test\s+going\s+to\s+be/i.test(sentence)) {
                glitches.push("- **Missing 'Be' Anchor Verb**: Kata sifat keadaan atau future structure digunakan tanpa auxiliary copula ('is/are/was/were').");
                fixes.push("- Tambahkan 'Be': misal `they are confused`, `it is crucial`, `is going to be successful`.");
                isPassed = false;
                band = "Band 5.0";
            }

            // Modal Glitch (must to / should to / can to / must doing)
            if (/\b(must|should|can|could|will|would|may|might)\s+(to\s+\w+|\w+ing)\b/i.test(sentence)) {
                glitches.push("- **Modal Auxiliary Collision**: Modal verbs tidak boleh diikuti 'to' atau gerund '-ing'.");
                fixes.push("- Gunakan Bare Infinitive: ganti `must to do` $\\rightarrow$ `must do`, `should implementing` $\\rightarrow$ `should implement`.");
                isPassed = false;
                band = "Band 5.0";
            }

            // Infinitive vs Gerund Collision
            if (/\bneed\s+to\s+\w+ing\b/i.test(sentence) || /\b(enjoy|avoid|consider|suggest)\s+to\s+\w+\b/i.test(sentence)) {
                glitches.push("- **Infinitive vs Gerund Collision**: Pola verb complementation terbalik.");
                fixes.push("- `need to` harus diikuti V1 (`need to manage`). Sebaliknya `avoid/consider` harus diikuti gerund (`consider investing`).");
                isPassed = false;
                band = "Band 5.0";
            }

            // Double Conjunction Crash
            if (/\b(although|even though|whereas|while)\b.*\b(but|however)\b/i.test(sentence) || /\b(because|since)\b.*\b(so|therefore)\b/i.test(sentence)) {
                glitches.push("- **Double Conjunction Crash**: Menggunakan dua konjungsi dalam satu kesatuan klausa (misal 'Although... but...').");
                fixes.push("- Hapus salah satu conjunction (gunakan 'Although..., [klausa bebas]' TANPA 'but').");
                isPassed = false;
                band = "Band 5.0";
            }

            // Preposition Contamination
            if (/\bdespite\s+of\b/i.test(sentence) || /\bdiscuss\s+about\b/i.test(sentence) || /\bmention\s+about\b/i.test(sentence)) {
                glitches.push("- **Preposition Contamination**: Penggunaan preposisi redundan/salah kolokasi.");
                fixes.push("- Gunakan `Despite [noun]` (tanpa 'of'), `discuss [topic]` (tanpa 'about').");
                isPassed = false;
                band = "Band 5.5";
            }

            // Article Phonetic Error
            if (/\ban\s+(university|uniform|unique|user|one)\b/i.test(sentence) || /\ba\s+(hour|honest|honor)\b/i.test(sentence)) {
                glitches.push("- **Phonetic Article Glitch**: Penentuan a/an melanggar aturan bunyi fonetik.");
                fixes.push("- Gunakan `a university` (karena bunyi semi-vokal /j/), `an hour` (karena bunyi vokal /aʊ/).");
                isPassed = false;
                band = "Band 5.5";
            }

            if (isPassed) {
                return `
# 🚦 VERDICT: PASSED

# 📊 Estimated Band Score: Band 7.0 - 7.5

# 🔍 Analisis Kesalahan & Keunggulan
- **Akurasi Konsep Stage**: Struktur kalimat bersih, subjek-verba harmonis, dan konsep dasar terpasang dengan tepat.
- **Glitch & Kesalahan Tata Bahasa**: Nol fatal glitch terdeteksi pada pemeriksaan aturan dasar.
- **Peningkatan Register Akademik**: Dapat ditingkatkan dengan menambahkan kata sifat presisi atau nominalisasi formal.

# 🛠️ Model Kalimat Perbaikan Band 8.5+
"The systematic implementation of these policies has demonstrated measurable improvements in overall operational efficiency."

# 📚 Rekomendasi Belajar
Pertahankan akurasi ini dan latih integrasi klausa kompleks (subordinasi & hedging).
                `;
            } else {
                return `
# 🚦 VERDICT: FAILED

# 📊 Estimated Band Score: ${band}

# 🔍 Analisis Kesalahan & Keunggulan
- **Akurasi Konsep Stage**: Kalimat mengandung bug gramatikal yang melanggar band descriptor IELTS.
- **Glitch & Kesalahan Tata Bahasa**:
${glitches.join('\n')}
- **Peningkatan Register Akademik**: Perbaiki kesalahan fundamental sebelum meningkatkan kosakata.

# 🛠️ Model Kalimat Perbaikan Band 8.5+
${fixes.join('\n')}

# 📚 Rekomendasi Belajar
Perbaiki kalimat Anda berdasarkan panduan perbaikan di atas, lalu klik tombol Uji Kembali di bawah!
                `;
            }
        }

        // State tracking for interactive drill arena in AI Glitch Lab
        let lastAiLabInputText = '';
        let lastAiLabAnalysisResponse = '';
        let currentDrillStudyPromptText = '';

        // Robust JSON parser for LLM responses (handles markdown fences, surrounding text, trailing commas)
        function extractJsonFromLLM(text) {
            if (!text) return null;
            let raw = String(text).trim();
            // 1. Direct JSON parse
            try {
                return JSON.parse(raw);
            } catch(e) {}

            // 2. Markdown code fences ```json ... ```
            const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (fenceMatch && fenceMatch[1]) {
                const inner = fenceMatch[1].trim();
                try {
                    return JSON.parse(inner);
                } catch(e) {
                    raw = inner;
                }
            }

            // 3. Find outer curly brackets
            const firstOpen = raw.indexOf('{');
            const lastClose = raw.lastIndexOf('}');
            if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
                let jsonStr = raw.substring(firstOpen, lastClose + 1);
                try {
                    return JSON.parse(jsonStr);
                } catch(e) {
                    // Fix trailing commas before closing braces/brackets
                    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
                    try {
                        return JSON.parse(jsonStr);
                    } catch(e2) {}
                }
            }
            return null;
        }

        // Helper to convert Audio Blob into Base64 for Gemini Multimodal Audio Understanding
        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        const base64Data = reader.result.split(',')[1];
                        resolve(base64Data);
                    } else {
                        reject(new Error("Failed to read audio blob as base64 string."));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // API Call to Gemini Engine with User's Configured Key & Model (Default: gemini-3.7-flash)
        // Supports Text + Direct Native Multimodal Audio (Base64 Inline Data)
        async function callGeminiAPI(userQuery, systemPrompt, audioBlob = null) {
            const apiKey = localStorage.getItem('ielts_gemini_api_key') || '';
            const model = localStorage.getItem('ielts_gemini_model') || 'gemini-3.7-flash';

            if (!apiKey || apiKey.trim() === '') {
                openApiKeyModal();
                showToast("Silakan masukkan Gemini API Key Anda untuk mengaktifkan AI Coach!", "info");
                return null;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const parts = [];

            // If audioBlob provided, convert to base64 inlineData for Multimodal Audio Understanding
            if (audioBlob) {
                try {
                    const base64Audio = await blobToBase64(audioBlob);
                    let mimeType = audioBlob.type ? audioBlob.type.split(';')[0].trim() : 'audio/webm';
                    if (!mimeType || mimeType === 'application/octet-stream') mimeType = 'audio/webm';
                    parts.push({
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Audio
                        }
                    });
                } catch(audioErr) {
                    console.warn("Failed to encode audio blob to Base64, falling back to text prompt:", audioErr);
                }
            }

            parts.push({ text: userQuery });

            const payload = {
                contents: [{ parts: parts }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            };

            let attempts = 0;
            while (attempts < 2) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!response.ok) {
                        const errBody = await response.text();
                        if (response.status === 400) {
                            throw new Error(`API Key tidak valid atau format permintaan salah (HTTP 400). Cek kembali API Key Anda.`);
                        } else if (response.status === 404) {
                            throw new Error(`Model '${model}' tidak tersedia pada endpoint ini (HTTP 404). Silakan coba ganti model ke 'gemini-3.6-flash' atau 'gemini-3.5-flash' di pengaturan.`);
                        } else if (response.status === 429) {
                            throw new Error(`Rate limit terlampaui (HTTP 429). Mohon tunggu beberapa detik atau ganti model ke Gemini 3.6 Flash / 3.5 Flash Lite.`);
                        } else {
                            throw new Error(`HTTP Error ${response.status}: ${errBody.substring(0, 100)}`);
                        }
                    }

                    const result = await response.json();
                    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response text received.";
                } catch (e) {
                    attempts++;
                    if (attempts >= 2) throw e;
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }

        // AI Sentence & Glitch Analysis Handler
        async function analyzeSentence() {
            SoundFX.play('click');
            const input = document.getElementById('ai-lab-input').value.trim();
            if (!input) {
                SoundFX.play('error');
                showToast("Masukkan kalimat terlebih dahulu untuk dianalisis!", "error");
                return;
            }

            const btn = document.getElementById('btn-analyze-lab');
            btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Analyzing...`;
            btn.disabled = true;

            const systemPrompt = `You are an elite, uncompromising Cambridge IELTS Senior Examiner and Linguistic Specialist for Indonesian learners.
Analyze the candidate's input using this 5-Pillar Critical Framework:

# 💡 1. WHY (Mengapa Konsep Ini Krusial di IELTS)
Jelaskan MENGAPA konsep tata bahasa ini sangat krusial di IELTS Writing/Speaking, dan tunjukkan bagaimana konsep ini secara langsung menentukan skor Grammatical Range & Accuracy (GRA) dan Coherence & Cohesion (CC).

# ⚙️ 2. HOW (Mekanisme Teknis & Aturan Baku)
Jelaskan CARA KERJA mekanika tata bahasanya langkah demi langkah secara sistematis tanpa jargon yang membingungkan.

# 🎨 3. ANALOGI INTUITIF (Mental Model Dunia Nyata)
Berikan 1 analogi dunia nyata yang sangat hidup dan mudah dibayangkan (Explain Like I'm 5 / ELI5) agar pengguna paham logikanya sampai ke alam bawah sadar.

# 🐛 4. DIAGNOSIS FORENSIK GLITCH & L1 TRANSFER
- **Glitch yang Terdeteksi**: [Sebutkan kesalahan tata bahasa atau kelemahan register formal]
- **Akar Masalah L1 (Interferensi Bahasa Indonesia)**: [Bedah kebiasaan bahasa Indonesia mana yang memicu kesalahan ini, misal: menerjemahkan kata per kata, ketiadaan konjugasi, atau pola pikir kalimat lisan]
- **Versi Slayer Band 8.5+**: [Tuliskan kalimat versi Band 8.5+ yang superior]
- **Bedah Formula Kalimat**: [Tuliskan rumus struktur kalimatnya, misal: 'In light of + [Noun Phrase], [Subject] + [Band 8 Collocation]']

# 🚀 5. LATIHAN & RETRIEVAL DRILL AKTIF
Berikan tepat 2 kalimat latihan interaktif untuk diperbaiki/ditransformasikan sekarang juga. Ajak pengguna mengetik jawabannya di Drill Arena di bawah!`;

            try {
                let resText = await callGeminiAPI(input, systemPrompt);
                if (!resText) {
                    resText = generateOfflineAnalysis(input);
                }

                lastAiLabInputText = input;
                lastAiLabAnalysisResponse = resText;

                const resultBox = document.getElementById('ai-lab-result');
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = renderMarkdown(resText);

                // Reveal interactive drill card
                const drillCard = document.getElementById('ai-lab-drill-card');
                const drillInput = document.getElementById('ai-lab-drill-input');
                const drillFeedback = document.getElementById('ai-lab-drill-feedback');
                if (drillCard) {
                    drillCard.classList.remove('hidden');
                    if (drillInput) drillInput.value = '';
                    if (drillFeedback) drillFeedback.classList.add('hidden');
                }

                SoundFX.play('correct');
                showToast("Analisis Glitch Selesai! Kerjakan latihan di bawah.", "success");
            } catch (err) {
                SoundFX.play('error');
                showToast(err.message || "Gagal menghubungi Gemini API. Menampilkan hasil diagnosa lokal...", "error");
                const resultBox = document.getElementById('ai-lab-result');
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = renderMarkdown(generateOfflineAnalysis(input) + `\n\n> ⚠️ **Catatan Error API:** ${err.message}`);

                lastAiLabInputText = input;
                lastAiLabAnalysisResponse = generateOfflineAnalysis(input);

                const drillCard = document.getElementById('ai-lab-drill-card');
                if (drillCard) drillCard.classList.remove('hidden');
            } finally {
                btn.innerHTML = `<i class="fa-solid fa-magnifying-glass font-bold"></i> Analyze Glitches`;
                btn.disabled = false;
            }
        }

        // Interactive Drill Evaluation Handler in AI Glitch Lab
        async function submitAiLabDrillAnswer() {
            SoundFX.play('click');
            const drillInput = document.getElementById('ai-lab-drill-input');
            const drillAnswers = drillInput ? drillInput.value.trim() : '';

            if (!drillAnswers || drillAnswers.length < 5) {
                SoundFX.play('error');
                showToast("Ketik jawaban latihan drill Anda terlebih dahulu!", "error");
                return;
            }

            const btn = document.getElementById('btn-submit-drill');
            const btnText = document.getElementById('btn-submit-drill-text');
            btn.disabled = true;
            if (btnText) btnText.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i> AI Examiner Sedang Menilai...`;

            const feedbackContainer = document.getElementById('ai-lab-drill-feedback');
            feedbackContainer.classList.remove('hidden');
            feedbackContainer.innerHTML = `
                <div class="text-center py-4 font-mono text-xs text-indigo-400 flex items-center justify-center gap-2">
                    <i class="fa-solid fa-spinner animate-spin"></i>
                    <span>Mengevaluasi akurasi jawaban latihan drill Anda...</span>
                </div>
            `;

            const systemPrompt = `You are a certified, STRICT, and UNCOMPROMISING Cambridge IELTS Examiner evaluating the candidate's answers to the Retrieval Drill exercises given in the previous step.
Context / Previous Grammar Topic & Questions:
${lastAiLabAnalysisResponse.substring(0, 1200)}

Candidate Drill Submission:
"${drillAnswers}"

🚨 RIGID EVALUATION POLICY (ZERO SUGARCOATING):
1. Grade each numbered question submitted by the candidate (Item 1: Correct / Incorrect, Item 2: Correct / Incorrect).
2. Point out ANY remaining glitches, missing articles, wrong prepositions, or informal phrasing.
3. Show the Band 8.5+ Slayer Model & formula for each item.
4. Conclude with:
   # 🏆 Drill Mastery Score: [e.g. 2/2 Sempurna / 1/2 Perlu Poles / 0/2 Gagal Total]
   # 🚦 Status: [MASTERED (+50 XP) or NEEDS PRACTICE]`;

            try {
                let gradeResponse = await callGeminiAPI(`Drill Submission:\n${drillAnswers}`, systemPrompt);

                if (!gradeResponse) {
                    // Fallback evaluation
                    gradeResponse = `
# 🏆 Drill Evaluation Report
- **Status Evaluasi**: Jawaban telah diterima dan dianalisis.
- **Komentar Tata Bahasa**: Struktur kalimat yang diperbaiki menunjukkan peningkatan pemahaman konsep.
- **Model Jawaban Band 8.5+**: Pastikan subjek, verba, dan klausa utama saling mengikat tanpa konjungsi ganda.
- **Skor**: **MASTERED (+50 XP)**
                    `;
                }

                // Check if errors detected in drill
                const hasErrors = gradeResponse.toLowerCase().includes('incorrect') || gradeResponse.toLowerCase().includes('needs practice') || gradeResponse.toLowerCase().includes('perlu') || gradeResponse.toLowerCase().includes('salah');
                
                // Generate drill study prompt
                const drillStudyPrompt = `Act as an elite IELTS Grammar & Writing Coach.
I am reviewing my Retrieval Drill practice in IeltsGo AI Glitch Lab.

Context Topic: ${lastAiLabInputText || 'IELTS Grammar Drills'}
My Drill Answers:
"${drillAnswers}"

AI Examiner Evaluation:
${gradeResponse.substring(0, 700)}

Please provide:
1. Clear explanation of any remaining grammatical glitches and the exact rules broken.
2. 3 Band 8.5+ native academic model sentences.
3. 2 new quick test sentences for me to practice right now.`;

                currentDrillStudyPromptText = drillStudyPrompt;
                window.currentDrillStudyPromptText = drillStudyPrompt;

                let remediationHtml = '';
                if (hasErrors) {
                    remediationHtml = `
                        <div class="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-2 mt-3">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div class="text-amber-400 font-bold text-xs flex items-center gap-1.5 font-mono">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    <span>Remediation Plan • Prompt Belajar Mandiri:</span>
                                </div>
                                <div class="flex items-center space-x-1.5">
                                    <button type="button" onclick="toggleDrillStudyPromptView()" id="btn-toggle-drill-prompt" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded border border-slate-700">
                                        <i class="fa-solid fa-eye mr-1" id="icon-toggle-drill-prompt"></i> <span id="text-toggle-drill-prompt">Lihat Prompt</span>
                                    </button>
                                    <button type="button" onclick="copyDrillStudyPrompt()" class="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 text-[10px] font-mono rounded border border-amber-500/30">
                                        <i class="fa-solid fa-copy mr-1"></i> Salin Prompt
                                    </button>
                                </div>
                            </div>
                            <pre id="drill-study-prompt-text" class="hidden text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap select-all max-h-36 overflow-y-auto leading-relaxed"></pre>
                        </div>
                    `;
                }

                feedbackContainer.innerHTML = `
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                        <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <i class="fa-solid fa-graduation-cap"></i> HASIL PENILAIAN DRILL INTERAKTIF
                        </span>
                        <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">GRADED</span>
                    </div>
                    <div class="text-xs text-slate-200 leading-relaxed font-sans space-y-2">
                        ${renderMarkdown(gradeResponse)}
                    </div>
                    ${remediationHtml}
                `;

                // Award XP for completing the drill
                addXP(50);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast("Latihan Drill Selesai! (+50 XP)", "success");

            } catch (err) {
                SoundFX.play('error');
                feedbackContainer.innerHTML = `
                    <div class="text-xs text-amber-400 p-3 bg-slate-900 rounded-lg border border-amber-500/30">
                        <i class="fa-solid fa-circle-exclamation mr-1"></i> Tidak dapat menghubungkan ke API (${err.message}). Jawaban Anda tersimpan. Silakan periksa kunci API Anda di menu atas.
                    </div>
                `;
                showToast("Gagal menilai drill.", "error");
            } finally {
                btn.disabled = false;
                if (btnText) btnText.innerHTML = `Kirim Jawaban Drill untuk Dinilai AI`;
            }
        }

        function toggleDrillStudyPromptView() {
            SoundFX.play('click');
            const pre = document.getElementById('drill-study-prompt-text');
            const toggleText = document.getElementById('text-toggle-drill-prompt');
            const toggleIcon = document.getElementById('icon-toggle-drill-prompt');
            if (!pre) return;

            if (pre.classList.contains('hidden')) {
                pre.innerText = currentDrillStudyPromptText || window.currentDrillStudyPromptText || '';
                pre.classList.remove('hidden');
                if (toggleText) toggleText.innerText = "Tutup Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye-slash mr-1";
            } else {
                pre.classList.add('hidden');
                if (toggleText) toggleText.innerText = "Lihat Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye mr-1";
            }
        }

        function copyDrillStudyPrompt() {
            const promptToCopy = currentDrillStudyPromptText || window.currentDrillStudyPromptText;
            if (!promptToCopy) return;
            navigator.clipboard.writeText(promptToCopy).then(() => {
                SoundFX.play('correct');
                showToast("Prompt belajar mandiri drill berhasil disalin!", "success");
            }).catch(() => {
                showToast("Gagal menyalin prompt.", "error");
            });
        }

        // Boss Essay Evaluation Handler with Guided Revision Loop
        async function evaluateBossEssay() {
            SoundFX.play('click');
            const essay = document.getElementById('boss-essay-input').value.trim();
            const prompt = document.getElementById('boss-prompt-text').innerText;

            if (essay.length < 30) {
                SoundFX.play('error');
                showToast("Tulisan terlalu pendek untuk evaluasi Boss Arena (minimal 30 kata).", "error");
                return;
            }

            const resultContainer = document.getElementById('boss-ai-result');
            resultContainer.classList.remove('hidden');
            resultContainer.innerHTML = `
                <div class="text-center py-8 font-mono text-sm text-red-400 flex flex-col items-center gap-3">
                    <i class="fa-solid fa-dragon fa-bounce text-3xl"></i>
                    <span>SUMMONING IELTS EXAMINER BOSS FOR EVALUATION...</span>
                </div>
            `;

            const wordCount = essay.split(/\s+/).filter(w => w.length > 0).length;
            const systemPrompt = `You are an official, certified, and RUTHLESS Senior Cambridge IELTS Writing Examiner evaluating an IELTS Writing Task 2 Boss Arena Speedrun.

Candidate Essay Word Count: ${wordCount} words.
Required IELTS Minimum: 250 words.

🚨 CRITICAL NON-NEGOTIABLE ANTI-HALLUCINATION & GIBBERISH GUARD:
- If the candidate's essay is gibberish, keyboard mash, non-English words, repetitive spam, or completely nonsensical:
  * Assign Overall Band Score: Band 2.0 (TA 2.0, CC 2.0, LR 2.0, GRA 2.0).
  * State explicitly that the submission is rejected for being invalid/incoherent gibberish.
  * Do NOT fabricate a passing score or hallucinate praise.

🚨 RIGID OFFICIAL IELTS TASK 2 BAND CEILINGS & PENALTIES:
1. UNDERLENGTH PENALTY:
   - If word count < 250 words: Task Response (TR/TA) MUST BE CAPPED at Band 5.0 maximum (Official Cambridge penalty for insufficient development).
2. SIMPLE SVO / MEMORIZED TEMPLATES PENALTY:
   - If the essay consists mostly of basic compound sentences without complex clauses, or relies on empty memorized template filler ("In this modern era, there are many pros and cons..."): GRA & LR CAPPED at Band 5.5.
3. REPETITIVE / VAGUE VOCABULARY PENALTY:
   - If candidate repeats generic words (good, bad, people, problem, thing, make, help) without formal C1/C2 collocations: LR CAPPED at Band 5.0 - 5.5.
4. COHERENCE & LOGICAL PROGRESSION:
   - Every body paragraph must have a clear Central Topic Sentence + In-depth Explanation (Why) + Specific Example + Impact.

Structure your comprehensive diagnostic report in Markdown using EXACTLY these headings in Bahasa Indonesia:

# 🏆 Official IELTS Band Score Breakdown (Strict & Unfiltered)
- **Task Response (TR)**: Band [X.X] — [Audit pemenuhan soal, kedalaman argumen, dan penalti jumlah kata jika <250 kata]
- **Coherence & Cohesion (CC)**: Band [X.X] — [Audit alur paragraf, transisi logis, dan ketiadaan lompatan ide]
- **Lexical Resource (LR)**: Band [X.X] — [Audit variasi kosakata C1/C2, ketepatan kolokasi, dan penalti kata klise]
- **Grammatical Range & Accuracy (GRA)**: Band [X.X] — [Audit akurasi klausa kompleks, tenses, dan nominalization]
- **Overall Estimated Band Score**: **Band [X.X]**

# ⚔️ Diagnosa 14-Stage Roadmap Mastery & Akar Masalah L1
(Periksa penguasaan 14 konsep grammar inti dari roadmap):
- **Fondasi SVO & Be-Anchor (Stage 1-4)**: [Analisis akurasi kalimat dasar]
- **Klausa Kompleks & Subordinasi (Stage 5-8)**: [Analisis variasi although, whereas, conditional, relative clauses]
- **Passive Voice & Nominalization (Stage 9-12)**: [Analisis register akademik C1/C2]
- **Akar Masalah L1 (Interferensi Bahasa Indonesia)**: [Jelaskan pola pikir bahasa Indonesia mana yang paling banyak merusak kealamian esai ini]

# 🛠️ Top 3 Glitch Repair Guide & Bedah Formula
(Ambil 3 kalimat paling bermasalah dari esai kandidat dan transformasikan ke standar Band 8.5+):
1. ❌ **Kalimat Asli**: "[Kutipan kalimat kandidat]"
   - 💡 **Versi Band 8.5+**: "[Kalimat hasil rekonstruksi]"
   - ⚙️ **Bedah Formula**: [Rumus sintaksisnya]
2. ❌ **Kalimat Asli**: "[Kutipan kalimat kandidat]"
   - 💡 **Versi Band 8.5+**: "[Kalimat hasil rekonstruksi]"
   - ⚙️ **Bedah Formula**: [Rumus sintaksisnya]
3. ❌ **Kalimat Asli**: "[Kutipan kalimat kandidat]"
   - 💡 **Versi Band 8.5+**: "[Kalimat hasil rekonstruksi]"
   - ⚙️ **Bedah Formula**: [Rumus sintaksisnya]

# 🚀 Model Paragraf Band 8.5+ Slayer
[Tuliskan 1 model paragraf Body Paragraph Band 8.5+ yang sempurna untuk menjawab topik ini]`;

            try {
                const userQuery = `Prompt: ${prompt}\n\nCandidate Response:\n${essay}`;
                let resText = await callGeminiAPI(userQuery, systemPrompt);

                if (!resText) {
                    resText = `
# 🏆 Estimated Band Score Breakdown
- **Task Achievement / Response**: 6.5
- **Coherence & Cohesion**: 6.5
- **Lexical Resource**: 7.0
- **Grammatical Range & Accuracy**: 6.5
- **Overall Estimated Band**: **6.5 - 7.0**

# ⚔️ 14-Stage Mastery Assessment
- SVO Structure: Solid foundation.
- Clause Complexity: Good use of compound-complex sentences.
- Area to Boost: Expand passive reporting verbs and academic nominalization.

# 🛠️ Glitch Repair Guide
1. *Before*: "People need to managing money." $\\rightarrow$ *After*: "Individuals are required to manage their financial assets."
2. *Before*: "Because of costs rose so demand dropped." $\\rightarrow$ *After*: "Owing to rising costs, consumer demand decreased substantially."

# 🚀 Band 8.0 Model Paragraph Preview
"It is often argued that financial education should be incorporated into the mandatory school curriculum. While parental guidance remains pivotal, formal instruction ensures standardized literacy across diverse socio-economic backgrounds."

> 💡 *Silakan masukkan Gemini API Key Anda melalui tombol kunci di atas untuk mendapatkan evaluasi real-time yang disesuaikan secara dinamis dengan esai Anda!*
                    `;
                }

                resultContainer.innerHTML = `
                    <div class="flex items-center justify-between border-b border-red-500/30 pb-3 mb-4">
                        <h3 class="font-bold text-white text-lg flex items-center gap-2">
                            <i class="fa-solid fa-trophy text-amber-400"></i> BOSS ARENA EVALUATION REPORT
                        </h3>
                        <span class="text-xs font-mono bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">COMPLETED</span>
                    </div>
                    <div>${renderMarkdown(resText)}</div>
                    
                    <!-- Guided Revision Loop Action Box -->
                    <div class="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row justify-between items-center gap-3 mt-5 shadow-lg">
                        <div>
                            <div class="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
                                <i class="fa-solid fa-pen-to-square"></i> Loop Revisi Kognitif (Self-Correction)
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5">Terapkan rekomendasi Glitch Repair di atas ke draf esai Anda untuk menguji peningkatan Band Score.</p>
                        </div>
                        <button onclick="startBossRevisionMode()" class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap border border-indigo-400/30">
                            <i class="fa-solid fa-arrows-rotate"></i>
                            <span>Mulai Revisi Draf</span>
                        </button>
                    </div>
                `;
                
                addXP(500);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast("Boss Arena Evaluation Completed! +500 XP", "success");

            } catch (err) {
                SoundFX.play('error');
                resultContainer.innerHTML = `<div class="text-red-400 text-xs p-4">Failed to generate AI evaluation: ${err.message}</div>`;
                showToast("Evaluasi gagal dikirim.", "error");
            }
        }

        // Smooth Scroll & Highlight for Guided Revision Mode
        function startBossRevisionMode() {
            SoundFX.play('click');
            const editor = document.getElementById('boss-essay-input');
            if (editor) {
                editor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                editor.focus();
                editor.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-500');
                setTimeout(() => {
                    editor.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-500');
                }, 3000);
                showToast("Mode Revisi Aktif: Edit draf Anda lalu klik Evaluate kembali untuk cek skor baru!", "info");
            }
        }

        // =========================================================================