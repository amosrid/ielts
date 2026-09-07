const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Provide browser globals mock before loading 4-speaking.js
global.window = {
    speechSynthesis: { speaking: false, getVoices: () => [] },
    AudioContext: class MockAudioContext {
        constructor() { this.state = 'running'; }
        createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } }; }
        createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    },
    open: (url, target) => {
        global.lastOpenedUrl = { url, target };
        return { closed: false };
    }
};
if (typeof navigator !== 'undefined') {
    Object.defineProperty(navigator, 'clipboard', {
        value: {
            writeText: async (t) => {
                global.lastCopiedText = t;
                return Promise.resolve();
            }
        },
        configurable: true,
        writable: true
    });
} else {
    global.navigator = {
        clipboard: {
            writeText: async (t) => {
                global.lastCopiedText = t;
                return Promise.resolve();
            }
        }
    };
}
global.URL = {
    createObjectURL: (blob) => `blob:mock-url-${Math.random()}`,
    revokeObjectURL: (url) => {}
};
global.document = {
    getElementById: () => null,
    createElement: (tag) => {
        return {
            tagName: tag.toUpperCase(),
            style: {},
            click() { this.clicked = true; global.lastClickedElement = this; }
        };
    },
    body: {
        appendChild(el) { global.appendedChild = el; },
        removeChild(el) { global.removedChild = el; }
    }
};
global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
};
global.SoundFX = { play(sound) { global.lastSoundPlayed = sound; } };
global.showToast = (msg, type) => { global.lastToast = { msg, type }; };
global.addXP = () => {};
global.triggerConfetti = () => {};
global.updateUI = () => {};
global.saveGameData = () => {};
global.playerState = { completedStages: {}, speakingHistory: {} };
global.STAGE_DATA = {};
global.renderMarkdown = (md) => `<rendered>${md}</rendered>`;
global.formatVocabChipsAndReasons = (txt) => txt;

// Load module
const speakingModule = require('../js/4-speaking.js');

const {
    speakingState,
    buildPart1ShadowingSystemPrompt,
    buildPart2CueCardSystemPrompt,
    buildPart3DiscussionSystemPrompt,
    buildGeneralSpeakingPrompt,
    buildSpeakingUserQuery,
    parseGeneratedSpeakingPrompt,
    cleanSpeakingTextForTTS,
    renderSpeakingAuditAccordions,
    buildDynamicSpeakingRemediationPrompt,
    downloadSpeakingAudio,
    copySpeakingGeminiPrompt,
    copyGeneralSpeakingPrompt,
    openGeminiWeb
} = speakingModule;

describe('IELTS Speaking Lab Restructuring TDD Suite', () => {

    describe('1. State Initialization', () => {
        test('speakingState includes cleanMonologues and injectedVocabs collections', () => {
            assert.ok(speakingState, 'speakingState should exist');
            assert.ok(typeof speakingState.cleanMonologues === 'object', 'cleanMonologues should be an object');
            assert.ok(typeof speakingState.injectedVocabs === 'object', 'injectedVocabs should be an object');
        });
    });

    describe('2. Part 1 Shadowing System Prompt Builder', () => {
        test('buildPart1ShadowingSystemPrompt includes activePromptText, targetAccent, and injectedVocabs', () => {
            const promptText = "In my daily routine, I prioritise my schedule early in the morning.";
            const accent = "British RP (Received Pronunciation)";
            const vocabs = "prioritise (CEFR C1), allocate (CEFR B2)";

            const prompt = buildPart1ShadowingSystemPrompt(promptText, accent, vocabs);

            assert.ok(prompt.includes(promptText), 'Prompt must embed activePromptText');
            assert.ok(prompt.includes(accent), 'Prompt must embed targetAccentName');
            assert.ok(prompt.includes(vocabs), 'Prompt must embed injectedVocabList');
        });

        test('buildPart1ShadowingSystemPrompt incorporates Anti-Mishearing rule and Read-Aloud context', () => {
            const prompt = buildPart1ShadowingSystemPrompt("Test sentence", "British RP", "");
            
            assert.ok(prompt.includes('READ-ALOUD') || prompt.includes('Read-Aloud') || prompt.includes('Preparation Drill'), 'Must declare read-aloud/shadowing context');
            assert.ok(prompt.includes('Anti-Mishearing') || prompt.includes('MISHEARING'), 'Must include anti-mishearing instruction');
            assert.ok(prompt.includes('# ✅ Text Fidelity Check'), 'Must include Text Fidelity Check');
            assert.ok(prompt.includes('# 📊 Delivery & Accuracy Score'), 'Must use Delivery & Accuracy Score heading');
            assert.ok(prompt.includes('# 👍 What You Did Well'), 'Must include What You Did Well section');
            assert.ok(prompt.includes('FC = Fluency & Coherence'), 'Must include glossary with FC, LR, GRA, PR');
            assert.ok(prompt.includes('# 🔁 Recurring Issue Check'), 'Must include Recurring Issue Check');
        });

        test('buildPart1ShadowingSystemPrompt omits grammar correction and Band 7.5 upgrade sections', () => {
            const prompt = buildPart1ShadowingSystemPrompt("Test sentence", "British RP", "");

            assert.strictEqual(prompt.includes('# 🔍 Grammar'), false, 'Part 1 must NOT have grammar correction section');
            assert.strictEqual(prompt.includes('# 🚀 Band 7.5+ Model Upgrade'), false, 'Part 1 must NOT have Band 7.5+ model upgrade section');
            assert.strictEqual(prompt.includes('Why We Upgraded It'), false, 'Part 1 must NOT ask why system upgraded its own text');
        });

        test('buildPart1ShadowingSystemPrompt handles edge cases (empty or null inputs)', () => {
            const prompt = buildPart1ShadowingSystemPrompt(null, undefined, null);
            assert.ok(typeof prompt === 'string' && prompt.length > 50, 'Should gracefully fallback without throwing');
            assert.ok(prompt.includes('Delivery & Accuracy Score'));
        });
    });

    describe('3. Part 2 Cue Card System Prompt Builder', () => {
        test('buildPart2CueCardSystemPrompt includes cue card text, Task Fulfillment Check, and Coherence', () => {
            const cueCard = "Describe a memorable journey you made.\nYou should say:\n- Where you went\n- How you travelled\n- Why it was memorable";
            const accent = "General American";

            const prompt = buildPart2CueCardSystemPrompt(cueCard, accent);

            assert.ok(prompt.includes(cueCard), 'Prompt must include cue card text');
            assert.ok(prompt.includes('General American'), 'Prompt must include target accent');
            assert.ok(prompt.includes('# ✅ Task Fulfillment Check'), 'Must include Task Fulfillment Check');
            assert.ok(prompt.includes('Addressed / Partially Addressed / Missed') || prompt.includes('Addressed / Partially addressed / Missed'), 'Must include fulfillment criteria');
            assert.ok(prompt.includes('# 🔍 Grammar & Coherence Feedback'), 'Must include Grammar & Coherence section');
            assert.ok(prompt.includes('# 🚀 Band 7.5+ Model Upgrade & Vocabulary'), 'Must include Band 7.5+ Model Upgrade');
            assert.ok(prompt.includes('# 📊 Delivery & Fluency Score'), 'Must use Delivery & Fluency Score heading');
            assert.ok(prompt.includes('# 👍 What You Did Well'), 'Must include What You Did Well section');
            assert.ok(prompt.includes('FC: [X.X] | LR: [X.X] | GRA: [X.X] | PR: [X.X]'), 'Must include Sub-Scores rubric');
            assert.ok(prompt.includes('# 🔁 Recurring Issue Check'), 'Must include Recurring Issue Check');
        });

        test('buildPart2CueCardSystemPrompt tolerates natural fillers and self-corrections', () => {
            const prompt = buildPart2CueCardSystemPrompt("Test topic", "British RP");
            assert.ok(prompt.includes('filler words') || prompt.includes('self-corrections') || prompt.includes('Filler words'), 'Must instruct examiner to tolerate natural spontaneous markers');
        });

        test('buildPart2CueCardSystemPrompt handles edge cases (empty or special characters)', () => {
            const prompt = buildPart2CueCardSystemPrompt('Cue card with special $100 & "quotes" <tags>', 'British RP');
            assert.ok(prompt.includes('$100'), 'Should safely handle special characters');
        });
    });

    describe('4. Part 3 Discussion System Prompt Builder', () => {
        test('buildPart3DiscussionSystemPrompt includes question, Idea Development Check, and Complex Structures', () => {
            const question = "Do you think modern technology helps or harms social relationships?";
            const accent = "Australian English";

            const prompt = buildPart3DiscussionSystemPrompt(question, accent);

            assert.ok(prompt.includes(question), 'Prompt must include discussion questions');
            assert.ok(prompt.includes('Australian English'), 'Prompt must include target accent');
            assert.ok(prompt.includes('# 💡 Idea Development Check'), 'Must include Idea Development Check');
            assert.ok(prompt.includes('Developed') && prompt.includes('Basic') && prompt.includes('Minimal'), 'Must classify response depth');
            assert.ok(prompt.includes('Complex Structure Attempts'), 'Must check complex structures');
            assert.ok(prompt.includes('# 📊 Discussion & Delivery Score'), 'Must use Discussion & Delivery Score heading');
            assert.ok(prompt.includes('# 👍 What You Did Well'), 'Must include What You Did Well');
            assert.ok(prompt.includes('FC: [X.X] | LR: [X.X] | GRA: [X.X] | PR: [X.X]'), 'Must include Sub-Scores');
            assert.ok(prompt.includes('# 🚀 Band 7.5+ Model Upgrade & Vocabulary'), 'Must include Model Upgrade for opinion');
            assert.ok(prompt.includes('# 🔁 Recurring Issue Check'), 'Must include Recurring Issue Check');
        });

        test('buildPart3DiscussionSystemPrompt handles null or empty inputs gracefully', () => {
            const prompt = buildPart3DiscussionSystemPrompt(null, null);
            assert.ok(typeof prompt === 'string' && prompt.length > 50);
            assert.ok(prompt.includes('Idea Development Check'));
        });
    });

    describe('5. Mode-Specific Speaking User Query Builder', () => {
        test('buildSpeakingUserQuery generates tailored instructions per mode', () => {
            const q1 = buildSpeakingUserQuery('part1', 'British RP');
            assert.ok(q1.includes('read-aloud') || q1.includes('read aloud'), 'Part 1 query must specify read-aloud');
            assert.ok(q1.includes('Do NOT check sentence grammar'), 'Part 1 query must explicitly instruct not to check grammar');

            const q2 = buildSpeakingUserQuery('part2', 'General American');
            assert.ok(q2.includes('cue card monologue'), 'Part 2 query must specify cue card monologue');
            assert.ok(q2.includes('task fulfillment'), 'Part 2 query must mention task fulfillment');

            const q3 = buildSpeakingUserQuery('part3', 'Australian English');
            assert.ok(q3.includes('discussion answer'), 'Part 3 query must specify discussion answer');
            assert.ok(q3.includes('idea development'), 'Part 3 query must mention idea development');
        });

        test('buildSpeakingUserQuery handles default fallback', () => {
            const qDefault = buildSpeakingUserQuery('unknown_mode', 'British RP');
            assert.ok(typeof qDefault === 'string' && qDefault.length > 20);
        });
    });

    describe('6. Generator Output Parser (parseGeneratedSpeakingPrompt)', () => {
        test('parses Part 1 generator output cleanly into topic, cleanMonologue, and grammarNotes', () => {
            const rawPart1 = `
# 🎙️ Topic: Hometown Memories
"My hometown is quiet and clean. I live in a small coastal city with old green trees. I really love living in this peaceful community."

# 🎯 Target Grammar & Vocab Applied:
- SVO sentence frame & 'be' copula anchor
- Attribute adjectives and simple present consistency
            `;

            const parsed = parseGeneratedSpeakingPrompt(rawPart1, 'part1');

            assert.strictEqual(parsed.topicTitle, 'Hometown Memories');
            assert.strictEqual(parsed.cleanMonologue, 'My hometown is quiet and clean. I live in a small coastal city with old green trees. I really love living in this peaceful community.');
            assert.ok(parsed.targetGrammarNotes.includes('SVO sentence frame'));
            assert.strictEqual(parsed.cleanMonologue.includes('# 🎙️ Topic:'), false, 'Clean monologue must NOT contain topic header');
            assert.strictEqual(parsed.cleanMonologue.includes('Target Grammar'), false, 'Clean monologue must NOT contain grammar notes');
        });

        test('parses Part 2 generator output into topic and cue points', () => {
            const rawPart2 = `
# 📋 Topic: Describe a memorable journey
You should say:
- Where you went
- How you travelled
- And explain why it was memorable.

# 🎯 Suggested Grammar Formula & Vocab to Demonstrate:
- Past narrative consistency
            `;

            const parsed = parseGeneratedSpeakingPrompt(rawPart2, 'part2');
            assert.ok(parsed.topicTitle.includes('Describe a memorable journey'));
            assert.ok(parsed.cleanMonologue.includes('You should say:'));
            assert.ok(parsed.cleanMonologue.includes('Where you went'));
            assert.strictEqual(parsed.cleanMonologue.includes('Suggested Grammar Formula'), false);
        });

        test('parses Part 3 generator output into question and strategy notes', () => {
            const rawPart3 = `
# ❓ Part 3 Discussion Question
"Do you believe that modern automation will ultimately create more employment opportunities than it eliminates?"

# 💡 Strategy Tip & Grammar Anchor
- State an objective thesis using impersonal passive (*"It is widely argued that..."*).
            `;

            const parsed = parseGeneratedSpeakingPrompt(rawPart3, 'part3');
            assert.ok(parsed.cleanMonologue.includes('Do you believe that modern automation'));
            assert.ok(parsed.targetGrammarNotes.includes('impersonal passive'));
            assert.strictEqual(parsed.cleanMonologue.includes('Strategy Tip'), false);
        });

        test('handles malformed or empty generator text without throwing', () => {
            const parsedNull = parseGeneratedSpeakingPrompt(null, 'part1');
            assert.strictEqual(parsedNull.topicTitle, '');
            assert.strictEqual(parsedNull.cleanMonologue, '');
            assert.strictEqual(parsedNull.targetGrammarNotes, '');

            const plainText = 'Just a simple paragraph without headers.';
            const parsedPlain = parseGeneratedSpeakingPrompt(plainText, 'part1');
            assert.strictEqual(parsedPlain.cleanMonologue, plainText);
        });
    });

    describe('7. TTS Text Cleaner (cleanSpeakingTextForTTS)', () => {
        test('strips technical headers, target grammar notes, and markdown for audio reading', () => {
            const raw = `
# 🎙️ Topic: Hometown
"My hometown is **quiet** and clean."

# 🎯 Target Grammar Applied:
- SVO frame
            `;
            const cleaned = cleanSpeakingTextForTTS(raw);
            assert.strictEqual(cleaned, 'My hometown is quiet and clean.');
        });
    });

    describe('8. Accordion Renderer (renderSpeakingAuditAccordions)', () => {
        test('renders Hero Score card for Part 1 Delivery & Fluency Score', () => {
            const md = `
# 📊 Delivery & Fluency Score
**85%** — Clear and rhythmic delivery with natural stress.
- **Target Accent**: British RP
- **Accent Match Assessment**: Accurate non-rhotic vowels.

# 📝 Audio Transcription
"My hometown is quiet and clean."

# ✅ Text Fidelity Check
- **Words matched to original text**: 38 of 40 words matched
- **Skipped or added words**: None — full text was read
            `;

            const html = renderSpeakingAuditAccordions(md, 'part1');
            assert.ok(html.includes('speaking-audit-band-card'), 'Must render score band card');
            assert.ok(html.includes('Text Fidelity Check'), 'Must render Text Fidelity section');
            assert.ok(html.includes('fa-square-check text-emerald-400') || html.includes('text-emerald'), 'Must style fidelity with emerald check');
        });

        test('renders Hero Score card for Part 1 Delivery & Accuracy Score and What You Did Well', () => {
            const md = `
# 📊 Delivery & Accuracy Score
**6.5** | **85%** — Clear and rhythmic delivery with natural stress.
- **Target Accent**: British RP
- **Glossary**: FC = Fluency & Coherence | LR = Lexical Resource | GRA = Grammatical Range & Accuracy | PR = Pronunciation

# 👍 What You Did Well
- Steady pacing on introductory clause and crisp aspirated plosives.

# 📝 Actual Audio Transcription
"My hometown is quiet and clean."

# ✅ Text Fidelity Check
- **Matched Words**: 38 of 40 words matched
- **Skipped / Added Words**: None — full text read accurately
            `;

            const html = renderSpeakingAuditAccordions(md, 'part1');
            assert.ok(html.includes('speaking-audit-band-card'), 'Must render score band card');
            assert.ok(html.includes('What You Did Well'), 'Must render What You Did Well section');
            assert.ok(html.includes('fa-thumbs-up text-emerald-400') || html.includes('text-emerald'), 'Must style What You Did Well with emerald thumbs-up');
            assert.ok(html.includes('Text Fidelity Check'), 'Must render Text Fidelity section');
        });

        test('renders Accordion for Part 2 Task Fulfillment Check and Coherence', () => {
            const md = `
# 📊 Fluency & Delivery Score
**80%** — Good coverage of cue card.

# 📝 Audio Transcription
"I want to talk about my journey..."

# ✅ Task Fulfillment Check
- **Point 1**: Addressed — Mentioned destination clearly.
- **Point 2**: Addressed — Described train journey.
- **Point 3**: Partially addressed — Brief reason given.

# 🔍 Grammar & Coherence Feedback
- **Coherence & Cohesion**: Ideas flowed well with good discourse markers.
- **Grammar Corrections**:
  * ❌ *"I travel by train"*
  * 💡 *"I travelled by train"* — Past tense required.

# 🚀 Band 7.5+ Model Upgrade & Vocabulary
- **Band 7.5+ Model Upgrade**:
  "I embarked on a memorable rail journey that offered [VOCAB: breathtaking] vistas."
            `;

            const html = renderSpeakingAuditAccordions(md, 'part2');
            assert.ok(html.includes('Task Fulfillment Check'), 'Must render Task Fulfillment Check');
            assert.ok(html.includes('fa-clipboard-check text-teal-400') || html.includes('text-teal'), 'Must style Task Fulfillment with teal');
            assert.ok(html.includes('Grammar & Coherence Feedback'), 'Must render Grammar & Coherence section');
            assert.ok(html.includes('loadRetestScriptToSpeakingBox'), 'Must extract 1-Click Retest Drill button for Band 7.5+');
        });

        test('renders Accordion for Part 3 Idea Development Check', () => {
            const md = `
# 📊 Discussion & Delivery Score
**75%** — Reasoned opinion provided.

# 📝 Audio Transcription
"I think automation is good..."

# 💡 Idea Development Check
- **Question 1**: Developed — Offered economic perspective and job evolution example.

# 🔍 Grammar & Structure Feedback
- **Complex Structure Attempts**: Used 2 conditional clauses effectively.
            `;

            const html = renderSpeakingAuditAccordions(md, 'part3');
            assert.ok(html.includes('Idea Development Check'), 'Must render Idea Development Check');
            assert.ok(html.includes('fa-lightbulb text-amber-400') || html.includes('text-amber'), 'Must style Idea Development with amber');
            assert.ok(html.includes('Grammar & Structure Feedback'), 'Must render Grammar & Structure section');
        });

        test('handles rejection banner when audio is inaudible', () => {
            const md = `# ⚠️ REKAMAN TIDAK DAPAT DINILAI (AUDIO DITOLAK)\nSpeech could not be heard clearly.`;
            const html = renderSpeakingAuditAccordions(md, 'part1');
            assert.ok(html.includes('REKAMAN TIDAK DAPAT DINILAI'), 'Must display rejection banner');
        });
    });

    describe('9. Dynamic Remediation Prompt Builder (buildDynamicSpeakingRemediationPrompt)', () => {
        test('extracts real diagnosed errors without dummy text fallback', () => {
            const evalResponse = `
# 📊 Delivery & Fluency Score
**70%** — Minor vowel distortion and dropped plurals.

# 📝 Audio Transcription
"My hometown is quiet and clean."

# 🔊 Phonetic Breakdown & Pronunciation Tips
- ❌ **"coastal"**
  - 👂 **What You Said**: "costal"
  - 🗣️ **Phonetic Breakdown**: **"KOHS-tul ↘"**
  - 🔍 **Simple English Word Match**: Like "coast" + "ull"
  - 💡 **Mouth & Tongue Position**: Round lips on the 'oa' vowel.

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: Dropped on "trees"
- **-ED Endings**: Audible on "lived"
- 🗣️ **Quick Speed Drill**: "She complete**s** /s/ her project**s** /s/."

# ✅ Text Fidelity Check
- **Words matched to original text**: 35 of 38 words matched
            `;

            const remediationPrompt = buildDynamicSpeakingRemediationPrompt('part1', 'British RP', 'My hometown text', evalResponse);

            assert.ok(remediationPrompt.includes('coastal'), 'Remediation prompt must extract "coastal"');
            assert.ok(remediationPrompt.includes('KOHS-tul'), 'Remediation prompt must extract phonetic breakdown');
            assert.ok(remediationPrompt.includes('Dropped on "trees"'), 'Remediation prompt must extract real suffix audit');
            assert.strictEqual(remediationPrompt.includes('Kata dasar mengalami distorsi vokal dan penghilangan konsonan.'), false, 'Must NOT use dummy fallback when phonetic section is present');
            assert.strictEqual(remediationPrompt.includes('Akhiran +s/-es jamak dan +ed lampau sering tertelan.'), false, 'Must NOT use dummy fallback when suffixes are present');
        });

        test('falls back gracefully when evalResponse is empty or malformed', () => {
            const remediation = buildDynamicSpeakingRemediationPrompt('part1', 'British RP', 'Active prompt text', '');
            assert.ok(remediation.includes('TARGET ACCENT: British RP'));
            assert.ok(remediation.includes('MY REAL DETECTED ERRORS'));
        });
    });

    describe('10. Full Evaluation Submission Flow (submitSpeakingEvaluation)', () => {
        test('validates audio presence before submitting', async () => {
            speakingState.audioBlobs.part1 = null;
            let toastMessage = '';
            global.showToast = (msg, type) => { toastMessage = msg; };

            await speakingModule.submitSpeakingEvaluation('part1');
            assert.ok(toastMessage.includes('Rekaman suara belum terdeteksi'), 'Must alert if audio is not recorded');
        });

        test('submits Part 1 and renders updated branding with Text Fidelity accordions', async () => {
            const domElements = {};
            const getOrCreate = (id) => {
                if (!domElements[id]) {
                    domElements[id] = {
                        id,
                        innerHTML: '',
                        innerText: '',
                        disabled: false,
                        classList: {
                            contains: () => false,
                            add: () => {},
                            remove: () => {}
                        }
                    };
                }
                return domElements[id];
            };
            global.document.getElementById = (id) => getOrCreate(id);

            speakingState.audioBlobs.part1 = { size: 1024, type: 'audio/webm' };
            speakingState.cleanMonologues.part1 = "My hometown is quiet and clean.";
            speakingState.injectedVocabs.part1 = [{ word: 'tranquil', cefr: 'C1' }];

            global.callGeminiAPI = async (userQuery, systemPrompt, audioBlob, meta) => {
                assert.ok(systemPrompt.includes('READ-ALOUD / SHADOWING'), 'System prompt must use Part 1 format');
                assert.ok(userQuery.includes('Do NOT check sentence grammar'), 'User query must specify Part 1 read aloud instructions');
                assert.ok(audioBlob, 'Audio blob must be passed to multimodal API');
                return `
# 📊 Delivery & Fluency Score
**85%** — Natural delivery.

# 📝 Audio Transcription
"My hometown is quiet and clean."

# ✅ Text Fidelity Check
- **Words matched to original text**: All matched
- **Skipped or added words**: None

# 🔊 Phonetic Breakdown & Pronunciation Tips
- Pronunciation of key words was very clear and accurate!

# 🛑 Word Endings Audit (-S/-ES & -ED)
- **-S/-ES Endings**: Audible
- **-ED Endings**: Audible
- 🗣️ **Quick Speed Drill**: "Clean test."
                `;
            };

            await speakingModule.submitSpeakingEvaluation('part1');

            const resultBox = domElements['speaking-eval-result-part1'];
            assert.ok(resultBox.innerHTML.includes('HASIL EVALUASI IELTS SPEAKING COACH'), 'Must render revised branding title');
            assert.ok(resultBox.innerHTML.includes('AI Multimodal Delivery & Articulation Audit'), 'Must render revised badge');
            assert.ok(resultBox.innerHTML.includes('Text Fidelity Check'), 'Must render fidelity accordion');
            assert.ok(speakingState.remediationPrompts.part1, 'Must store remediation prompt in state');
        });

        test('submits Part 2 spontaneous speech with Task Fulfillment and Band 7.5 upgrade', async () => {
            speakingState.audioBlobs.part2 = { size: 2048, type: 'audio/webm' };
            speakingState.cleanMonologues.part2 = "Describe a journey you made.";

            global.callGeminiAPI = async (userQuery, systemPrompt) => {
                assert.ok(systemPrompt.includes('IELTS PART 2'), 'System prompt must use Part 2 cue card format');
                assert.ok(userQuery.includes('task fulfillment'), 'User query must request task fulfillment');
                return null; // Test fallback generation
            };

            await speakingModule.submitSpeakingEvaluation('part2');

            const resultBox = global.document.getElementById('speaking-eval-result-part2');
            assert.ok(resultBox.innerHTML.includes('Task Fulfillment Check'), 'Must render fallback Task Fulfillment accordion');
            assert.ok(resultBox.innerHTML.includes('Band 7.5+ Model Upgrade'), 'Must render Band 7.5 model upgrade');
        });

        test('submits Part 3 spontaneous speech with Idea Development check', async () => {
            speakingState.audioBlobs.part3 = { size: 1500, type: 'audio/webm' };
            speakingState.cleanMonologues.part3 = "Do you believe automation creates jobs?";

            global.callGeminiAPI = async (userQuery, systemPrompt) => {
                assert.ok(systemPrompt.includes('PART 3 DISCUSSION'), 'System prompt must use Part 3 format');
                assert.ok(userQuery.includes('idea development'), 'User query must request idea development');
                return null; // Test fallback generation
            };

            await speakingModule.submitSpeakingEvaluation('part3');

            const resultBox = global.document.getElementById('speaking-eval-result-part3');
            assert.ok(resultBox.innerHTML.includes('Idea Development Check'), 'Must render Idea Development check');
        });
    });

    describe('11. Full Prompt Generator Flow (generateSpeakingPrompt)', () => {
        test('generates Part 1 monologue and populates teleprompter and grammar notes separately', async () => {
            const domElements = {};
            global.document.getElementById = (id) => {
                if (!domElements[id]) {
                    domElements[id] = { id, innerHTML: '', innerText: '', value: 'medium', checked: false, disabled: false, classList: { add: () => {}, remove: () => {} } };
                }
                return domElements[id];
            };

            global.callGeminiAPI = async () => `
# 🎙️ Topic: Hometown Living
"I was born and raised in a coastal city. The weather is refreshing throughout the year."

# 🎯 Target Grammar & Vocab Applied:
- SVO frame & copula anchor
            `;

            await speakingModule.generateSpeakingPrompt('part1');

            assert.strictEqual(speakingState.cleanMonologues.part1, "I was born and raised in a coastal city. The weather is refreshing throughout the year.");
            assert.ok(domElements['speaking-text-part1'].innerHTML.includes('coastal city'));
            assert.strictEqual(domElements['speaking-text-part1'].innerHTML.includes('# 🎙️ Topic:'), false);
            assert.ok(domElements['speaking-grammar-notes-part1'].innerHTML.includes('SVO frame'));
            assert.ok(domElements['speaking-topic-tag-part1'].innerText.includes('Hometown Living'));
        });
    });

    describe('12. Speaking UI & State Interaction Helpers', () => {
        test('loadRetestScriptToSpeakingBox decodes text and loads to teleprompter and state', () => {
            const domElements = {};
            global.document.getElementById = (id) => {
                if (!domElements[id]) {
                    domElements[id] = { id, innerHTML: '', scrollIntoView: () => {} };
                }
                return domElements[id];
            };

            const sampleScript = "During this journey, I ventured into picturesque districts.";
            const encoded = encodeURIComponent(sampleScript);

            speakingModule.loadRetestScriptToSpeakingBox('part2', encoded);

            assert.strictEqual(speakingState.generatedPrompts.part2, sampleScript);
            assert.ok(domElements['speaking-text-part2'].innerHTML.includes(sampleScript));
            assert.ok(domElements['speaking-text-part2'].innerHTML.includes('TEKS RETEST DRILL BAND 7.5 AKTIF'));
        });

        test('toggleSpeakingStudyPromptView toggles visibility and button text', () => {
            const preElement = {
                classList: {
                    _classes: new Set(['hidden']),
                    contains(c) { return this._classes.has(c); },
                    add(c) { this._classes.add(c); },
                    remove(c) { this._classes.delete(c); }
                },
                innerText: ''
            };
            const toggleText = { innerText: '' };
            const toggleIcon = { className: '' };

            global.document.getElementById = (id) => {
                if (id.startsWith('speaking-study-prompt-text-')) return preElement;
                if (id.startsWith('text-toggle-speaking-prompt-')) return toggleText;
                if (id.startsWith('icon-toggle-speaking-prompt-')) return toggleIcon;
                return null;
            };

            speakingState.remediationPrompts.part1 = "Remediation content test";

            // First toggle: reveal
            speakingModule.toggleSpeakingStudyPromptView('part1');
            assert.strictEqual(preElement.classList.contains('hidden'), false);
            assert.strictEqual(preElement.innerText, "Remediation content test");
            assert.strictEqual(toggleText.innerText, "Tutup Prompt");

            // Second toggle: hide
            speakingModule.toggleSpeakingStudyPromptView('part1');
            assert.strictEqual(preElement.classList.contains('hidden'), true);
            assert.strictEqual(toggleText.innerText, "Lihat Prompt");
        });

        test('switchSpeakingMode updates activeMode and switches tab styles', () => {
            const tabs = {
                'tab-btn-speaking-part1': { className: '' },
                'speaking-mode-part1': { classList: { add: () => {}, remove: () => {} } },
                'tab-btn-speaking-part2': { className: '' },
                'speaking-mode-part2': { classList: { add: () => {}, remove: () => {} } },
                'tab-btn-speaking-part3': { className: '' },
                'speaking-mode-part3': { classList: { add: () => {}, remove: () => {} } }
            };
            global.document.getElementById = (id) => tabs[id] || null;

            speakingModule.switchSpeakingMode('part2');
            assert.strictEqual(speakingState.activeMode, 'part2');
            assert.ok(tabs['tab-btn-speaking-part2'].className.includes('bg-rose-600'));
        });

        test('updateSpeakingTargetAccent saves setting to localStorage', () => {
            global.document.getElementById = () => ({ value: 'australian' });
            speakingModule.updateSpeakingTargetAccent();
            assert.strictEqual(global.localStorage.getItem('ielts_target_accent'), 'australian');
        });

        test('onSpeakingGrammarModeChange saves grammar mode to localStorage', () => {
            global.document.getElementById = () => ({ value: 'recent_stages' });
            speakingModule.onSpeakingGrammarModeChange();
            assert.strictEqual(global.localStorage.getItem('ielts_speaking_grammar_mode'), 'recent_stages');
        });

        test('onSpeakingRateChange synchronizes TTS rates across all tabs and localStorage', () => {
            const rateSelects = {
                'select-tts-rate-part1': { value: '1.15' },
                'select-tts-rate-part2': { value: '' },
                'select-tts-rate-part3': { value: '' }
            };
            global.document.getElementById = (id) => rateSelects[id] || null;

            speakingModule.onSpeakingRateChange('part1');
            assert.strictEqual(global.localStorage.getItem('ielts_tts_selected_rate'), '1.15');
            assert.strictEqual(rateSelects['select-tts-rate-part2'].value, '1.15');
            assert.strictEqual(rateSelects['select-tts-rate-part3'].value, '1.15');
        });

        test('getUnlockedGrammarContext returns natural IELTS mode when selected or by default', () => {
            const ctx = speakingModule.getUnlockedGrammarContext('ielts_natural');
            assert.strictEqual(ctx.mode, 'ielts_natural');
            assert.ok(ctx.label.includes('Alami'));
        });
    });

    describe('13. General / Free Speaking System Prompt Builder', () => {
        test('buildGeneralSpeakingPrompt generates valid unprompted evaluation prompt', () => {
            const prompt = buildGeneralSpeakingPrompt('British RP (Received Pronunciation)', 'Talking about favorite hobbies');
            assert.ok(prompt.includes('Talking about favorite hobbies'), 'Must include custom context');
            assert.ok(prompt.includes('British RP'), 'Must include target accent');
            assert.ok(prompt.includes('# 📊 General Speaking Evaluation Score'), 'Must include General Speaking Evaluation Score');
            assert.ok(prompt.includes('FC: [X.X] | LR: [X.X] | GRA: [X.X] | PR: [X.X]'), 'Must include IELTS 4 sub-scores');
            assert.ok(prompt.includes('# 👍 What You Did Well'), 'Must include strengths section');
            assert.ok(prompt.includes('# 🔍 Grammar & Coherence Feedback'), 'Must include grammar feedback');
            assert.ok(prompt.includes('# 🚀 Band 7.5+ Model Upgrade & Vocabulary'), 'Must include Band 7.5 model upgrade');
        });

        test('buildGeneralSpeakingPrompt handles default arguments when empty', () => {
            const prompt = buildGeneralSpeakingPrompt();
            assert.ok(typeof prompt === 'string' && prompt.length > 50);
            assert.ok(prompt.includes('General spontaneous IELTS speaking practice'));
        });
    });

    describe('14. Audio Download Flow (downloadSpeakingAudio)', () => {
        test('alerts user with toast and returns false when no audio blob exists', () => {
            speakingState.audioBlobs.part1 = null;
            let alerted = false;
            global.showToast = (msg, type) => {
                if (type === 'warning' || type === 'error') alerted = true;
            };

            const result = downloadSpeakingAudio('part1');
            assert.strictEqual(result, false, 'Should return false when no audio blob');
            assert.strictEqual(alerted, true, 'Should display warning toast');
        });

        test('creates download link, sets filename, and triggers click when audio exists', () => {
            speakingState.audioBlobs.part1 = { size: 4096, type: 'audio/webm' };
            global.lastClickedElement = null;
            global.appendedChild = null;

            const result = downloadSpeakingAudio('part1');
            assert.strictEqual(result, true, 'Should return true on successful download trigger');
            assert.ok(global.lastClickedElement, 'Link element must be clicked');
            assert.ok(global.lastClickedElement.download.includes('ielts-speaking-part1'), 'Filename should include mode');
            assert.ok(global.lastClickedElement.href.startsWith('blob:'), 'Href should be an object URL');
        });
    });

    describe('15. Clipboard Copy Prompt Flow (copySpeakingGeminiPrompt & copyGeneralSpeakingPrompt)', () => {
        test('copySpeakingGeminiPrompt copies Part 1 prompt with prepended Gemini guidance', async () => {
            speakingState.cleanMonologues.part1 = "I prioritize my daily work in the morning.";
            global.lastCopiedText = '';
            let toastMsg = '';
            global.showToast = (msg) => { toastMsg = msg; };

            const copied = await copySpeakingGeminiPrompt('part1');
            assert.ok(copied.includes('I prioritize my daily work in the morning.'));
            assert.ok(copied.includes('Delivery & Accuracy Score'));
            assert.strictEqual(global.lastCopiedText, copied, 'Clipboard text must match generated prompt');
            assert.ok(toastMsg.includes('berhasil disalin') || toastMsg.includes('clipboard'));
        });

        test('copySpeakingGeminiPrompt copies Part 2 cue card prompt', async () => {
            speakingState.cleanMonologues.part2 = "Describe a momentous event.";
            const copied = await copySpeakingGeminiPrompt('part2');
            assert.ok(copied.includes('Describe a momentous event.'));
            assert.ok(copied.includes('Delivery & Fluency Score'));
            assert.ok(copied.includes('Task Fulfillment Check'));
        });

        test('copySpeakingGeminiPrompt copies Part 3 analytical discussion prompt', async () => {
            speakingState.cleanMonologues.part3 = "How does artificial intelligence impact creative industries?";
            const copied = await copySpeakingGeminiPrompt('part3');
            assert.ok(copied.includes('artificial intelligence'));
            assert.ok(copied.includes('Discussion & Delivery Score'));
            assert.ok(copied.includes('Idea Development Check'));
        });

        test('copyGeneralSpeakingPrompt copies general free speaking prompt', async () => {
            global.lastCopiedText = '';
            const copied = await copyGeneralSpeakingPrompt();
            assert.ok(copied.includes('General Speaking Evaluation Score'));
            assert.ok(copied.includes('Sub-Scores'));
            assert.strictEqual(global.lastCopiedText, copied);
        });
    });

    describe('16. External Gemini Navigation & Recorder UI State Integration', () => {
        test('openGeminiWeb opens Google Gemini app in a new tab', () => {
            global.lastOpenedUrl = null;
            openGeminiWeb();
            assert.ok(global.lastOpenedUrl, 'window.open must be invoked');
            assert.strictEqual(global.lastOpenedUrl.url, 'https://gemini.google.com/app');
            assert.strictEqual(global.lastOpenedUrl.target, '_blank');
        });

        test('stopSpeakingRecording reveals download, copy prompt, and Gemini chat buttons', () => {
            const elements = {
                'rec-dot-part1': { className: '' },
                'rec-status-label-part1': { innerText: '' },
                'btn-rec-stop-part1': { classList: { add: () => {}, remove: () => {} } },
                'btn-rec-start-part1': { classList: { add: () => {}, remove: () => {} }, innerHTML: '' },
                'btn-rec-play-part1': { classList: { add: () => {}, remove: () => {} } },
                'btn-rec-submit-part1': { classList: { add: () => {}, remove: () => {} } },
                'btn-rec-download-part1': { classList: { add: () => {}, remove: () => {} } },
                'btn-rec-copy-prompt-part1': { classList: { add: () => {}, remove: () => {} } },
                'btn-rec-open-gemini-part1': { classList: { add: () => {}, remove: () => {} } },
                'speaking-gemini-workflow-part1': { classList: { add: () => {}, remove: () => {} } }
            };

            let removedHidden = [];
            Object.keys(elements).forEach(k => {
                if (elements[k].classList) {
                    elements[k].classList.remove = (cls) => { if (cls === 'hidden') removedHidden.push(k); };
                }
            });

            global.document.getElementById = (id) => elements[id] || null;
            speakingState.mediaRecorders.part1 = { state: 'inactive', stop: () => {} };

            speakingModule.stopSpeakingRecording('part1');

            assert.ok(removedHidden.includes('btn-rec-download-part1'), 'Must reveal download audio button');
            assert.ok(removedHidden.includes('btn-rec-copy-prompt-part1'), 'Must reveal copy prompt button');
            assert.ok(removedHidden.includes('btn-rec-open-gemini-part1'), 'Must reveal open gemini button');
            assert.ok(removedHidden.includes('speaking-gemini-workflow-part1'), 'Must reveal 3-step workflow card');
        });
    });

    describe('17. index.html UI Markup Verification', () => {
        const fs = require('node:fs');
        const indexPath = path.join(__dirname, '..', 'index.html');
        const htmlContent = fs.readFileSync(indexPath, 'utf-8');

        test('index.html contains General Speaking Prompt button in Speaking Lab header', () => {
            assert.ok(htmlContent.includes('id="btn-copy-general-speaking-prompt"'), 'Must have btn-copy-general-speaking-prompt');
            assert.ok(htmlContent.includes('copyGeneralSpeakingPrompt()'), 'Must call copyGeneralSpeakingPrompt()');
        });

        ['part1', 'part2', 'part3'].forEach(mode => {
            test(`index.html contains Download, Copy Prompt, Open Gemini, and Workflow Card for ${mode}`, () => {
                assert.ok(htmlContent.includes(`id="btn-rec-download-${mode}"`), `Must have btn-rec-download-${mode}`);
                assert.ok(htmlContent.includes(`downloadSpeakingAudio('${mode}')`), `Must invoke downloadSpeakingAudio('${mode}')`);

                assert.ok(htmlContent.includes(`id="btn-rec-copy-prompt-${mode}"`), `Must have btn-rec-copy-prompt-${mode}`);
                assert.ok(htmlContent.includes(`copySpeakingGeminiPrompt('${mode}')`), `Must invoke copySpeakingGeminiPrompt('${mode}')`);

                assert.ok(htmlContent.includes(`id="btn-rec-open-gemini-${mode}"`), `Must have btn-rec-open-gemini-${mode}`);
                assert.ok(htmlContent.includes(`openGeminiWeb()`), `Must invoke openGeminiWeb()`);

                assert.ok(htmlContent.includes(`id="speaking-gemini-workflow-${mode}"`), `Must have speaking-gemini-workflow-${mode}`);
            });
        });
    });

});
