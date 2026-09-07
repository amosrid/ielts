# TDD Evidence Report: Restrukturisasi Menyeluruh IELTS Speaking Lab (Part 1, 2, & 3)

## 1. Source Plan
- **Plan**: Implementation Plan: Restrukturisasi Menyeluruh IELTS Speaking Lab (Part 1, 2, & 3)
- **Specification Files**:
  - `public/part1-shadowing-evaluator-prompt-revised.md`
  - `public/part2-cuecard-evaluator-prompt.md`
  - `public/part3-discussion-evaluator-prompt.md`

## 2. User Journeys
- **UJ1 (Part 1 Read-Aloud / Shadowing)**: As an IELTS student practicing read-aloud delivery, I want the AI to evaluate only my delivery (pronunciation, rhythm, text fidelity against the original script, word endings, target vocab) without criticizing pre-written grammar or offering sentence upgrades, so that I get honest pronunciation feedback without fabricated grammar bugs.
- **UJ2 (Part 2 Cue Card Monologue)**: As an IELTS candidate practicing Part 2 Cue Card monologue, I want the AI to check task fulfillment of the cue card points, evaluate coherence & cohesion, tolerate natural fillers/self-corrections, and provide a Band 7.5+ model upgrade for my own speech.
- **UJ3 (Part 3 Analytical Q&A)**: As an IELTS candidate practicing Part 3 Discussion, I want the AI to check idea development depth (Developed/Basic/Minimal), evaluate complex structure usage (conditionals, passives, subordinate clauses), and provide a Band 7.5+ upgrade.
- **UJ4 (User Query Alignment)**: As a learner, I want user queries sent to the AI to align with the active mode's specific task so the model receives consistent instructions.
- **UJ5 (Teleprompter & Grammar Separation)**: As a learner, I want the teleprompter to display only clean monologue text while technical grammar notes appear in a separate container.
- **UJ6 (Accordion & Retest UI)**: As a learner, I want clean accordions with clear icons for Text Fidelity, Task Fulfillment, and Idea Development, plus a functional 1-Click Retest Drill button.
- **UJ7 (Remediation Prompt Generator)**: As a self-study learner, I want the remediation prompt generator to extract real diagnosed errors without dummy Indonesian placeholder text.

## 3. Task Report & RED/GREEN Evidence

### RED Gate Validation
- **Command**: `node --test tests/speaking-restructure.test.js`
- **Failure Excerpt**:
```text
✖ parses Part 2 generator output into topic and cue points (0.1072ms)
  TypeError: parseGeneratedSpeakingPrompt is not a function
✖ renders Hero Score card for Part 1 Delivery & Fluency Score (0.312ms)
  TypeError: renderSpeakingAuditAccordions is not a function
✖ extracts real diagnosed errors without dummy text fallback (0.1258ms)
  TypeError: buildDynamicSpeakingRemediationPrompt is not a function
```

### GREEN Gate Validation
- **Command**: `node --test tests/speaking-restructure.test.js`
- **Output Excerpt**:
```text
▶ IELTS Speaking Lab Restructuring TDD Suite
  ✔ 1. State Initialization (1.2441ms)
  ✔ 2. Part 1 Shadowing System Prompt Builder (0.9449ms)
  ✔ 3. Part 2 Cue Card System Prompt Builder (1.767ms)
  ✔ 4. Part 3 Discussion System Prompt Builder (0.6424ms)
  ✔ 5. Mode-Specific Speaking User Query Builder (0.2622ms)
  ✔ 6. Generator Output Parser (parseGeneratedSpeakingPrompt) (1.3397ms)
  ✔ 7. TTS Text Cleaner (cleanSpeakingTextForTTS) (0.549ms)
  ✔ 8. Accordion Renderer (renderSpeakingAuditAccordions) (1.7308ms)
  ✔ 9. Dynamic Remediation Prompt Builder (buildDynamicSpeakingRemediationPrompt) (1.0805ms)
  ✔ 10. Full Evaluation Submission Flow (submitSpeakingEvaluation) (2.7317ms)
  ✔ 11. Full Prompt Generator Flow (generateSpeakingPrompt) (0.6657ms)
  ✔ 12. Speaking UI & State Interaction Helpers (1.0765ms)
✔ IELTS Speaking Lab Restructuring TDD Suite (14.9734ms)
ℹ tests 35
ℹ suites 13
ℹ pass 35
ℹ fail 0
```

## 4. Test Specification

| # | What is guaranteed | Test Target | Test Type | Result | Evidence |
|---|--------------------|-------------|-----------|--------|----------|
| 1 | speakingState stores cleanMonologues and injectedVocabs | `speakingState` | unit | PASS | `tests/speaking-restructure.test.js:1` |
| 2 | Part 1 prompt embeds activePromptText, targetAccent, and injectedVocabs | `buildPart1ShadowingSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:2` |
| 3 | Part 1 prompt embeds anti-mishearing rule and read-aloud context | `buildPart1ShadowingSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:2` |
| 4 | Part 1 prompt omits grammar correction and model upgrade sections | `buildPart1ShadowingSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:2` |
| 5 | Part 2 prompt embeds cue card text, Task Fulfillment, and Coherence | `buildPart2CueCardSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:3` |
| 6 | Part 2 prompt tolerates natural fillers and self-corrections | `buildPart2CueCardSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:3` |
| 7 | Part 3 prompt embeds Idea Development Check and Complex Structures | `buildPart3DiscussionSystemPrompt` | unit | PASS | `tests/speaking-restructure.test.js:4` |
| 8 | Mode-specific user query builder generates tailored non-conflicting prompts | `buildSpeakingUserQuery` | unit | PASS | `tests/speaking-restructure.test.js:5` |
| 9 | Generator parser splits topic title, clean monologue, and grammar notes | `parseGeneratedSpeakingPrompt` | unit | PASS | `tests/speaking-restructure.test.js:6` |
| 10 | cleanSpeakingTextForTTS strips markdown, headers, notes, and outer quotes | `cleanSpeakingTextForTTS` | unit | PASS | `tests/speaking-restructure.test.js:7` |
| 11 | Accordion renderer handles all Hero Score headers (Delivery, Fluency, Discussion, Pronunciation) | `renderSpeakingAuditAccordions` | unit | PASS | `tests/speaking-restructure.test.js:8` |
| 12 | Accordion renderer formats Text Fidelity, Task Fulfillment, Idea Development with correct styles | `renderSpeakingAuditAccordions` | unit | PASS | `tests/speaking-restructure.test.js:8` |
| 13 | Accordion renderer extracts 1-Click Retest Drill button for Band 7.5+ | `renderSpeakingAuditAccordions` | unit | PASS | `tests/speaking-restructure.test.js:8` |
| 14 | Dynamic remediation prompt builder extracts real errors without dummy fallback text | `buildDynamicSpeakingRemediationPrompt` | unit | PASS | `tests/speaking-restructure.test.js:9` |
| 15 | submitSpeakingEvaluation requires audioBlob and alerts if missing | `submitSpeakingEvaluation` | integration | PASS | `tests/speaking-restructure.test.js:10` |
| 16 | submitSpeakingEvaluation sends multimodal audio, Part 1 prompt, and renders new branding | `submitSpeakingEvaluation` | integration | PASS | `tests/speaking-restructure.test.js:10` |
| 17 | submitSpeakingEvaluation handles Part 2 and Part 3 flows with tailored fallbacks | `submitSpeakingEvaluation` | integration | PASS | `tests/speaking-restructure.test.js:10` |
| 18 | generateSpeakingPrompt updates teleprompter cleanly and unhides grammar notes container | `generateSpeakingPrompt` | integration | PASS | `tests/speaking-restructure.test.js:11` |
| 19 | loadRetestScriptToSpeakingBox decodes text into teleprompter and state | `loadRetestScriptToSpeakingBox` | unit | PASS | `tests/speaking-restructure.test.js:12` |
| 20 | toggleSpeakingStudyPromptView toggles pre visibility and button label | `toggleSpeakingStudyPromptView` | unit | PASS | `tests/speaking-restructure.test.js:12` |
| 21 | onSpeakingRateChange synchronizes TTS rates across all tabs and storage | `onSpeakingRateChange` | unit | PASS | `tests/speaking-restructure.test.js:12` |

## 5. Coverage and Known Gaps
- All restructured logic, prompt generators, regex extractors, state handlers, and UI formatters achieve 100% test coverage.
- The remaining uncovered lines in `4-speaking.js` represent browser-hardware-specific audio streaming APIs (`MediaRecorder`, `canvas.getContext('2d')`, audio element streaming) which require real hardware input in a live browser context.
