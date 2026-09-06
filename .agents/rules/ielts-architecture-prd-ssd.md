---
trigger: always_on
description: "Master architecture, design philosophy, and PRD/SSD guardrails for building and maintaining the IELTS Band 7.5 Mastery Studio."
---

# IELTS Band 7.5+ Studio Master Rule & Architecture Guardrail

Whenever you propose, modify, refactor, or build any code or UI for this project:

1. **MANDATORY SPEC CONSULTATION**:
   - Before writing or editing any code, always read and adhere strictly to the master specification file:
     c:/Users/amosp/Downloads/food-business-app-3/public/IELTS_7.5_MASTERY_PRD_SSD.md.

2. **DESIGN SYSTEM: "CALM EDITORIAL ACADEMIC" (TIDAK LEBAY)**:
   - **No Neon/Harsh Glows**: Absolutely no glowing shadows, blinking neon badges, or arcade-like gamification effects.
   - **60-30-10 Color Rule**:
     * 60% Canvas: Clean Ivory (#fbfbfa light) or Obsidian Slate (#0f1117 dark).
     * 30% Structural: Clean white cards with crisp 1px border (#e5e7eb / #1f293d), rounded-xl, subtle shadow-sm.
     * 10% Accent: Deep Academic Indigo (#4338ca), Sage Emerald (#047857), Warm Ochre (#b45309), Crimson Slate (#be123c).
   - **Typography**: Editorial Serif (Newsreader / Lora) for essays and reading materials; Clean Sans (Inter / Plus Jakarta Sans) for UI; Clean Mono (JetBrains Mono) for phonetic IPA and tokens.

3. **CONSOLIDATED 3-PILLAR WORKSPACE**:
   - Do NOT create fragmented tabs. Consolidate into exactly 3 focused modules:
     1. Focus Cockpit (Daily Deliberate Task, Radar 4 Kriteria, Vocal Warmup).
     2. Immersion & Synthesis Studio (6-Step Reading-to-Speaking Loop with Auto-Save Draft and Native TTS Shadowing at Step 5).
     3. Lexical & Feynman Vault (SM-2 Spaced Repetition, ELI5 everyday physical object analogies).

4. **CODE ARCHITECTURE & PERSISTENCE**:
   - Modular ES6 structure (/core/, /modules/, /pedagogy/).
   - Single Source of Truth state store with automatic draft persistence to prevent any user data loss on refresh.
   - Unified audio engine (audio-tts.js) supporting British RP and US accents.
   - Graceful offline fallbacks: users must NEVER be blocked by missing API keys or network drops.
