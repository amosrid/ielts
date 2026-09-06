---
trigger: always_on
description: "Strict Scope Boundary & Preservation of Working Components and System Prompts: Never alter working UI components, button labels, or AI system prompts unless explicitly instructed."
---

# Strict Scope Boundary & Component/Prompt Preservation Rule

Whenever modifying, refactoring, reorganizing, or adding features to this codebase:

1. **JANGAN UBAH JIKA TIDAK DISURUH (Strict Task Boundary)**:
   - When instructed to move, group, or reorganize elements (e.g. into tabs, modals, drawers, or accordions), ONLY move their containers.
   - **DO NOT** rewrite, redesign, restyle, or rename existing working inner components, button labels, icons, or layouts unless the user explicitly asks to modify that specific component.

2. **PRESERVE SYSTEM PROMPTS & AI PERSONAS (No Unprompted Prompt Rewrites)**:
   - NEVER modify, simplify, or weaken existing AI system prompts (especially the AI Pronunciation & Phonetic Coach, Writing Quest Examiners, Mini-Boss Evaluators, and Glitch Lab prompts).
   - If a component calls an AI API, preserve its exact `systemPrompt`, `userQuery`, scoring rubric, and response parsing contracts. Any prompt tuning must be explicitly requested or approved by the user.

3. **PRESERVE OUTPUT DEPTH & VISUAL CONTRACTS**:
   - Do NOT replace detailed multi-section outputs (such as the 5-Pillar Phonetic Audit or step-by-step blueprints) with abbreviated summary badges or cards that hide information, unless explicitly instructed.
   - Maintain the established output fidelity so learners never lose comprehensive pedagogical feedback.

4. **MINIMAL-DIFF DISCIPLINE**:
   - Always prefer the minimal set of code changes necessary to fulfill the user's specific request.
   - Avoid opportunistic refactoring of unrelated functions or styles in adjacent code blocks.
