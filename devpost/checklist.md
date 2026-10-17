---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Dependencies, domain schemas, integer math engine, chat extractor, and Dexie IndexedDB**
  Becomes usable: Project scaffold with Next.js 14, Tailwind, Dexie, qrcode.react, Tesseract.js. Core integer paise math engine (`moneyMath.ts` implementing the Hare-Niemeyer Largest Remainder method with zero penny loss), deterministic Hinglish chat & Bank SMS parser (`chatExtractor.ts`), Dexie IndexedDB client (`db.ts`), and Min-Cash-Flow debt solver (`debtGraph.ts`) are fully tested and functional.
  Why now: Establishes the mathematical bedrock and local database before constructing user-facing views.
  PRD ref: `prd.md > Features and Behavior > 3. Proportional Tax & Tip Mathematical Distribution`
  Spec ref: `spec.md > Domain Model`, `spec.md > Integer Math Specification`, `spec.md > Stack`
  Build: Configure `package.json`, install dependencies, implement `src/types/ledger.schema.ts`, `src/lib/moneyMath.ts`, `src/lib/chatExtractor.ts`, `src/lib/debtGraph.ts`, `src/lib/upiGenerator.ts`, and `src/lib/db.ts`.
  Verify (mechanical): Run TypeScript check and node test verifying Largest Remainder math, Hinglish chat parsing, and Min-Cash-Flow debt simplification.
  Learner check: Verify the test script passes with 100% mathematical precision (zero penny errors) and clean schema validation.
  Commit: `Scaffold Next.js project, integer paise engine, chat extractor, and Dexie IndexedDB`

- [x] **2. PrivacyShieldHeader and AutoIngestStream (Clipboard auto-reader & Live notification simulator)**
  Becomes usable: Top telemetry bar with live IndexedDB storage stats and local wipe trigger. Left panel auto-ingest stream featuring focus-triggered clipboard auto-reader, global `Ctrl+V` paste listener, live incoming WhatsApp/SMS feed simulator, and receipt drag-and-drop.
  Why now: Provides the zero-friction ingestion pipeline so data immediately flows into the workbench.
  PRD ref: `prd.md > The Core Journey` (step 1), `prd.md > Features and Behavior > 1. Multimodal OCR & Receipt Parsing Engine`
  Spec ref: `spec.md > Components > HeaderFintech.tsx`, `spec.md > Components > ReceiptDropzone.tsx`
  Build: Implement `src/hooks/useClipboardInterceptor.ts`, `src/hooks/useLocalMemoryStats.ts`, `src/components/PrivacyShieldHeader.tsx`, and `src/components/AutoIngestStream.tsx`.
  Verify (mechanical): Verify clipboard hook handles focus and paste events safely without throwing permission exceptions.
  Learner check: Open http://localhost:3000, click a simulated WhatsApp notification or paste a chat snippet, and see it immediately load into active state.
  Commit: `Build PrivacyShieldHeader and AutoIngestStream with clipboard auto-capture`

- [x] **3. SplitWorkbench (Interactive line items, member avatar toggles, proportional tax/tip lock)**
  Becomes usable: The center interactive table where line items, quantities, and prices appear. Clicking member avatar chips (`[You]`, `[R]`, `[P]`, `[A]`) assigns shares dynamically, recalculates proportional tax and tip without penny errors, and saves the verified expense to local IndexedDB.
  Why now: Delivers the core line-item allocation experience.
  PRD ref: `prd.md > Features and Behavior > 2. Participant Management`, `prd.md > 3. Proportional Tax & Tip Mathematical Distribution`
  Spec ref: `spec.md > Components > ItemizedBillTable.tsx`, `spec.md > Components > ProportionalMathLedger.tsx`
  Build: Build `src/components/SplitWorkbench.tsx` with member avatar selector chips, proportional tax/tip lock, manual line-item addition, and IndexedDB saving.
  Verify (mechanical): Test member toggling on line items and verify proportional split calculations sum to totalPaise exactly.
  Learner check: Assign an appetizer to multiple members, watch their individual shares compute, and save to local memory.
  Commit: `Implement SplitWorkbench with interactive member assignments and proportional math`

- [ ] **4. MemoryGraphVault, NPCI UPI QR Generator, and unified page integration**
  Becomes usable: Right panel local memory vault displaying spending stats, simplified Min-Cash-Flow debts, dynamic NPCI `upi://pay` QR codes in `UpiSettlementModal.tsx`, and 1-click WhatsApp summary export. Full application builds cleanly with `npm run build`.
  Why now: Completes the full end-to-end loop from ingestion to settlement.
  PRD ref: `prd.md > Features and Behavior > 4. Dynamic Payment QR Code Generation`, `prd.md > 5. Group Chat Export`
  Spec ref: `spec.md > Components > SettlementCardsGrid.tsx`, `spec.md > Components > PaymentQRModal.tsx`
  Build: Build `src/components/MemoryGraphVault.tsx`, `src/components/UpiSettlementModal.tsx`, and assemble `src/app/page.tsx` with high-craft Fintech theme.
  Verify (mechanical): Run `npm run build` and verify 0 errors; verify UPI QR code generation and debt graph simplification.
  Learner check: Check the simplified debt summary, open a UPI QR code, test scanning it on a mobile device, and copy the WhatsApp summary.
  Commit: `Add MemoryGraphVault, NPCI UPI QR modal, and complete single-screen workspace`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — Slice 2 (Live notification stream & clipboard auto-capture)
- [ ] Final kick-the-tires exploration and feedback completed — Slice 4 (Full end-to-end local-first workspace)

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
