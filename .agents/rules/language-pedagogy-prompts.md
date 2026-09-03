---
trigger: model_decision
description: "Guidelines for writing and refining pedagogical prompts in language learning (vocab ELI5, speech evaluation, sentence upgrades)."
---

# Language Pedagogy & Prompt Engineering Guardrails

When designing, modifying, or reviewing system prompts for language learners:

1. **Tangible ELI5 Explanations (Physical Object Anchoring)**:
   - When generating child explanations / ELI5 in English for beginner learners, ALWAYS ground the analogy in physical, tangible everyday objects (e.g., clothes fitting a waistline, a melting ice cube, a phone charger, pouring water into a full cup).
   - NEVER define an unfamiliar word using another abstract vocabulary word (e.g., avoid defining *tailored* with *specifically customized*).

2. **Epistemic Humility in Speech & Pronunciation Scoring**:
   - Explicitly instruct the AI to acknowledge acoustic limitations (no spectrogram/formant analysis).
   - Round pronunciation scores to multiples of 5 (55%, 70%, 85%) to prevent fake precision.
   - Scale output length by real user performance:
     - 90-100%: Brief praise + score.
     - 75-89%: 1 subtle refinement note.
     - <75%: Max 3 prioritized issues affecting intelligibility first.

3. **Linguistic Rationale for Upgrades (The 'Why' Factor)**:
   - When proposing Band 7.5+ upgrades to candidate speech or writing, ALWAYS explain the exact reason for the change in clear terms (e.g., "Why *rested* instead of *sleep*? Because *rested* uses correct past tense and conveys a natural relaxing stay").

4. **Actionable Vocabulary Extraction**:
   - Highlight newly introduced high-tier vocabulary in model sentences using `[VOCAB: word]` tags so they can be isolated and saved directly into the user's Vocabulary Bank with one click.

5. **Acoustic & Accent Alignment**:
   - Always evaluate pronunciation against the user's explicitly selected target accent (British RP, General American, or Australian).
   - Transliterate tricky syllables using Indonesian phonetic transliteration with CAPITAL STRESS (e.g. `ar-TI-kyu-leit ↘`).
