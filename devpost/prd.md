---
doc: prd
status: approved
---

# ReceiptSplit (Local-First Private Edition) — Product Requirements

A high-craft, local-first private expense and chat agent that transforms chaotic WhatsApp group chats, Indian bank SMS alerts, and crumpled paper receipts into instant, proportional, zero-penny-loss group settlements with automated NPCI UPI QR codes and Min-Cash-Flow debt simplification.

*Source: [scope.md](file:///c:/Users/ash76/OneDrive/Desktop/AmazonHackathon-2/scope.md)*

---

## The Core Journey
1. **Intake & Zero-Permission Auto-Ingestion**:
   - **Focus-Triggered Clipboard Scanner**: User copies a message from WhatsApp or SMS, switches back to ReceiptSplit, and the `window.onfocus` interceptor auto-detects currency/merchant patterns and loads the parsed split card instantly without typing.
   - **Global Hotkey Ingestion**: Pressing `Ctrl+V` anywhere on the screen parses copied text or images.
   - **Live Notification Feed Simulator**: Pre-loaded incoming messages (Hinglish chats: *"Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"*, itemized pub bills, and HDFC UPI SMS alerts). Features an "Auto-Simulate Stream" mode for judges and demos.
   - **Offline Client-Side OCR**: Drag-and-drop dropzone applies Canvas contrast binarization and Tesseract.js WASM line-item extraction.
2. **Deterministic NLP / Regex Line-Item Extraction**:
   - Extracts merchant name, items, unit prices, subtotal, and tax in under 5ms without cloud latency.
   - Automatically handles shared remainders and creates balanced split items.
3. **Interactive Line-Item Allocation (Split Workbench)**:
   - Displays color-coded avatar pills (`[You]`, `[Rahul]`, `[Priya]`, `[Arjun]`) on each line item.
   - Clicking an avatar toggles individual or shared allocations with per-person unit price indicators.
   - Allows quick inline addition and editing of line items, quantities, and prices.
4. **Zero-Penny Hare-Niemeyer Mathematical Engine**:
   - Stores all currency in integer minor units (`amountPaise`: ₹1.00 = 100 paise).
   - Divides line items and proportionally distributes tax/tip using the Largest Remainder (Hare-Niemeyer) algorithm.
   - UI displays mathematical proof assertion: `Exact Integer Check: ₹X.XX = ₹X.XX (Zero penny discrepancy • Hare-Niemeyer Verified)`.
5. **Local-First Memory Graph & Min-Cash-Flow Solver**:
   - Persists all expenses and contacts locally in IndexedDB via Dexie.js (zero cloud writes).
   - Directed Acyclic Graph (DAG) solver computes net balances across all unsettled expenses and recursively collapses multi-party debt webs into the minimal direct transfers.
6. **NPCI Instant UPI QR Code Generation**:
   - Renders authentic scannable SVG QR codes using `qrcode.react` with `upi://pay?pa=...&pn=...&am=...&cu=INR` deep links.
   - One-click copy for monospace WhatsApp receipt summaries and direct mobile UPI app launch links.

---

## Screens and Layout (3-Column Bento Grid)
1. **Privacy Shield Telemetry Header (`PrivacyShieldHeader.tsx`)**:
   - Live telemetry: `🔒 100% On-Device IndexedDB`, byte storage counter (e.g. `14.2 KB`), ledger count, and `0 External Cloud Writes`.
   - Payee UPI ID quick-input with persistence.
   - "Export JSON" local backup button and 1-click "Wipe Local DB" reset button.
2. **Left Panel: Auto-Ingest Stream (`AutoIngestStream.tsx` - 30% width)**:
   - Toggle switch: `[AUTO-SCAN CLIPBOARD ON TAB FOCUS: ON/OFF]`.
   - "Auto-Simulate Live Stream" button for live demo presentation.
   - Incoming notification stream cards (WhatsApp group chats, UPI SMS, receipt OCR).
   - Offscreen Canvas contrast binarizer and Tesseract WASM receipt dropzone.
3. **Center Panel: Split Workbench (`SplitWorkbench.tsx` - 42% width)**:
   - Editable merchant title and source badge (`WHATSAPP_CHAT`, `BANK_SMS`, `RECEIPT_OCR`, `MANUAL`).
   - "Paid by" member selector and "Add Friend" modal.
   - Interactive line-item table with color-coded avatar pills and per-person cost breakdown.
   - Proportional tax and tip inputs.
   - Hare-Niemeyer mathematical proof assertion badge.
   - "Save to Local Memory Vault" button with celebratory visual feedback.
4. **Right Panel: Memory Graph Vault (`MemoryGraphVault.tsx` - 28% width)**:
   - Min-Cash-Flow debt simplification summary (e.g., *"Collapsed 7 group bills into 2 direct transfers"*).
   - Direct transfer cards with "Generate QR" triggers.
   - On-device spending memory insights (Top merchant, total spend, unsettled balance).
   - Historical local ledger with one-click reloading into Workbench.
5. **NPCI Settlement Modal (`UpiSettlementModal.tsx`)**:
   - Authentic SVG QR code, direct UPI mobile link, and formatted WhatsApp summary copy.

---

## Features and Behavior
1. **Integer Minor Units Model**:
   - All financial amounts are stored as integers representing paise.
   - Conversions: `toPaise("10.50") === 1050`, `toRupees(1050) === "₹10.50"`.
2. **Deterministic Hinglish & SMS NLP**:
   - Regex patterns detect Indian currency formats (`Rs. 1,240`, `₹1240`, `INR 1240`).
   - Hinglish debt keywords: `X dega`, `Y had [Item] [Price]`, `shared [Item]`, `baaki split`.
   - Unallocated balance automatically creates a communal shared line item.
3. **Graph Debt Minimization (Min-Cash-Flow)**:
   - Input: Array of unsettled `ExpenseRecord` and `Member` objects.
   - Algorithm:
     1. Calculate net balance for each member: $\text{Balance}_i = \text{Credits}_i - \text{Debits}_i$.
     2. Separate members into Creditors ($\text{Balance} > 0$) and Debtors ($\text{Balance} < 0$).
     3. Greedily match maximum debtor with maximum creditor until all balances are zero.
4. **Complete Local-First Privacy**:
   - IndexedDB stores all data locally in the user's browser.
   - No cookies, no external analytics, zero tracking.
