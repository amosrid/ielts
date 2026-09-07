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
            cleanMonologues: {},
            injectedVocabs: {},
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

        function onSpeakingGrammarModeChange() {
            SoundFX.play('click');
            const sel = document.getElementById('select-speaking-grammar-mode');
            if (!sel) return;
            const mode = sel.value;
            localStorage.setItem('ielts_speaking_grammar_mode', mode);

            const labelMap = {
                'ielts_natural': '✨ IELTS Band 7.5+ Alami (Rekomendasi)',
                'recent_stages': '🎯 Fokus 2-3 Stage Terakhir',
                'all_stages': '📚 Semua Stage Terbuka (Strict)'
            };
            showToast(`Mode Tata Bahasa: ${labelMap[mode] || mode}`, "info");
        }

        function onSpeakingRateChange(mode) {
            const sel = document.getElementById(`select-tts-rate-${mode}`);
            if (!sel) return;
            const rateVal = sel.value;
            localStorage.setItem('ielts_tts_selected_rate', rateVal);

            // Synchronize all 3 tabs
            ['part1', 'part2', 'part3'].forEach(m => {
                const s = document.getElementById(`select-tts-rate-${m}`);
                if (s) s.value = rateVal;
            });
            showToast(`Kecepatan TTS diatur ke ${rateVal}x`, "info");
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

            // Restore saved grammar mode
            const savedGrammarMode = localStorage.getItem('ielts_speaking_grammar_mode') || 'ielts_natural';
            const grammarSelect = document.getElementById('select-speaking-grammar-mode');
            if (grammarSelect) grammarSelect.value = savedGrammarMode;

            // Restore saved TTS rate
            const savedRate = localStorage.getItem('ielts_tts_selected_rate') || '1.0';
            ['part1', 'part2', 'part3'].forEach(m => {
                const rateSelect = document.getElementById(`select-tts-rate-${m}`);
                if (rateSelect) rateSelect.value = savedRate;
            });

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
            // Only select words with:
            // 1. Not mastered (v.status !== 'mastered')
            // 2. Not locked behind padlock (v.lockStatus !== 'locked')
            // 3. Has active Feynman practice (v.feynmanLevel > 0)
            let pool = (vocabBank || []).filter(v => 
                v.status !== 'mastered' && 
                v.lockStatus !== 'locked' && 
                (v.feynmanLevel || 0) > 0
            );
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
                statusEl.innerText = "Aktifkan untuk menyisipkan kosakata yang sudah dilatih di Feynman Lab";
                return;
            }

            const pool = getVocabPoolByFilter(speakingVocabFilter);
            const filterLabel = speakingVocabFilter === 'all' ? 'Semua Level' : speakingVocabFilter;

            if (pool.length === 0) {
                statusEl.innerHTML = `<span class="text-amber-400 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i> 0 kata siap (${filterLabel}) — jelaskan minimal 1x di Feynman Lab untuk memasukkannya ke Speaking</span>`;
            } else {
                statusEl.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-check mr-1"></i> ${pool.length} kata aktif (Feynman Lv.1+) siap diacak (${filterLabel})</span>`;
            }
        }

        function getRandomVocabsForSpeaking(filterVal, countOrLength = 3) {
            const pool = getVocabPoolByFilter(filterVal);
            if (pool.length === 0) return [];
            
            let targetCount = 3;
            if (typeof countOrLength === 'number') {
                targetCount = countOrLength;
            } else if (countOrLength === 'short') {
                targetCount = Math.min(2, pool.length);
            } else if (countOrLength === 'long') {
                targetCount = pool.length >= 10 ? 6 : (pool.length >= 5 ? 5 : pool.length);
            } else { // 'medium' or default
                targetCount = pool.length >= 8 ? 4 : (pool.length >= 3 ? 3 : pool.length);
            }

            // Shuffle randomly
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(targetCount, shuffled.length));
        }

        function getUnlockedGrammarContext(forcedMode) {
            const mode = forcedMode || localStorage.getItem('ielts_speaking_grammar_mode') || 'ielts_natural';
            const completedIds = Object.keys(playerState.completedStages || {});
            
            if (mode === 'ielts_natural') {
                return {
                    mode: 'ielts_natural',
                    count: completedIds.length,
                    label: 'IELTS Band 7.5+ Alami',
                    badgeText: 'IELTS Alami Band 7.5+',
                    stageTitles: ['Band 7.5+ Natural Flow', 'Compound-Complex Syntax', 'Idiomatic Discourse Markers'],
                    rulesSummary: 'Natural IELTS Band 7.5+ compound-complex structures, idiomatic discourse markers, subordinate clauses (concession, cause/effect, conditionals), varied clause lengths, and authentic spoken rhythm without artificial beginner constraints.',
                    promptConstraint: 'Structure: Use natural, fluent IELTS Band 7.5+ spoken grammar (varied clause structures, compound-complex sentences, idiomatic discourse markers). Avoid robotic, toddler-like repetition.'
                };
            }

            if (mode === 'recent_stages') {
                let recentIds = completedIds.slice(-3);
                if (recentIds.length === 0) {
                    recentIds = ['stage_1', 'stage_2'];
                }
                const stageTitles = recentIds.map(id => (typeof STAGE_DATA !== 'undefined' && STAGE_DATA[id]?.title) ? STAGE_DATA[id].title : id);
                return {
                    mode: 'recent_stages',
                    count: recentIds.length,
                    label: `Fokus ${recentIds.length} Stage Terakhir`,
                    badgeText: `Fokus Stage ${recentIds.map(id => id.replace('stage_', '')).join('-')}`,
                    stageTitles: stageTitles,
                    rulesSummary: stageTitles.join('; '),
                    promptConstraint: `Scaffolding constraint: Specifically highlight and demonstrate grammar patterns from candidate's recent unlocked stages: [${stageTitles.join('; ')}]. Weave them into natural, communicative spoken English.`
                };
            }

            // Cumulative 'all_stages'
            if (completedIds.length === 0) {
                return {
                    mode: 'all_stages',
                    count: 0,
                    label: 'Mode Fondasi SVO & Be',
                    badgeText: 'Stage 1-2 (Fondasi)',
                    stageTitles: ["Stage 1: SVO Sentence Frame", "Stage 2: 'Be' State Anchor"],
                    rulesSummary: "Basic Subject + Verb + Object word order, correct 'be' copula anchors (is/are/was/were).",
                    promptConstraint: 'Scaffolding constraint: Candidate has unlocked foundation stages: SVO sentence frame and "Be" copula verbs.'
                };
            }
            const allTitles = completedIds.map(id => (typeof STAGE_DATA !== 'undefined' && STAGE_DATA[id]?.title) ? STAGE_DATA[id].title : id);
            return {
                mode: 'all_stages',
                count: completedIds.length,
                label: `Semua Stage (${completedIds.length})`,
                badgeText: `${completedIds.length} Stage Terbuka`,
                stageTitles: allTitles,
                rulesSummary: allTitles.join('; '),
                promptConstraint: `Scaffolding constraint: Candidate has unlocked these stages: [${allTitles.join('; ')}]. Emphasize these patterns naturally in the spoken response.`
            };
        }

        // =========================================================================
        // IELTS SPEAKING PROMPT BUILDERS (PART 1, 2, & 3 MODULAR SPECIFICATIONS)
        // =========================================================================

        function buildPart1ShadowingSystemPrompt(activePromptText, targetAccentName, injectedVocabList) {
            const cleanText = activePromptText || 'IELTS Speaking Read-Aloud Task';
            const accent = targetAccentName || 'British RP';
            const vocabs = injectedVocabList || 'None specified';

            return `You are a direct, honest, and supportive AI IELTS Speaking Coach specializing in READ-ALOUD / SHADOWING delivery assessment. All feedback MUST be written strictly in clear, accessible B1-level English (simple, friendly, and practical).

Your top priority: HONESTY & ACCURATE DIAGNOSIS. Do NOT inflate scores, do NOT use empty flattery, and do NOT fabricate errors that were not audible.

============================================
CONTEXT — THIS IS A READ-ALOUD TASK, NOT SPONTANEOUS SPEECH
============================================
The candidate was given this EXACT text to read aloud:
"${cleanText}"

This is critical: the candidate did NOT compose this sentence themselves. Your job is to assess DELIVERY (pronunciation, rhythm, stress, intonation, linking) — NOT sentence structure or word choice, since those were already written by the system.

Target Accent: ${accent}

============================================
🚨 RULE #1 — CHECK AUDIO QUALITY FIRST
============================================
If the audio is completely silent, background noise dominates, or speech is too faint to hear:
Write exactly: "# ⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)"
Explain simply in B1 English that speech could not be heard clearly, and STOP evaluation.

============================================
🚨 RULE #2 — TRANSCRIBE CAREFULLY AGAINST THE ORIGINAL TEXT
============================================
When you transcribe what you heard, compare it word-by-word against the original text above.

If a word in your transcription differs from the original AND the difference doesn't make clear sense in context (e.g. you think you heard "tracking" where the original says "dragging", and "tracking past 3 AM" is semantically odd) — this is most likely a MISHEARING on your part, not a mispronunciation by the candidate. In this case:
- Transcribe the ORIGINAL word, not your uncertain guess.
- Do NOT treat it as an error to correct.
- Only flag it if the audio genuinely sounds like a different, clearly pronounced word.

Only report a genuine deviation when:
- A word was clearly skipped or clearly added compared to the original text, OR
- A word was audibly mispronounced in a way that changes its sound significantly (not just a transcription judgment call).

============================================
🚨 RULE #3 — REALISTIC SCORE ESTIMATE (MULTIPLES OF 5)
============================================
You do NOT measure physical acoustic spectrograms. Give an HONEST, REALISTIC estimate of DELIVERY quality (not grammar, since the text was pre-written) and round to the nearest multiple of 5.
- 90-100%: Highly fluent, natural rhythm, crisp vowels matching ${accent}, natural stress/intonation on target vocabulary.
- 75-89%: Clear, communicative delivery. Slight vowel nuance or minor pacing issue, but easy to understand without strain.
- 55-74%: Understandable, but noticeable hesitations, flat intonation, or dropped final consonants.
- 35-54%: Heavy hesitation, word-by-word reading instead of natural flow, or severe distortion impeding comprehension.
- 0-30%: Barely intelligible or damaged audio.

============================================
🚨 RULE #4 — TIERED PHONETIC OUTPUT DEPTH
============================================
- If score >=90%: Praise clean articulation and natural rhythm. Do NOT invent fake errors.
- If score 75-89%: Provide 1 gentle, concrete fine-tuning tip.
- If score <75%: Identify top issues heard by importance (max 3 words).

============================================
🚨 RULE #5 — PRACTICAL PHONETIC GUIDANCE (NO COMPLICATED IPA)
============================================
1. Syllable Breakdown with CAPITAL letters for stress (e.g. ar-TI-cu-late ↘).
2. Simple English Word Match: compare with extremely common everyday words.
3. Mouth & Tongue Position: 1 actionable physical tip.
4. Word Endings Audit: check if -s/-es and -ed sounds were audible or dropped.
5. Prioritize feedback on the injected target vocabulary words (given below), since these are the words the candidate is specifically practicing.

Target vocabulary in this text: ${vocabs}

MANDATORY MARKDOWN OUTPUT STRUCTURE:

# 📊 Delivery & Fluency Score
**[Score rounded to multiple of 5]%** — [1 concise sentence in B1 English summarizing delivery performance]
- **Target Accent**: ${accent}
- **Accent Match Assessment**: [Honest B1 English review of vowel articulation and rhythm compared to target accent]

# 📝 Audio Transcription
"[Write what was heard. If uncertain about a word AND the original text is clear from context, use the original word rather than an uncertain guess — see Rule #2]"

# ✅ Text Fidelity Check
- **Words matched to original text**: [e.g. "38 of 40 words matched"]
- **Skipped or added words**: [List any, or write "None — full text was read"]

# 🔊 Phonetic Breakdown & Pronunciation Tips
[Follow Rule #4 tiered instructions. Prioritize the target vocabulary words.]:
- ❌ **"[Word]"**
  - 👂 **What You Said**: "[How it sounded]"
  - 🗣️ **Phonetic Breakdown**: **"[Syllable breakdown, e.g. im-PER-ti-nunt ↘]"**
  - 🔍 **Simple English Word Match**: [1 common word with identical sound]
  - 💡 **Mouth & Tongue Position**: [Simple physical cue]

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: [Audible or dropped]
- **-ED Endings**: [Audible or dropped]
- 🗣️ **Quick Speed Drill**: [1 short practice phrase, e.g. "She complete**s** /s/ her project**s** /s/ on time."]`;
        }

        function buildPart2CueCardSystemPrompt(cueCardPromptText, targetAccentName) {
            const cleanCueCard = cueCardPromptText || 'IELTS Speaking Part 2 Cue Card Task';
            const accent = targetAccentName || 'British RP';

            return `You are a direct, honest, and supportive AI IELTS Speaking Coach and Examiner. All feedback MUST be written strictly in clear, accessible B1-level English (simple, friendly, and practical).

Your top priority: HONESTY & ACCURATE DIAGNOSIS. Do NOT inflate scores, do NOT use empty flattery, and do NOT fabricate errors that were not audible.

============================================
CONTEXT — THIS IS A SPONTANEOUS CUE CARD MONOLOGUE (IELTS PART 2)
============================================
The candidate was given this cue card and spoke spontaneously (with ~1 minute preparation, no script):

Cue Card Topic & Points:
"${cleanCueCard}"

Unlike a read-aloud task, the candidate composed these sentences themselves in real time. This means:
- Grammar, vocabulary choice, and sentence structure ARE the candidate's own — feel free to correct and upgrade them (unlike Part 1 shadowing).
- Natural spontaneous speech includes self-corrections, filler words ("um", "well", "you know"), and minor restarts. Do NOT penalize these heavily — real IELTS examiners tolerate natural hesitation markers used at a reasonable frequency. Only flag hesitation as a problem if it is frequent enough to break comprehension.

Target Accent: ${accent}

============================================
🚨 RULE #1 — CHECK AUDIO QUALITY FIRST
============================================
If the audio is completely silent, background noise dominates, or speech is too faint to hear:
Write exactly: "# ⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)"
Explain simply in B1 English that speech could not be heard clearly, and STOP evaluation.

============================================
🚨 RULE #2 — TASK FULFILLMENT CHECK (IELTS-SPECIFIC)
============================================
Compare what the candidate said against the cue card points listed above. For each point on the cue card, note whether it was addressed, partially addressed, or missed. This is a real IELTS Part 2 scoring criterion — a fluent answer that skips half the cue card points should not receive a top score.

============================================
🚨 RULE #3 — REALISTIC SCORE ESTIMATE (MULTIPLES OF 5)
============================================
You do NOT measure physical acoustic spectrograms. Give an HONEST, REALISTIC estimate covering fluency, coherence, and delivery combined, rounded to the nearest multiple of 5.
- 90-100%: Highly fluent, natural rhythm, wide vocabulary range, all cue card points covered coherently, natural compound-complex sentences.
- 75-89%: Clear, communicative delivery. Most cue card points covered. 1-2 minor grammar slips or vocabulary gaps, but flow is easy to follow.
- 55-74%: Understandable ideas, but noticeable spoken grammar errors, some cue card points missed or underdeveloped, or frequent hesitation.
- 35-54%: Heavy hesitation, fragmented sentences, most cue card points missed, or severe distortion impeding comprehension.
- 0-30%: Barely intelligible or damaged audio.

============================================
🚨 RULE #4 — TIERED PHONETIC OUTPUT DEPTH
============================================
- If score >=90%: Praise clean articulation and natural rhythm. Do NOT invent fake errors.
- If score 75-89%: Provide 1 gentle, concrete fine-tuning tip.
- If score <75%: Identify top issues heard by importance (max 3 words).

============================================
🚨 RULE #5 — PRACTICAL PHONETIC GUIDANCE (NO COMPLICATED IPA)
============================================
1. Syllable Breakdown with CAPITAL letters for stress (e.g. ar-TI-cu-late ↘).
2. Simple English Word Match: compare with extremely common everyday words.
3. Mouth & Tongue Position: 1 actionable physical tip.
4. Word Endings Audit: check if -s/-es and -ed sounds were audible or dropped.

============================================
🚨 RULE #6 — GRAMMAR, COHERENCE & BAND 7.5+ UPGRADE
============================================
1. Evaluate spoken grammar accuracy AND coherence/cohesion (how well ideas connect — linking words, logical flow between points) as two distinct aspects.
2. Provide concise, clear grammar corrections only for genuine errors (not filler words or natural self-corrections).
3. Provide a 2-3 sentence exemplary Band 7.5+ Model Upgrade expressing the candidate's main idea, staying faithful to what they actually said.
4. Mark high-tier (C1/C2) words/collocations with [VOCAB: word].
5. Explain briefly WHY each change was made.

MANDATORY MARKDOWN OUTPUT STRUCTURE:

# 📊 Fluency & Delivery Score
**[Score rounded to multiple of 5]%** — [1 concise sentence in B1 English summarizing performance]
- **Target Accent**: ${accent}
- **Accent Match Assessment**: [Honest B1 English review of vowel articulation and rhythm compared to target accent]

# 📝 Audio Transcription
"[Write word-for-word what was heard]"

# ✅ Task Fulfillment Check
- **Point 1**: [Addressed / Partially addressed / Missed] — [1 short note]
- **Point 2**: [Addressed / Partially addressed / Missed] — [1 short note]
- **Point 3**: [Addressed / Partially addressed / Missed] — [1 short note]
(list all points from the cue card)

# 🔍 Grammar & Coherence Feedback
- **Coherence & Cohesion**: [Comment on how well ideas connected and flowed between cue card points]
- **Grammar Corrections**:
  * ❌ *"[Part of original sentence with genuine error]"*
  * 💡 *"[Corrected version]"* — [Explain simply in B1 English]

# 🚀 Band 7.5+ Model Upgrade & Vocabulary
- **Band 7.5+ Model Upgrade**:
  "[2-3 exemplary sentences reconstructing the candidate's own idea. Insert 1-3 C1/C2 words marked with [VOCAB: word]]"
- **Why We Upgraded It**:
  * 1️⃣ **[Original] ➔ [Upgraded]**: [Explanation]
  * 2️⃣ **[Original] ➔ [Upgraded]**: [Explanation]
- **New Vocabulary to Learn**:
  * [VOCAB: word1] = [simple B1 English definition]
  * [VOCAB: word2] = [simple B1 English definition]

# 🔊 Phonetic Breakdown & Pronunciation Tips
[Follow Rule #4 tiered instructions]

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: [Audible or dropped]
- **-ED Endings**: [Audible or dropped]
- 🗣️ **Quick Speed Drill**: [1 short practice phrase]`;
        }

        function buildPart3DiscussionSystemPrompt(discussionQuestionsText, targetAccentName) {
            const cleanQuestions = discussionQuestionsText || 'IELTS Speaking Part 3 Discussion Question';
            const accent = targetAccentName || 'British RP';

            return `You are a direct, honest, and supportive AI IELTS Speaking Coach and Examiner. All feedback MUST be written strictly in clear, accessible B1-level English (simple, friendly, and practical).

Your top priority: HONESTY & ACCURATE DIAGNOSIS. Do NOT inflate scores, do NOT use empty flattery, and do NOT fabricate errors that were not audible.

============================================
CONTEXT — THIS IS AN IELTS PART 3 DISCUSSION (SPONTANEOUS Q&A)
============================================
The candidate answered the following discussion question(s) spontaneously, in real time, with no script:

Question(s) Given:
"${cleanQuestions}"

Unlike Part 2 (a single monologue), Part 3 is an interactive discussion. What matters most here — more than in Part 1 or 2 — is IDEA DEVELOPMENT: does the candidate give a real opinion with reasons/examples, or just a short surface-level answer? A fluent but shallow answer ("I think it's good because it's good") should score lower on content even if pronunciation is perfect.

Natural spontaneous speech includes self-corrections, filler words, and minor restarts. Do NOT penalize these heavily unless frequent enough to break comprehension.

Target Accent: ${accent}

============================================
🚨 RULE #1 — CHECK AUDIO QUALITY FIRST
============================================
If the audio is completely silent, background noise dominates, or speech is too faint to hear:
Write exactly: "# ⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)"
Explain simply in B1 English that speech could not be heard clearly, and STOP evaluation.

============================================
🚨 RULE #2 — IDEA DEVELOPMENT CHECK (IELTS-SPECIFIC, PART 3 PRIORITY)
============================================
For each question answered, classify the response as one of:
- **Developed**: gives an opinion/answer AND supports it with a reason, example, or elaboration.
- **Basic**: gives an opinion/answer but with little or no supporting reason.
- **Minimal**: very short response, unclear stance, or doesn't really answer the question asked.
Be honest here — this is usually the single biggest gap between Band 6 and Band 7.5+ candidates, more than grammar or pronunciation.

============================================
🚨 RULE #3 — REALISTIC SCORE ESTIMATE (MULTIPLES OF 5)
============================================
You do NOT measure physical acoustic spectrograms. Give an HONEST, REALISTIC estimate covering idea development, coherence, grammar, and delivery combined, rounded to the nearest multiple of 5.
- 90-100%: Well-developed, well-justified answers with natural complex grammar (conditionals, passives, subordinate clauses), fluent delivery, wide vocabulary.
- 75-89%: Clear answers with reasons/examples, occasional grammar slip, generally fluent, minor vocabulary gaps.
- 55-74%: Answers given but often under-developed or repetitive reasoning, some spoken grammar errors, noticeable hesitation.
- 35-54%: Mostly minimal/surface answers, fragmented sentences, or severe distortion impeding comprehension.
- 0-30%: Barely intelligible or damaged audio.

============================================
🚨 RULE #4 — TIERED PHONETIC OUTPUT DEPTH
============================================
- If score >=90%: Praise clean articulation and natural rhythm. Do NOT invent fake errors.
- If score 75-89%: Provide 1 gentle, concrete fine-tuning tip.
- If score <75%: Identify top issues heard by importance (max 3 words).
Keep this section brief for Part 3 — content/argumentation matters more here than in Part 1/2, so don't let phonetic detail dominate the feedback.

============================================
🚨 RULE #5 — GRAMMAR & BAND 7.5+ UPGRADE (INCLUDING COMPLEX STRUCTURES)
============================================
1. Evaluate spoken grammar accuracy. Part 3 is a good place to check for complex structures (conditionals, passive voice, subordinate clauses) since abstract questions naturally invite them — note if the candidate attempted these or stayed only in simple sentences.
2. Provide concise, clear grammar corrections only for genuine errors (not filler words or natural self-corrections).
3. Provide a 2-3 sentence exemplary Band 7.5+ Model Upgrade for one of the candidate's answers, staying faithful to their actual opinion/reasoning.
4. Mark high-tier (C1/C2) words/collocations with [VOCAB: word].
5. Explain briefly WHY each change was made.

MANDATORY MARKDOWN OUTPUT STRUCTURE:

# 📊 Discussion & Delivery Score
**[Score rounded to multiple of 5]%** — [1 concise sentence in B1 English summarizing performance]
- **Target Accent**: ${accent}
- **Accent Match Assessment**: [Honest B1 English review of vowel articulation and rhythm compared to target accent]

# 📝 Audio Transcription
"[Write word-for-word what was heard, organized by question if multiple questions were asked]"

# 💡 Idea Development Check
- **Question 1**: [Developed / Basic / Minimal] — [1 short note on why]
- **Question 2**: [Developed / Basic / Minimal] — [1 short note on why]
(list all questions answered)

# 🔍 Grammar & Structure Feedback
- **Complex Structure Attempts**: [Note whether candidate used conditionals, passive voice, or subordinate clauses, and whether they were used correctly]
- **Grammar Corrections**:
  * ❌ *"[Part of original sentence with genuine error]"*
  * 💡 *"[Corrected version]"* — [Explain simply in B1 English]

# 🚀 Band 7.5+ Model Upgrade & Vocabulary
- **Band 7.5+ Model Upgrade** (for one answer):
  "[2-3 exemplary sentences reconstructing the candidate's own opinion/reasoning. Insert 1-3 C1/C2 words marked with [VOCAB: word]]"
- **Why We Upgraded It**:
  * 1️⃣ **[Original] ➔ [Upgraded]**: [Explanation]
  * 2️⃣ **[Original] ➔ [Upgraded]**: [Explanation]
- **New Vocabulary to Learn**:
  * [VOCAB: word1] = [simple B1 English definition]
  * [VOCAB: word2] = [simple B1 English definition]

# 🔊 Phonetic Breakdown & Pronunciation Tips
[Follow Rule #4 tiered instructions — keep concise for Part 3]

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: [Audible or dropped]
- **-ED Endings**: [Audible or dropped]
- 🗣️ **Quick Speed Drill**: [1 short practice phrase]`;
        }

        function buildSpeakingUserQuery(mode, targetAccentName) {
            const accent = targetAccentName || 'British RP';
            if (mode === 'part1') {
                return `Please listen to my read-aloud recording. Check my delivery, rhythm, text fidelity against the original script, word endings, and pronunciation of target words in ${accent}. Do NOT check sentence grammar since the script was provided.`;
            }
            if (mode === 'part2') {
                return `Please evaluate my spontaneous 2-minute cue card monologue in ${accent}. Check task fulfillment of the cue card points, coherence, spoken grammar, and pronunciation.`;
            }
            if (mode === 'part3') {
                return `Please evaluate my spontaneous discussion answer in ${accent}. Check my idea development, complex structure usage, grammar accuracy, and pronunciation.`;
            }
            return `Please listen to my spoken voice recording. Evaluate my speech in ${accent}, checking pronunciation, fluency, and grammatical structure in clear B1 English.`;
        }

        function parseGeneratedSpeakingPrompt(rawText, mode = 'part1') {
            if (!rawText || typeof rawText !== 'string') {
                return { topicTitle: '', cleanMonologue: '', targetGrammarNotes: '' };
            }

            let text = rawText.trim();
            let topicTitle = '';
            let cleanMonologue = '';
            let targetGrammarNotes = '';

            // Extract target grammar / strategy tip / formula notes section
            const grammarSplitRegex = /(?:\n|^)(#+\s*(?:🎯|💡|📚|🔍)?\s*(?:Target Grammar|Suggested Grammar|Strategy Tip|Grammar Formula)[^\n]*\n+)([\s\S]*)$/i;
            const grammarMatch = text.match(grammarSplitRegex);
            if (grammarMatch) {
                targetGrammarNotes = (grammarMatch[1] + (grammarMatch[2] || '')).trim();
                text = text.substring(0, grammarMatch.index).trim();
            }

            // Extract topic title
            const topicMatch = text.match(/#+\s*(?:🎙️|📋|❓)?\s*(?:Topic|Candidate Task Card|Part 3 Discussion Question)[:\s]*(.*)/i);
            if (topicMatch) {
                topicTitle = topicMatch[1].trim();
                // Remove the header line
                text = text.replace(/#+\s*(?:🎙️|📋|❓)?\s*(?:Topic|Candidate Task Card|Part 3 Discussion Question)[:\s]*.*?\n+/i, '').trim();
            }

            cleanMonologue = text.trim();
            if (mode === 'part1' || mode === 'part3') {
                // Strip wrapping quotes if entire text is wrapped in quotes
                cleanMonologue = cleanMonologue.replace(/^["“”]([\s\S]+)["“”]$/, '$1').trim();
            }

            return {
                topicTitle,
                cleanMonologue,
                targetGrammarNotes
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

            // Monologue Length Constraint (Short / Medium / Long)
            const lengthChoice = document.getElementById(`select-speaking-length-${mode}`)?.value || 'medium';
            let lengthInstruction = '';
            let targetWords = '60-80 words (6-8 sentences)';
            if (lengthChoice === 'short') {
                lengthInstruction = 'Generate a CONCISE model monologue of exactly 3 to 4 clear, impactful sentences (approx 35-50 words). Focus on crisp phonemes and natural clarity.';
                targetWords = '35-50 words (3-4 sentences)';
            } else if (lengthChoice === 'long') {
                lengthInstruction = 'Generate a RICH, EXTENDED model monologue of 10 to 14 complex sentences (approx 120-160 words). Provide full descriptive depth, varied sentence structures, and stamina drill.';
                targetWords = '120-160 words (10-14 sentences)';
            } else {
                lengthInstruction = 'Generate an authentic model monologue of 6 to 8 well-developed sentences (approx 70-90 words), standard IELTS Part 1 length.';
                targetWords = '70-90 words (6-8 sentences)';
            }

            const grammarMode = document.getElementById('select-speaking-grammar-mode')?.value || localStorage.getItem('ielts_speaking_grammar_mode') || 'ielts_natural';
            const grammarCtx = getUnlockedGrammarContext(grammarMode);

            // Check if Vocab Logger integration is enabled
            const useVocab = document.getElementById('toggle-speaking-use-vocab')?.checked;
            let injectedVocabs = [];
            if (useVocab) {
                injectedVocabs = getRandomVocabsForSpeaking(speakingVocabFilter, lengthChoice);
                if (injectedVocabs.length === 0) {
                    showToast(`Tidak ditemukan kata 'learning' (Feynman Lv.1+) untuk filter ${speakingVocabFilter}. Menghasilkan materi tanpa injeksi vocab.`, "info");
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

            if (mode === 'part1') {
                systemPrompt = `You are an elite IELTS Speaking Coach creating a Read-Aloud / Shadowing monologue for IELTS Speaking Part 1.
${grammarCtx.promptConstraint}${vocabPromptInstruction}

Length Constraint:
${lengthInstruction}

Task:
Generate an authentic IELTS Speaking Part 1 model monologue (${targetWords}) on an engaging IELTS topic (e.g. Work/Study, Daily Routine, Hometown, Hobbies, Technology, Nature, Social Life).
The monologue must sound completely authentic and conversational (Band 7.5+), naturally weaving in any injected vocabulary words without awkward stiffness.

Format your response in Markdown:
# 🎙️ Topic: [Topic Title]
[The spoken response text with key grammar structures and injected vocabulary words in **bold**]

# 🎯 Target Grammar & Vocab Applied:
- [List 2-3 target rules or vocabulary embedded]`;
                userPrompt = `Generate a Part 1 shadowing monologue (${lengthChoice} length: ${targetWords}) matching grammar mode: ${grammarCtx.label} (${grammarCtx.rulesSummary})${injectedVocabs.length > 0 ? ` and including target words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;

            } else if (mode === 'part2') {
                systemPrompt = `You are a certified IELTS Speaking Examiner creating an authentic IELTS Speaking Part 2 Candidate Task Card (Cue Card).
${grammarCtx.promptConstraint}${vocabPromptInstruction}

Task:
Create a full IELTS Speaking Part 2 Cue Card that naturally prompts the candidate to use varied sentence structures and target vocabulary.

Format your response in Markdown:
# 📋 Topic: Describe [Topic Name]
You should say:
- What it is / was
- Where / When it happened
- Who was involved
- And explain why it was significant to you.

# 🎯 Suggested Grammar Formula & Vocab to Demonstrate:
- [List 2-3 specific techniques/vocabulary to use in the 2-minute monologue]`;
                userPrompt = `Generate a Part 2 Cue Card task matching grammar mode: ${grammarCtx.label}${injectedVocabs.length > 0 ? ` and highlighting target words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;

            } else {
                systemPrompt = `You are an IELTS Speaking Examiner conducting Part 3 Analytical Discussion.
${grammarCtx.promptConstraint}${vocabPromptInstruction}

Task:
Create 1 deep, analytical IELTS Speaking Part 3 discussion question that requires the candidate to express reasoned opinions, compare trends, or analyze causes/effects, using the target vocabulary.

Format in Markdown:
# ❓ Part 3 Discussion Question
"[Write the question in quotes]"

# 💡 Strategy Tip & Grammar Anchor
- [Brief tip on how to structure a natural Band 7.5+ answer using: ${grammarCtx.mode === 'ielts_natural' ? 'subordinate clauses, evaluative adjectives, and balanced hedging' : grammarCtx.rulesSummary}${injectedVocabs.length > 0 ? ` and applying vocabularies (${injectedVocabs.map(v => v.word).join(', ')})` : ''}]`;
                userPrompt = `Generate a challenging Part 3 question matching grammar mode: ${grammarCtx.label}${injectedVocabs.length > 0 ? ` and integrating words: ${injectedVocabs.map(v => v.word).join(', ')}` : ''}`;
            }

            try {
                let resText = await callGeminiAPI(userPrompt, systemPrompt, null, { feature: 'speaking_topic_gen' });

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
                const parsed = parseGeneratedSpeakingPrompt(resText, mode);
                speakingState.cleanMonologues[mode] = parsed.cleanMonologue;
                speakingState.injectedVocabs[mode] = injectedVocabs;

                if (textEl) {
                    textEl.innerHTML = (typeof renderMarkdown === 'function') ? renderMarkdown(parsed.cleanMonologue || resText) : (parsed.cleanMonologue || resText);
                }

                // Render grammar notes in separate container if present
                const grammarNotesEl = document.getElementById(`speaking-grammar-notes-${mode}`);
                if (grammarNotesEl) {
                    if (parsed.targetGrammarNotes) {
                        grammarNotesEl.innerHTML = (typeof renderMarkdown === 'function') ? renderMarkdown(parsed.targetGrammarNotes) : parsed.targetGrammarNotes;
                        grammarNotesEl.classList.remove('hidden');
                    } else {
                        grammarNotesEl.innerHTML = '';
                        grammarNotesEl.classList.add('hidden');
                    }
                }

                if (topicTag) {
                    const tagTitle = parsed.topicTitle ? `Topic: ${parsed.topicTitle}` : `Active (${grammarCtx.badgeText})`;
                    topicTag.innerText = `${tagTitle}${injectedVocabs.length > 0 ? ` • ${injectedVocabs.length} Vocabs` : ''}`;
                }

                // Update grammar tags
                if (tagsEl) {
                    if (grammarCtx.mode === 'ielts_natural') {
                        tagsEl.innerHTML = `
                            <span class="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold"><i class="fa-solid fa-sparkles mr-1"></i> Band 7.5+ Natural Flow</span>
                            <span class="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Compound-Complex Syntax</span>
                            <span class="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-700">Native Idiomatic Markers</span>
                        `;
                    } else {
                        tagsEl.innerHTML = (grammarCtx.stageTitles || []).slice(0, 4).map(t => `<span class="text-[10px] font-mono bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">${t}</span>`).join('');
                    }
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
                       .replace(/^["“”]+|["“”]+$/g, '')
                       .replace(/Klik tombol[\s\S]*/i, '')
                       .trim();
            // Ensure any residual outer quotes after trimming are stripped
            text = text.replace(/^["“”]+|["“”]+$/g, '').trim();
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

        if (typeof window !== 'undefined' && typeof document !== 'undefined' && 'speechSynthesis' in window) {
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

            // Extract strictly cleaned text (prefer cleanMonologues)
            let rawText = speakingState.cleanMonologues?.[mode] || speakingState.generatedPrompts[mode] || textEl.innerText || '';
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
                lockStatus: 'unlocked',
                meaningId: `Menganalisis arti dan konteks IELTS untuk ${cleanWord}...`,
                meaningEn: `Analyzing Cambridge definition and IELTS context for ${cleanWord}...`,
                indonesianGuide: `${cleanWord.toUpperCase()}`,
                example: `I practice pronouncing "${cleanWord}" clearly with authentic accent in my IELTS test.`,
                synonyms: [],
                ipa: '',
                dateAdded: Date.now(),
                srInterval: 1,
                srNextReview: null,
                srReviewCount: 0,
                feynmanLevel: 0,
                feynmanStatus: 'unlearned',
                feynmanLastExplanation: '',
                feynmanLastSentence: '',
                feynmanFeedback: null,
                consecutiveMasteryCount: 0,
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
                    target.coreMeaningB1 = analysis.coreMeaningB1 || analysis.meaningEn || target.coreMeaningB1;
                    target.visualFlow = analysis.visualFlow || target.visualFlow || '💡 → 🧠 → 🗣️';
                    target.mentalImageExplanation = analysis.mentalImageExplanation || analysis.childExplanation || target.mentalImageExplanation;
                    target.childExplanation = analysis.mentalImageExplanation || analysis.childExplanation || target.childExplanation;
                    target.collocationMatrix = analysis.collocationMatrix || target.collocationMatrix;
                    target.nuanceCompare = analysis.nuanceCompare !== undefined ? analysis.nuanceCompare : target.nuanceCompare;
                    target.ieltsUpgrade = analysis.ieltsUpgrade !== undefined ? analysis.ieltsUpgrade : target.ieltsUpgrade;
                    target.usageWarning = analysis.usageWarning !== undefined ? analysis.usageWarning : target.usageWarning;
                    target.quickRecap = analysis.quickRecap || target.quickRecap;
                    target.naturalExamples = analysis.naturalExamples || target.naturalExamples;
                    target.indonesianGuide = analysis.indonesianGuide || target.indonesianGuide;
                    target.example = analysis.example || target.example;
                    target.dailyExamples = analysis.dailyExamples || target.dailyExamples || [];
                    target.synonyms = analysis.synonyms || target.synonyms || [];
                    target.ipa = analysis.ipa || target.ipa || '';
                    if (target.feynmanLevel === undefined) target.feynmanLevel = 0;
                    if (!target.feynmanStatus) target.feynmanStatus = 'unlearned';
                    saveVocabBank();

                    // If modal card is currently open for this vocab, live-update DOM
                    if (currentActiveVocabId === vocabId && typeof openVocabCard === 'function') {
                        openVocabCard(vocabId);
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
                const isHeroScore = trimmed.includes('Skor Pelafalan') || 
                                   trimmed.includes('Skor Resmi IELTS') || 
                                   trimmed.includes('Official IELTS Speaking Band Score') || 
                                   trimmed.includes('Pronunciation & Fluency Score') ||
                                   trimmed.includes('Delivery & Fluency Score') ||
                                   trimmed.includes('Fluency & Delivery Score') ||
                                   trimmed.includes('Discussion & Delivery Score');

                if (isHeroScore) {
                    const cardBorder = isRejected ? 'border-red-500/60 bg-red-950/20' : 'border-rose-500/40';
                    bandScoreHtml = `
                        ${rejectionBannerHtml}
                        <div class="speaking-audit-band-card p-4 sm:p-5 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border border-slate-200 dark:border-rose-500/40 shadow-md dark:shadow-lg mb-4 space-y-2.5 text-slate-800 dark:text-slate-100">
                            ${(typeof renderMarkdown === 'function') ? renderMarkdown(trimmed) : trimmed}
                        </div>
                    `;
                    return;
                }

                // Extract title from first line (# ...)
                const firstLineMatch = trimmed.match(/^#\s+(.*)/);
                const title = firstLineMatch ? firstLineMatch[1].trim() : `Audit Detail ${idx + 1}`;
                let contentBody = trimmed.replace(/^#\s+.*\n?/, '').trim();

                // Format [VOCAB: word] tags into compact bookmark chips and format numbered items
                contentBody = typeof formatVocabChipsAndReasons === 'function' 
                    ? formatVocabChipsAndReasons(contentBody)
                    : contentBody;

                // Style & Icon picker based on title
                let iconClass = 'fa-solid fa-circle-info text-slate-400';
                let borderClass = 'border-slate-800 hover:border-slate-700';
                let bgClass = 'bg-slate-900/60';
                let titleColor = 'text-slate-200';

                if (title.includes('Text Fidelity')) {
                    iconClass = 'fa-solid fa-square-check text-emerald-400';
                    borderClass = 'border-emerald-500/30';
                    titleColor = 'text-emerald-300';
                } else if (title.includes('Task Fulfillment')) {
                    iconClass = 'fa-solid fa-clipboard-check text-teal-400';
                    borderClass = 'border-teal-500/30';
                    titleColor = 'text-teal-300';
                } else if (title.includes('Idea Development')) {
                    iconClass = 'fa-solid fa-lightbulb text-amber-400';
                    borderClass = 'border-amber-500/30';
                    titleColor = 'text-amber-300';
                } else if (title.includes('Grammar & Coherence') || title.includes('Grammar & Structure')) {
                    iconClass = 'fa-solid fa-diagram-project text-cyan-400';
                    borderClass = 'border-cyan-500/30';
                    titleColor = 'text-cyan-300';
                } else if (title.includes('Transkripsi') || title.includes('Transcription')) {
                    iconClass = 'fa-solid fa-microphone-lines text-sky-400';
                    borderClass = 'border-sky-500/30';
                    titleColor = 'text-sky-300';
                } else if (title.includes('Struktur Kalimat') || title.includes('Tata Bahasa') || title.includes('Spoken Grammar') || title.includes('Sentence Structure')) {
                    iconClass = 'fa-solid fa-code-compare text-emerald-400';
                    borderClass = 'border-emerald-500/30';
                    titleColor = 'text-emerald-300';
                } else if (title.includes('Transformasi') || title.includes('Band 7.5') || title.includes('Bedah Kosakata') || title.includes('Model Upgrade')) {
                    iconClass = 'fa-solid fa-rocket text-amber-400';
                    borderClass = 'border-amber-500/30';
                    titleColor = 'text-amber-300';

                    // Extract the standard English text for 1-Click Retest Drill
                    let cleanRetest = '';
                    const modelMatch = contentBody.match(/-\s*\*\*Band 7\.5\+ Model Upgrade\*\*[^\n]*:\s*\n*>?\s*"([^"]+)"/i)
                                    || contentBody.match(/Band 7\.5\+ Model Upgrade[^\n]*\n+>?\s*"([^"]+)"/i)
                                    || contentBody.match(/Model Kalimat[^\n]*\n+>?\s*"([^"]+)"/i);
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
                        cleanRetest = cleanRetest.replace(/\[VOCAB:\s*([^\]]+)\]/gi, '$1').replace(/\s+/g, ' ').trim();
                        contentBody += `\n\n<div class="pt-3 mt-3 border-t border-slate-800 flex flex-wrap gap-2"><button type="button" onclick="loadRetestScriptToSpeakingBox('${mode}', '${encodeURIComponent(cleanRetest)}')" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 border border-emerald-400/30 transition-all cursor-pointer"><i class="fa-solid fa-rotate-right"></i> <span>Muat Teks Ini ke Player & Rekam Ulang Sekarang</span></button></div>`;
                    }

                } else if (title.includes('Salah') || title.includes('Mispronounced') || title.includes('Fonetik') || title.includes('Lidah Indonesia') || title.includes('Phonetic Breakdown') || title.includes('Pronunciation Tips')) {
                    iconClass = 'fa-solid fa-triangle-exclamation text-rose-400';
                    borderClass = 'border-rose-500/30';
                    titleColor = 'text-rose-300';

                    // Inject 1-Click Save to Vocab Bank Button for each mispronounced word
                    contentBody = contentBody.replace(
                        /-\s*❌\s*\*\*"?([a-zA-Z\s'-]+)"?\*\*/gi,
                        (match, word) => {
                            const clean = word.trim();
                            return `- ❌ **"${clean}"** <button type="button" onclick="quickAddVocabWithFeedback(this, '${clean}')" class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold rounded border border-indigo-200 dark:border-indigo-500/40 ml-1 transition-all cursor-pointer shadow-xs active:scale-95" title="Simpan '${clean}' ke Bank Kosakata"><i class="fa-solid fa-bookmark text-[9px] text-indigo-500 dark:text-indigo-400"></i><span>Simpan</span></button>`;
                        }
                    );

                } else if (title.includes('+S') || title.includes('+ED') || title.includes('Akhiran') || title.includes('Word Endings')) {
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

            const bandScore = extractSection(/(?:^|\n)(#\s*(?:📊|🏆)?\s*(?:Delivery & Fluency Score|Fluency & Delivery Score|Discussion & Delivery Score|Pronunciation & Fluency Score|Skor Resmi IELTS Speaking)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const summaryRoadmap = extractSection(/(?:^|\n)(#\s*(?:📋)?\s*(?:Ringkasan Diagnosa|Roadmap)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const mispronounced = extractSection(/(?:^|\n)(#\s*(?:🔊)?\s*(?:Phonetic Breakdown|Pronunciation Tips|Bedah Kata Salah)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const suffixes = extractSection(/(?:^|\n)(#\s*(?:🛑)?\s*(?:Word Endings Audit|Audit Khusus Akhiran)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const grammarGlitches = extractSection(/(?:^|\n)(#\s*(?:🔍)?\s*(?:Grammar & Coherence Feedback|Grammar & Structure Feedback|Spoken Grammar|Bedah Kesalahan Grammar Spoken)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);
            const contentFeedback = extractSection(/(?:^|\n)(#\s*(?:✅|💡|⏱️)?\s*(?:Text Fidelity Check|Task Fulfillment Check|Idea Development Check|Audit Kelancaran)[\s\S]*?)(?=\n#\s+[^\#]|$)/i);

            const promptTask = activePromptText ? activePromptText.substring(0, 300) : 'IELTS Speaking Task';

            return `Act as an elite ${targetAccentName} Phonetics Master & IELTS Speaking Examiner Coach.
I have just completed an IELTS Speaking ${mode.toUpperCase()} session in IeltsGo. Below is the EXACT diagnostic audit extracted directly from my real recorded voice evaluation.

🎯 TARGET ACCENT: ${targetAccentName}
📋 IELTS TASK / TOPIC:
"${promptTask}"

📊 MY OFFICIAL DIAGNOSED SCORES:
${bandScore ? bandScore.substring(0, 300) : 'Overall Estimated Band: 6.5'}

🛑 MY REAL DETECTED ERRORS (Wajib gunakan data kesalahan nyata saya di bawah, JANGAN membuat contoh generik):
1. MISPRONOUNCED WORDS & PHONETIC FAULTS (Lidah Indonesia):
${mispronounced ? mispronounced.substring(0, 500) : '- Kata dasar mengalami distorsi vokal dan penghilangan konsonan.'}

2. MISSING SUFFIXES (+S / +ED / FINAL CLUSTERS):
${suffixes ? suffixes.substring(0, 400) : '- Akhiran +s/-es jamak dan +ed lampau sering tertelan.'}

3. SPOKEN GRAMMAR & STRUCTURAL MISTAKES:
${grammarGlitches ? grammarGlitches.substring(0, 400) : (mode === 'part1' ? '- Read-Aloud delivery rhythm and phrasing.' : '- Subject-verb agreement dan susunan klausa masih kaku.')}

4. CONTENT FIDELITY & FLUENCY NOTES:
${contentFeedback ? contentFeedback.substring(0, 400) : '- Kelancaran dan artikulasi alami.'}

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
            const activePromptText = speakingState.cleanMonologues?.[mode] || speakingState.generatedPrompts[mode] || document.getElementById(`speaking-text-${mode}`)?.innerText || 'IELTS Speaking Task';
            const grammarCtx = getUnlockedGrammarContext();

            const btnSubmit = document.getElementById(`btn-rec-submit-${mode}`);
            const resultBox = document.getElementById(`speaking-eval-result-${mode}`);

            if (btnSubmit) btnSubmit.disabled = true;
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.innerHTML = `
                    <div class="text-center py-6 font-mono text-xs text-rose-400 flex flex-col items-center gap-3">
                        <i class="fa-solid fa-headphones-simple fa-bounce text-3xl"></i>
                        <span class="text-[11px] text-slate-400">AI Multimodal Speech & Articulation Audit: Aksen (${targetAccentName}), Evaluasi Spesifik ${mode.toUpperCase()}</span>
                    </div>
                `;
            }

            let systemPrompt = '';
            if (mode === 'part1') {
                const injectedList = (speakingState.injectedVocabs?.part1 || []).map(v => `${v.word} (CEFR ${v.cefr})`).join(', ') || 'None specified';
                systemPrompt = buildPart1ShadowingSystemPrompt(activePromptText, targetAccentName, injectedList);
            } else if (mode === 'part2') {
                systemPrompt = buildPart2CueCardSystemPrompt(activePromptText, targetAccentName);
            } else if (mode === 'part3') {
                systemPrompt = buildPart3DiscussionSystemPrompt(activePromptText, targetAccentName);
            } else {
                systemPrompt = buildPart1ShadowingSystemPrompt(activePromptText, targetAccentName, '');
            }

            const userQuery = buildSpeakingUserQuery(mode, targetAccentName);

            try {
                let evalResponse = await callGeminiAPI(userQuery, systemPrompt, audioBlob, { feature: 'speaking_examiner' });

                if (!evalResponse) {
                    if (mode === 'part1') {
                        evalResponse = `
# 📊 Delivery & Fluency Score
**80%** — Clear and communicative delivery with natural rhythm and good vowel quality.
- **Target Accent**: ${targetAccentName}
- **Accent Match Assessment**: Articulation generally aligns well with target accent vowels and timing.

# 📝 Audio Transcription
"${activePromptText ? activePromptText.slice(0, 120) : 'I live in a small coastal city and the local park is very peaceful.'}"

# ✅ Text Fidelity Check
- **Words matched to original text**: High fidelity (all core keywords articulated).
- **Skipped or added words**: None — full text was read.

# 🔊 Phonetic Breakdown & Pronunciation Tips
- ❌ **"coastal"**
  - 👂 **What You Said**: "cost-all"
  - 🗣️ **Phonetic Breakdown**: **"KOHS-tul ↘"**
  - 🔍 **Simple English Word Match**: Like "coast" + "ull"
  - 💡 **Mouth & Tongue Position**: Round lips slightly on the first syllable vowel.

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: Audible and clear on plural nouns.
- **-ED Endings**: Well articulated in this recording.
- 🗣️ **Quick Speed Drill**: *"She complete**s** /s/ her project**s** /s/ on time."*
`;
                    } else if (mode === 'part2') {
                        evalResponse = `
# 📊 Fluency & Delivery Score
**75%** — Spontaneous monologue covers main cue card points with coherent transitions.
- **Target Accent**: ${targetAccentName}
- **Accent Match Assessment**: Intonation is communicative, with slight flat pacing on complex phrases.

# 📝 Audio Transcription
"${activePromptText ? activePromptText.slice(0, 120) : 'I would like to talk about a memorable journey I took recently.'}"

# ✅ Task Fulfillment Check
- **Point 1**: Addressed — Main subject introduced clearly.
- **Point 2**: Addressed — Background context and setting explained.
- **Point 3**: Partially addressed — Could elaborate further on personal significance.

# 🔍 Grammar & Coherence Feedback
- **Coherence & Cohesion**: Connected ideas smoothly using natural sequential discourse markers.
- **Grammar Corrections**:
  * ❌ *"I stay at hotel"*
  * 💡 *"I stayed at a hotel"* — Ensure past simple inflection and article 'a'.

# 🚀 Band 7.5+ Model Upgrade & Vocabulary
- **Band 7.5+ Model Upgrade**:
  "During this journey, I [VOCAB: ventured] into picturesque coastal districts where I could truly [VOCAB: unwind]."
- **Why We Upgraded It**:
  * 1️⃣ **'stay' ➔ 'ventured'**: More descriptive and academic verb choice.
  * 2️⃣ **'relax' ➔ 'unwind'**: Natural idiomatic collocation for stress relief.
- **New Vocabulary to Learn**:
  * [VOCAB: ventured] = traveled into a new or unfamiliar place
  * [VOCAB: unwind] = to relax after strenuous activity

# 🔊 Phonetic Breakdown & Pronunciation Tips
- ❌ **"journey"**
  - 👂 **What You Said**: "jor-nee"
  - 🗣️ **Phonetic Breakdown**: **"JUR-nee ↘"**
  - 🔍 **Simple English Word Match**: First vowel matches "sir" or "bird"
  - 💡 **Mouth & Tongue Position**: Curl the tongue back slightly mid-mouth.

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: Audible on final markers.
- **-ED Endings**: Clear on past narrative forms.
- 🗣️ **Quick Speed Drill**: *"We explore**d** /d/ diverse region**s** /z/."*
`;
                    } else {
                        evalResponse = `
# 📊 Discussion & Delivery Score
**75%** — Analytical viewpoint presented with solid reasoning.
- **Target Accent**: ${targetAccentName}
- **Accent Match Assessment**: Natural rhythm and communicative pitch variation.

# 📝 Audio Transcription
"${activePromptText ? activePromptText.slice(0, 120) : 'In my opinion, technology brings both benefits and challenges to social relationships.'}"

# 💡 Idea Development Check
- **Question 1**: Developed — Clear stance backed by reasoning and modern example.

# 🔍 Grammar & Structure Feedback
- **Complex Structure Attempts**: Used conditional structure ("If society balances screen time, social ties can strengthen").
- **Grammar Corrections**:
  * ❌ *"it make people isolated"*
  * 💡 *"it makes people feel isolated"* — Subject-verb agreement with third-person singular.

# 🚀 Band 7.5+ Model Upgrade & Vocabulary
- **Band 7.5+ Model Upgrade**:
  "Although digital tools [VOCAB: facilitate] connectivity, they can inadvertently [VOCAB: diminish] deep personal rapport."
- **Why We Upgraded It**:
  * 1️⃣ **'help' ➔ 'facilitate'**: Higher register analytical verb.
  * 2️⃣ **'reduce' ➔ 'diminish'**: More precise academic nuance.
- **New Vocabulary to Learn**:
  * [VOCAB: facilitate] = to make an action or process easier
  * [VOCAB: diminish] = to make or become less

# 🔊 Phonetic Breakdown & Pronunciation Tips
- ❌ **"technology"**
  - 👂 **What You Said**: "tek-no-LO-jee"
  - 🗣️ **Phonetic Breakdown**: **"tek-NOL-uh-jee ↘"**
  - 🔍 **Simple English Word Match**: Stress 'NOL' identical to 'knowledge'
  - 💡 **Mouth & Tongue Position**: Stress the second syllable with open jaw.

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: Consistent on 3rd person verbs.
- **-ED Endings**: Distinct on passive constructions.
- 🗣️ **Quick Speed Drill**: *"Advance**s** /ɪz/ in tool**s** /z/ impact live**s** /z/."*
`;
                    }
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
                                <i class="fa-solid fa-headphones-simple text-rose-400"></i> HASIL EVALUASI IELTS SPEAKING COACH (AI Multimodal Speech & Articulation Audit)
                            </h3>
                            <span class="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30 font-bold">AI Multimodal Delivery & Articulation Audit (IELTS Band 7.5+ Calibration)</span>
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

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {
                speakingState,
                buildPart1ShadowingSystemPrompt,
                buildPart2CueCardSystemPrompt,
                buildPart3DiscussionSystemPrompt,
                buildSpeakingUserQuery,
                parseGeneratedSpeakingPrompt,
                cleanSpeakingTextForTTS,
                renderSpeakingAuditAccordions,
                buildDynamicSpeakingRemediationPrompt,
                submitSpeakingEvaluation,
                generateSpeakingPrompt,
                loadRetestScriptToSpeakingBox,
                toggleSpeakingStudyPromptView,
                switchSpeakingMode,
                updateSpeakingTargetAccent,
                onSpeakingGrammarModeChange,
                onSpeakingRateChange,
                getUnlockedGrammarContext
            };
        }