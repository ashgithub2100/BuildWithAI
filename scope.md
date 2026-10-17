---
doc: scope
status: approved
---

# Anchor

An anti-procrastination circuit-breaker app that kills cognitive paralysis using the Rule of One, microscopic task breakdown, and avoidance detection.

## The Unique Kernel
Traditional productivity apps aggravate cognitive freeze by confronting overwhelmed users with endless backlogs, tags, and guilt-inducing checklists. Anchor does the opposite: it acts as a cognitive shock absorber. It ingests an unfiltered brain dump, locks the noise entirely out of sight, and forces the **Rule of One**—presenting a single microscopic step scaled specifically to the user's current cognitive energy. If avoidance or hesitation is detected, its circuit-breaker intervenes to downscale the task until starting friction drops to zero.

## Who It's For
Knowledge workers, neurodivergent individuals (ADHD/executive dysfunction), students, and creators who freeze when overwhelmed by large, ambiguous projects and end up doomscrolling instead of taking action.

## The Core Loop
1. **Unload**: The user dumps chaotic, unstructured thoughts into a judgment-free input.
2. **Calibrate**: The user selects their real-time cognitive energy level (Low/Foggy, Medium/Steady, High/Flow).
3. **Lock & Anchor**: The app seals the backlog into a hidden vault and surfaces exactly **ONE** microscopic, low-friction next action on screen.
4. **Action or Circuit-Breaker**:
   - *If moving*: User completes the micro-step, gets a calm dopamine ping, and receives the next step.
   - *If stalling/hesitating*: Avoidance detection triggers a gentle circuit-breaker ("Feeling resistance? Let's make it 10x smaller") reducing the step to a laughable, effortless atomic start (e.g., "Just open the document").

## Inspiration & Identity
- **Aesthetic**: Zen-like focus, distraction-free dark mode with soothing warm accents, premium typography, tactile micro-interactions, and zero guilt/shame cues.
- **Tone**: Compassionate, unhurried, and ruthlessly pragmatic.
- **References**: Superhuman-level keyboard fluidity meets the calm reductionism of a meditation timer and the atomic habit philosophy of BJ Fogg and James Clear.

## Why This Matters to the Learner
Cognitive paralysis isn't a failure of willpower—it's an emotional reaction to feeling overwhelmed by scale and ambiguity. Building Anchor creates a practical, science-backed tool that breaks the paralysis loop and restores immediate agency.

## What "Working" Looks Like
In a 60-second live screen demo:
1. The user pastes an overwhelming, messy 5-line project brain dump.
2. The user sets energy to "Low / Foggy".
3. The app absorbs the dump, locks away the chaos, and presents a single atomic step: *"Open browser and log in to portal"*.
4. When the user hesitates or clicks *"Too hard / Stuck"*, the Avoidance Circuit-Breaker fires: *"Let's shrink it: Just open a blank tab"*.
5. The user checks it off; the app delivers subtle haptic/visual praise, unlocks the next step, and shows momentum building without cognitive overwhelm.

## The POC Boundary
- **In Scope (POC)**:
  - Unstructured Brain Dump text input with instant breakdown logic.
  - Energy Level Selector (Low, Medium, High) that modulates task granularity.
  - The Rule of One active screen (only 1 actionable item visible; all backlog hidden).
  - Micro-Step Decomposition Engine: Splitting daunting tasks into atomic 1-to-5-minute actions.
  - Avoidance Circuit-Breaker: Timer/stalling trigger or explicit "I'm stuck / I can't start" trigger that dynamically shrinks the micro-step.
  - Completion feedback loop & session momentum streak counter.
  - Emergency Backlog Peek (deliberately frictioned to prevent doom-browsing).
  - Local browser persistence (remembers active step and backlog).

## Later
- Voice-memo stream-of-consciousness dumping with auto-summarization.
- Smart notification nudge integration via web push or desktop alerts.
- Circadian rhythm and energy level trend analysis across workdays.

## Explicitly Cut
- **User Accounts & Authentication**: Adds setup friction and doesn't prove the core cognitive circuit-breaker mechanic.
- **Multi-user Collaboration / Team Assignments**: Anchor is an intimate individual cognitive tool; shared boards cause anxiety.
- **Nested Project Folders, Tags, and Kanban Boards**: These trigger the very administrative paralysis Anchor exists to destroy.
