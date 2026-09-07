# GAN Design Evaluation Rubric

## Evaluation Dimensions & Weights

### Design Quality (weight: 0.35)
- **Aesthetic Authority**: Does the workspace feel like a high-end Cambridge / IDP preparation publication (The Economist / The Guardian aesthetic) rather than a noisy gamified tutorial?
- **Hierarchy & Layout Balance**: Is the eye guided naturally from the editorial masthead to the daily deliberate ritual, the Band 7.5 readiness radar, and the core diagnostic cards?
- **Color Discipline**: Strict adherence to the 60-30-10 palette (Ivory / Obsidian Slate canvas, crisp structural cards, restrained academic indigo, emerald, warm ochre, crimson slate semantic accents). Zero harsh neon glows or clashes.
- **Theme Fidelity**: Flawless contrast and visual warmth in both Light Mode and Dark Mode.

### Originality (weight: 0.30)
- **Creative Leaps**: Avoidance of generic "AI slop" (no generic purple-blue gradients, no identical rounded cards with centered icons, no boilerplate heroes).
- **Editorial Distinction**: Use of academic serif mastheads, bespoke micro-borders, clean status pill tags, and an authoritative Band 7.5 diagnostic score matrix.
- **Pedagogical Polish**: A 20-minute daily deliberate practice ritual tracker that conveys seriousness of purpose.

### Craft (weight: 0.25)
- **Micro-Interactions**: Smooth hover states, subtle card elevation transitions, clean responsive adjustments.
- **Spacing & Rhythm**: Consistent 8pt grid spacing, balanced line heights, and refined typography scales (`JetBrains Mono` for figures/IPA, `Newsreader`/`Lora` for editorial headers, `Outfit`/`Inter` for labels).
- **DOM Precision**: Clean semantic HTML structure, well-structured CSS classes, and maintainable CSS utility rules.

### Functionality (weight: 0.10)
- **Strict DOM Contract**: All 25+ dynamic DOM IDs queried by JavaScript remain 100% active, functional, and correctly populated.
- **Interactive Integrity**: Every button (Continue Stage, Start Review, Open Speaking Lab, Vocab Logger, Deck Manager, Achievements) works smoothly without JavaScript console errors.
- **State Synchronicity**: Dynamic counters (XP, Level, Streak, Vocab Due, CEFR counts, Phase progress, Boss unlock) reflect live `playerState` and `vocabBank`.

## Scoring Calibration
- 1-4: AI slop, broken elements, harsh contrast clashes, or missing IDs.
- 5-6: Functional but visually mundane or inconsistent theme contrast.
- 7-8: Polished, professional academic design, clean typography, all features working.
- 9-10: Award-winning editorial elegance, breathtaking calm aesthetic, immaculate craft and zero regressions.

**Passing Threshold**: 7.5 / 10
