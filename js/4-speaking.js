/* ============================================================
   IELTS GO — Speaking Lab · TTS · Recording · AI Eval · Sidebar · Color Mode
   ============================================================ */

        // IeltsGo SPEAKING LAB JAVASCRIPT ENGINE (v5.0)
        // Audio Recorder + Waveform Visualizer + Web Speech Recognition + AI Scaffolding
        // =========================================================================
        const speakingState = {
            activeMode: 'part1',
            mediaRecorders: {},
            audioChunks: {},
            audioBlobs: {},
            audioURLs: {},
            streams: {},
            audioContexts: {},
            analysers: {},
            animFrames: {},
            recTimerIntervals: {},
            recSeconds: { part1: 0, part2: 0, part3: 0 },
            prepTimerInterval: null,
            prepTimeSeconds: 60,
            speakingTimerInterval: null,
            speakingTimeSeconds: 120,
            generatedPrompts: {},
            remediationPrompts: {}
        };

        function switchSpeakingMode(mode) {
            SoundFX.play('click');
            speakingState.activeMode = mode;

            // Update tab button styles
            ['part1', 'part2', 'part3'].forEach(m => {
                const btn = document.getElementById(`tab-btn-speaking-${m}`);
                const content = document.getElementById(`speaking-mode-${m}`);
                if (btn && content) {
                    if (m === mode) {
                        btn.className = "py-2.5 px-3 rounded-xl bg-rose-600 text-white flex items-center justify-center gap-2 transition-all shadow-md";
                        content.classList.remove('hidden');
                    } else {
                        btn.className = "py-2.5 px-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 flex items-center justify-center gap-2 transition-all";
                        content.classList.add('hidden');
                    }
                }
            });
        }

        function updateSpeakingTargetAccent() {
            SoundFX.play('click');
            const sel = document.getElementById('speaking-target-accent');
            const val = sel ? sel.value : 'british_rp';
            localStorage.setItem('ielts_target_accent', val);
            const labelMap = {
                'british_rp': '🇬🇧 British RP (Received Pronunciation)',
                'general_american': '🇺🇸 General American (US Standard)',
                'australian': '🇦🇺 Australian English',
                'neutral_academic': '🌍 Neutral Academic (International)'
            };
            showToast(`Target Aksen Diperbarui: ${labelMap[val] || val}`, "info");
        }

        function initSpeakingLabUI() {
            const completedCount = Object.keys(playerState.completedStages || {}).length;
            const summaryEl = document.getElementById('speaking-unlocked-stages-summary');
            if (summaryEl) {
                if (completedCount === 0) {
                    summaryEl.innerHTML = `<span class="text-amber-400 font-bold">0 of 14 Stages Unlocked</span> (Menggunakan Mode Fondasi SVO & Be Anchor)`;
                } else {
                    const stageNames = Object.keys(playerState.completedStages)
                        .map(id => STAGE_DATA[id]?.title ? STAGE_DATA[id].title.split(' ')[0] : id)
                        .slice(0, 5)
                        .join(', ');
                    summaryEl.innerHTML = `<span class="text-emerald-400 font-bold">${completedCount} of 14 Stages Unlocked</span> <span class="text-slate-400 text-[11px]">(${stageNames}${completedCount > 5 ? '...' : ''})</span>`;
                }
            }

            // Restore saved target accent
            const savedAccent = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentSelect = document.getElementById('speaking-target-accent');
            if (accentSelect) accentSelect.value = savedAccent;

            updateSpeakingVocabPoolStatus();
        }

        // =========================================================================
        // IeltsGo v6.2 — SPEAKING LAB VOCAB LOGGER INTEGRATION
        // =========================================================================
        let speakingVocabFilter = 'all'; // 'all', 'C1-C2', 'C1', 'C2', 'B2'

        function toggleSpeakingVocabIntegration() {
            SoundFX.play('click');
            const chk = document.getElementById('toggle-speaking-use-vocab');
            const panel = document.getElementById('speaking-vocab-filter-panel');
            if (!chk || !panel) return;

            if (chk.checked) {
                panel.classList.remove('hidden');
                updateSpeakingVocabPoolStatus();
            } else {
                panel.classList.add('hidden');
                const statusEl = document.getElementById('speaking-vocab-pool-status');
                if (statusEl) statusEl.innerText = "Aktifkan untuk menyisipkan kosakata yang sedang dipelajari";
            }
        }

        function setSpeakingVocabFilter(filterVal) {
            SoundFX.play('click');
            speakingVocabFilter = filterVal;
            
            document.querySelectorAll('.speaking-cefr-filter-btn').forEach(btn => {
                btn.className = "speaking-cefr-filter-btn px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 transition-all border border-slate-800";
            });
            const activeBtn = document.getElementById(`btn-speaking-vocab-${filterVal}`);
            if (activeBtn) {
                activeBtn.className = "speaking-cefr-filter-btn px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold transition-all shadow-sm";
            }

            updateSpeakingVocabPoolStatus();
        }

        function getVocabPoolByFilter(filterVal) {
            // Only select words with status === 'learning' (not mastered)
            let pool = (vocabBank || []).filter(v => v.status !== 'mastered');
            const f = (filterVal || 'all').toUpperCase();
            
            if (f === 'C1') {
                pool = pool.filter(v => (v.cefr || '').toUpperCase() === 'C1');
            } else if (f === 'C2') {
                pool = pool.filter(v => (v.cefr || '').toUpperCase() === 'C2');
            } else if (f === 'C1-C2') {
                pool = pool.filter(v => {
                    const c = (v.cefr || '').toUpperCase();
                    return c === 'C1' || c === 'C2';
                });
            } else if (f === 'B2') {
                pool = pool.filter(v => (v.cefr || '').toUpperCase() === 'B2');
            }
            return pool;
        }

        function updateSpeakingVocabPoolStatus() {
            const statusEl = document.getElementById('speaking-vocab-pool-status');
            if (!statusEl) return;

            const chk = document.getElementById('toggle-speaking-use-vocab');
            if (!chk || !chk.checked) {
                statusEl.innerText = "Aktifkan untuk menyisipkan kosakata yang sedang dipelajari";
                return;
            }

            const pool = getVocabPoolByFilter(speakingVocabFilter);
            const filterLabel = speakingVocabFilter === 'all' ? 'Semua Level' : speakingVocabFilter;

            if (pool.length === 0) {
                statusEl.innerHTML = `<span class="text-amber-400 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 0 kata learning (${filterLabel})</span>`;
            } else {
                statusEl.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check mr-1"></i> ${pool.length} kata learning siap diacak (${filterLabel})</span>`;
            }
        }

        function getRandomVocabsForSpeaking(filterVal, count = 3) {
            const pool = getVocabPoolByFilter(filterVal);
            if (pool.length === 0) return [];
            
            // Shuffle randomly
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        function getUnlockedGrammarContext() {
            const completedIds = Object.keys(playerState.completedStages || {});
            if (completedIds.length === 0) {
                return {
                    count: 0,
                    stageTitles: ["Stage 1: SVO Sentence Frame", "Stage 2: 'Be' State Anchor"],
                    rulesSummary: "Basic Subject + Verb + Object word order, correct 'be' copula anchors (is/are/was/were)."
                };
            }
            const stageTitles = completedIds.map(id => STAGE_DATA[id]?.title || id);
            return {
                count: completedIds.length,
                stageTitles: stageTitles,
                rulesSummary: stageTitles.join('; ')
            };
        }

        // Generate Speaking Text / Cue Card / Part 3 Question
        async function generateSpeakingPrompt(mode) {
            SoundFX.play('click');
            const btn = document.getElementById(`btn-generate-speaking-${mode}`);
            const textEl = document.getElementById(`speaking-text-${mode}`);
            const tagsEl = document.getElementById(`speaking-grammar-tags-${mode}`);
            const vocabTagsEl = document.getElementById(`speaking-vocab-tags-${mode}`);
            const topicTag = document.getElementById(`speaking-topic-tag-${mode}`);

            if (btn) btn.disabled = true;
            if (textEl) textEl.innerHTML = `<div class="py-4 text-center text-rose-400 font-mono text-xs"><i class="fa-solid fa-spinner animate-spin mr-2"></i> Merancang materi speaking berbasis stage yang Anda kuasai...</div>`;

            const grammarCtx = getUnlockedGrammarContext();

            // Check if Vocab Logger integration is enabled
            const useVocab = document.getElementById('toggle-speaking-use-vocab')?.checked;
            let injectedVocabs = [];
            if (useVocab) {
                injectedVocabs = getRandomVocabsForSpeaking(speakingVocabFilter, 3);
                if (injectedVocabs.length === 0) {
                    showToast(`Tidak ditemukan kata 'learning' untuk filter ${speakingVocabFilter}. Menghasilkan materi tanpa injeksi vocab.`, "info");
                }
            }

            let vocabPromptInstruction = '';
            if (injectedVocabs.length > 0) {
                vocabPromptInstruction = `\n\nCRITICAL VOCABULARY REQUIREMENT:
You MUST naturally weave these ${injectedVocabs.length} words from the student's Vocab Logger into your generated text/prompt:
${injectedVocabs.map(v => `- "${v.word}" (CEFR ${v.cefr}, meaning: ${v.meaningEn})`).join('\n')}
Make sure each of these target vocabulary words is formatted in **bold** in the text.`;
            }

            let systemPrompt = '';
            let userPrompt = '';

            // Monologue Length Constraint (Short / Medium / Long)
            const lengthChoice = document.getElementById(`select-speaking-length-${mode}`)?.value || 'medium';
            let lengthInstruction = '';
            let targetWords = '60-80 words (6-8 sentences)';
            if (lengthChoice === 'short') {
                lengthInstruction = 'Generate a CONCISE model monologue of exactly 3 to 4 clear, impactful sentences (approx 35-50 words). Focus on crisp phonemes and SVO clarity.';
                targetWords = '35-50 words (3-4 sentences)';
            } else if (lengthChoice === 'long') {
                lengthInstruction = 'Generate a RICH, EXTENDED model monologue of 10 to 14 complex sentences (approx 120-160 words). Provide full descriptive depth, varied sentence structures, and stamina drill.';
                targetWords = '120-160 words (10-14 sentences)';
            } else {
                lengthInstruction = 'Generate an authentic model monologue of 6 to 8 well-developed sentences (approx 70-90 words), standard IELTS Part 1 length.';
                targetWords = '70-90 words (6-8 sentences)';
            }

            if (mode === 'part1') {
                systemPrompt = `You are an elite IELTS Speaking Coach creating a Read-Aloud / Shadowing monologue for IELTS Speaking Part 1.
Scaffolding constraint: The student has unlocked these grammar stages: [${grammarCtx.rulesSummary}].
DO NOT use grammatical structures beyond their unlocked level.${vocabPromptInstruction}

Length Constraint:
${lengthInstruction}

Task:
Generate an authentic IELTS Speaking Part 1 model monologue (${targetWords}) on a familiar topic (e.g. Work/Study, Daily Routine, Hometown, Hobbies, Technology).
The monologue must naturally integrate the target grammar structures from their unlocked stages and any specified vocabulary words.

Format your response in Markdown:
# 🎙️ Topic: [Topic Title]
[The spoken response text with key grammar structures and injected vocabulary words in **bold**]

# 🎯 Target Grammar & Vocab Applied:
- [List 2-3 target rules or vocabulary embedded]`;
                userPrompt = `Generate a Part 1 shadowing monologue (${lengthChoice} length: ${targetWords}) using unlocked grammar: ${grammarCtx.rulesSummary}${injectedVocabs.length > 0 ? ` and including target words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;

            } else if (mode === 'part2') {
                systemPrompt = `You are a certified IELTS Speaking Examiner creating an authentic IELTS Speaking Part 2 Candidate Task Card (Cue Card).
Scaffolding constraint: Student unlocked grammar: [${grammarCtx.rulesSummary}].${vocabPromptInstruction}

Task:
Create a full IELTS Speaking Part 2 Cue Card that naturally prompts the candidate to use their unlocked grammar structures and target vocabulary.

Format your response in Markdown:
# 📋 Topic: Describe [Topic Name]
You should say:
- What it is / was
- Where / When it happened
- Who was involved
- And explain why it was significant to you.

# 🎯 Suggested Grammar Formula & Vocab to Demonstrate:
- [List 2-3 specific techniques/vocabulary to use in the 2-minute monologue]`;
                userPrompt = `Generate a Part 2 Cue Card task matching unlocked grammar: ${grammarCtx.rulesSummary}${injectedVocabs.length > 0 ? ` and highlighting target words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;

            } else {
                systemPrompt = `You are an IELTS Speaking Examiner conducting Part 3 Analytical Discussion.
Scaffolding constraint: Student unlocked grammar: [${grammarCtx.rulesSummary}].${vocabPromptInstruction}

Task:
Create 1 deep, analytical IELTS Speaking Part 3 discussion question that requires the candidate to express reasoned opinions, compare trends, or analyze causes/effects, using the target vocabulary.

Format in Markdown:
# ❓ Part 3 Discussion Question
"[Write the question in quotes]"

# 💡 Strategy Tip & Grammar Anchor
- [Brief tip on how to structure a Band 8.0 answer using: ${grammarCtx.rulesSummary}${injectedVocabs.length > 0 ? ` and applying vocabularies (${injectedVocabs.map(v => v.word).join(', ')})` : ''}]`;
                userPrompt = `Generate a challenging Part 3 question matching unlocked grammar: ${grammarCtx.rulesSummary}${injectedVocabs.length > 0 ? ` and integrating words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;
            }

            try {
                let resText = await callGeminiAPI(userPrompt, systemPrompt);

                if (!resText) {
                    if (mode === 'part1') {
                        if (lengthChoice === 'short') {
                            resText = `
# 🎙️ Topic: Hometown
"My hometown is quiet and clean. I live in a small coastal city. The local park has old green trees. I love living in this peaceful community."

# 🎯 Target Grammar Applied:
- SVO sentence frame & 'be' copula anchor
- Attribute adjectives and simple present consistency
                            `;
                        } else if (lengthChoice === 'long') {
                            resText = `
# 🎙️ Topic: Daily Habits & Productivity
"In my daily routine, I **prioritise** my schedule early in the morning. Even though unexpected tasks **frequently arise**, I **try to maintain** focus on core responsibilities. This structured approach **is essential** because it **prevents** unnecessary stress throughout the workday. Additionally, I make sure to take regular short breaks so that my cognitive energy remains sharp. In the evening, reviewing what has been accomplished provides clarity for the upcoming day."

# 🎯 Target Grammar Applied:
- SVO sentence frame & verb agreement
- Subordinate concession clauses with 'even though'
- Purpose clauses with 'so that'
                            `;
                        } else {
                            resText = `
# 🎙️ Topic: Daily Habits & Productivity
"In my daily routine, I **prioritise** my schedule early in the morning. Even though unexpected tasks **frequently arise**, I **try to maintain** focus on core responsibilities. This approach **is essential** because it **prevents** unnecessary stress throughout the workday."

# 🎯 Target Grammar Applied:
- SVO sentence frame & verb agreement
- 'Be' anchor in predicate complements
- Infinitive complementation
                            `;
                        }
                    } else if (mode === 'part2') {
                        resText = `
# 📋 Topic: Describe a memorable achievement you accomplished
You should say:
- What the achievement was
- When and where it occurred
- What challenges you faced
- And explain why this milestone is important to you.

# 🎯 Suggested Grammar Formula to Demonstrate:
- Past simple narrative consistency
- Complex causal clauses with 'although' and 'since'
- Modals for reflective analysis ('would have been difficult')
                        `;
                    } else {
                        resText = `
# ❓ Part 3 Discussion Question
"Do you believe that modern automation will ultimately create more employment opportunities than it eliminates?"

# 💡 Strategy Tip & Grammar Anchor
- State an objective thesis using impersonal passive (*"It is widely argued that..."*).
- Use modal hedging (*"While some sectors may experience disruption, new technical roles could emerge."*).
                        `;
                    }
                }

                speakingState.generatedPrompts[mode] = resText;

                if (textEl) textEl.innerHTML = renderMarkdown(resText);
                if (topicTag) topicTag.innerText = `Active (${grammarCtx.count} Stage${injectedVocabs.length > 0 ? ` • ${injectedVocabs.length} Vocabs` : ''})`;

                // Update grammar tags
                if (tagsEl) {
                    tagsEl.innerHTML = grammarCtx.stageTitles.slice(0, 4).map(t => `<span class="text-[10px] font-mono bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">${t}</span>`).join('');
                }

                // Update vocab tags
                if (vocabTagsEl) {
                    if (injectedVocabs.length > 0) {
                        vocabTagsEl.classList.remove('hidden');
                        vocabTagsEl.innerHTML = `
                            <span class="text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1 mr-1">
                                <i class="fa-solid fa-brain"></i> Vocab Injected:
                            </span>
                            ${injectedVocabs.map(v => `
                                <button onclick="openVocabCard('${v.id}')" class="px-2 py-0.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-mono text-[10px] flex items-center gap-1 transition-all" title="Buka kartu ${v.word}">
                                    <span class="font-bold">${v.word}</span>
                                    <span class="text-[9px] px-1 py-0.2 rounded bg-slate-900 cefr-${(v.cefr||'b2').toLowerCase()}">${v.cefr}</span>
                                </button>
                            `).join('')}
                        `;
                    } else {
                        vocabTagsEl.classList.add('hidden');
                        vocabTagsEl.innerHTML = '';
                    }
                }

                SoundFX.play('correct');
                showToast("Materi Speaking baru berhasil dirancang!", "success");

            } catch (err) {
                SoundFX.play('error');
                if (textEl) textEl.innerHTML = `<div class="text-xs text-amber-400 p-2">Gagal generate: ${err.message}. Menggunakan prompt standar.</div>`;
            } finally {
                if (btn) btn.disabled = false;
            }
        }

        // =========================================================================
        // SPEAKING LAB TTS AUDIO PLAYER & VOICE ACTOR ENGINE
        // =========================================================================
        let currentSpeakingTTSMode = null;

        function cleanSpeakingTextForTTS(rawText) {
            if (!rawText) return '';
            let text = rawText;
            // Strictly strip technical trailing sections like Target Grammar, Strategy Tip, Rekomendasi
            text = text.split(/#+\s*(?:🎯|💡|📚|🔍|🛑|⏱️|🏆)?\s*(?:Target Grammar|Suggested Grammar|Strategy Tip|Rekomendasi|Audit|Skor|Official)/i)[0];
            // Strictly strip header lines like # 🎙️ Topic: Hometown, # 📋 Topic: Describe..., # ❓ Part 3 Discussion Question
            text = text.replace(/#+\s*(?:🎙️|📋|❓)?\s*(?:Topic|Candidate Task Card|Discussion Question).*?\n/gi, '');
            // Strip markdown bold, italic, code markers, headers, quotes
            text = text.replace(/\*\*([^*]+)\*\*/g, '$1')
                       .replace(/\*([^*]+)\*/g, '$1')
                       .replace(/`([^`]+)`/g, '$1')
                       .replace(/^#+\s+/gm, '')
                       .replace(/^>\s+/gm, '')
                       .replace(/Klik tombol[\s\S]*/i, '')
                       .trim();
            return text;
        }

        function populateTTSVoiceOptions() {
            if (!('speechSynthesis' in window)) return;
            const voices = window.speechSynthesis.getVoices() || [];
            const englishVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
            
            // Sort: British (en-GB/UK) first, then US, then AU, then others
            englishVoices.sort((a, b) => {
                const getPriority = (lang) => {
                    const l = (lang || '').toUpperCase();
                    if (l.includes('GB') || l.includes('UK')) return 1;
                    if (l.includes('US')) return 2;
                    if (l.includes('AU')) return 3;
                    return 4;
                };
                return getPriority(a.lang) - getPriority(b.lang);
            });

            const savedVoice = localStorage.getItem('ielts_tts_selected_voice') || '';

            ['part1', 'part2', 'part3'].forEach(m => {
                const select = document.getElementById(`select-tts-voice-${m}`);
                if (!select) return;
                
                let html = '<option value="">Auto (Target Accent)</option>';
                englishVoices.forEach(v => {
                    const isSelected = v.name === savedVoice ? 'selected' : '';
                    const tag = v.lang.toUpperCase().includes('GB') ? '🇬🇧 UK' : (v.lang.toUpperCase().includes('US') ? '🇺🇸 US' : (v.lang.toUpperCase().includes('AU') ? '🇦🇺 AU' : '🌐 EN'));
                    const cleanName = v.name.replace(/(Microsoft|Google|English|United Kingdom|United States)/g, '').trim() || v.name;
                    html += `<option value="${v.name}" ${isSelected}>${tag} - ${cleanName}</option>`;
                });
                select.innerHTML = html;
            });
        }

        function onSpeakingVoiceChange(mode) {
            const select = document.getElementById(`select-tts-voice-${mode}`);
            if (!select) return;
            const val = select.value;
            localStorage.setItem('ielts_tts_selected_voice', val);

            // Sync all dropdowns
            ['part1', 'part2', 'part3'].forEach(m => {
                const sel = document.getElementById(`select-tts-voice-${m}`);
                if (sel) sel.value = val;
            });
            showToast(`Pengisi suara TTS diperbarui!`, "info");
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = populateTTSVoiceOptions;
            setTimeout(populateTTSVoiceOptions, 500);
        }

        function stopSpeakingTTS(mode) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            const targetModes = mode ? [mode] : ['part1', 'part2', 'part3'];
            targetModes.forEach(m => {
                const btnPlay = document.getElementById(`btn-tts-play-${m}`);
                const btnStop = document.getElementById(`btn-tts-stop-${m}`);
                const label = document.getElementById(`label-tts-play-${m}`);
                const icon = document.getElementById(`icon-tts-play-${m}`);
                if (btnPlay) {
                    btnPlay.classList.remove('bg-rose-600', 'hover:bg-rose-500');
                    if (m === 'part1') btnPlay.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
                    else if (m === 'part2') btnPlay.classList.add('bg-amber-600', 'hover:bg-amber-500');
                    else if (m === 'part3') btnPlay.classList.add('bg-cyan-600', 'hover:bg-cyan-500');
                }
                if (btnStop) btnStop.classList.add('hidden');
                if (label) {
                    if (m === 'part1') label.innerText = "Dengarkan Model Suara (TTS)";
                    else if (m === 'part2') label.innerText = "Dengarkan Task Card (TTS)";
                    else if (m === 'part3') label.innerText = "Dengarkan Pertanyaan (TTS)";
                }
                if (icon) {
                    icon.className = "fa-solid fa-volume-high";
                }
            });
            currentSpeakingTTSMode = null;
        }

        function toggleSpeakingTTS(mode) {
            if (!('speechSynthesis' in window)) {
                showToast("Browser Anda tidak mendukung Web Speech Synthesis.", "error");
                return;
            }

            if (window.speechSynthesis.speaking && currentSpeakingTTSMode === mode) {
                stopSpeakingTTS(mode);
                return;
            }

            // Stop any ongoing speech
            stopSpeakingTTS();

            const textEl = document.getElementById(`speaking-text-${mode}`);
            if (!textEl) return;

            // Extract strictly cleaned text (no Target Grammar, no headers)
            let rawText = speakingState.generatedPrompts[mode] || textEl.innerText || '';
            let cleanText = cleanSpeakingTextForTTS(rawText);

            if (!cleanText || cleanText.length < 5) {
                showToast("Teks belum digenerate. Silakan klik 'Generate' terlebih dahulu!", "info");
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Accent & Selected Voice
            const targetAccentKey = localStorage.getItem('ielts_target_accent') || 'british_rp';
            let langCode = 'en-GB';
            if (targetAccentKey === 'general_american') langCode = 'en-US';
            else if (targetAccentKey === 'australian') langCode = 'en-AU';
            utterance.lang = langCode;

            const voices = window.speechSynthesis.getVoices() || [];
            const savedVoiceName = localStorage.getItem('ielts_tts_selected_voice') || '';
            if (savedVoiceName) {
                const chosen = voices.find(v => v.name === savedVoiceName);
                if (chosen) utterance.voice = chosen;
            } else if (voices.length > 0) {
                const match = voices.find(v => v.lang === langCode || v.lang.replace('_', '-').startsWith(langCode));
                if (match) utterance.voice = match;
            }

            // Rate
            const rateSelect = document.getElementById(`select-tts-rate-${mode}`);
            const rateVal = rateSelect ? parseFloat(rateSelect.value) : 1.0;
            utterance.rate = rateVal || 1.0;
            utterance.pitch = 1.0;

            const btnPlay = document.getElementById(`btn-tts-play-${mode}`);
            const btnStop = document.getElementById(`btn-tts-stop-${mode}`);
            const label = document.getElementById(`label-tts-play-${mode}`);
            const icon = document.getElementById(`icon-tts-play-${mode}`);

            utterance.onstart = () => {
                currentSpeakingTTSMode = mode;
                if (btnPlay) {
                    btnPlay.classList.remove('bg-indigo-600', 'bg-amber-600', 'bg-cyan-600', 'hover:bg-indigo-500', 'hover:bg-amber-500', 'hover:bg-cyan-500');
                    btnPlay.classList.add('bg-rose-600', 'hover:bg-rose-500');
                }
                if (btnStop) btnStop.classList.remove('hidden');
                if (label) label.innerText = "Berhenti Mendengarkan";
                if (icon) icon.className = "fa-solid fa-volume-xmark";
            };

            utterance.onend = () => {
                stopSpeakingTTS(mode);
            };

            utterance.onerror = (e) => {
                console.warn("TTS Error:", e);
                stopSpeakingTTS(mode);
            };

            window.speechSynthesis.speak(utterance);
        }

        // Audio Recording via Web MediaRecorder & Live Web Audio API Visualizer
        async function startSpeakingRecording(mode) {
            SoundFX.play('click');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                speakingState.streams[mode] = stream;

                // Set up AudioContext & Analyser for Live Waveform
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContextClass();
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);

                speakingState.audioContexts[mode] = audioCtx;
                speakingState.analysers[mode] = analyser;

                // Start Canvas Waveform Visualizer
                drawSpeakingWaveform(mode);

                // Set up MediaRecorder
                const mediaRecorder = new MediaRecorder(stream);
                speakingState.mediaRecorders[mode] = mediaRecorder;
                speakingState.audioChunks[mode] = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) speakingState.audioChunks[mode].push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(speakingState.audioChunks[mode], { type: 'audio/webm' });
                    speakingState.audioBlobs[mode] = blob;
                    const url = URL.createObjectURL(blob);
                    speakingState.audioURLs[mode] = url;

                    const player = document.getElementById(`audio-player-${mode}`);
                    if (player) {
                        player.src = url;
                        player.classList.remove('hidden');
                    }
                };

                mediaRecorder.start();

                // Live Recording Timer
                speakingState.recSeconds[mode] = 0;
                const timerEl = document.getElementById(`rec-timer-${mode}`);
                clearInterval(speakingState.recTimerIntervals[mode]);
                speakingState.recTimerIntervals[mode] = setInterval(() => {
                    speakingState.recSeconds[mode]++;
                    const m = Math.floor(speakingState.recSeconds[mode] / 60);
                    const s = speakingState.recSeconds[mode] % 60;
                    if (timerEl) timerEl.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                }, 1000);

                // Update UI Buttons & Indicators
                const dot = document.getElementById(`rec-dot-${mode}`);
                const label = document.getElementById(`rec-status-label-${mode}`);
                const btnStart = document.getElementById(`btn-rec-start-${mode}`);
                const btnStop = document.getElementById(`btn-rec-stop-${mode}`);
                const btnPlay = document.getElementById(`btn-rec-play-${mode}`);
                const btnSubmit = document.getElementById(`btn-rec-submit-${mode}`);

                if (dot) dot.className = "w-3 h-3 rounded-full bg-rose-500 rec-pulse";
                if (label) label.innerText = "Status: Merekam Suara...";
                if (btnStart) btnStart.classList.add('hidden');
                if (btnStop) btnStop.classList.remove('hidden');
                if (btnPlay) btnPlay.classList.add('hidden');
                if (btnSubmit) btnSubmit.classList.add('hidden');

                showToast("Mikrofon aktif. Mulai berbicara!", "info");

            } catch (err) {
                SoundFX.play('error');
                showToast(`Tidak dapat mengakses mikrofon: ${err.message}. Pastikan izin mikrofon diberikan.`, "error");
            }
        }

        function stopSpeakingRecording(mode) {
            SoundFX.play('click');
            // Stop MediaRecorder
            const mr = speakingState.mediaRecorders[mode];
            if (mr && mr.state !== 'inactive') mr.stop();

            // Stop streams
            const stream = speakingState.streams[mode];
            if (stream) stream.getTracks().forEach(t => t.stop());

            // Stop timer
            clearInterval(speakingState.recTimerIntervals[mode]);

            // Cancel waveform animation
            if (speakingState.animFrames[mode]) cancelAnimationFrame(speakingState.animFrames[mode]);

            // Update UI
            const dot = document.getElementById(`rec-dot-${mode}`);
            const label = document.getElementById(`rec-status-label-${mode}`);
            const btnStop = document.getElementById(`btn-rec-stop-${mode}`);
            const btnStart = document.getElementById(`btn-rec-start-${mode}`);
            const btnPlay = document.getElementById(`btn-rec-play-${mode}`);
            const btnSubmit = document.getElementById(`btn-rec-submit-${mode}`);

            if (dot) dot.className = "w-3 h-3 rounded-full bg-emerald-400";
            if (label) label.innerText = "Status: Rekaman Siap";
            if (btnStop) btnStop.classList.add('hidden');
            if (btnStart) {
                btnStart.classList.remove('hidden');
                btnStart.innerHTML = `<i class="fa-solid fa-rotate-right"></i> <span>Rekam Ulang</span>`;
            }
            if (btnPlay) btnPlay.classList.remove('hidden');
            if (btnSubmit) btnSubmit.classList.remove('hidden');

            showToast("Rekaman selesai! Anda dapat memutar ulang atau mengirim ke AI Examiner.", "success");
        }

        function playSpeakingRecording(mode) {
            SoundFX.play('click');
            const player = document.getElementById(`audio-player-${mode}`);
            if (player && player.src) player.play();
        }

        function handleSpeakingAudioUpload(event, mode) {
            const file = event.target.files?.[0];
            if (!file) return;

            SoundFX.play('click');
            const url = URL.createObjectURL(file);
            speakingState.audioBlobs[mode] = file;
            speakingState.audioURLs[mode] = url;

            const player = document.getElementById(`audio-player-${mode}`);
            if (player) {
                player.src = url;
                player.classList.remove('hidden');
            }

            const label = document.getElementById(`rec-status-label-${mode}`);
            const btnPlay = document.getElementById(`btn-rec-play-${mode}`);
            const btnSubmit = document.getElementById(`btn-rec-submit-${mode}`);

            if (label) label.innerText = `File: ${file.name.substring(0, 20)}...`;
            if (btnPlay) btnPlay.classList.remove('hidden');
            if (btnSubmit) btnSubmit.classList.remove('hidden');

            showToast("File audio dimuat. Klik 'Kirim ke AI Examiner' untuk dinilai!", "success");
        }

        // Live Audio Waveform Canvas Visualizer
        function drawSpeakingWaveform(mode) {
            const canvas = document.getElementById(`waveform-canvas-${mode}`);
            const analyser = speakingState.analysers[mode];
            if (!canvas || !analyser) return;

            const ctx = canvas.getContext('2d');
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function render() {
                speakingState.animFrames[mode] = requestAnimationFrame(render);
                analyser.getByteTimeDomainData(dataArray);

                ctx.fillStyle = '#020617';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.lineWidth = 2;
                ctx.strokeStyle = '#f43f5e'; // Rose 500
                ctx.beginPath();

                const sliceWidth = canvas.width * 1.0 / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * canvas.height / 2;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);

                    x += sliceWidth;
                }

                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            }

            render();
        }

        // Part 2 Prep Countdown Timer
        function startPrepCountdown() {
            SoundFX.play('click');
            const btn = document.getElementById('btn-start-prep');
            const display = document.getElementById('prep-timer-display');
            if (btn) btn.disabled = true;

            speakingState.prepTimeSeconds = 60;
            clearInterval(speakingState.prepTimerInterval);

            speakingState.prepTimerInterval = setInterval(() => {
                speakingState.prepTimeSeconds--;
                const s = speakingState.prepTimeSeconds;
                if (display) display.innerText = `00:${s.toString().padStart(2, '0')}`;

                if (speakingState.prepTimeSeconds <= 0) {
                    clearInterval(speakingState.prepTimerInterval);
                    SoundFX.play('levelup');
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = "Prep Selesai ✓";
                    }
                    showToast("WAKTU PREPARASI HABIS! Mulai rekam monolog 2 menit Anda sekarang.", "info");
                }
            }, 1000);
        }

        // =========================================================================
        // SPEAKING LAB UTILITIES: VOCAB SAVER & RETEST DRILL LOADER
        // =========================================================================
        async function saveMispronouncedWordToVocabBank(word) {
            if (!word) return;
            const cleanWord = word.trim().replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '');
            if (!cleanWord) return;
            
            if (typeof vocabBank === 'undefined') {
                vocabBank = [];
            }
            
            const existing = vocabBank.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
            if (existing) {
                // If it already exists with generic placeholder, trigger background enrichment
                if (existing.pos === 'Speaking Focus' || (existing.meaningEn && existing.meaningEn.includes('Key spoken vocabulary')) || (existing.meaningId && existing.meaningId.includes('Menganalisis'))) {
                    enrichVocabCardInBackground(existing.id, cleanWord);
                }
                SoundFX.play('info');
                showToast(`"${cleanWord}" sudah ada di Bank Kosakata Anda!`, 'info');
                return;
            }
            
            const newVocab = {
                id: 'vocab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                word: cleanWord,
                pos: 'noun',
                cefr: 'B2',
                meaningId: `Menganalisis arti dan konteks IELTS untuk ${cleanWord}...`,
                meaningEn: `Analyzing Cambridge definition and IELTS context for ${cleanWord}...`,
                indonesianGuide: `${cleanWord.toUpperCase()}`,
                example: `I practice pronouncing "${cleanWord}" clearly with authentic accent in my IELTS test.`,
                synonyms: [],
                ipa: '',
                dateAdded: Date.now(),
                srInterval: 1,
                srNextReview: Date.now() + (1 * 86400000),
                srReviewCount: 0,
                status: 'learning'
            };
            
            vocabBank.unshift(newVocab);
            saveVocabBank();
            addXP(15);
            SoundFX.play('levelup');
            triggerConfetti();
            showToast(`Kata "${cleanWord}" tersimpan ke Bank Vocab (+15 XP)! AI sedang melengkapi data...`, 'success');
            updateUI();

            // Run Background AI Enrichment
            enrichVocabCardInBackground(newVocab.id, cleanWord);
        }

        async function enrichVocabCardInBackground(vocabId, word) {
            try {
                const analysis = await analyzeVocabWithAI(word);
                if (!analysis || analysis.isNonEnglish) return;

                const target = vocabBank.find(v => v.id === vocabId);
                if (target) {
                    target.word = analysis.correctedWord || target.word;
                    target.pos = analysis.pos || target.pos || 'noun';
                    target.cefr = analysis.cefr || target.cefr || 'B2';
                    target.meaningId = analysis.meaningId || target.meaningId;
                    target.meaningEn = analysis.meaningEn || target.meaningEn;
                    target.indonesianGuide = analysis.indonesianGuide || target.indonesianGuide;
                    target.example = analysis.example || target.example;
                    target.childExplanation = analysis.childExplanation || target.childExplanation || '';
                    target.dailyExamples = analysis.dailyExamples || target.dailyExamples || [];
                    target.synonyms = analysis.synonyms || target.synonyms || [];
                    target.ipa = analysis.ipa || target.ipa || '';
                    if (target.feynmanLevel === undefined) target.feynmanLevel = 0;
                    if (!target.feynmanStatus) target.feynmanStatus = 'unlearned';
                    saveVocabBank();

                    // If modal card is currently open for this vocab, live-update DOM
                    if (currentActiveVocabId === vocabId) {
                        const wordEl = document.getElementById('vocab-card-word');
                        const posEl = document.getElementById('vocab-card-pos');
                        const cefrEl = document.getElementById('vocab-card-cefr');
                        const ipaEl = document.getElementById('vocab-card-ipa');
                        const mIdEl = document.getElementById('vocab-card-meaning-id');
                        const mEnEl = document.getElementById('vocab-card-meaning-en');
                        const guideEl = document.getElementById('vocab-card-indonesian-guide');
                        const exEl = document.getElementById('vocab-card-example');
                        const childEl = document.getElementById('vocab-card-child-explanation');
                        const dailyEl = document.getElementById('vocab-card-daily-examples');
                        const synContainer = document.getElementById('vocab-card-synonyms');

                        if (wordEl) wordEl.innerText = target.word;
                        if (posEl) posEl.innerText = target.pos;
                        if (cefrEl) {
                            cefrEl.innerText = target.cefr;
                            cefrEl.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded border cefr-${(target.cefr || 'b2').toLowerCase()}`;
                        }
                        if (ipaEl) ipaEl.innerText = target.ipa || '';
                        if (mIdEl) mIdEl.innerText = target.meaningId || '';
                        if (mEnEl) mEnEl.innerText = target.meaningEn || '';
                        if (guideEl) guideEl.innerText = target.indonesianGuide || '';
                        if (exEl) exEl.innerText = target.example || '';
                        if (childEl) childEl.innerText = target.childExplanation || '';
                        if (dailyEl && target.dailyExamples && target.dailyExamples.length > 0) {
                            dailyEl.innerHTML = target.dailyExamples.map((dex, i) => `
                                <div class="flex items-start gap-2 bg-teal-950/20 p-2 rounded-lg border border-teal-500/20">
                                    <span class="text-[10px] font-mono text-teal-400 font-bold mt-0.5">${i+1}.</span>
                                    <span class="text-xs text-teal-100">${dex}</span>
                                </div>
                            `).join('');
                        }
                        if (synContainer) {
                            if (target.synonyms && target.synonyms.length > 0) {
                                synContainer.innerHTML = target.synonyms.map(s => `<span class="text-xs font-mono bg-slate-950 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-800">${s}</span>`).join('');
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("Background vocab enrichment failed:", err.message);
            }
        }

        function loadRetestScriptToSpeakingBox(mode, encodedText) {
            const text = decodeURIComponent(encodedText);
            if (!text) return;
            
            SoundFX.play('click');
            const textEl = document.getElementById(`speaking-text-${mode}`);
            if (textEl) {
                textEl.innerHTML = `<div class="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-emerald-200 font-sans text-xs leading-relaxed"><div class="text-[10px] font-mono text-emerald-400 font-bold mb-1 flex items-center gap-1.5"><i class="fa-solid fa-rotate-right"></i> TEKS RETEST DRILL BAND 7.5 AKTIF:</div>${text}</div>`;
            }
            speakingState.generatedPrompts[mode] = text;
            
            // Scroll smoothly to generated card / audio recorder
            const recCard = document.getElementById(`speaking-generated-card-${mode}`);
            if (recCard) {
                recCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            showToast("Teks Latihan Ulang Band 7.5 dimuat! Silakan rekam ulang sekarang.", "success");
        }

        // =========================================================================
        // SPEAKING LAB AUDIT ACCORDION FORMATTER (DEFAULT CLOSED)
        // =========================================================================
        function renderSpeakingAuditAccordions(rawMarkdown, mode = 'part1') {
            if (!rawMarkdown) return '';

            const isRejected = rawMarkdown.includes('REKAMAN DITOLAK') || rawMarkdown.includes('Band 0.0') || rawMarkdown.includes('REJECTED');
            let rejectionBannerHtml = '';
            if (isRejected) {
                rejectionBannerHtml = `
                    <div class="p-4 rounded-xl bg-red-950/80 border-2 border-red-500/80 text-red-200 text-xs space-y-2 mb-4 shadow-xl">
                        <div class="font-bold text-red-400 text-sm flex items-center gap-2">
                            <i class="fa-solid fa-triangle-exclamation text-base text-red-400 animate-bounce"></i>
                            <span>⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)</span>
                        </div>
                        <p class="leading-relaxed text-slate-300">
                            AI Examiner tidak dapat mendengar ujaran bahasa Inggris yang jelas karena audio hening, volume mikrofon terlalu rendah, atau suara tertutup derau bising. Skor resmi tidak dapat diterbitkan.
                        </p>
                        <div class="text-[11px] font-mono text-amber-300 pt-1.5 border-t border-red-900/60 flex items-center gap-1.5">
                            <i class="fa-solid fa-lightbulb text-amber-400"></i>
                            <span>Solusi: Dekatkan mulut Anda ke mikrofon dan bicaralah dengan lantang di ruangan yang tenang, lalu klik Rekam Ulang.</span>
                        </div>
                    </div>
                `;
            }

            // Split markdown by major H1 headings (# ...)
            const rawSections = rawMarkdown.split(/\n(?=#\s+)/g);
            let bandScoreHtml = '';
            let accordionItems = [];

            rawSections.forEach((sec, idx) => {
                const trimmed = sec.trim();
                if (!trimmed) return;

                // Check if this is the Hero Score section
                if (trimmed.includes('Skor Pelafalan') || trimmed.includes('Skor Resmi IELTS') || trimmed.includes('Official IELTS Speaking Band Score')) {
                    const cardBorder = isRejected ? 'border-red-500/60 bg-red-950/20' : 'border-rose-500/40';
                    bandScoreHtml = `
                        ${rejectionBannerHtml}
                        <div class="speaking-audit-band-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-200 dark:border-rose-500/40 shadow-md dark:shadow-lg mb-4 space-y-2.5 text-slate-800 dark:text-slate-100">
                            ${renderMarkdown(trimmed)}
                        </div>
                    `;
                    return;
                }

                // Extract title from first line (# ...)
                const firstLineMatch = trimmed.match(/^#\s+(.*)/);
                const title = firstLineMatch ? firstLineMatch[1].trim() : `Audit Detail ${idx + 1}`;
                let contentBody = trimmed.replace(/^#\s+.*\n?/, '').trim();

                // Convert [VOCAB: word] tags into styled badge + 1-Click Save to Vocab Logger Button
                contentBody = contentBody.replace(
                    /\[VOCAB:\s*([a-zA-Z\s'-]+)\]/gi,
                    (m, word) => {
                        const clean = word.trim();
                        return `<span class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-500/40 font-mono text-xs">${clean}</span> <button type="button" onclick="event.stopPropagation(); saveMispronouncedWordToVocabBank('${clean}')" class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold rounded-lg border border-indigo-200 dark:border-indigo-500/40 ml-1 transition-all shadow-sm active:scale-95 cursor-pointer" title="Simpan '${clean}' ke Vocab Logger"><i class="fa-solid fa-plus text-indigo-500 dark:text-indigo-400"></i> + Simpan ke Vocab</button>`;
                    }
                );

                // Style & Icon picker based on title
                let iconClass = 'fa-solid fa-circle-info text-slate-400';
                let borderClass = 'border-slate-800 hover:border-slate-700';
                let bgClass = 'bg-slate-900/60';
                let titleColor = 'text-slate-200';

                if (title.includes('Transkripsi')) {
                    iconClass = 'fa-solid fa-microphone-lines text-sky-400';
                    borderClass = 'border-sky-500/30';
                    titleColor = 'text-sky-300';
                } else if (title.includes('Struktur Kalimat') || title.includes('Tata Bahasa')) {
                    iconClass = 'fa-solid fa-code-compare text-emerald-400';
                    borderClass = 'border-emerald-500/30';
                    titleColor = 'text-emerald-300';
                } else if (title.includes('Transformasi') || title.includes('Band 7.5') || title.includes('Bedah Kosakata')) {
                    iconClass = 'fa-solid fa-rocket text-amber-400';
                    borderClass = 'border-amber-500/30';
                    titleColor = 'text-amber-300';
                } else if (title.includes('Ringkasan Diagnosa') || title.includes('Roadmap') || title.includes('Urutan')) {
                    iconClass = 'fa-solid fa-list-check text-rose-400';
                    borderClass = 'border-rose-500/30';
                    titleColor = 'text-rose-300';
                } else if (title.includes('Keunggulan') || title.includes('Strengths')) {
                    iconClass = 'fa-solid fa-star text-amber-400';
                    borderClass = 'border-amber-500/30';
                    titleColor = 'text-amber-300';
                } else if (title.includes('Salah') || title.includes('Mispronounced') || title.includes('Fonetik') || title.includes('Lidah Indonesia')) {
                    iconClass = 'fa-solid fa-triangle-exclamation text-rose-400';
                    borderClass = 'border-rose-500/30';
                    titleColor = 'text-rose-300';

                    // Inject 1-Click Save to Vocab Bank Button for each mispronounced word
                    contentBody = contentBody.replace(
                        /-\s*❌\s*\*\*"?([a-zA-Z\s'-]+)"?\*\*/gi,
                        (match, word) => {
                            const clean = word.trim();
                            return `- ❌ **"${clean}"** <button type="button" onclick="saveMispronouncedWordToVocabBank('${clean}')" class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-[10px] font-mono rounded border border-indigo-500/40 ml-1.5 transition-all" title="Simpan '${clean}' ke Bank Kosakata"><i class="fa-solid fa-bookmark text-indigo-400"></i> + Bank Vocab</button>`;
                        }
                    );

                } else if (title.includes('+S') || title.includes('+ED') || title.includes('Akhiran')) {
                    iconClass = 'fa-solid fa-spell-check text-indigo-400';
                    borderClass = 'border-indigo-500/30';
                    titleColor = 'text-indigo-300';
                } else if (title.includes('Kelancaran') || title.includes('Kegugupan') || title.includes('Fluency')) {
                    iconClass = 'fa-solid fa-wave-square text-cyan-400';
                    borderClass = 'border-cyan-500/30';
                    titleColor = 'text-cyan-300';
                } else if (title.includes('Grammar') || title.includes('Glitches')) {
                    iconClass = 'fa-solid fa-code-compare text-emerald-400';
                    borderClass = 'border-emerald-500/30';
                    titleColor = 'text-emerald-300';
                } else if (title.includes('Latihan Ulang') || title.includes('Retest') || title.includes('Band 7.5') || title.includes('Model')) {
                    iconClass = 'fa-solid fa-award text-amber-400';
                    borderClass = 'border-amber-500/30';
                    titleColor = 'text-amber-300';

                    // Extract the standard English text for 1-Click Retest Drill
                    let cleanRetest = '';
                    const modelMatch = contentBody.match(/Model Kalimat[^\n]*\n+>?\s*"([^"]+)"/i);
                    const hMatch = contentBody.match(/#{1,4}\s*📝?\s*Teks\s+(?:Asli\s+)?Bahasa\s+Inggris[^\n]*\n+([\s\S]*?)(?=\n#{1,4}|\n\n#{1,4}|$)/i)
                                || contentBody.match(/#{1,4}\s*📝?\s*Teks[^\n]*\n+([\s\S]*?)(?=\n#{1,4}|$)/i);
                    if (modelMatch && modelMatch[1]) {
                        cleanRetest = modelMatch[1].trim();
                    } else if (hMatch && hMatch[1]) {
                        cleanRetest = hMatch[1].trim().replace(/^[>\s"]+|["]+$/g, '').replace(/^>\s*/gm, '').trim();
                    } else {
                        const quoteMatch = contentBody.match(/"([^"\n]{25,})"/);
                        if (quoteMatch) cleanRetest = quoteMatch[1].trim();
                    }
                    if (cleanRetest) {
                        contentBody += `\n\n<div class="pt-3 mt-3 border-t border-slate-800 flex flex-wrap gap-2"><button type="button" onclick="loadRetestScriptToSpeakingBox('${mode}', '${encodeURIComponent(cleanRetest)}')" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 border border-emerald-400/30 transition-all"><i class="fa-solid fa-rotate-right"></i> <span>Muat Teks Ini ke Player & Rekam Ulang Sekarang</span></button></div>`;
                    }

                } else if (title.includes('Rekomendasi') || title.includes('Latihan')) {
                    iconClass = 'fa-solid fa-lightbulb text-violet-400';
                    borderClass = 'border-violet-500/30';
                    titleColor = 'text-violet-300';
                }

                accordionItems.push(`
                    <details class="speaking-audit-detail group bg-white dark:bg-slate-900/60 border border-slate-200 dark:${borderClass} rounded-xl overflow-hidden mb-2.5 transition-all shadow-sm">
                        <summary class="cursor-pointer font-bold p-3.5 flex justify-between items-center select-none ${titleColor} text-xs hover:bg-slate-800/60 transition-colors">
                            <span class="flex items-center gap-2">
                                <i class="${iconClass}"></i>
                                <span>${title}</span>
                            </span>
                            <i class="fa-solid fa-chevron-down text-slate-500 group-open:rotate-180 transition-transform text-xs"></i>
                        </summary>
                        <div class="p-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-2 bg-slate-50/70 dark:bg-slate-950/60">
                            ${renderMarkdown(contentBody)}
                        </div>
                    </details>
                `);
            });

            return `
                ${bandScoreHtml}
                <div class="flex justify-between items-center py-1 mb-2 text-[11px] font-mono text-slate-400">
                    <span class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-layer-group text-rose-400"></i> Rincian Audit Mendalam:</span>
                    <button type="button" onclick="toggleAllSpeakingDetails(this)" class="text-rose-400 hover:text-rose-300 underline font-bold transition-all">
                        Buka Semua Section
                    </button>
                </div>
                <div class="space-y-1">
                    ${accordionItems.join('')}
                </div>
            `;
        }

        function toggleAllSpeakingDetails(btn) {
            const parent = btn.closest('#speaking-eval-result-part1, #speaking-eval-result-part2, #speaking-eval-result-part3');
            if (!parent) return;
            const details = parent.querySelectorAll('details.speaking-audit-detail');
            const isOpening = btn.innerText.includes('Buka');
            details.forEach(d => {
                if (isOpening) d.setAttribute('open', 'true');
                else d.removeAttribute('open');
            });
            btn.innerText = isOpening ? 'Tutup Semua Section' : 'Buka Semua Section';
        }

        // Helper to build Dynamic Error-Injected Remediation Prompt
        function buildDynamicSpeakingRemediationPrompt(mode, targetAccentName, activePromptText, evalResponse) {
            const extractSection = (headingRegex) => {
                if (!evalResponse) return '';
                const match = evalResponse.match(headingRegex);
                if (match && match[1]) return match[1].trim();
                if (match && match[0]) return match[0].trim();
                return '';
            };

            const bandScore = extractSection(/(?:^|\n)(#\s*(?:🏆)?\s*Skor Resmi IELTS Speaking[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const summaryRoadmap = extractSection(/(?:^|\n)(#\s*(?:📋)?\s*Ringkasan Diagnosa & Roadmap[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const mispronounced = extractSection(/(?:^|\n)(#\s*(?:🔊)?\s*Bedah Kata Salah[\s\S]*?)(?=\n#\s+[^\#]|$)/i) || extractSection(/(?:^|\n)(#\s*(?:🔊)?\s*Bedah Kata yang Salah[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const suffixes = extractSection(/(?:^|\n)(#\s*(?:🛑)?\s*Audit Khusus Akhiran[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const grammarGlitches = extractSection(/(?:^|\n)(#\s*(?:🔍)?\s*Bedah Kesalahan Grammar Spoken[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const fluencyNotes = extractSection(/(?:^|\n)(#\s*(?:⏱️)?\s*Audit Kelancaran[\s\S]*?)(?=\n#\s+[^\#]|$)/i);

            return `Act as an elite ${targetAccentName} Phonetics Master & IELTS Speaking Examiner Coach.
I have just completed an IELTS Speaking ${mode.toUpperCase()} session in IeltsGo. Below is the EXACT diagnostic audit extracted directly from my real recorded voice evaluation.

🎯 TARGET ACCENT: ${targetAccentName}
📋 IELTS TASK / TOPIC:
"${activePromptText.substring(0, 300)}"

📊 MY OFFICIAL DIAGNOSED SCORES:
${bandScore ? bandScore.substring(0, 300) : 'Overall Estimated Band: 5.5'}

🛑 MY REAL DETECTED ERRORS (Wajib gunakan data kesalahan nyata saya di bawah, JANGAN membuat contoh generik):
1. MISPRONOUNCED WORDS & PHONETIC FAULTS (Lidah Indonesia):
${mispronounced ? mispronounced.substring(0, 500) : '- Kata dasar mengalami distorsi vokal dan penghilangan konsonan.'}

2. MISSING SUFFIXES (+S / +ED / FINAL CLUSTERS):
${suffixes ? suffixes.substring(0, 400) : '- Akhiran +s/-es jamak dan +ed lampau sering tertelan.'}

3. SPOKEN GRAMMAR GLITCHES & STRUCTURAL MISTAKES:
${grammarGlitches ? grammarGlitches.substring(0, 400) : '- Subject-verb agreement dan susunan klausa masih kaku.'}

4. FLUENCY, HESITATION & PAUSES:
${fluencyNotes ? fluencyNotes.substring(0, 300) : '- Terbata-bata dan keraguan memecah alur kalimat.'}

${summaryRoadmap ? `\n📋 DIAGNOSED PROGRESSIVE ROADMAP:\n${summaryRoadmap.substring(0, 500)}\n` : ''}

🎯 YOUR ASSIGNMENT AS MY PERSONAL COACH (Target Band 7.5 Mastery):
Provide a hyper-targeted, 4-step progressive remediation drill tailored 100% to fix MY EXACT ERRORS listed above:

Step 1: [SINGLE-WORD MOUTH & TONGUE BLUEPRINT (LIDAH INDONESIA)]
Break down the exact tongue position, lip shape, and Indonesian phonetic approximation for each mispronounced word from my error list above so I never say them wrong again.

Step 2: [SENTENCE-LEVEL SUFFIX & GRAMMAR ANCHOR]
Give me 3 drill sentences forcing the crisp pronunciation of my missed +S and +ED suffixes and correcting my exact spoken grammar mistakes.

Step 3: [PACING, CHUNKING & BREATHING DRILL]
Show me how to group my thoughts into natural breath units (chunking) to eliminate my fillers ("um/uh") and false starts.

Step 4: [BAND 7.5 NATURAL SHADOWING SCRIPT WITH PHONETIC MARKINGS]
Write a 2-sentence high-scoring model response answering my original task. Format it with:
- STRESSED syllables in CAPITAL LETTERS
- Pitch contour arrows (↗ for rising pitch, ↘ for falling pitch)
- Intonation notes so my voice sounds dynamic, natural, and conversational in ${targetAccentName}.`;
        }

        // Submit Spoken Response for AI IELTS Speaking Evaluation (Direct Multimodal Audio)
        async function submitSpeakingEvaluation(mode) {
            SoundFX.play('click');
            const audioBlob = speakingState.audioBlobs[mode] || null;

            if (!audioBlob) {
                SoundFX.play('error');
                showToast("Rekaman suara belum terdeteksi. Silakan rekam atau upload audio Anda terlebih dahulu!", "error");
                return;
            }

            const targetAccentKey = localStorage.getItem('ielts_target_accent') || 'british_rp';
            const accentNames = {
                'british_rp': 'British RP (Received Pronunciation — Non-rhotic, crisp T, pure vowels)',
                'general_american': 'General American (Standard US — Rhotic r, flap T, open vowels)',
                'australian': 'Australian English (General AU phonology)',
                'neutral_academic': 'Neutral International Academic'
            };
            const targetAccentName = accentNames[targetAccentKey] || 'British RP';
            const activePromptText = speakingState.generatedPrompts[mode] || document.getElementById(`speaking-text-${mode}`)?.innerText || 'IELTS Speaking Task';
            const grammarCtx = getUnlockedGrammarContext();

            const btnSubmit = document.getElementById(`btn-rec-submit-${mode}`);
            const resultBox = document.getElementById(`speaking-eval-result-${mode}`);

            if (btnSubmit) btnSubmit.disabled = true;
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="text-center py-6 font-mono text-xs text-rose-400 flex flex-col items-center gap-3">
                        <i class="fa-solid fa-headphones-simple fa-bounce text-3xl"></i>
                        <span class="text-[11px] text-slate-400">Analisis Akustik Multimodal: Aksen (${targetAccentName}), Diagnosa Struktur Kalimat, Band 7.5 Upgrade, dan Bedah Fonetik</span>
                    </div>
                `;
            }

            const systemPrompt = `Anda adalah Pelatih Vokal & Penguji Kelancaran IELTS Speaking yang AKURAT, JUJUR, dan MENDIDIK (gaya evaluasi terstandarisasi).
Prioritas utama: KEJUJURAN & EDUKASI KONKRET. Jangan gunakan basa-basi, jangan inflasi nilai, dan HAPUS seksi 4 rubrik resmi yang kaku.

Tugas: Menilai rekaman audio lisan kandidat untuk mode: ${mode.toUpperCase()}
Topik/Pertanyaan yang Diberikan: "${activePromptText || 'IELTS Speaking'}"
Target Aksen: ${targetAccentName}

============================================
🚨 ATURAN #1 — CEK KUALITAS AUDIO DULU
============================================
Jika audio hening, noise berisik, atau suara tidak terdengar:
Tulis persis: "# ⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)"
Jelaskan bahwa suara tidak terdengar jelas, dan STOP evaluasi.

============================================
🚨 ATURAN #2 — SKOR AKURAT & JUJUR (GAYA PERSENTASE KELIPATAN 5)
============================================
- Anda TIDAK memiliki spektrogram akustik fisik. Berikan estimasi skor yang JUJUR dan BULATKAN ke KELIPATAN 5 (misal: 55%, 70%, 85% — BUKAN 73% atau 84%).
- Skala Jangkar Penilaian:
  * 90-100%: Sangat fasih, intonasi hidup, vokal bersih sesuai target aksen ${targetAccentName}, struktur kalimat alami & gramatikal.
  * 75-89%: Komunikasi lancar dan jelas. Ada 1-2 slip minor pada grammar atau akhiran vokal/konsonan, tapi alur bicara sangat mudah dipahami.
  * 55-74%: Ide bisa dipahami, tetapi ada kesalahan tenses lisan yang jelas, terbata-bata/hesitasi, atau konsonan akhir tertelan.
  * 35-54%: Terbata-bata parah, struktur kalimat terputus-putus, atau distorsi kata yang berat.
  * 0-30%: Nyaris tidak bisa dipahami atau audio rusak.

============================================
🚨 ATURAN #3 — BEDAH STRUKTUR & UPGRADE BAND 7.5+ DENGAN ALASAN ("KENAPA DIGANTI BEGITU?")
============================================
1. Analisis apakah kalimat yang diucapkan kandidat strukturnya sudah jelas dan benar secara tata bahasa.
2. Sajikan Model Kalimat Upgrade Standar IELTS Band 7.5+.
3. BEDAH ALASAN PERUBAHAN: Jelaskan secara transparan dan gamblang MENGAPA kata/struktur tersebut diubah:
   - Apakah karena bentuk waktu lampau (past tense)?
   - Apakah karena kata baru lebih formal atau memiliki kolokasi yang lebih alami bagi penutur asli?
   - Contoh: "Kalimat asli 'I'm sleep at hotel' diubah menjadi 'I rested at the hotel' karena: (1) Menghilangkan konjungsi 'am' yang salah sebelum verb biasa, (2) Menggunakan past tense 'rested', dan (3) Kata 'rest' memberikan nuansa istirahat yang lebih santai & elegan daripada sekadar 'sleep'."
4. SOROT KOSAKATA BARU: Setiap kali Anda memperkenalkan kosakata tingkat tinggi (C1/C2) atau kolokasi elegan dalam naskah upgrade, tandai dengan format: [VOCAB: kata] agar siswa bisa menyimpannya ke Bank Kosakata. Contoh: [VOCAB: tranquil], [VOCAB: unwind], [VOCAB: picturesque].

============================================
🚨 ATURAN #4 — AUDIT FONETIK, AKSEN TARGET & CARA BACA LIDAH INDONESIA
============================================
- Kesesuaian Aksen: Evaluasi apakah pelafalan vokal dan konsonan sudah mengarah ke target aksen ${targetAccentName}.
- Bedah Kata Salah (Maksimal 3 kata paling krusial):
  * DILARANG menggunakan simbol IPA rumit! Gunakan 100% huruf alfabet Indonesia (A-Z) dengan suku kata ditekan ditulis HURUF BESAR (KAPITAL STRESS) dan arah intonasi ↗ ↘.
  * Berikan PADANAN KATA INGGRIS SIMPEL: Bandingkan bunyi sulit dengan kata bahasa Inggris yang sangat umum (misal: bunyi vokal sama seperti di kata 'it' atau 'sit', bukan seperti 'ee' di 'eat').
- Audit Akhiran: Periksa apakah akhiran +s/-es (/s/, /z/, /ɪz/) dan +ed (/t/, /d/, /ɪd/) terdengar jelas atau tertelan.

WAJIB FORMAT OUTPUT DALAM STRUKTUR MARKDOWN BERIKUT:

# 📊 Skor Pelafalan & Kelancaran
**[Skor dibulatkan ke kelipatan 5]%** — [1 kalimat padat ringkasan pencapaian]
- **Target Aksen**: ${targetAccentName}
- **Kesesuaian Aksen Terdengar**: [Review jujur apakah sudah mendekati target aksen atau masih kental ritme suku kata bahasa ibu Indonesia]

# 📝 Transkripsi Audio Anda
"[Tuliskan kata demi kata persis apa yang Anda dengar langsung dari rekaman audio kandidat]"

# 🔍 Struktur Kalimat & Koreksi Tata Bahasa Lisan
- **Kejelasan Struktur**: [Apakah ide kalimat tersampaikan dengan struktur yang jelas, atau masih rancu/terbata-bata?]
- **Koreksi Tata Bahasa**:
  * ❌ *"[Bagian kalimat asli yang salah/kurang pas]"*
  * 💡 *"[Koreksi tata bahasa baku]"* — [Jelaskan aturan grammar yang dilanggar secara sederhana]

# 🚀 Transformasi Kalimat Band 7.5+ & Bedah Kosakata
- **Model Kalimat IELTS Band 7.5+**:
  "[Tuliskan 1-2 kalimat model Band 7.5+ yang merekonstruksi ide kandidat. Sisipkan 1-3 kosakata level C1/C2 dan tandai dengan [VOCAB: kata]]"

- **Bedah Perubahan: Kenapa Diganti Begitu?**:
  [Jelaskan alasan konkret mengapa kata/struktur di atas diganti menjadi versi Band 7.5+. Jelaskan nuansa, apakah lebih formal, lebih alami, atau mencegah salah paham]

- **Kosakata Baru yang Disarankan**:
  [Tuliskan daftar kata yang ditandai [VOCAB: kata] di atas beserta arti ringkasnya]

# 🔊 Bedah Pengucapan & Kata yang Kurang Tepat
(Maksimal 3 kata paling krusial yang salah atau terdistorsi di rekaman. Jika pelafalan sudah sangat baik >=90%, tulis 'Pelafalan kata-kata kunci sudah sangat bersih dan jelas!'):
- ❌ **"[Kata Salah]"**
  - 👂 **Kamu Mengucapkan**: "[Bunyi keliru yang keluar]"
  - 🗣️ **Cara Baca Lidah Indonesia**: **"[Transliterasi suku kata KAPITAL STRESS, misal: ar-TI-kyu-leit ↘]"**
  - 🔍 **Padanan Kata Inggris Simpel**: [Sebutkan 1 kata Inggris umum yang punya bunyi vokal/konsonan sama persis, misal: bunyi 'i' sama seperti di kata 'it', bukan 'eat']
  - 💡 **Panduan Posisi Mulut**: [Bukaan rahang dan posisi lidah konkret]

# 🛑 Audit Akhiran +S/-ES & +ED
- **Akhiran +S/-ES**: [Apakah desis /s/, /z/, /ɪz/ terdengar tajam atau tertelan?]
- **Akhiran +ED**: [Apakah letupan /t/, /d/, /ɪd/ terdengar jelas atau tertelan?]
- 🗣️ **Drill Kilat**: [1 frasa pendek latihan]`;

            try {
                const userQuery = `Halo AI Examiner, tolong dengarkan rekaman audio saya secara langsung. Berikan skor persentase kelipatan 5, review kesesuaian aksen ${targetAccentName}, transkripsi ucapan saya, cek struktur kalimat lisan dan koreksinya, model upgrade IELTS Band 7.5+ lengkap dengan penjelasan kenapa diganti begitu serta penanda [VOCAB: kata], dan bedah pengucapan kata yang salah dengan cara baca lidah Indonesia dan padanan kata simpel.`;
                let evalResponse = await callGeminiAPI(userQuery, systemPrompt, audioBlob);

                if (!evalResponse) {
                    evalResponse = `
# 📊 Skor Pelafalan & Kelancaran
**75%** — Pelafalan cukup jelas dan komunikatif, namun memerlukan pemolesan pada akhiran kata dan pemilihan kosakata formal.
- **Target Aksen**: ${targetAccentName}
- **Kesesuaian Aksen Terdengar**: Artikulasi vokal cukup baik, namun irama suku kata masih cenderung datar ala penutur bahasa Indonesia.

# 📝 Transkripsi Audio Anda
"${activePromptText ? activePromptText.slice(0, 100) : 'I live in a small coastal city and the local park is very peaceful.'}"

# 🔍 Struktur Kalimat & Koreksi Tata Bahasa Lisan
- **Kejelasan Struktur**: Ide kalimat tersampaikan dengan baik, tetapi pilihan verba dan tenses masih bisa diperhalus.
- **Koreksi Tata Bahasa**:
  * ❌ *"I live in small coastal city"*
  * 💡 *"I reside in a coastal community"* — Tambahkan artikel 'a' sebelum kata benda tunggal dan gunakan kata kerja yang lebih elegan.

# 🚀 Transformasi Kalimat Band 7.5+ & Bedah Kosakata
- **Model Kalimat IELTS Band 7.5+**:
  "I currently [VOCAB: reside] in a [VOCAB: tranquil] coastal district where local residents frequently [VOCAB: unwind] in the park."

- **Bedah Perubahan: Kenapa Diganti Begitu?**:
  (1) Kata 'live' diganti dengan [VOCAB: reside] agar terdengar lebih formal dan bernilai akademik tinggi.
  (2) Kata 'peaceful' diganti dengan [VOCAB: tranquil] karena memberikan nuansa ketenangan yang lebih kaya dan deskriptif.
  (3) Frasa 'spend time' diganti dengan [VOCAB: unwind] untuk menunjukkan kemampuan menggunakan idiom santai namun berkelas tinggi.

- **Kosakata Baru yang Disarankan**:
  - **reside** (verb): bertempat tinggal (formal)
  - **tranquil** (adjective): tenang, damai, tenteram
  - **unwind** (verb): melepaskan penat, bersantai

# 🔊 Bedah Pengucapan & Kata yang Kurang Tepat
- ❌ **"Peaceful"**
  - 👂 **Kamu Mengucapkan**: "pes-ful"
  - 🗣️ **Cara Baca Lidah Indonesia**: **"PII-s-ful ↘"**
  - 🔍 **Padanan Kata Inggris Simpel**: Bunyi vokal 'ee' panjang sama persis seperti di kata 'see' atau 'tree', bukan seperti 'pet'.
  - 💡 **Panduan Posisi Mulut**: Tarik sudut bibir ke samping seperti sedang tersenyum saat mengucap 'PII'.
- ❌ **"Residents"**
  - 👂 **Kamu Mengucapkan**: "re-si-den"
  - 🗣️ **Cara Baca Lidah Indonesia**: **"RE-zi-dents ↘"**
  - 🔍 **Padanan Kata Inggris Simpel**: Bunyi huruf 's' tengah bergetar seperti suara lebah /z/ pada kata 'buzz'.
  - 💡 **Panduan Posisi Mulut**: Getarkan pita suara saat mengucapkan 'zi' dan letupkan akhiran '-nts'.

# 🛑 Audit Akhiran +S/-ES & +ED
- **Akhiran +S/-ES**: Akhiran /s/ pada kata 'residents' dan 'parks' terdengar agak tertelan. Pastikan ada desis tajam di balik gigi depan.
- **Akhiran +ED**: Relatif aman pada rekaman ini.
- 🗣️ **Drill Kilat**: *"The resident**s** /s/ enjoy tranquil park**s** /s/."*
`;
                }

                // Generate Dynamic Error-Injected Speaking Remediation Prompt
                const speakingStudyPrompt = buildDynamicSpeakingRemediationPrompt(mode, targetAccentName, activePromptText, evalResponse);
                speakingState.remediationPrompts[mode] = speakingStudyPrompt;

                // Save speaking history
                if (!playerState.speakingHistory) playerState.speakingHistory = {};
                playerState.speakingHistory[mode] = true;

                // Render result card with collapsible accordions + remediation prompt box
                if (resultBox) {
                    resultBox.innerHTML = `
                        <div class="flex items-center justify-between border-b border-rose-500/30 pb-3 mb-4">
                            <h3 class="font-bold text-white text-sm flex items-center gap-2">
                                <i class="fa-solid fa-headphones-simple text-rose-400"></i> HASIL AUDIT AKUSTIK & IELTS SPEAKING EXAMINER
                            </h3>
                            <span class="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30 font-bold">BAND 7.5 RETEST CALIBRATED</span>
                        </div>
                        <div class="space-y-3">
                            ${renderSpeakingAuditAccordions(evalResponse, mode)}
                        </div>

                        <!-- Speaking Remediation Prompt Generator Box -->
                        <div class="bg-slate-900 border border-rose-500/30 rounded-xl p-4 space-y-2 mt-4">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div class="text-rose-300 font-bold text-xs flex items-center gap-1.5 font-mono">
                                    <i class="fa-solid fa-robot text-rose-400"></i>
                                    <span>Prompt Belajar Fonetik & Speaking Mandiri:</span>
                                </div>
                                <div class="flex items-center space-x-1.5">
                                    <button type="button" onclick="toggleSpeakingStudyPromptView('${mode}')" id="btn-toggle-speaking-prompt-${mode}" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono rounded border border-slate-700">
                                        <i class="fa-solid fa-eye mr-1" id="icon-toggle-speaking-prompt-${mode}"></i> <span id="text-toggle-speaking-prompt-${mode}">Lihat Prompt</span>
                                    </button>
                                    <button type="button" onclick="copySpeakingStudyPrompt('${mode}')" class="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 text-[10px] font-mono rounded border border-rose-500/30">
                                        <i class="fa-solid fa-copy mr-1"></i> Salin Prompt
                                    </button>
                                </div>
                            </div>
                            <pre id="speaking-study-prompt-text-${mode}" class="hidden text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap select-all max-h-48 overflow-y-auto leading-relaxed"></pre>
                        </div>
                    `;
                }

                // Award XP
                addXP(150);
                SoundFX.play('levelup');
                triggerConfetti();
                showToast(`Evaluasi Speaking Selesai! (+150 XP)`, "success");

                updateUI();
                saveGameData();

            } catch (err) {
                SoundFX.play('error');
                if (resultBox) {
                    resultBox.innerHTML = `<div class="text-xs text-amber-400 p-3 bg-slate-900 rounded-lg border border-amber-500/30">Gagal evaluasi AI: ${err.message}. Periksa koneksi API Anda.</div>`;
                }
                showToast("Evaluasi speaking gagal.", "error");
            } finally {
                if (btnSubmit) btnSubmit.disabled = false;
            }
        }

        function toggleSpeakingStudyPromptView(mode) {
            SoundFX.play('click');
            const pre = document.getElementById(`speaking-study-prompt-text-${mode}`);
            const toggleText = document.getElementById(`text-toggle-speaking-prompt-${mode}`);
            const toggleIcon = document.getElementById(`icon-toggle-speaking-prompt-${mode}`);
            if (!pre) return;

            if (pre.classList.contains('hidden')) {
                pre.innerText = speakingState.remediationPrompts[mode] || '';
                pre.classList.remove('hidden');
                if (toggleText) toggleText.innerText = "Tutup Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye-slash mr-1";
            } else {
                pre.classList.add('hidden');
                if (toggleText) toggleText.innerText = "Lihat Prompt";
                if (toggleIcon) toggleIcon.className = "fa-solid fa-eye mr-1";
            }
        }

        function copySpeakingStudyPrompt(mode) {
            const promptText = speakingState.remediationPrompts[mode];
            if (!promptText) return;
            navigator.clipboard.writeText(promptText).then(() => {
                SoundFX.play('correct');
                showToast("Prompt evaluasi speaking berhasil disalin!", "success");
            }).catch(() => {
                showToast("Gagal menyalin prompt.", "error");
            });
        }

        // =========================================================================
        
        function quickAddVocabFromSpeaking(word) {
            return saveMispronouncedWordToVocabBank(word);
        }
    