/* ============================================================
   IELTS GO — SoundFX · Data Constants · AI Infrastructure
   ============================================================ */

        // Procedural Audio Synthesizer via Web Audio API
        const SoundFX = {
            ctx: null,
            isMuted: (typeof localStorage !== 'undefined' && localStorage.getItem('ielts_audio_muted') === 'true'),
            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume().catch(() => {});
                }
            },
            play(type) {
                if (this.isMuted) return;
                try {
                    this.init();
                    if (!this.ctx) return;
                    
                    const playNotes = () => {
                        const now = this.ctx.currentTime || 0;
                        if (type === 'click') {
                            const osc = this.ctx.createOscillator();
                            const gain = this.ctx.createGain();
                            osc.connect(gain);
                            gain.connect(this.ctx.destination);
                            osc.frequency.setValueAtTime(600, now);
                            gain.gain.setValueAtTime(0.05, now);
                            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
                            osc.start(now);
                            osc.stop(now + 0.06);
                        } else if (type === 'correct') {
                            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                                const osc = this.ctx.createOscillator();
                                const gain = this.ctx.createGain();
                                osc.type = 'triangle';
                                osc.connect(gain);
                                gain.connect(this.ctx.destination);
                                const t = now + (idx * 0.09);
                                osc.frequency.setValueAtTime(freq, t);
                                gain.gain.setValueAtTime(0.1, t);
                                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
                                osc.start(t);
                                osc.stop(t + 0.25);
                            });
                        } else if (type === 'levelup' || type === 'stage_clear') {
                            // Jubilant 4-tone ascending fanfare (C5 -> E5 -> G5 -> C6)
                            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                                const osc = this.ctx.createOscillator();
                                const gain = this.ctx.createGain();
                                osc.type = 'sine';
                                osc.connect(gain);
                                gain.connect(this.ctx.destination);
                                const t = now + (idx * 0.1);
                                osc.frequency.setValueAtTime(freq, t);
                                gain.gain.setValueAtTime(0.12, t);
                                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
                                osc.start(t);
                                osc.stop(t + 0.4);
                            });
                        } else if (type === 'error') {
                            const osc = this.ctx.createOscillator();
                            const gain = this.ctx.createGain();
                            osc.type = 'sawtooth';
                            osc.connect(gain);
                            gain.connect(this.ctx.destination);
                            osc.frequency.setValueAtTime(180, now);
                            osc.frequency.linearRampToValueAtTime(110, now + 0.2);
                            gain.gain.setValueAtTime(0.09, now);
                            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
                            osc.start(now);
                            osc.stop(now + 0.22);
                        }
                    };

                    if (this.ctx.state === 'suspended') {
                        this.ctx.resume().then(() => playNotes()).catch(() => {});
                    } else {
                        playNotes();
                    }
                } catch(e) {
                    console.warn('SoundFX playback warning:', e);
                }
            }
        };

        // Auto unlock AudioContext on first user interaction
        if (typeof window !== 'undefined') {
            const unlockAudio = () => {
                SoundFX.init();
                window.removeEventListener('click', unlockAudio);
                window.removeEventListener('touchstart', unlockAudio);
                window.removeEventListener('keydown', unlockAudio);
            };
            window.addEventListener('click', unlockAudio, { passive: true });
            window.addEventListener('touchstart', unlockAudio, { passive: true });
            window.addEventListener('keydown', unlockAudio, { passive: true });
        }

        function toggleAudioMute() {
            SoundFX.isMuted = !SoundFX.isMuted;
            localStorage.setItem('ielts_audio_muted', SoundFX.isMuted ? 'true' : 'false');
            updateAudioIcons();
            showToast(SoundFX.isMuted ? 'Sound muted.' : 'Sound unmuted.', 'info');
        }

        function updateAudioIcons() {
            const icons = document.querySelectorAll('#btn-audio-mute i, #btn-audio-mute-mobile i');
            icons.forEach(icon => {
                icon.className = SoundFX.isMuted ? 'fa-solid fa-volume-xmark text-red-400' : 'fa-solid fa-volume-high text-cyan-400';
            });
        }

        // Achievements Configuration
        const ACHIEVEMENTS_DATA = [
            { id: 'first_blood', title: 'First Blood', desc: 'Clear your first roadmap stage', icon: 'fa-shoe-prints', condition: (s) => Object.keys(s.completedStages || {}).length >= 1 },
            { id: 'svo_master', title: 'SVO Engineer', desc: 'Complete all 3 stages of Base Engine (Fase 1)', icon: 'fa-shield-halved', condition: (s) => s.completedStages && s.completedStages['stage1-1'] && s.completedStages['stage1-2'] && s.completedStages['stage1-3'] },
            { id: 'time_traveler', title: 'Time Manipulator', desc: 'Complete all 4 stages of Fase 2', icon: 'fa-clock', condition: (s) => s.completedStages && s.completedStages['stage2-1'] && s.completedStages['stage2-2'] && s.completedStages['stage2-3'] && s.completedStages['stage2-4'] },
            { id: 'clause_weaver', title: 'Clause Weaver', desc: 'Complete all 3 stages of Fase 3', icon: 'fa-diagram-project', condition: (s) => s.completedStages && s.completedStages['stage3-1'] && s.completedStages['stage3-2'] && s.completedStages['stage3-3'] },
            { id: 'precision_striker', title: 'Nominalizer', desc: 'Master Passive & Nominalization (Fase 4)', icon: 'fa-crosshairs', condition: (s) => s.completedStages && s.completedStages['stage4-1'] && s.completedStages['stage4-2'] },
            { id: 'automation_ready', title: 'Reflex Automator', desc: 'Finish Retrieval Drills (Fase 5)', icon: 'fa-bolt', condition: (s) => s.completedStages && s.completedStages['stage5-1'] && s.completedStages['stage5-2'] },
            { id: 'mini_boss_slayer', title: 'Sentinel Slayer', desc: 'Defeat your first Phase Mini-Boss', icon: 'fa-shield-virus', condition: (s) => s.miniBossResults && Object.keys(s.miniBossResults).length >= 1 },
            { id: 'all_mini_bosses', title: 'Phase Conqueror', desc: 'Defeat all 5 Phase Mini-Bosses', icon: 'fa-dungeon', condition: (s) => s.miniBossResults && Object.keys(s.miniBossResults).length >= 5 },
            { id: 'speaking_first', title: 'First Voice', desc: 'Complete your first Speaking Lab recording evaluation', icon: 'fa-microphone', condition: (s) => s.speakingHistory && Object.keys(s.speakingHistory).length >= 1 },
            { id: 'speaking_cuecard', title: 'Cue Card Champion', desc: 'Deliver a 2-minute Part 2 Cue Card monologue', icon: 'fa-id-card-clip', condition: (s) => s.speakingHistory && s.speakingHistory['part2'] },
            { id: 'speaking_master', title: 'Speaking Slayer', desc: 'Conquer all 3 Speaking Lab modes', icon: 'fa-comments', condition: (s) => s.speakingHistory && s.speakingHistory['part1'] && s.speakingHistory['part2'] && s.speakingHistory['part3'] },
            { id: 'boss_unlocked', title: 'Arena Challenger', desc: 'Unlock the 60-Minute Boss Arena', icon: 'fa-dragon', condition: (s) => s.bossUnlocked },
            { id: 'grand_master', title: 'Band 8.5 Legend', desc: 'Complete all 14 Stages in the Roadmap', icon: 'fa-crown', condition: (s) => Object.keys(s.completedStages || {}).length >= 14 }
        ];

        // Player State Management (Permanently saved in LocalStorage)
        let playerState = {
            xp: 0,
            level: 1,
            completedStages: {},
            miniBossResults: {},
            speakingHistory: {},
            bossUnlocked: false,
            unlockedAchievements: {}
        };

        const STAGE_XP = 100;
        const LEVEL_XP = 400;

        // Realistic & Challenging CEFR / IELTS Band Progression
        const RANK_TIERS = [
            { minLevel: 1,  title: 'Band 4.0 • Grammar Rookie' },
            { minLevel: 3,  title: 'Band 4.5 • SVO Builder' },
            { minLevel: 5,  title: 'Band 5.0 • Tense Explorer' },
            { minLevel: 8,  title: 'Band 5.5 • Clause Drafter' },
            { minLevel: 12, title: 'Band 6.0 • Competent Writer' },
            { minLevel: 16, title: 'Band 6.5 • Academic Practitioner' },
            { minLevel: 21, title: 'Band 7.0 • Precision Scholar' },
            { minLevel: 28, title: 'Band 7.5 • Fluent Synthesizer' },
            { minLevel: 36, title: 'Band 8.0 • Senior Stylist' },
            { minLevel: 45, title: 'Band 8.5 • Master of Rhetoric' },
            { minLevel: 55, title: 'Band 9.0 • Grand Laureate' },
            { minLevel: 70, title: 'Band 9.0+ • IELTS Grandmaster' }
        ];

        function getPlayerRankTitle(level) {
            let currentTitle = RANK_TIERS[0].title;
            for (let i = 0; i < RANK_TIERS.length; i++) {
                if (level >= RANK_TIERS[i].minLevel) {
                    currentTitle = RANK_TIERS[i].title;
                } else {
                    break;
                }
            }
            return currentTitle;
        }

        const RANK_TITLES = RANK_TIERS.map(t => t.title);

        // Robust Markdown Formatter
        function renderMarkdown(mdText) {
            if (!mdText) return '';
            let html = mdText;

            // Code blocks
            html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-emerald-400 text-xs my-2.5 overflow-x-auto leading-relaxed">$1</pre>');
            
            // Inline code
            html = html.replace(/\`([^\`]+)\`/g, '<code class="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-cyan-400 text-xs border border-slate-800">$1</code>');

            // Headings
            html = html.replace(/^### (.*$)/gim, '<h3 class="text-xs font-mono font-bold text-amber-300 mt-4 mb-2 flex items-center gap-2 uppercase tracking-wide"><i class="fa-solid fa-chevron-right text-[10px] text-amber-400"></i> $1</h3>');
            html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-indigo-300 mt-5 mb-2 border-b border-slate-800 pb-1.5 flex items-center gap-2">$1</h2>');
            html = html.replace(/^# (.*$)/gim, '<h1 class="text-base font-black text-white mt-5 mb-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">$1</h1>');

            // Bold & Italic
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300 font-semibold">$1</strong>');
            html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');

            // Bullet Lists
            html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<div class="flex items-start space-x-2 my-1.5"><i class="fa-solid fa-circle-notch text-[8px] text-cyan-400 mt-1.5"></i><span class="text-slate-300 text-xs leading-relaxed">$1</span></div>');

            // Line breaks
            html = html.replace(/\n\n/g, '<div class="h-2"></div>');
            html = html.replace(/\n/g, '<br>');

            return html;
        }

        // Custom Toast Notification System
        let toastTimeout = null;
        function showToast(message, type = 'info') {
            const toast = document.getElementById('custom-toast');
            const toastMsg = document.getElementById('toast-message');
            const toastIcon = document.getElementById('toast-icon');

            if (!toast || !toastMsg || !toastIcon) return;

            toastMsg.innerText = message;
            if (type === 'success') {
                toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-base';
            } else if (type === 'error') {
                toastIcon.className = 'fa-solid fa-circle-xmark text-red-400 text-base';
            } else {
                toastIcon.className = 'fa-solid fa-circle-info text-blue-400 text-base';
            }

            toast.classList.remove('hidden');
            if (toastTimeout) {
                clearTimeout(toastTimeout);
            }
            toastTimeout = setTimeout(() => {
                toast.classList.add('hidden');
                toastTimeout = null;
            }, 3800);
        }

        // 14 Stages Comprehensive Data Dictionary with 3 High-Quality Curated Questions per Stage & Detailed Option Explanations
        const STAGE_DATA = {
            'stage1-1': {
                title: 'Stage 1: Kerangka Kalimat SVO',
                desc: 'Re-order the words into a clean Subject-Verb-Object sentence:',
                analogy: 'Rangka Kereta Api & Lokomotif: Subject adalah lokomotif penarik, Verb adalah mesin penggerak, dan Object adalah gerbong muatan. Jika Anda menaruh gerbong di depan lokomotif tanpa pengait resmi, kereta akan anjlok (sentence collapse).',
                whyHow: 'Penilai IELTS mendeteksi kebiasaan menerjemahkan harfiah dari pola bahasa ibu yang sering menaruh keterangan di sembarang tempat. Di IELTS, urutan kata SVO yang rigid adalah syarat mutlak agar skor GRA tidak tertahan di Band 5.0.',
                aiPrompt: `Act as an elite IELTS Writing & Speaking Coach. I am mastering Stage 1: English SVO (Subject-Verb-Object) Word Order and eliminating word-for-word translation habits from Indonesian.\n\n1. Explain the fundamental SVO rule using a memorable real-world analogy.\n2. Show 5 common 'buggy' sentences made by candidates (e.g. inverted word order, topicalization errors) and fix them into Band 7.5+ standard SVO academic sentences.\n3. Give me a 5-question interactive translation drill where I must reorder scrambled sentences into precise SVO structures. Do not reveal the answers until I respond.`,
                questions: [
                    {
                        question: 'Select the correct English Subject-Verb-Object word order:',
                        options: [
                            'Students achieve high scores in exams.',
                            'In exams students high scores achieve.',
                            'Achieve students high scores in exams.',
                            'High scores students achieve in exams.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Students" (Subject) + "achieve" (Verb) + "high scores" (Object) + "in exams" (Prepositional Adverbial).',
                            'Glitch: Verb ("achieve") diletakkan di paling belakang (gaya bahasa SOV / terjemahan harfiah).',
                            'Glitch: Verb ("Achieve") diletakkan sebelum Subject tanpa aturan inversi pertanyaan yang valid.',
                            'Glitch: Objek ("High scores") mendahului Subject sehingga menciptakan kerancuan makna.'
                        ]
                    },
                    {
                        question: 'Which sentence maintains strict SVO structure with an introductory adverbial clause?',
                        options: [
                            'In recent years, many countries have adopted renewable energy policies.',
                            'In recent years have adopted many countries renewable energy policies.',
                            'Many countries in recent years renewable energy policies have adopted.',
                            'Adopted many countries renewable energy policies in recent years.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Keterangan waktu diawali koma, diikuti Subject ("many countries") + Verb ("have adopted") + Object ("renewable energy policies").',
                            'Glitch: Verb mendahului Subject setelah frase preposisi.',
                            'Glitch: Objek memotong alur sebelum kata kerja utama.',
                            'Glitch: Kalimat diawali Past Participle tanpa Subject yang jelas.'
                        ]
                    },
                    {
                        question: 'Identify the grammatically correct academic sentence with a compound subject:',
                        options: [
                            'Both governments and private corporations invest substantial capital in public infrastructure.',
                            'Both governments and private corporations substantial capital in public infrastructure invest.',
                            'Invest both governments and private corporations substantial capital in public infrastructure.',
                            'Substantial capital both governments and private corporations invest in public infrastructure.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Subjek gabungan ("Both governments and private corporations") + Verb ("invest") + Object ("substantial capital").',
                            'Glitch: Verb berada di akhir kalimat.',
                            'Glitch: Verb memimpin kalimat tanpa struktur pertanyaan.',
                            'Glitch: Objek berada di depan tanpa konstruksi pasif yang benar.'
                        ]
                    }
                ]
            },
            'stage1-2': {
                title: 'Stage 2: "Be" Anchor Verb Isolation',
                desc: 'Identify the sentence with correct "Be" conjugation:',
                analogy: 'Kabel Grounding / Jangkar Kapal: Dalam bahasa Indonesia, kata sifat bisa berdiri sendiri ("Mereka bingung"). Dalam bahasa Inggris, kalimat tanpa kata kerja utama akan hanyut tanpa jangkar auxiliary "Be" ("They are confused").',
                whyHow: 'Kesalahan paling sering terjadi di Speaking & Writing: "They confused", "This trend significant". Kehilangan "Be" sebelum kata sifat langsung memberi sinyal ke examiner bahwa kontrol grammar dasar belum stabil.',
                aiPrompt: `Act as an expert IELTS Grammar Coach. I am studying Stage 2: Lexical Verbs vs Auxiliary 'Be' Anchors (specifically fixing missing 'be' verbs before adjectives/participles like 'They are confused' vs 'They confused').\n\n1. Give me a crisp explanation with a grounding analogy explaining why adjectives in English cannot function as standalone predicates without a 'Be' anchor.\n2. Provide a comparison table of 6 high-frequency IELTS descriptive words (confused, reluctant, crucial, evident, concerned, inclined) in incorrect (buggy) vs correct Band 7.5+ sentences.\n3. Give me 4 diagnostic sentences with intentional missing 'Be' glitches for me to identify and debug.`,
                questions: [
                    {
                        question: 'Which sentence correctly anchors state with "Be"?',
                        options: [
                            'Many candidates confused about essay structure.',
                            'Many candidates do confused about essay structure.',
                            'Many candidates are confused about essay structure.',
                            'Many candidates is confused about essay structure.'
                        ],
                        correct: 2,
                        explanations: [
                            'Glitch: Hilang auxiliary "Be" sebelum kata sifat "confused".',
                            'Glitch: Menggunakan auxiliary "do" untuk kata sifat "confused".',
                            'Benar! "Many candidates" (jamak) + "are" (Be anchor) + "confused" (adjective predicate).',
                            'Glitch: Kesalahan subjek-verba agreement ("is" digunakan untuk subjek jamak "candidates").'
                        ]
                    },
                    {
                        question: 'Select the sentence with accurate "Be" verb agreement before an academic adjective:',
                        options: [
                            'The statistical evidence is consistent with earlier projections.',
                            'The statistical evidence consistent with earlier projections.',
                            'The statistical evidence are consistent with earlier projections.',
                            'The statistical evidence does consistent with earlier projections.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Evidence" (uncountable noun tunggal) berpasangan dengan "is" + adjective "consistent".',
                            'Glitch: Hilang linking verb "Be" sebelum "consistent".',
                            'Glitch: "Evidence" adalah uncountable noun sehingga tidak bisa dipasangkan dengan "are".',
                            'Glitch: Auxiliary "does" tidak boleh dipasangkan dengan kata sifat.'
                        ]
                    },
                    {
                        question: 'Which sentence correctly uses "Be" anchor in a past situation?',
                        options: [
                            'Local residents were reluctant to support the proposed zoning law.',
                            'Local residents reluctant to support the proposed zoning law.',
                            'Local residents did reluctant to support the proposed zoning law.',
                            'Local residents was reluctant to support the proposed zoning law.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Local residents" (jamak lampau) + "were" + adjective "reluctant".',
                            'Glitch: Missing past Be verb ("were").',
                            'Glitch: "did" tidak boleh dipasangkan langsung dengan kata sifat "reluctant".',
                            'Glitch: "was" adalah bentuk tunggal, sedangkan "residents" adalah jamak.'
                        ]
                    }
                ]
            },
            'stage1-3': {
                title: 'Stage 3: Auxiliary "Do" Transformation',
                desc: 'Transform standard positive sentence into negative:',
                analogy: 'Kunci Pas Khusus Mekanik: Auxiliary "Do" adalah alat bantu yang hanya dipasang saat ingin membongkar kalimat menjadi negatif (do not) atau tanya (do you...?). Jangan memasang 2 kunci pas bersamaan seperti "They are not agree".',
                whyHow: 'Di IELTS Speaking Part 3, kandidat sering panik saat menyatakan ketidaksetujuan dan mengucapkan "I am not agree" atau "They do not fulfilling". Ini merusak kelancaran tata bahasa.',
                aiPrompt: `Act as an IELTS Examiner. I am studying Stage 3: Auxiliary 'Do' in Negations & Questions (avoiding 'I am not agree' or 'They do not fulfilling').\n\n1. Explain the mechanical separation between 'Be' and 'Do' with a clear mental model.\n2. Show 5 high-frequency speaking & writing scenarios where candidates confuse 'Do' and 'Be' in negation/interrogation, and provide the Band 8.0 corrections.\n3. Drill me with 5 positive academic statements to transform into negative formal statements and follow-up inquiry questions.`,
                questions: [
                    {
                        question: 'Negative form of: "They fulfill their financial obligations."',
                        options: [
                            'They not fulfill their financial obligations.',
                            'They do not fulfill their financial obligations.',
                            'They are not fulfill their financial obligations.',
                            'They do not fulfilling their financial obligations.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch: Negasi kata kerja leksikal membutuhkan auxiliary "do not".',
                            'Benar! Formula: Subject + do not + bare infinitive (fulfill).',
                            'Glitch Tabrakan Be & Action: "are not fulfill" mencampurkan auxiliary Be dengan kata kerja dasar.',
                            'Glitch: Setelah "do not", kata kerja harus kembali ke bentuk dasar (V1), bukan V-ing.'
                        ]
                    },
                    {
                        question: 'Which sentence correctly negates the action verb "agree"?',
                        options: [
                            'Many economists do not agree with this taxation model.',
                            'Many economists are not agree with this taxation model.',
                            'Many economists not agree with this taxation model.',
                            'Many economists does not agree with this taxation model.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Agree" adalah kata kerja aksi, sehingga bentuk negasi jamaknya adalah "do not agree".',
                            'Glitch Fatal ("I am not agree glitch"): "Agree" adalah kata kerja, bukan kata sifat.',
                            'Glitch: Hilang auxiliary "do".',
                            'Glitch: "economists" adalah jamak sehingga harus memakai "do", bukan "does".'
                        ]
                    },
                    {
                        question: 'Select the correct formal question format using auxiliary "Do":',
                        options: [
                            'Does this policy guarantee long-term economic stability?',
                            'Is this policy guarantee long-term economic stability?',
                            'Does this policy guarantees long-term economic stability?',
                            'Do this policy guarantee long-term economic stability?'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Formula tanya: Does + Subject tunggal ("this policy") + Bare Verb ("guarantee").',
                            'Glitch: Mencampur "Is" dengan kata kerja aksi "guarantee".',
                            'Glitch: Setelah auxiliary "Does", kata kerja tidak boleh berakhiran "-s" lagi.',
                            'Glitch: "this policy" adalah tunggal sehingga wajib memakai "Does", bukan "Do".'
                        ]
                    }
                ]
            },
            'stage2-1': {
                title: 'Stage 4: Simple Tenses Fluency',
                desc: 'Identify correct Simple Past irregular verb form:',
                analogy: 'Lampu Sorot Garis Waktu: Simple Past adalah lampu sorot pada peristiwa yang sudah terkunci dan padam di masa lalu. Simple Present adalah lampu sorot pada kebenaran umum abadi. Jangan mencampur warna lampu dalam satu paragraf data!',
                whyHow: 'Writing Task 1 laporan data tahun lampau (misal: tren 1990-2020) menuntut konsistensi Past Simple. Begitu pula di Speaking Part 2 saat menceritakan pengalaman pribadi lampau.',
                aiPrompt: `Act as an IELTS Task 1 & Speaking Specialist. I am training Stage 4: Present & Past Simple Fluency and Irregular Verb Retrieval under pressure.\n\n1. Explain when to strictly anchor sentences in Past Simple vs Present Simple in IELTS Task 1 trend reports and Speaking Part 2 storytelling.\n2. Give me a list of 15 essential irregular verbs frequently used in IELTS data trends (e.g., rise-rose-risen, fall-fell-fallen, grow-grew-grown, lead-led-led) with sample sentences.\n3. Provide a timed paragraph transformation challenge: give me a paragraph written in present tense and have me convert it entirely into past historical narrative.`,
                questions: [
                    {
                        question: 'Which sentence correctly describes a completed past event in IELTS Task 1?',
                        options: [
                            'The candidate write an essay yesterday.',
                            'The candidate wrote an essay yesterday.',
                            'The candidate writed an essay yesterday.',
                            'The candidate is write an essay yesterday.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch: Menggunakan Present Simple untuk waktu lampau ("yesterday").',
                            'Benar! "Write" adalah irregular verb dengan bentuk lampau V2 "wrote".',
                            'Glitch: "Writed" bukan bentuk kata kerja yang sah dalam bahasa Inggris.',
                            'Glitch: Konstruksi campur aduk antara "is" dan V1.'
                        ]
                    },
                    {
                        question: 'Select the sentence with accurate irregular verb forms for historical trend reporting:',
                        options: [
                            'Between 2000 and 2010, renewable energy production rose substantially.',
                            'Between 2000 and 2010, renewable energy production rised substantially.',
                            'Between 2000 and 2010, renewable energy production has rose substantially.',
                            'Between 2000 and 2010, renewable energy production was rise substantially.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Rise" memiliki bentuk V2 lampau "rose".',
                            'Glitch: "Rised" adalah bentuk salah.',
                            'Glitch: Present Perfect tidak boleh digunakan bersama rentang waktu lampau spesifik yang sudah selesai.',
                            'Glitch: "was rise" adalah konstruksi pasif cacat.'
                        ]
                    },
                    {
                        question: 'Which sentence correctly maintains tense consistency in a past narrative?',
                        options: [
                            'The government introduced new tax incentives and saw immediate results.',
                            'The government introduced new tax incentives and sees immediate results.',
                            'The government introduce new tax incentives and saw immediate results.',
                            'The government has introduced new tax incentives yesterday and saw results.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Kedua verba ("introduced" dan "saw") konsisten dalam Simple Past.',
                            'Glitch: Tense shift yang tidak konsisten (Past "introduced" berganti ke Present "sees").',
                            'Glitch: Verba pertama menggunakan Present, sedangkan verba kedua Past.',
                            'Glitch: "has introduced" tidak boleh dipasangkan dengan keterangan waktu spesifik "yesterday".'
                        ]
                    }
                ]
            },
            'stage2-2': {
                title: 'Stage 5: Continuous & Future Forms',
                desc: 'Continuous trend description for Task 1:',
                analogy: 'Kamera Video (Continuous) vs Garis Proyeksi Kompas (Future): Continuous menangkap video aksi yang sedang bergulir saat ini, sedangkan Future adalah kalkulasi kompas menuju titik di masa depan.',
                whyHow: 'Krusial untuk Task 1 yang memiliki data tahun depan (misal: "is projected to reach 80% by 2035") dan Speaking Part 3 saat mendiskusikan perubahan sosial masa depan.',
                aiPrompt: `Act as an IELTS Academic Coach. I am studying Stage 5: Continuous Forms and Academic Future Forecasting (will, is predicted to, is projected to, is likely to).\n\n1. Teach me how to describe ongoing trends and future projections for IELTS Writing Task 1 line graphs without using repetitive words.\n2. Provide 6 Band 8.0 sentence structures for making predictions and forecasts based on statistical data.\n3. Give me 3 data points (e.g. Year 2035 projected figures) and challenge me to write high-band predictive sentences. Evaluate my output.`,
                questions: [
                    {
                        question: 'Select the correct continuous trend sentence for ongoing processes:',
                        options: [
                            'The proportion of solar energy is increasing steadily.',
                            'The proportion of solar energy increasing steadily.',
                            'The proportion of solar energy is increase steadily.',
                            'The proportion of solar energy does increasing steadily.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Formula Present Continuous: Subject + is/are + Verb-ing ("is increasing").',
                            'Glitch: Hilang auxiliary "is" sebelum participle "increasing".',
                            'Glitch: "is increase" adalah kombinasi cacat.',
                            'Glitch: Auxiliary "does" tidak berpasangan dengan bentuk "-ing".'
                        ]
                    },
                    {
                        question: 'Which sentence demonstrates academic future projection for IELTS Task 1 data?',
                        options: [
                            'Global oil consumption is projected to decline significantly by 2040.',
                            'Global oil consumption will declining significantly by 2040.',
                            'Global oil consumption is project to decline significantly by 2040.',
                            'Global oil consumption going to decline significantly by 2040.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "is projected to decline" adalah formula akademik standar Band 8.0 untuk estimasi masa depan.',
                            'Glitch: Modal "will" harus diikuti bare verb ("will decline"), bukan "-ing".',
                            'Glitch: "is project" salah bentuk (seharusnya passive participle "projected").',
                            'Glitch: Kurang auxiliary "is" sebelum "going to".'
                        ]
                    },
                    {
                        question: 'Select the correct academic expression of future probability:',
                        options: [
                            'Electric vehicles are likely to dominate the automotive market within the next decade.',
                            'Electric vehicles are likely dominate the automotive market within the next decade.',
                            'Electric vehicles will likely to dominate the automotive market within the next decade.',
                            'Electric vehicles is likely to dominate the automotive market within the next decade.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Formula: Subject jamak ("Electric vehicles") + are + likely + to-infinitive ("to dominate").',
                            'Glitch: Kurang partikel "to" setelah "likely".',
                            'Glitch: Redundansi "will" + "likely to".',
                            'Glitch: Kesalahan agreement ("is" digunakan untuk subjek jamak "vehicles").'
                        ]
                    }
                ]
            },
            'stage2-3': {
                title: 'Stage 6: Modal Verbs & Academic Hedging',
                desc: 'Proper modal verb pairing without extra "to":',
                analogy: 'Bumper Pengaman Mobil: Klaim mutlak ("Akan selalu menghancurkan ekonomi") ibarat mobil tanpa bumper—mudah ditolak oleh akademisi. Modal verbs (may, could, should, tends to) adalah bumper pelindung argumen agar bernilai ilmiah dan terukur.',
                whyHow: 'Menentukan skor Task Achievement di Task 2. Kandidat yang membuat klaim mutlak (over-generalization) biasanya tertahan di Band 6.0 karena argumennya dianggap tidak realistis.',
                aiPrompt: `Act as an IELTS Task 2 Essay Master. I am learning Stage 6: Modal Verbs & Academic Hedging (toning down absolute claims into sophisticated nuanced arguments).\n\n1. Explain the concept of 'Academic Hedging' with an intuitive analogy and why absolute statements (like 'Smoking always kills people') lower IELTS Band scores.\n2. Transform 5 overgeneralized statements into nuanced, Band 8.0 academic claims using modals, probability adverbs, and cautious reporting verbs (e.g. 'It could be argued that...', 'tends to indicate').\n3. Give me 3 controversial prompts and test my ability to write hedged opinion statements.`,
                questions: [
                    {
                        question: 'Select the correct academic modal sentence without grammatical bugs:',
                        options: [
                            'Governments should to implement sustainable policies.',
                            'Governments should implementing sustainable policies.',
                            'Governments should implement sustainable policies.',
                            'Governments should do implement sustainable policies.'
                        ],
                        correct: 2,
                        explanations: [
                            'Glitch: Modal verbs (should) TIDAK BOLEH diikuti partikel "to".',
                            'Glitch: Modal verbs TIDAK BOLEH diikuti bentuk "-ing".',
                            'Benar! Modal verb (should) langsung diikuti Bare Infinitive ("implement").',
                            'Glitch: Redundansi menyisipkan auxiliary "do" setelah modal verb.'
                        ]
                    },
                    {
                        question: 'Which sentence exemplifies high-band "Academic Hedging" (nuanced cautious claim)?',
                        options: [
                            'Excessive screen time inevitably destroys children’s cognitive development.',
                            'Excessive screen time may potentially hinder certain aspects of children’s cognitive development.',
                            'Excessive screen time will 100% destroy children’s cognitive development.',
                            'Excessive screen time must to ruin children’s cognitive development.'
                        ],
                        correct: 1,
                        explanations: [
                            'Terlalu Absolut: "inevitably destroys" adalah over-generalization tanpa ruang toleransi ilmiah.',
                            'Benar! "may potentially hinder" adalah teknik hedging akademik yang aman dan bernilai tinggi di IELTS Task 2.',
                            'Informal & Absolut: "will 100% destroy" tidak sesuai dengan register formal akademik.',
                            'Glitch: "must to ruin" salah tata bahasa.'
                        ]
                    },
                    {
                        question: 'Select the correct deduction modal expressing logical conclusion in writing:',
                        options: [
                            'Such rapid urbanization could create unprecedented challenges for waste management.',
                            'Such rapid urbanization could to create unprecedented challenges for waste management.',
                            'Such rapid urbanization could creating unprecedented challenges for waste management.',
                            'Such rapid urbanization can to create unprecedented challenges for waste management.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "could" + Bare Infinitive ("create").',
                            'Glitch: Menyisipkan "to" setelah "could".',
                            'Glitch: Menggunakan bentuk "-ing" setelah modal.',
                            'Glitch: Menyisipkan "to" setelah "can".'
                        ]
                    }
                ]
            },
            'stage2-4': {
                title: 'Stage 7: Sound-based Articles',
                desc: 'Select correct article based on phonetic sound:',
                analogy: 'Steker Listrik & Getaran Pita Suara: Memilih "a" vs "an" bukan dari huruf abjad pertama, melainkan getaran suara vokal di tenggorokan. Bunyi vokal murni memakai "an", sedangkan bunyi konsonan/semi-vokal memakai "a".',
                whyHow: 'Kesalahan artikel pada kata seperti "a university" vs "an hour" adalah kesalahan presisi mikro yang langsung mengurangi penilaian Grammatical Accuracy.',
                aiPrompt: `Act as an IELTS Linguistics Coach. I am mastering Stage 7: Phonetic Sound Articles (a vs an based on acoustic sound) and High-Value Academic Prepositional Collocations.\n\n1. Explain phonetic rules for 'a' vs 'an' with classic trap words (e.g., European, hour, university, honest, unique, MBA) using clear acoustic analogies.\n2. Give me a curated cheat-sheet of 20 essential IELTS prepositional pairs (e.g., increase in, responsible for, impact on, associated with).\n3. Provide a 10-question rapid-fire fill-in-the-blank quiz with tricky traps to test my mastery.`,
                questions: [
                    {
                        question: 'Which sentence uses phonetic sound articles correctly?',
                        options: [
                            'A orchestra played a European symphony yesterday.',
                            'An orchestra played a European symphony yesterday.',
                            'An orchestra played an European symphony yesterday.',
                            'A orchestra played an European symphony yesterday.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch: "Orchestra" diawali bunyi vokal /ɔː/ sehingga wajib memakai "An".',
                            'Benar! "An orchestra" (bunyi vokal /ɔː/) dan "a European" (bunyi konsonan semi-vowel /j/).',
                            'Glitch: "European" diawali bunyi konsonan semi-vowel /j/ (seperti "you"), jadi harus memakai "a", bukan "an".',
                            'Glitch: Kedua artikel salah tempat.'
                        ]
                    },
                    {
                        question: 'Select the sentence with accurate sound-based articles and prepositions:',
                        options: [
                            'The study required an hour of observation at a university campus.',
                            'The study required a hour of observation at an university campus.',
                            'The study required an hour of observation at an university campus.',
                            'The study required a hour of observation at a university campus.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "An hour" (huruf \'h\' tidak berbunyi, vokal /aʊər/) dan "a university" (bunyi konsonan /j/).',
                            'Glitch: "hour" butuh "an", sedangkan "university" butuh "a".',
                            'Glitch: "university" tidak boleh menggunakan "an".',
                            'Glitch: "hour" tidak boleh menggunakan "a".'
                        ]
                    },
                    {
                        question: 'Which sentence uses correct prepositional collocations for IELTS Task 1 trend descriptions?',
                        options: [
                            'There was a substantial increase in renewable energy consumption.',
                            'There was a substantial increase of renewable energy consumption.',
                            'There was a substantial increase on renewable energy consumption.',
                            'There was a substantial increase at renewable energy consumption.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Frase kata benda kenaikan berpasangan dengan "increase in" + bidang/sektor.',
                            'Kurang Presisi: "increase of" digunakan untuk menyebutkan margin/angka (misal: "an increase of 15%").',
                            'Glitch: "increase on" tidak tepat konteks di Task 1.',
                            'Glitch: "increase at" keliru preposisi.'
                        ]
                    }
                ]
            },
            'stage3-1': {
                title: 'Stage 8: Infinitive vs Gerund Rules',
                desc: 'Verb pattern selection after controlling verbs:',
                analogy: 'Roda Gigi Mesin: Kata kerja tertentu hanya mau mengait ke roda gigi bertipe "to + verb" (tujuan ke depan), sedangkan yang lain hanya mengait ke "-ing" (aktivitas yang dialami). Memaksa keduanya bersatu seperti "need to managing" akan meremukkan gigi mesin kalimat.',
                whyHow: 'Pola verb pattern yang salah di paragraf pengantar atau tesis langsung merusak impresi pertama examiner dan membatasi nilai Grammatical Range.',
                aiPrompt: `Act as an IELTS Examiner. I am studying Stage 8: Infinitive vs Gerund Verb Patterns (e.g., manage to do, consider doing, prevent from doing, look forward to doing).\n\n1. Explain the conceptual difference between Infinitive (future/goal-oriented) and Gerund (activity/experience-oriented) with clear cognitive analogies.\n2. Provide a categorized list of Top 15 IELTS verbs that strictly require Infinitives and Top 15 that strictly require Gerunds, plus verbs whose meaning changes (e.g., stop to do vs stop doing).\n3. Create a 5-question error-detection drill where I have to spot and fix verb pattern bugs.`,
                questions: [
                    {
                        question: 'Select the grammatically accurate verb pattern:',
                        options: [
                            'Young people need to managing money.',
                            'Young people need to manage money.',
                            'Young people need for manage money.',
                            'Young people need manage money.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch ("need to managing glitch"): Kata kerja "need" membutuhkan "to + base verb", bukan "to + gerund".',
                            'Benar! Formula: need + to-infinitive ("to manage").',
                            'Glitch: "need for manage" bukan konstruksi yang sah.',
                            'Glitch: "need" harus memiliki partikel "to" sebelum kata kerja berikutnya.'
                        ]
                    },
                    {
                        question: 'Which sentence correctly pairs verbs requiring Gerunds (-ing) after prepositions?',
                        options: [
                            'Governments should consider investing in public transport instead of subsidizing fossil fuels.',
                            'Governments should consider to invest in public transport instead of to subsidize fossil fuels.',
                            'Governments should consider investing in public transport instead of subsidize fossil fuels.',
                            'Governments should consider to invest in public transport instead of subsidizing fossil fuels.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "consider" diikuti gerund ("investing"), dan setelah preposisi "instead of" wajib gerund ("subsidizing").',
                            'Glitch: "consider" tidak boleh diikuti infinitive "to invest".',
                            'Glitch: Setelah preposisi "of", kata kerja harus berakhiran "-ing".',
                            'Glitch: "consider to invest" adalah kesalahan verb pattern.'
                        ]
                    },
                    {
                        question: 'Identify the sentence with correct verb complementation for "avoid" and "decide":',
                        options: [
                            'Individuals often avoid paying taxes until authorities decide to enforce strict penalties.',
                            'Individuals often avoid to pay taxes until authorities decide enforcing strict penalties.',
                            'Individuals often avoid paying taxes until authorities decide enforcing strict penalties.',
                            'Individuals often avoid to pay taxes until authorities decide to enforce strict penalties.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "avoid" wajib diikuti gerund ("paying"), sedangkan "decide" wajib diikuti infinitive ("to enforce").',
                            'Glitch: Kedua pola terbalik.',
                            'Glitch: "decide" tidak lazim diikuti gerund untuk keputusan tindakan tunggal.',
                            'Glitch: "avoid to pay" adalah kesalahan umum di IELTS Writing.'
                        ]
                    }
                ]
            },
            'stage3-2': {
                title: 'Stage 9: Causative Verbs (Make/Let/Help)',
                desc: 'Causative pattern rule check:',
                analogy: 'Tuas Penggerak Sistem: Kausatif adalah tuas yang membuat orang/pihak lain bertindak. Strukturnya memiliki toleransi presisi: "make someone DO", bukan "make someone to do".',
                whyHow: 'Krusial untuk Task 2 ketika menjelaskan peran kebijakan pemerintah atau institusi ("Governments must make companies reduce emissions", "Schools enable students to develop skills").',
                aiPrompt: `Act as an IELTS Writing Coach. I am training Stage 9: Causative Structures (Make, Let, Have, Help, Enable, Cause) and Academic Phrasal Verbs (carry out, phase out, account for).\n\n1. Explain the exact syntax patterns for Causative verbs with active vs passive agents using a cause-and-effect analogy.\n2. Provide 6 high-scoring academic substitution pairs (e.g. replacing informal 'set up' with 'establish', 'look into' with 'investigate').\n3. Give me 3 policy scenarios where I must construct sentences using causatives to describe government interventions. Evaluate my sentences.`,
                questions: [
                    {
                        question: 'Which causative structure is grammatically correct?',
                        options: [
                            'Schools make students to wear uniforms.',
                            'Schools make students wear uniforms.',
                            'Schools make students wearing uniforms.',
                            'Schools make students for wear uniforms.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch: Kausatif "make" TIDAK BOLEH diikuti "to" (make [someone] DO).',
                            'Benar! Formula kausatif aktif: Subject + make + Object + Bare Infinitive ("wear").',
                            'Glitch: Kausatif "make" tidak berpasangan dengan bentuk "-ing".',
                            'Glitch: "for wear" adalah kesalahan struktur.'
                        ]
                    },
                    {
                        question: 'Select the sentence with accurate causative phrasing for institutional policies:',
                        options: [
                            'Strict regulations enable companies to transition towards carbon neutrality.',
                            'Strict regulations enable companies transition towards carbon neutrality.',
                            'Strict regulations enable companies transitioning towards carbon neutrality.',
                            'Strict regulations makes companies to transition towards carbon neutrality.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Verba "enable" dan "allow" berpasangan dengan Object + to-infinitive ("to transition").',
                            'Glitch: "enable" membutuhkan partikel "to" (berbeda dengan "make").',
                            'Glitch: "enable" tidak diikuti bentuk "-ing".',
                            'Glitch: Kesalahan agreement jamak "regulations makes" dan penambahan "to" pada "make".'
                        ]
                    },
                    {
                        question: 'Which sentence correctly uses "help" in an academic context?',
                        options: [
                            'Financial literacy programs help young adults manage their personal budgets effectively.',
                            'Financial literacy programs help young adults for managing their personal budgets.',
                            'Financial literacy programs helps young adults manage their personal budgets.',
                            'Financial literacy programs help young adults in manage their personal budgets.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Help" diikuti bare infinitive ("manage") atau to-infinitive ("to manage"). Subjek jamak berpasangan dengan "help".',
                            'Glitch: "for managing" tidak lazim setelah objek kausatif.',
                            'Glitch: Subjek jamak "programs" salah dipasangkan dengan verba tunggal "helps".',
                            'Glitch: "in manage" adalah kesalahan preposisi.'
                        ]
                    }
                ]
            },
            'stage3-3': {
                title: 'Stage 10: Clause Combining & Relatives',
                desc: 'Complex clause subordination without double connectors:',
                analogy: 'Jembatan Layang Bertingkat: Menggabungkan dua jalan raya menjadi jembatan bertingkat tanpa memasang dua lampu merah di titik yang sama (Double Conjunction Crash: "Because... so...").',
                whyHow: 'Kriteria penentu Band 7.0+ adalah kemampuan menyusun *complex sentences* dengan *subordinating conjunctions* (Although, Whereas) dan *relative pronouns* (which, who) secara luwes.',
                aiPrompt: `Act as a Senior IELTS Examiner. I am mastering Stage 10: Clause Combining, Subordination, and Relative Clauses (FANBOYS vs Complex Subordinators like Although, Whereas, In spite of, Which, Who).\n\n1. Explain how to combine two simple ideas into a Band 8.0 complex sentence without falling into the 'Double Conjunction' trap (e.g., 'Although... but...').\n2. Show 5 examples of turning simple sentences into non-defining relative clauses and concessive clauses for Task 2 body paragraphs.\n3. Give me 4 pairs of choppy simple sentences and prompt me to synthesize each pair into a single Band 8.0 compound-complex sentence.`,
                questions: [
                    {
                        question: 'Select the accurate complex cause-and-effect sentence without double conjunctions:',
                        options: [
                            'Because people fail to meet obligations so problems arise.',
                            'Because people fail to meet obligations, problems arise.',
                            'Although people fail to meet obligations, problems arise.',
                            'Because of people fail to meet obligations, problems arise.'
                        ],
                        correct: 1,
                        explanations: [
                            'Glitch Fatal ("Double Conjunction Crash"): Menggabungkan "Because" dengan "so" dalam satu kalimat.',
                            'Benar! Klausa subordinatif ("Because people fail...") dipisahkan koma dengan klausa utama ("problems arise").',
                            'Logika Kontradiksi: "Although" menyatakan kontras konsesif, bukan sebab-akibat langsung.',
                            'Glitch: "Because of" harus diikuti noun phrase, bukan klausa penuh (S+V).'
                        ]
                    },
                    {
                        question: 'Which sentence correctly combines clauses with a relative pronoun?',
                        options: [
                            'The proposed legislation, which aims to curb emissions, received bipartisan approval.',
                            'The proposed legislation which it aims to curb emissions received bipartisan approval.',
                            'The proposed legislation, that aims to curb emissions received bipartisan approval.',
                            'The proposed legislation who aims to curb emissions received bipartisan approval.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Non-defining relative clause diapit koma menggunakan "which" untuk merujuk pada benda ("legislation").',
                            'Glitch: Redundansi menyisipkan pronoun "it" di dalam klausa relatif yang sudah memiliki "which".',
                            'Glitch: "that" tidak boleh digunakan dalam non-defining clause berkoma.',
                            'Glitch: "who" hanya digunakan untuk subjek manusia.'
                        ]
                    },
                    {
                        question: 'Select the grammatically accurate concessive complex sentence:',
                        options: [
                            'Although initial setup costs are high, solar panels yield significant long-term savings.',
                            'Although initial setup costs are high, but solar panels yield significant long-term savings.',
                            'Despite initial setup costs are high, solar panels yield significant long-term savings.',
                            'Even though initial setup costs are high, yet solar panels yield significant savings.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "Although" memimpin dependent clause tanpa konjungsi ganda ("but").',
                            'Glitch: "Although... but..." adalah kesalahan double conjunction.',
                            'Glitch: "Despite" harus diikuti noun phrase atau gerund, bukan klausa subjek+verba.',
                            'Glitch: Redundansi "Even though... yet...".'
                        ]
                    }
                ]
            },
            'stage4-1': {
                title: 'Stage 11: Passive Shield & Perfect Tenses',
                desc: 'Passive voice transformation for academic register:',
                analogy: 'Jubah Peneliti Formal: Dalam tulisan ilmiah, fokus utama adalah pada AKSI dan TEMUANNYA, bukan pada siapa yang melakukannya. Passive Voice menyamarkan subjek personal "I / We" menjadi fakta objektif bernilai akademik tinggi.',
                whyHow: 'Menghilangkan gaya bahasa obrolan santai ("People in my city built roads") dan menaikkannya ke register formal ("A sophisticated transit system was constructed"). Wajib di Task 1 Process Diagram.',
                aiPrompt: `Act as an Academic Writing Coach for IELTS. I am learning Stage 11: Passive Voice Shielding and Present Perfect Formulations for Academic Register.\n\n1. Explain why passive voice and impersonal structures (e.g., 'It is widely acknowledged that...', 'Measures have been taken') elevate academic register and objectivity in IELTS essays.\n2. Convert 5 personal/informal sentences (e.g., 'People in the city built new roads') into Band 8.0 passive and perfect constructions.\n3. Provide a Task 1 process diagram description drill where passive voice is mandatory. Guide me step-by-step.`,
                questions: [
                    {
                        question: 'Passive form of: "The council established a new policy."',
                        options: [
                            'A new policy was establish by the council.',
                            'A new policy has established by the council.',
                            'A new policy was established by the council.',
                            'A new policy is establish by the council.'
                        ],
                        correct: 2,
                        explanations: [
                            'Glitch: Lupa bentuk Past Participle V3 ("establish" seharusnya "established").',
                            'Glitch: Menjadi makna aktif dalam Present Perfect ("has established").',
                            'Benar! Simple Past Passive: was + Past Participle ("was established").',
                            'Glitch: Salah tenses dan verba dasar tidak berubah ke V3.'
                        ]
                    },
                    {
                        question: 'Select the correct Present Perfect Passive construction for Task 1/2:',
                        options: [
                            'Substantial investments have been allocated to modernizing the railway infrastructure.',
                            'Substantial investments has been allocated to modernizing the railway infrastructure.',
                            'Substantial investments have allocated to modernizing the railway infrastructure.',
                            'Substantial investments have being allocated to modernizing the railway infrastructure.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Subjek jamak ("investments") + have been + Past Participle ("allocated").',
                            'Glitch: "investments" adalah jamak, tidak boleh dipasangkan dengan "has".',
                            'Glitch: Menjadi kalimat aktif tanpa "been" (investasi tidak bisa mengalokasikan dirinya sendiri).',
                            'Glitch: "have being" salah rumus tata bahasa.'
                        ]
                    },
                    {
                        question: 'Which impersonal passive structure is best suited for an IELTS Task 2 introduction?',
                        options: [
                            'It is widely argued that economic globalization creates both opportunities and challenges.',
                            'It is widely argue that economic globalization creates both opportunities and challenges.',
                            'It widely argues that economic globalization creates both opportunities and challenges.',
                            'It is widely been argued that economic globalization creates both opportunities.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! "It is widely argued that..." adalah template formal impersonal passive Band 8.0+.',
                            'Glitch: "argue" harus dalam bentuk V3 ("argued").',
                            'Glitch: Frase aktif tanpa subjek agen yang logis.',
                            'Glitch: "is widely been" salah kombinasi tenses.'
                        ]
                    }
                ]
            },
            'stage4-2': {
                title: 'Stage 12: Nominalization & Register',
                desc: 'Converting action verbs to academic concept nouns:',
                analogy: 'Mengemas Barang Curah ke Kontainer Resmi: Daripada mengangkut 5 karung barang terpisah ("Ketika orang makan terlalu banyak gula, kesehatan mereka memburuk"), nominalisasi mengemasnya menjadi 1 kontainer ringkas ("Excessive sugar consumption leads to health deterioration").',
                whyHow: 'Kunci lompatan skor dari Band 6.5 ke Band 8.0 pada kriteria Lexical Resource dan Grammatical Range. Esai Band 8+ padat dengan noun phrase berbobot.',
                aiPrompt: `Act as an elite IELTS Examiner. I am studying Stage 12: Nominalization (converting verbs/adjectives into abstract nouns) and Parallel Structure in academic lists.\n\n1. Explain the power of 'Nominalization' using a 'packaging loose items into freight containers' analogy to show how it creates concise, authoritative academic prose.\n2. Show 6 before-and-after transformations: Verb-heavy, conversational sentences $\\rightarrow$ Compact, nominalized Band 8.5 academic statements.\n3. Give me 4 verbose sentences and ask me to nominalize the core actions. Review my answers and give precise Band score feedback.`,
                questions: [
                    {
                        question: 'Nominalized form of: "You need to manage resources well."',
                        options: [
                            'Effective management of resources is essential.',
                            'You must manage resources nicely.',
                            'Managing resources by you is needed.',
                            'People need to manage resources.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Mengubah kata kerja "manage" menjadi noun phrase berbobot "Effective management of resources".',
                            'Informal: Masih menggunakan gaya bahasa percakapan informal "You must... nicely".',
                            'Kaku: Pasif canggung yang masih bergantung pada kata ganti personal.',
                            'Gaya Bahasa Dasar: Masih berupa kalimat tindakan sederhana tanpa peningkatan register.'
                        ]
                    },
                    {
                        question: 'Transform: "Because the climate is changing rapidly, sea levels are rising." $\\rightarrow$ High-band nominalized version:',
                        options: [
                            'Rapid climate change has precipitated a marked rise in sea levels.',
                            'Because climate changes very quickly, so sea levels rise.',
                            'The changing of climate rapidly is making sea levels to rise up.',
                            'Climate changes rapidly and this is causing sea level rising.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Mengubah "climate is changing rapidly" menjadi "Rapid climate change" dan "sea levels are rising" menjadi "a marked rise in sea levels" (Band 8.5 Register).',
                            'Glitch: Double conjunction "Because... so..." dan bahasa percakapan dasar.',
                            'Kaku & Glitch: "making sea levels to rise" kausatif salah dan frase nomina canggung.',
                            'Informal: Gaya koordinasi sederhana "and this is causing".'
                        ]
                    },
                    {
                        question: 'Which sentence demonstrates correct Parallel Structure across nominalized elements?',
                        options: [
                            'The curriculum promotes critical thinking, financial literacy, and digital competence.',
                            'The curriculum promotes critical thinking, managing finances, and digital competence.',
                            'The curriculum promotes critical thinking, to be financially literate, and digital competence.',
                            'The curriculum promotes to think critically, financial literacy, and being digital.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Ketiga elemen berupa Noun Phrase yang paralel: [critical thinking] + [financial literacy] + [digital competence].',
                            'Glitch: Struktur tidak paralel (Noun Phrase + Gerund Clause + Noun Phrase).',
                            'Glitch: Struktur mencampur Noun Phrase dengan Infinitive Clause.',
                            'Glitch: Struktur tidak seimbang di ketiga bagian daftar.'
                        ]
                    }
                ]
            },
            'stage5-1': {
                title: 'Stage 13: Sentence Transformation Drill',
                desc: 'Automating instant sentence transformation:',
                analogy: 'Refleks Petarung / Pemain Musik: Bukan hanya tahu tangga nada saat melihat partitur, tetapi jari mampu menekan tuts piano secara instan dalam 3 variasi melodi saat improvisasi panggung.',
                whyHow: 'Menjembatani "comprehension vs production gap"—di mana kandidat paham saat membaca buku, tetapi otaknya macet saat harus memproduksi esai 250 kata dalam 40 menit.',
                aiPrompt: `Act as a High-Intensity IELTS Reflex Coach. I am drilling Stage 13: Rapid Sentence Transformation & Output Retrieval under time pressure.\n\n1. Explain the neurological concept of 'comprehension vs retrieval/production gap' in IELTS and how rapid transformation drills bridge this gap.\n2. Give me ONE core idea (e.g. 'Air pollution is getting worse in cities'), and prompt me to generate 4 distinct Band 7.5+ variations: (a) Active with modal hedging, (b) Passive reporting, (c) Nominalized cause-and-effect, (d) Concessive complex clause.\n3. Conduct an interactive 3-round rapid drill where you give me a prompt and evaluate my transformations instantly.`,
                questions: [
                    {
                        question: 'Rapid transform: "They avoid spending money." $\\rightarrow$ Formal focus:',
                        options: [
                            'Avoidance of expenditure is recommended.',
                            'They try to not spend money.',
                            'Spending money is avoided by them.',
                            'They avoid to spend money.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Transformasi dari kata kerja informal "avoid spending" menjadi noun phrase akademis "Avoidance of expenditure".',
                            'Informal: Gaya bahasa percakapan sehari-hari.',
                            'Kaku: Pasif canggung dengan agen personal "by them".',
                            'Glitch: "avoid" salah dipasangkan dengan to-infinitive.'
                        ]
                    },
                    {
                        question: 'Rapid transform: "People throw rubbish in rivers, so water gets polluted." $\\rightarrow$ Band 8.0 complex synthesis:',
                        options: [
                            'Indiscriminate waste disposal directly exacerbates aquatic pollution.',
                            'People throwing rubbish in rivers causes that water gets polluted.',
                            'Because people throw rubbish, so water is becoming dirty.',
                            'Water gets polluted due to people are throwing rubbish.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Mensintesis dua ide sederhana menjadi satu klausa berbobot dengan verba presisi "exacerbates aquatic pollution".',
                            'Canggung: "causes that water gets polluted" bukan struktur alami bahasa Inggris.',
                            'Glitch: Double conjunction "Because... so...".',
                            'Glitch: "due to" diikuti klausa penuh (seharusnya noun phrase).'
                        ]
                    },
                    {
                        question: 'Rapid transform: "More tourists visit the island and damage coral reefs." $\\rightarrow$ Concessive / Passive formulation:',
                        options: [
                            'Although increased tourism stimulates local commerce, fragile coral ecosystems have suffered severe degradation.',
                            'More tourists visit and coral reefs are damaged by them.',
                            'Tourist numbers are increasing and because of this reefs are destroyed.',
                            'Despite tourists are visiting, coral reefs get damaged.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Menggabungkan kedua sisi argumen secara seimbang dengan concessive subordination ("Although...").',
                            'Sederhana: Hanya berupa compound sentence sederhana tanpa variasi kosakata akademik.',
                            'Informal: "and because of this" adalah gaya bertutur lisan.',
                            'Glitch: "Despite" diikuti klausa subjek+verba.'
                        ]
                    }
                ]
            },
            'stage5-2': {
                title: 'Stage 14: Bug Hunting & Self-Correction',
                desc: 'Spotting double-conjunction glitches:',
                analogy: 'Linter Kode & Quality Control Inspector: Memasang scanner otomatis di mata Anda untuk mendeteksi bug sintaksis dalam 3 menit terakhir sebelum esai diserahkan ke examiner.',
                whyHow: 'Menyisihkan 3 menit untuk proofreading terarah dan memperbaiki 3 kesalahan kecil artikel/tenses dapat mendongkrak skor GRA dari 6.0 langsung ke 7.0.',
                aiPrompt: `Act as an IELTS Senior Quality Control Examiner. I am practicing Stage 14: Bug Hunting, Proofreading Loops, and Speed Self-Correction.\n\n1. Teach me the 'Top 7 IELTS Grammar Glitches Checklist' to scan for in the final 3 minutes of an exam.\n2. Provide a 150-word sample IELTS essay body paragraph that contains 6 embedded grammar glitches (missing 'be', double conjunctions, faulty nominalization, preposition errors).\n3. Challenge me to find, explain, and correct all 6 glitches. Reveal the answer key only after I submit my findings.`,
                questions: [
                    {
                        question: 'Identify the glitch in: "Although it was raining, but they went outside."',
                        options: [
                            'No glitch found.',
                            'Using both "Although" and "but" creates a double-conjunction glitch.',
                            '"Raining" should be "rain".',
                            '"Outside" requires a preposition.'
                        ],
                        correct: 1,
                        explanations: [
                            'Salah: Kalimat tersebut memiliki bug konjungsi fatal.',
                            'Benar! "Although" dan "but" keduanya adalah konjungsi. Hapus "but" untuk memulihkan gramatika.',
                            'Salah: "was raining" sudah benar dalam Past Continuous.',
                            'Salah: "went outside" adalah kolokasi yang benar tanpa preposisi tambahan.'
                        ]
                    },
                    {
                        question: 'Spot the bug in: "The government must to allocate more funds because education is crucial."',
                        options: [
                            'Modal verb "must" incorrectly paired with "to".',
                            '"crucial" requires an auxiliary "do".',
                            '"education" must be pluralized.',
                            '"more funds" is grammatically incorrect.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Modal verb "must" harus langsung diikuti bare verb ("must allocate"), bukan "must to allocate".',
                            'Salah: "education is crucial" sudah benar dengan Be anchor.',
                            'Salah: "education" adalah uncountable noun abstrak.',
                            'Salah: "more funds" sudah tepat.'
                        ]
                    },
                    {
                        question: 'Find the error in: "Despite of rising living costs, consumer spending increased."',
                        options: [
                            '"Despite" must not be followed by the preposition "of".',
                            '"rising" must be changed to "rose".',
                            '"consumer spending" is grammatically incorrect.',
                            '"increased" should be in present tense.'
                        ],
                        correct: 0,
                        explanations: [
                            'Benar! Gunakan "Despite [noun phrase]" atau "In spite of [noun phrase]". Bentuk "Despite of" adalah kesalahan kontaminasi.',
                            'Salah: "rising" berfungsi sebagai participle adjective yang tepat untuk "costs".',
                            'Salah: "consumer spending" adalah kolokasi akademik standar.',
                            'Salah: "increased" sudah konsisten dengan konteks historis lampau.'
                        ]
                    }
                ]
            }
        };

        // Add writingPrompt context to each stage (Step 2 of Dual-Stage Quest)
        const STAGE_WRITING_PROMPTS = {
            'stage1-1': {
                writingPrompt: 'Tulis 1-2 kalimat bahasa Inggris yang mendeskripsikan rutinitas atau kebiasaan seseorang, menggunakan struktur Subject-Verb-Object yang benar.',
                writingExample: 'Contoh: "University students submit assignments on time." atau "Researchers analyze data carefully."',
                writingHint: 'Pastikan: [Siapa] + [melakukan apa] + [kepada apa/di mana]. Jangan terbalik!'
            },
            'stage1-2': {
                writingPrompt: 'Tulis 1-2 kalimat akademik menggunakan "Be" sebagai anchor verb (be + adjective / be + noun phrase). Contoh topik: kondisi lingkungan, situasi pendidikan, atau keadaan ekonomi.',
                writingExample: 'Contoh: "Air quality in urban areas is increasingly concerning." atau "Local residents are reluctant to relocate."',
                writingHint: 'Ingat: [Subjek] + [am/is/are/was/were] + [kata sifat]. Jangan tinggalkan "Be"!'
            },
            'stage1-3': {
                writingPrompt: 'Tulis 1 kalimat positif dan 1 kalimat negatifnya menggunakan auxiliary "Do/Does/Did" pada topik kebijakan atau kebiasaan.',
                writingExample: 'Contoh: "Many economists support this policy." → "Many economists do not support this policy."',
                writingHint: 'Formula negasi: [Subjek] + do/does/did + not + [V1 tanpa -s]. Jangan gunakan "are not" untuk kata kerja aksi!'
            },
            'stage2-1': {
                writingPrompt: 'Tulis 2 kalimat untuk mendeskripsikan tren data: satu kalimat Simple Past (masa lalu), satu kalimat Simple Present (fakta umum). Topik: energi, pendidikan, atau ekonomi.',
                writingExample: 'Contoh: "Renewable energy production rose by 40% between 2000 and 2020. Currently, solar power accounts for a significant share of global electricity generation."',
                writingHint: 'Simple Past: gunakan V2 (rose, fell, increased). Simple Present: gunakan V1/V1+s (rises, accounts).'
            },
            'stage2-2': {
                writingPrompt: 'Tulis 1 kalimat tentang tren yang sedang berlangsung (Present Continuous) dan 1 kalimat tentang prediksi masa depan (is projected to / is likely to).',
                writingExample: 'Contoh: "Electric vehicle adoption is accelerating rapidly. Battery costs are projected to decline further by 2030."',
                writingHint: 'Tren: is/are + V-ing. Prediksi: is projected to / is likely to / is expected to + V1.'
            },
            'stage2-3': {
                writingPrompt: 'Tulis 2 kalimat opini akademik menggunakan modal hedging (should, could, may, might) untuk membahas solusi atas masalah lingkungan atau sosial.',
                writingExample: 'Contoh: "Governments should implement stricter emission regulations. Individuals could also contribute by adopting sustainable practices."',
                writingHint: 'Modal verb + bare infinitive (tanpa "to" dan tanpa "-ing"). Hindari klaim absolut!'
            },
            'stage2-4': {
                writingPrompt: 'Tulis 1-2 kalimat akademik menggunakan artikel yang tepat (a/an berdasarkan bunyi) dan preposisi yang akurat (increase in, impact on, responsible for).',
                writingExample: 'Contoh: "An unprecedented rise in urban pollution has had a significant impact on public health." atau "A university study found an hourly exposure limit."',
                writingHint: 'Cek bunyi awal kata: bunyi vokal → "an", bunyi konsonan/semi-vokal → "a". "University" = /j/ = "a university".'
            },
            'stage3-1': {
                writingPrompt: 'Tulis 1-2 kalimat menggunakan pola infinitive dan gerund secara tepat. Gunakan verba: need to, decide to, consider, enjoy, avoid, manage to.',
                writingExample: 'Contoh: "Young adults need to develop financial literacy before they consider investing in the stock market."',
                writingHint: 'need/decide/want + to-infinitive. consider/avoid/enjoy + gerund (-ing). Setelah preposisi selalu -ing!'
            },
            'stage3-2': {
                writingPrompt: 'Tulis 1-2 kalimat menggunakan struktur kausatif (make, help, enable, allow, let) dalam konteks kebijakan pendidikan atau pemerintahan.',
                writingExample: 'Contoh: "Mandatory financial education helps students manage their personal budgets. Such programs also enable young people to make informed economic decisions."',
                writingHint: 'make/let + V1 (tanpa to). enable/allow/help + to-V1 (dengan to).'
            },
            'stage3-3': {
                writingPrompt: 'Tulis 1 kalimat kompleks dengan klausa konsesif (Although / Even though / Whereas) dan 1 kalimat dengan relative clause (which / who) tentang topik pendidikan atau teknologi.',
                writingExample: 'Contoh: "Although initial implementation costs are substantial, the long-term benefits of digital education outweigh these expenses. This approach, which has been adopted by several developed nations, demonstrates measurable improvements in literacy rates."',
                writingHint: 'Although/Even though: jangan tambahkan "but" di klausa kedua! Relative clause dengan "which" untuk benda, "who" untuk manusia.'
            },
            'stage4-1': {
                writingPrompt: 'Tulis 1 kalimat passive voice (Simple Past atau Present Perfect Passive) dan 1 kalimat menggunakan impersonal passive ("It is widely argued/reported that...") tentang isu kebijakan.',
                writingExample: 'Contoh: "A comprehensive environmental policy has been implemented by the municipal government. It is widely acknowledged that such regulations significantly reduce industrial pollution."',
                writingHint: 'Passive: [be] + [V3 past participle]. Present Perfect Passive: has/have been + V3. Impersonal: It is widely [argued/believed/reported] that...'
            },
            'stage4-2': {
                writingPrompt: 'Tulis 2 kalimat akademik dengan nominalisasi: ubah kata kerja aksi menjadi noun phrase (manage → management, develop → development, pollute → pollution).',
                writingExample: 'Contoh: "Effective waste management requires substantial governmental investment. The rapid deterioration of natural ecosystems has prompted international concern."',
                writingHint: 'manage → management, develop → development, pollute → pollution, fail → failure, invest → investment. Gunakan sebagai subjek atau objek!'
            },
            'stage5-1': {
                writingPrompt: 'Ambil kalimat sederhana berikut dan tulis dalam 2 versi Band 7.5+: (a) nominalisasi, (b) passive + hedging modal. Kalimat asal: "Many people waste water every day."',
                writingExample: 'Contoh (a): "Indiscriminate water wastage remains a pervasive global concern." (b): "Water resources are believed to be squandered on a daily basis across numerous regions."',
                writingHint: 'Transformasi kunci: [kata kerja informal] → [noun phrase formal]. Tambahkan precision adverbs: substantially, considerably, markedly.'
            },
            'stage5-2': {
                writingPrompt: 'Tulis 3-4 kalimat essay mini yang mengintegrasikan semua 14 skill: SVO, Be anchor, tenses, modals, passive, nominalization, dan clause complexity. Topik: "Technology is changing education."',
                writingExample: 'Contoh: "The rapid integration of digital tools into educational institutions has fundamentally transformed conventional learning methodologies. Although access to technology remains unequal across socio-economic groups, it is widely acknowledged that such innovations could substantially enhance academic outcomes when implemented systematically."',
                writingHint: 'Cek: SVO, nominalisasi, passive voice, modal hedging, complex clause, dan tenses yang konsisten.'
            }
        };

        // Phase Mini-Boss Configuration Data
        const MINI_BOSS_DATA = {
            phase1: {
                phaseId: 'phase1',
                bossName: 'The SVO Sentinel',
                bossIcon: 'fa-robot',
                color: 'emerald',
                stages: ['stage1-1', 'stage1-2', 'stage1-3'],
                title: 'Fase 1 Mini-Boss: The SVO Sentinel',
                briefing: 'Mini-Boss ini akan menguji penguasaan fondasi grammar Anda: SVO order, Be anchor, dan Do auxiliary. Kirimkan paragraf Anda untuk mendapatkan diagnosa detail keunggulan dan kelemahan.',
                essayPrompt: 'Describe your daily routine or a typical day at your workplace/university (3-4 sentences). Focus on using correct SVO structure, Be verb anchors for states/conditions, and Do auxiliary for negation or questions.',
                essayMinWords: 50,
                essayMaxWords: 120,
                grammarFocus: ['SVO word order', 'Be verb as state anchor', 'Do/Does auxiliary for negation'],
                stageNames: {
                    'stage1-1': 'Stage 1: SVO Sentence Frame',
                    'stage1-2': 'Stage 2: Be Anchor Verb',
                    'stage1-3': 'Stage 3: Do Auxiliary'
                },
                xpReward: 300
            },
            phase2: {
                phaseId: 'phase2',
                bossName: 'The Tense Titan',
                bossIcon: 'fa-clock-rotate-left',
                color: 'blue',
                stages: ['stage2-1', 'stage2-2', 'stage2-3', 'stage2-4'],
                title: 'Fase 2 Mini-Boss: The Tense Titan',
                briefing: 'The Tense Titan akan menguji kemampuan Anda menggunakan berbagai sistem waktu secara akurat dan modal hedging yang sesuai register akademik.',
                essayPrompt: 'Describe a significant change or trend you have observed in your community or field of interest over the past decade. Include what happened in the past, what is happening now, and what may happen in the future. Use appropriate tenses and modal verbs for hedging (3-4 sentences).',
                essayMinWords: 60,
                essayMaxWords: 150,
                grammarFocus: ['Simple Past vs Present consistency', 'Continuous forms for ongoing trends', 'Academic modal hedging (may, could, should)', 'Phonetic articles and prepositions'],
                stageNames: {
                    'stage2-1': 'Stage 4: Simple Tenses',
                    'stage2-2': 'Stage 5: Continuous & Future',
                    'stage2-3': 'Stage 6: Modal Hedging',
                    'stage2-4': 'Stage 7: Articles & Prepositions'
                },
                xpReward: 400
            },
            phase3: {
                phaseId: 'phase3',
                bossName: 'The Clause Commander',
                bossIcon: 'fa-diagram-project',
                color: 'purple',
                stages: ['stage3-1', 'stage3-2', 'stage3-3'],
                title: 'Fase 3 Mini-Boss: The Clause Commander',
                briefing: 'Clause Commander menguji kompleksitas kalimat Anda: pola verb pattern, struktur kausatif, dan kemampuan menggabungkan klausa tanpa double conjunction.',
                essayPrompt: 'Discuss TWO possible solutions to an environmental problem in your country (such as air pollution, deforestation, or plastic waste). Use causative structures, verb patterns (infinitive/gerund), and complex clause linking. Write 3-4 sentences.',
                essayMinWords: 60,
                essayMaxWords: 150,
                grammarFocus: ['Infinitive vs Gerund verb patterns', 'Causative structures (make, help, enable)', 'Complex clause combining without double conjunctions', 'Relative clauses (which/who)'],
                stageNames: {
                    'stage3-1': 'Stage 8: Infinitive vs Gerund',
                    'stage3-2': 'Stage 9: Causative Structures',
                    'stage3-3': 'Stage 10: Clause Combining'
                },
                xpReward: 300
            },
            phase4: {
                phaseId: 'phase4',
                bossName: 'The Precision Paladin',
                bossIcon: 'fa-crosshairs',
                color: 'amber',
                stages: ['stage4-1', 'stage4-2'],
                title: 'Fase 4 Mini-Boss: The Precision Paladin',
                briefing: 'The Precision Paladin menguji register akademik Anda: passive voice, present perfect, dan nominalisasi untuk menciptakan prosa yang berbobot dan formal.',
                essayPrompt: 'Write a formal academic paragraph (3-4 sentences) about the impact of a government education or environmental policy. Use: (a) at least ONE passive voice construction, (b) ONE impersonal structure ("It is widely argued/believed"), (c) ONE nominalized phrase (e.g., "the implementation of..." or "educational development").',
                essayMinWords: 60,
                essayMaxWords: 150,
                grammarFocus: ['Passive voice (Simple Past & Present Perfect Passive)', 'Impersonal passive structures', 'Nominalization (verb → noun phrase)', 'Parallel structure in academic lists'],
                stageNames: {
                    'stage4-1': 'Stage 11: Passive Voice & Perfect Tenses',
                    'stage4-2': 'Stage 12: Nominalization & Register'
                },
                xpReward: 200
            },
            phase5: {
                phaseId: 'phase5',
                bossName: 'The Grand Automaton',
                bossIcon: 'fa-bolt-lightning',
                color: 'cyan',
                stages: ['stage5-1', 'stage5-2'],
                title: 'Fase 5 Mini-Boss: The Grand Automaton',
                briefing: 'The Grand Automaton is your final gateway. Write a fully-integrated paragraph demonstrating ALL 14 stage competencies simultaneously: SVO, Be anchor, tenses, modals, passive, nominalization, complex clauses, and bug-free self-editing.',
                essayPrompt: 'Write a fully integrated academic paragraph (4-5 sentences) on the topic: "Technology is reshaping the way people learn and work." Your paragraph must demonstrate: correct SVO, active/passive mix, modal hedging, nominalization, at least one complex clause (Although/whereas/which), and consistent tense. This is your ultimate grammar integration challenge!',
                essayMinWords: 80,
                essayMaxWords: 180,
                grammarFocus: ['Full Grammar Integration (all 14 stages)', 'Sentence transformation from simple to complex', 'Bug detection and self-correction', 'Consistent tense and register throughout'],
                stageNames: {
                    'stage5-1': 'Stage 13: Sentence Transformation',
                    'stage5-2': 'Stage 14: Bug Hunting & Proofreading'
                },
                xpReward: 500
            }
        };

        let currentActiveStageId = null;
        let currentQuestQuestionIndex = 0;
        let currentQuestStep = 'mcq'; // 'mcq' | 'writing' | 'done'
        let currentActivePromptStageId = null;
        let currentMiniBossPhase = null;

        // Initialize state on window load (Restores ALL saved progress & drafts from LocalStorage)
        window.onload = function() {
            initColorMode();
            loadSaveData();
            restoreDraftsAndSettings();
            loadVocabBank();
            calculateStreak();
            updateUI();
            checkAchievements();
            renderDashboard();
        };

        // Accessibility: Close modals on ESC
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeQuestModal();
                closePromptModal();
                closeAchievementsModal();
                closeResetModal();
                closeApiKeyModal();
                closeVocabCard();
                closeReviewModal();
                closeAffirmationsManager();
            }
        });

        // LocalStorage Management