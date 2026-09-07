# Design Spec: Focus Cockpit & Dashboard (Calm Editorial Academic)

## Brief
Redesign the Focus Cockpit & Dashboard into a high-end "Calm Editorial Academic" workspace (inspired by *The Economist* and *The Guardian* typography, Band 7.5 readiness radar, daily deliberate ritual tracker, cohesive light/dark mode contrast, and zero-distraction layout) while preserving 100% of existing JavaScript DOM IDs, button triggers, and state synchronization contracts.

## Aesthetic & Design Direction
- **Philosophy**: *"Calm Editorial Academic"* — Dignified, publication-grade academic authority instead of generic neon gamification.
- **Palette (60-30-10 Rule)**:
  - 60% Neutral Canvas: Ivory paper (`#fbfbfa` / `#f8fafc`) in Light Mode, deep obsidian slate (`#0b0f17` / `#0f172a`) in Dark Mode.
  - 30% Structural Cards: Crisp white card containers (`#ffffff`) with hairline borders (`#e2e8f0` / `#1e293b`), balanced padding, and subtle shadows (`shadow-sm`).
  - 10% Semantic Accents: Deep Academic Indigo (`#4338ca` / `#6366f1`), Sage/Emerald (`#047857` / `#10b981`), Warm Ochre (`#b45309` / `#f59e0b`), Crimson Slate (`#be123c`).
- **Typography Hierarchy**:
  - Masthead & Editorial Headings: Academic Serif (`Newsreader` / `Merriweather` / `Lora`, font-serif italic/normal) for prestige editorial gravitas.
  - Labels & Navigation: Precision Sans (`Outfit` / `Inter`, uppercase tracking-wider).
  - Metrics & Status: Clean Monospace (`JetBrains Mono`).

## Core Dashboard Modules (Strict DOM Preservation)
1. **Editorial Masthead & Focus Banner**:
   - Preserves: `dash-greeting-badge`, `dash-streak-count`, `dash-level-text`, `dash-xp-fraction`, `dash-xp-bar-inner`, `btn-dash-hero-continue`, `dash-hero-continue-text`.
   - Adds: Band 7.5 Target Calibration status badge and Daily Deliberate Practice timer/ritual indicator.
2. **IELTS Band 7.5 Readiness Diagnostic Radar**:
   - Dynamic 4-pillar IELTS breakdown:
     - **TR** (Task Response)
     - **CC** (Coherence & Cohesion)
     - **LR** (Lexical Resource)
     - **GRA** (Grammatical Range & Accuracy)
   - Real-time visual progress bars/radar indicators derived from completed stages, vocabulary acquisition count, and speaking sessions.
3. **Daily Deliberate Ritual Protocol (20-Minute Focus)**:
   - Preserves: `daily-affirmation-card`, `affirmation-card-body`, `affirmation-deck-count`.
   - Clean 3-step deliberate checklist (Vocal Warmup, Grammar Drill, Spaced Review).
4. **Phase Mastery & 60-Min Boss Arena**:
   - Preserves: `dash-overall-percent`, `dash-p1-bar`, `dash-p1-label` through `dash-p5-bar`, `dash-p5-label`, `dash-boss-badge`.
   - Clean editorial stage progression matrix with phase-specific academic hues.
5. **Acoustic Speaking Diagnostic & Spaced Repetition Lexical Vault**:
   - Preserves: `dash-speaking-accent-tag`, `dash-spk-part1-status`, `dash-spk-part2-status`, `dash-spk-part3-status`, `dash-vocab-total-badge`, `dash-vocab-due-count`, `dash-cefr-c2-count` through `dash-cefr-a1-count`, `btn-dash-review-cta`.
6. **Honours & Cambridge Band Badges Showcase**:
   - Preserves: `dash-badges-unlocked-count`, `dash-badges-preview-list`.

## Strict Non-Negotiable Constraints
- DO NOT remove, rename, or hide any element ID expected by `js/2-core.js`, `js/5-vocab.js`, or `js/6-affirmation.js`.
- DO NOT modify any AI prompt or API configuration.
- Keep light and dark modes fully supported with zero contrast clashes.
