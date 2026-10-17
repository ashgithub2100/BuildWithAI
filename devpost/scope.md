---
doc: scope
status: approved
---

# ReceiptSplit (Local-First Private Edition)

A high-craft, local-first private expense and chat agent that turns messy WhatsApp group chats, Indian bank SMS alerts, and crumpled paper receipts into instant, proportional, zero-penny-loss group settlements with automated NPCI UPI QR codes and Min-Cash-Flow debt simplification.

## The Unique Kernel
Group bill splitting is notoriously awkward, tedious, and error-prone. Traditional apps require manual entry or send sensitive personal finances to cloud servers, while naive float arithmetic causes penny discrepancies (e.g. ₹1,000 / 3 = 333.33, losing 1 paisa). 

ReceiptSplit solves this with a **Zero-Friction Ingestion Pipeline + Integer Currency Math + Min-Cash-Flow Debt Graph**:
1. **3-Channel Zero-Permission Ingestion**: Focus-triggered clipboard auto-capture (`window.onfocus`), global `Ctrl+V` paste listener, live notification stream simulator (Hinglish WhatsApp chats and bank SMS), and client-side Canvas binarization + Tesseract WASM OCR.
2. **Zero Floating-Point Penny Errors**: All amounts stored in integer minor units (`paise`: ₹1.00 = 100 paise) and distributed using the Hare-Niemeyer / Largest Remainder algorithm with zero loss.
3. **100% On-Device IndexedDB Storage**: Zero cloud leakage or database writes via Dexie.js.
4. **Local Min-Cash-Flow Graph Solver**: Automatically collapses multi-party debt webs into minimal direct two-party payments.
5. **Authentic NPCI UPI QR Generation**: Generates standard `upi://pay` deep links scannable by Google Pay, PhonePe, Paytm, and BHIM, plus one-click WhatsApp summary copy.

## Who It's For
Friends dining out, roommates managing shared grocery/utility bills, and trip organizers in India who want instant, dispute-free group expense itemization with complete data privacy and native UPI settlements.

## The Core Loop
1. **Auto-Capture / Intercept**: The user copies a WhatsApp message, switches tabs (auto-captured on focus), pastes with `Ctrl+V`, drops a photo receipt, or clicks a simulated notification.
2. **Deconstruct & Parse**: Fast deterministic lexical NLP parses items, amounts, merchants, and member contributions in under 5ms without cloud latency.
3. **Assign & Lock**: The user toggles color-coded member avatar chips (`[You]`, `[Rahul]`, `[Priya]`, `[Arjun]`) on line items.
4. **Proportional Distribution**: The integer math engine calculates exact base shares plus proportional tax and tip using the Hare-Niemeyer Largest Remainder method.
5. **Graph Settlement**: The local memory graph collapses multi-bill debts into the minimum number of direct transfers, rendering scannable NPCI UPI QR codes and formatted WhatsApp settlement texts.

## Aesthetic & Tone
- **Visual Identity**: High-trust obsidian slate fintech theme (`#0B0F17` background, `#111827` panels, `#10B981` emerald ledger green, and `#3B82F6` fintech blue).
- **Tone**: Effortless, transparent, mathematically pristine, and dispute-free.
- **Inspiration**: Stripe Checkout clarity meets Apple Wallet minimalism, Wise cross-border precision, and Linear keyboard ergonomics.

## What "Working" Looks Like
In a 60-second live screen demo:
1. User copies a Hinglish WhatsApp text: *"Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"*.
2. User switches to the ReceiptSplit tab; the focus-triggered interceptor auto-loads the parsed expense into the Split Workbench with 0 clicks.
3. Items, subtotal, and tax are displayed with color-coded member chips.
4. Hare-Niemeyer integer math allocates shares down to the exact paisa, showing the mathematical proof assertion: `₹1,240.00 = ₹1,240.00 (Zero penny discrepancy)`.
5. Saving to the Local Memory Vault updates the Min-Cash-Flow graph, collapsing redundant IOUs into direct transfers.
6. User clicks "Generate QR", revealing an authentic NPCI UPI QR code scannable by any Indian UPI app.

## The POC Boundary
- **In Scope (POC)**:
  - 3-channel ingestion: Focus-triggered clipboard reader, global paste, live notification stream simulator, and client Canvas + Tesseract WASM OCR.
  - Deterministic Hinglish WhatsApp chat and Indian bank SMS regex/NLP parser.
  - Integer minor unit (`amountPaise`) model and Hare-Niemeyer Largest Remainder algorithm.
  - Interactive line-item table with clickable member avatar toggles and per-item cost indicators.
  - Proportional tax and tip distribution lock.
  - Local IndexedDB storage via Dexie.js with live telemetry byte counter, 0-cloud-writes indicator, JSON backup export, and local wipe.
  - Min-Cash-Flow DAG debt simplification solver.
  - Authentic NPCI `upi://pay` QR code generation (`qrcode.react`) and 1-click WhatsApp summary export.
  - Optional stateless ephemeral AI vision parse endpoint with PII redaction and zero logging.

## Later
- Real-time WebRTC peer-to-peer room sync between diners' smartphones.
- PWA Web Share Target for direct mobile share-sheet ingestion.
- Multi-currency conversion for international travel.

## Explicitly Cut
- Cloud user authentication and centralized database accounts.
- Bank account / card processing integration (handled natively peer-to-peer via UPI deep links).
