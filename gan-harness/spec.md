# Spec: IELTS Vocabulary Bank — Solid & High-Efficiency Redesign

## Objective
Redesign the Vocabulary Bank tab (`#tab-vocab-logger`) to be significantly more effective, solid, scannable, and engaging for IELTS Band 7.5+ candidates, while strictly preserving all existing data structures, AI prompts, event handlers, and modal contracts.

## Target User Persona
An ambitious IELTS learner studying on desktop and mobile who needs:
1. Instant visibility of daily review load and retention metrics (KPI HUD).
2. Frictionless word intake (Fast Add & Bulk Import).
3. Fast 1-click triage via intuitive quick-filter pills (Due Today, C1/C2 Band 7.5+, Locked, Writing Focus, Speaking Focus).
4. High-impact card design featuring collocations (collocation chunks), 5-level Feynman mastery pip tracker, Indonesian phonetic guide, and British audio pronunciation.
5. High density and visual solidity without feeling cluttered or overwhelmed.

## Key Design Pillars
1. **Command & KPI HUD**: 4 interactive metric cards (Total Words, Due Review, Band 7.5+ C1/C2, Mastered) that double as quick filters.
2. **Segmented Workflow Pills**: Horizontal pill bar for instant 1-tap filtering for top daily workflows.
3. **Solid High-Density Vocab Cards**:
   - CEFR color coding (C2 Violet, C1 Royal Blue, B2 Emerald, B1 Amber, Slang Orange).
   - Instant UK Audio pronunciation trigger.
   - Monospace Indonesian tongue-stress guide (`DIS-i-peit ↘`).
   - Highlighted IELTS Star Collocation (`⭐ gradually dissipate`).
   - 5-step Feynman mastery progress pip bar (`●●●○○`).
4. **Dual View Mode**: Grid View (rich cards) & Compact Dense Row View (rapid triage for large banks).
5. **Full Backward Compatibility**: 100% preserves existing DOM IDs (`input-vocab-word`, `btn-add-vocab`, `input-vocab-search`, `select-vocab-sort`, `vocab-bank-list`, `vocab-filter-detail-panel`, etc.) and JavaScript event hooks.
