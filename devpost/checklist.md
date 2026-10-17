---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Next.js 14 project scaffold, domain schemas, Web Audio synthesizer, and heuristic engine**
  Becomes usable: The Next.js 14 project builds with TypeScript, Tailwind CSS, Framer Motion, and Lucide React. Core domain schemas (`anchor.schema.ts`), tactile Web Audio mechanical relay synthesizer (`soundEngine.ts`), and intelligent deterministic lexical fallback parser (`heuristicEngine.ts`) are fully tested and functional.
  Why now: Establishes the solid bedrock, typing contracts, and sound synthesizer so all downstream slices have guaranteed zero-latency local fallbacks and sensory feedback.
  PRD ref: `prd.md > Features and Behavior > 1. Chaotic Brain Dump Intake`, `prd.md > 2. Cognitive Energy Calibration`
  Spec ref: `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Data Model`
  Build: Scaffold Next.js project with Tailwind CSS, configure fonts and Analog Industrial theme (`#0E0E0D`, `#161614`, `#E59838`). Implement `src/types/anchor.schema.ts`, `src/lib/soundEngine.ts`, and `src/lib/heuristicEngine.ts` with unit verification.
  Verify (mechanical): Run TypeScript check and unit verification script testing schema validation and deterministic task deconstruction + recursive shrink calculations.
  Learner check: Verify the project builds cleanly with `npm run build` with zero TypeScript errors.
  Commit: `Scaffold Next.js project, domain schemas, sound engine, and heuristic parser`

- [x] **2. LLM Route Handlers (`/api/deconstruct` and `/api/shrink`) & Hybrid LIFO/FIFO Store (`useAnchorStore.ts`)**
  Becomes usable: API routes accept raw dumps, detect avoidance tasks, calibrate by energy (FRIED/STEADY/WIRED), and recursively shrink tasks. The Zustand store manages the FSM (`DUMP_MODE` -> `CALIBRATING` -> `ANCHOR_LOCKED` -> `SHRINKING` -> `SESSION_COMPLETE`) with LIFO Execution Stack and FIFO Vault Queue.
  Why now: Implements the cognitive brain and dual-queue state machine before connecting user-facing components.
  PRD ref: `prd.md > Features and Behavior > 4. Microscopic Task Breakdown Engine`, `prd.md > 5. Avoidance Detection & The Circuit-Breaker`
  Spec ref: `spec.md > State Machines: Rule of One & Avoidance Detection`, `spec.md > Components`
  Build: Implement `src/lib/llmClient.ts`, `src/app/api/deconstruct/route.ts`, `src/app/api/shrink/route.ts`, and `src/store/useAnchorStore.ts` with local persistence and SSR hydration guard.
  Verify (mechanical): Execute API test script sending sample dumps to `/api/deconstruct` and `/api/shrink`, verifying schema validation, avoidance tagging, and dual-queue store transitions.
  Learner check: Test API endpoints with curl/fetch and observe proper structured JSON and queue initialization.
  Commit: `Implement deconstruct & shrink route handlers and hybrid LIFO/FIFO store`

- [x] **3. BrainDumpTerminal, HeaderTelemetry, and The Rule-of-One ActiveAnchorStage**
  Becomes usable: Full user-facing loop. User can type or click "Load Demo Brain Dump", toggle hardware energy switches (`FRIED`, `STEADY`, `WIRED`), click "Anchor Me", hear the relay click, and enter the Rule-of-One focus stage displaying only the active task, countdown timer, stack depth badges (`[SHRINK DEPTH: L0]`), and keyboard shortcuts.
  Why now: Delivers the core visual experience and the Rule of One cockpit.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Look and Feel`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Components > BrainDumpIntake`, `spec.md > Components > FocusCockpit`
  Build: Build `HeaderTelemetry.tsx`, `BrainDumpTerminal.tsx`, and `ActiveAnchorStage.tsx` with Analog Industrial aesthetic, kbd badges, and Framer Motion spring transitions.
  Verify (mechanical): Start dev server, load page, submit demo brain dump, and verify transition to `ANCHOR_LOCKED` displays strictly the single primary task.
  Learner check: Open http://localhost:3000, click "Load Demo Brain Dump", select "FRIED", click "Anchor Me", and experience the noise vanishing into the single-task stage.
  Commit: `Build BrainDumpTerminal, HeaderTelemetry, and ActiveAnchorStage`

- [x] **4. Passive Resistance Telemetry Hook, AvoidanceInterceptor, Shrink Circuit-Breaker, and VaultSealBar**
  Becomes usable: Procrastination telemetry is active: tab-switching (`document.visibilityState`) and 45s idle stalls automatically trigger the amber circuit-breaker prompt. Pressing `Space` slices tasks in half down to 15s atomic actions and pushes remainders onto the LIFO stack. Pressing `Enter` snaps the task complete with Web Audio clicks. Pressing `V` inspects the sealed vault with an intentional friction confirmation.
  Why now: Completes the full anti-procrastination circuit-breaker loop, edge cases, and sensory gratification.
  PRD ref: `prd.md > Features and Behavior > 5. Avoidance Detection & The Circuit-Breaker`, `prd.md > 6. Momentum Engine & Dopamine Micro-Loop`
  Spec ref: `spec.md > Components > AvoidanceCircuitBreakerModal`, `spec.md > Components > VaultDrawer`
  Build: Implement `usePassiveResistance.ts`, `useKeyboardShortcuts.ts`, `AvoidanceInterceptor.tsx`, and `VaultSealBar.tsx`. Wire keyboard shortcuts (`[ENTER]`, `[SPACE]`, `[V]`) and completion stage.
  Verify (mechanical): Test tab-switching trigger, 45s idle prompt, recursive task shrinking, and task completion cycling through the execution stack into the vault queue.
  Learner check: Test pressing `Space` to shrink a task, observe depth badge update (`[SHRINK DEPTH: L1]`), press `Enter` to complete, hear the mechanical snap, and test the sealed vault drawer.
  Commit: `Add passive resistance telemetry, avoidance interceptor, and vault seal bar`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — Slice 3 (Interactive dump to Rule-of-One focus stage)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 4 (Full end-to-end loop with avoidance & sound)

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
