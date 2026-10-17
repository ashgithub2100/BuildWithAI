# ReceiptSplit (Local-First Private Edition)

> **Zero-friction group expense & chat agent with 100% on-device privacy, zero-penny Hare-Niemeyer math, and native NPCI UPI settlements.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Dexie.js](https://img.shields.io/badge/Dexie.js-IndexedDB-emerald.svg)](https://dexie.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## ⚡ The Technical Problem
1. **OS Permission Walls & Friction**: Browsers strictly forbid silent background scraping of native WhatsApp/SMS. Users are forced to retype bills manually.
2. **Floating-Point Penny Loss**: In standard JavaScript, splitting ₹1,000 three ways (`1000 / 3 = 333.33`) sums to ₹999.99—leaving ₹0.01 missing and breaking accounting reconciliation.
3. **Cloud Privacy Leakage**: Most expense apps require cloud accounts, syncing personal friendships and financial receipts to external third-party servers.
4. **Chaotic Multi-Person Debt Chains**: Across multiple meals and trips, friends end up with 10+ circular IOUs that nobody knows how to settle cleanly.

---

## 🛠️ The Senior Architecture Solution

### 1. 3-Channel Zero-Permission Ingestion Pipeline
- **Focus-Triggered Clipboard Scanner** (`window.onfocus`): Copy a message in WhatsApp, switch back to the ReceiptSplit tab, and the interceptor reads the clipboard, hashes the text to prevent duplicates, detects currency patterns, and auto-populates the split card—zero pasting or typing required.
- **Global `Ctrl+V` Paste Listener**: Intercepts raw chat text or image blobs anywhere on screen.
- **Live Notification Feed Simulator**: Pre-loaded realistic WhatsApp group chats (*"Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"*), pub bill texts, and HDFC UPI SMS alerts. Includes an **"Auto-Simulate Stream"** button for hands-free 2-minute demo videos.
- **Offline Client-Side OCR**: HTML5 Canvas contrast binarizer + Tesseract.js WASM worker running client-side with 0ms network latency.

### 2. Zero-Penny Hare-Niemeyer Math Engine
- All currency amounts are converted to integer minor units (`amountPaise`: ₹1.00 = 100 paise).
- Remainder paise are distributed deterministically using the **Largest Remainder (Hare-Niemeyer) Algorithm**, ensuring:
  $$\sum \text{Member Shares} \equiv \text{Receipt Total (Exact to the Paisa)}$$
- Proportional tax and tip allocations lock to each member's item subtotal share.

### 3. Local-First Graph Debt Simplification (Min-Cash-Flow)
- **100% On-Device IndexedDB Persistence**: All expenses, contacts, and spending history live locally inside IndexedDB via Dexie.js (zero cloud writes).
- **Directed Graph Solver**: A local Min-Cash-Flow algorithm computes net balances across all unsettled expenses and recursively pairs maximum creditors with maximum debtors, collapsing complex IOU loops into the minimum direct peer-to-peer transfers.

### 4. Authentic NPCI UPI QR & WhatsApp Export
- Generates standard NPCI `upi://pay` deep links:
  `upi://pay?pa=payee@upi&pn=Name&am=1240.00&cu=INR&tn=ReceiptSplit`
- Renders high-contrast vector QR codes via `qrcode.react` scannable by Google Pay, PhonePe, Paytm, and BHIM.
- 1-click **"Copy WhatsApp Settlement Card"** formats an itemized monospace breakdown ready to paste into group chats.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18.17+ or Node.js 20+
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/ashgithub2100/BuildWithAI.git
cd BuildWithAI

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```text
src/
├── types/
│   └── ledger.schema.ts          # Zod domain models & integer paise interfaces
├── lib/
│   ├── db.ts                     # Dexie.js IndexedDB schema & local wipe utilities
│   ├── moneyMath.ts              # Hare-Niemeyer Largest Remainder integer math engine
│   ├── chatExtractor.ts          # Deterministic Hinglish & SMS regex/NLP parser
│   ├── receiptOcr.ts             # Canvas contrast normalizer & Tesseract WASM parser
│   ├── debtGraph.ts              # Min-Cash-Flow graph debt simplification algorithm
│   └── upiGenerator.ts           # NPCI `upi://pay` URI builder & WhatsApp formatter
├── hooks/
│   ├── useClipboardInterceptor.ts # Focus-triggered clipboard auto-reader
│   └── useLocalMemoryStats.ts    # Reactive IndexedDB storage telemetry hook
├── components/
│   ├── PrivacyShieldHeader.tsx   # Top telemetry bar (0 Cloud Writes, local wipe)
│   ├── AutoIngestStream.tsx      # Left panel: live stream simulator & receipt dropzone
│   ├── SplitWorkbench.tsx        # Center panel: interactive line items & avatar chips
│   ├── MemoryGraphVault.tsx      # Right panel: Min-Cash-Flow settlements & ledger history
│   └── UpiSettlementModal.tsx    # Scannable NPCI UPI QR code modal
└── app/
    ├── layout.tsx                # Obsidian slate theme root layout
    ├── page.tsx                  # Single-screen 3-column responsive workspace
    └── api/
        └── vision-parse/route.ts # Optional stateless ephemeral AI vision endpoint
```

---

## 🎨 Design System

Inspired by Wise, Linear, and Stripe:
- **Background**: `#0B0F17` (Deep Obsidian Slate)
- **Panels**: `#111827` with `1px solid #1F2937` borders
- **Verified/Privacy Accent**: `#10B981` (Emerald Ledger Green)
- **Action Accent**: `#3B82F6` (Fintech Blue)
- **Unsettled Accent**: `#F59E0B` (Warm Amber)

---

## 🔒 Privacy Guarantee

ReceiptSplit does **not** make external network calls to persist your finances. All transactions, contacts, and graphs are stored exclusively in your browser's IndexedDB. You can inspect or export your complete data as a JSON file at any time directly from the header.
