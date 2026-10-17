---
doc: prd
status: approved
---

# Anchor — Product Requirements

An anti-procrastination circuit-breaker web application that kills cognitive paralysis using the Rule of One, microscopic task breakdown, and avoidance detection.

*Source: [scope.md](file:///c:/Users/ash76/OneDrive/Desktop/AmazonHackathon-2/scope.md)*

---

## The Core Journey
1. **Arrival & Zero-Friction Entry**: The user opens Anchor in a state of cognitive overload. There are no distracting dashboards, unread badges, or overdue lists. The screen presents a clean, soothing text intake: *"Dump the noise. What's on your mind?"*
2. **Brain Dump & Energy Choice**: The user pastes or types an unstructured, chaotic stream-of-consciousness dump (e.g., *"Need to finish hackathon video, fix the CSS bug, write the devpost description, make sure github is public, email the team, and I feel completely stuck"*). They select their current energy level via a 3-tier selector:
   - 🟢 **High / Flow** (Deep work, ready for 15-minute substantive blocks)
   - 🟡 **Medium / Steady** (Moderate focus, ready for 5-minute tasks)
   - 🔴 **Low / Foggy** (Exhausted/Paralyzed, ready only for 30-to-60-second atomic micro-actions)
3. **The Lock-In (Circuit Breaker Activated)**: The user clicks *"Anchor Me"*. An animated shutter or vault closes over the dump. The overwhelming list disappears from perception.
4. **The Rule of One Cockpit**: The screen displays exactly **ONE** task—the Anchor. Nothing else. The typography is large, clear, and reassuring. A subtle heartbeat/focus pulse indicator shows that the session is live.
5. **Momentum or Avoidance**:
   - **Happy Path (Momentum)**: The user does the step, hits `Space` or clicks `Complete Step`. A soft audio chime and gentle particle burst trigger, and the next micro-step slides into view.
   - **Hesitation Path (Avoidance Circuit-Breaker)**: If the user stays inactive on the step past an avoidance threshold (e.g., 90 seconds without progress) OR if they click *"Can't Start / Too Hard"*, the Avoidance Circuit-Breaker intervenes gently:
     - Prompts: *"Feeling friction? That's normal. Let's make it 10x smaller."*
     - Replaces the step with an atomic microscopic pre-step (e.g., if the step was *"Write 3 sentences"*, it shrinks to *"Open the editor tab and type just 1 letter"*).
6. **Session Wrap & Dopamine Reward**: Once all micro-steps generated from the dump are completed, Anchor displays a completion card summarizing the microscopic wins and time elapsed, resetting the mental state from paralysis to pride.

---

## Screens and Layout
Anchor operates as a focused single-page application (SPA) with three fluid visual states:

1. **Intake Surface (Dump & Calibrate)**:
   - Centered distraction-free card.
   - Large auto-expanding textarea for freeform dump.
   - 3-segment tactile Energy Selector (`Low / Foggy`, `Medium / Steady`, `High / Flow`).
   - Primary action button: *"Anchor Me"*.
2. **Active Focus Cockpit (The Rule of One)**:
   - Fullscreen zen mode.
   - Total suppression of backlogs, navbars, and sidebar clutter.
   - Centerpiece: Current Micro-Step card in high-contrast legible font with an estimated duration (e.g., `~45s`).
   - Micro-action buttons:
     - Primary: `Done (Space)`
     - Circuit-Breaker: `Too Hard / Break It Down (B)`
     - Skip/Defer: `Park for Later`
   - Bottom status bar: Minimalist progress dots (`3 of 7 completed`), Session Timer, and a discreet locked *"Vault"* button.
3. **The Vault Drawer (Frictioned Backlog)**:
   - A slide-over panel that stores the rest of the decomposed steps.
   - Deliberately introduces a 1-second "Are you sure you want to look? Stay anchored on your current step" confirmation overlay to prevent impulse list-scanning.

---

## Look and Feel
- **Visual Aesthetic**: Calming dark mode ("Oasis Dark") using deep slate/charcoal backgrounds (`#0d1117`, `#161b22`), subtle ambient glows, and warm amber/emerald accents (`#f59e0b`, `#10b981`) instead of aggressive neon alert colors.
- **Typography**: Clean, friendly modern sans-serif (Inter or Outfit) for body; crisp monospace for timing and keyboard shortcuts.
- **Micro-interactions**: Smooth transitions between micro-steps, satisfying tactile button presses, soft audio feedback (synthesized web audio tone), and confetti/particle bloom on final task victory.
- **Emotional Tone**: Non-judgmental, warm, protective, and empowering.

---

## Features and Behavior

### 1. Chaotic Brain Dump Intake
- Accepts multi-line messy paragraphs, bullet points, or stream-of-consciousness text.
- Provides one-click sample scenarios ("Hackathon Deadline Panic", "Overdue Tax Prep", "Messy Room Reset") for rapid testing and demo recording.
- *Acceptance Criteria*:
  - Pasting a 1,000-character blob of unstructured text parses successfully without lag.
  - Clicking an example prompt immediately populates the input and sets recommended energy level.

### 2. Cognitive Energy Calibration
- Three explicit cognitive energy tiers:
  - **Low / Foggy**: Decomposes actions into 30–60 second physical micro-actions (e.g., "Put fingers on keyboard", "Open doc").
  - **Medium / Steady**: Decomposes actions into 3–5 minute focused blocks.
  - **High / Flow**: Decomposes actions into 10–15 minute solid milestones.
- *Acceptance Criteria*:
  - Toggling energy modifies the resulting step granularity immediately upon processing.

### 3. The Rule of One Focus Cockpit
- Displays strictly **ONE** active task at any moment.
- Hides all subsequent steps, eliminating the cognitive weight of unfinished tasks.
- Supports rapid keyboard shortcuts (`Space` to complete, `B` to break down, `V` to toggle vault).
- *Acceptance Criteria*:
  - No other task titles or future step descriptions are visible on the main focus screen.
  - Pressing `Space` marks current task complete and animates in the next step within 200ms.

### 4. Microscopic Task Breakdown Engine
- Decomposes high-level daunting statements into actionable, atomic micro-steps.
- Employs a built-in intelligent heuristic engine (with optional AI model integration via client API key or built-in deterministic fallback logic) that detects complex verbs and expands them into sequential sub-steps.
- *Acceptance Criteria*:
  - Input: "Submit project to Devpost" -> Output:
    1. "Open devpost.com in browser"
    2. "Log into account"
    3. "Click 'Enter a Submission'"
    4. "Paste project title"
    5. "Upload 1 screenshot"
    6. "Click Submit"

### 5. Avoidance Detection & The Circuit-Breaker
- **Passive Detection**: An idle timer monitors active time on the current micro-step. If time on step exceeds 2x the estimated micro-duration (e.g. 90 seconds on a 30s task) without interaction, a gentle pulse appears: *"Still with us? Need a tinier step?"*
- **Active Trigger**: The user can click *"Too Hard / I'm Stuck"* at any time.
- **Circuit-Breaker Action**: Replaces the intimidating step with an even smaller "Atomic Zero" step (e.g., "Don't write anything. Just look at the screen for 10 seconds and take a breath").
- *Acceptance Criteria*:
  - Clicking *"Too Hard"* instantly splits the current task into two smaller halves or downscales its difficulty.
  - Idle timer triggers the compassionate check-in prompt without resetting the task.

### 6. Momentum Engine & Dopamine Micro-Loop
- Displays a visual streak of completed micro-steps (minimalist glowing pills/dots).
- Plays an optional gentle harmonic chime upon step completion.
- Triggers a celebratory victory card when the queue reaches zero.
- *Acceptance Criteria*:
  - Checking off a task visibly advances the momentum counter and plays audio tone.
  - Final step completion triggers the success celebration card with option to "Start New Dump" or "Rest".

---

## States and Boundaries
- **Empty State**: Welcoming input box with clear prompt and quick-demo sample buttons.
- **Active Focus State**: Only the single Anchor step is visible with clear CTAs.
- **Circuit-Breaker State**: A non-accusatory overlay that offers immediate task simplification.
- **Vault State (Backlog)**: Guarded modal with a confirmation check so the user doesn't relapse into task-list skimming.
- **Completion State**: Celebration card with total completed steps and session time.
- **Persistence**: All state (active task, energy level, backlog, completed count) is automatically persisted in `localStorage`. If the user accidentally refreshes or closes the tab, they resume right at their current Anchor step.

---

## Product Decisions
- **Single Task View (Rule of One) vs. List View**: Strictly enforced single-task view. Giving the option to show a full list destroys the core value proposition of killing cognitive paralysis.
- **Client-Side First**: Runs 100% locally in the browser with local storage persistence and built-in heuristic decomposition (with optional LLM API fallback) to guarantee instant zero-latency responsiveness and zero server setup requirements for the hackathon demo.
- **Gentle vs. Punitive Circuit-Breaker**: Zero guilt, zero red warning alerts, zero shaming. The circuit breaker is a supportive friend, not a nagging boss.

---

## What We're Building (POC Scope)
1. SPA web application with Oasis Dark theme and smooth transitions.
2. Brain dump input with sample presets for quick demonstration.
3. 3-tier energy level selector.
4. Intelligent micro-step breakdown engine.
5. The Rule of One active cockpit with keyboard shortcuts.
6. Avoidance detection idle timer and active "Too Hard / Shrink It" circuit breaker.
7. Friction-locked Vault drawer to view upcoming steps.
8. Audio-visual micro-celebration loop and session completion summary.
9. LocalStorage state persistence.

---

## Deferred From the POC
- **Speech-to-text / Audio voice memo transcription**: Deferred to future release; text input covers the core user journey.
- **Cloud sync & multi-device accounts**: Not required for proof of concept.
- **Push / Desktop notifications**: Kept in-app to avoid browser permission friction during judging/demo.

---

## Non-Goals
- Becoming a general-purpose project management tool (Jira/Asana replacement).
- Supporting team collaboration, sharing, or assignees.
- Long-term backlog grooming, scheduling, recurring reminders, or calendar sync.

---

## Open Questions
- *Audio Chimes*: Should sound effects default to ON or OFF? (Decision: Default ON with an easy one-click mute toggle on the cockpit).
