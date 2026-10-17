---
doc: spec
status: approved
---

# ReceiptSplit: Local-First Private Expense & Chat Agent — Technical Spec

A principal-grade technical blueprint for ReceiptSplit: a 100% on-device, privacy-preserving expense parser, proportional splitter, and local graph debt simplifier. It auto-ingests WhatsApp group chats, bank UPI SMS alerts, and crumpled receipt photos without cloud tracking, calculates exact splits using the Largest Remainder integer math algorithm (zero penny bugs), simplifies debts locally via a Min-Cash-Flow graph solver in IndexedDB, and generates authentic NPCI UPI payment QR codes.

---

## How This Works, In Plain Language
Traditional expense splitting apps force users into public social networks, send sensitive financial data to cloud databases, suffer from floating-point rounding errors (e.g. ₹0.01 missing), and require manual re-typing. ReceiptSplit replaces this with a zero-friction, on-device intelligence architecture:

1. **3-Channel Auto-Ingestion**:
   - **Focus-Triggered Clipboard Watcher**: When a user copies an expense text in WhatsApp/SMS and switches tabs to ReceiptSplit, `window.onfocus` automatically captures the text, detects expense patterns, and loads it into the workbench.
   - **Live Feed Simulator**: A built-in feed of realistic WhatsApp group chats (including natural Hinglish like *"Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"*) and Bank UPI SMS messages streams live into the app.
   - **Offline Optical Dropzone**: Canvas binarization + Tesseract WASM parses photo receipts locally in the browser with 0ms network latency.
2. **Integer Math & Zero Penny Loss (Hare-Niemeyer Algorithm)**:
   - All calculations run in integer minor units (`paise`: ₹1.00 = 100 paise).
   - Division remainders are distributed 1 paisa at a time based on the largest fractional remainders, mathematically guaranteeing that the sum of member shares equals the receipt total down to the exact paisa.
3. **Local Memory Graph & Debt Simplification (Dexie.js IndexedDB)**:
   - 100% of transaction history and member memory resides on-device in IndexedDB.
   - A Min-Cash-Flow Directed Acyclic Graph (DAG) algorithm collapses multi-person debt loops (e.g. collapsing 7 group meals into 2 direct UPI transfers).
4. **NPCI UPI Settlement**:
   - Generates authentic `upi://pay` dynamic QR codes pre-filled with the exact payee handle and amount, plus formatted WhatsApp breakdown text.

---

## The Core Journey Through the System

```
[Clipboard / WhatsApp Chat / UPI SMS / Receipt Photo]
                          │
                          ▼
             [chatExtractor & receiptOcr]
            (0ms Local Deterministic NLP)
                          │
                          ▼
             [SplitWorkbench (Active Split)]
     ┌────────────────────┴────────────────────┐
     ▼                                         ▼
[Itemized Rows + Member Chips]     [Proportional Tax & Tip Lock]
     │                                         │
     └────────────────────┬────────────────────┘
                          │
                          ▼
     [moneyMath: allocateSplitDeterministically]
         (Hare-Niemeyer Integer Paise Engine)
                          │
                          ▼
            [Dexie.js IndexedDB Storage]
           (100% On-Device Local Memory)
                          │
                          ▼
          [debtGraph: Min-Cash-Flow Solver]
    (Collapses N debt chains into direct transfers)
                          │
                          ▼
          [UpiSettlementModal & WhatsApp Card]
           (NPCI upi://pay QR + 1-Tap Copy)
```

---

## Stack & Core Dependencies
- **Runtime & Framework**: [Next.js 14 App Router](https://nextjs.org/) (React 18, TypeScript strict mode).
- **On-Device Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper) for zero-cloud local persistence.
- **Client-Side OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/) + HTML5 Canvas image binarizer.
- **QR Code Engine**: `qrcode.react` (authentic NPCI `upi://pay` vector QR generator).
- **Validation**: [Zod](https://zod.dev/) for compile-time and runtime domain contracts.
- **Styling & Motion**: Tailwind CSS + Framer Motion (spring layout animations) + Lucide React.
- **Currency Arithmetic**: Custom `moneyMath.ts` implementing the Hare-Niemeyer Largest Remainder method in integer paise.

---

## Where It Runs and How Someone Tries It
- **Runtime**: Local Next.js dev server.
- **Start Command**:
  ```bash
  npm run dev
  ```
- **Demo URL**: `http://localhost:3000`
- **1-Minute Judge Demonstration**:
  1. Open `http://localhost:3000`.
  2. Notice the top telemetry bar: `🔒 100% On-Device IndexedDB | 0 External DB Writes`.
  3. In the left panel, click *"Auto-Simulate Live Stream"* or click any incoming sample:
     - *"Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"*
  4. Watch the center **Split Workbench** auto-populate in 3ms:
     - Rahul assigned ₹400
     - Priya assigned ₹300
     - Remaining ₹540 evenly distributed across all members.
  5. Toggle the member avatar chips on any row to reassign shares; watch the live math update with zero penny discrepancies.
  6. Click *"Save to Local Memory"*.
  7. In the right panel, observe the **Memory Graph Vault**:
     - The Min-Cash-Flow solver automatically collapses the group debt into the minimum direct transfers.
     - Click *"Pay via UPI QR"* to reveal the NPCI-compliant QR code pre-filled with the exact paise amount.

---

## Domain Model & Zod Schemas (`src/types/ledger.schema.ts`)

```typescript
export interface Member {
  id: string;
  name: string;
  upiId?: string;
  avatarColor: string;
}

export interface LineItem {
  id: string;
  title: string;
  amountPaise: number; // integer (₹1.00 = 100)
  assignedMemberIds: string[]; // empty = shared by all
}

export interface ExpenseRecord {
  id: string;
  sourceType: "WHATSAPP_CHAT" | "BANK_SMS" | "RECEIPT_OCR" | "MANUAL";
  rawSourceText: string;
  merchantName: string;
  createdAt: number;
  paidByMemberId: string;
  subtotalPaise: number;
  taxPaise: number;
  tipPaise: number;
  totalPaise: number;
  items: LineItem[];
  settled: boolean;
}

export interface SimplifiedDebt {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  toMemberUpi?: string;
  amountPaise: number;
}
```

---

## Integer Math Specification (`src/lib/moneyMath.ts`)

1. **Paise Conversion**:
   - All user inputs are converted to integer paise immediately: `Math.round(val * 100)`.
2. **Item Division (Largest Remainder)**:
   - For an item of $A$ paise assigned to $K$ members:
     $$\text{Base Share } b = \lfloor A / K \rfloor$$
     $$\text{Remainder } r = A \pmod K$$
   - The first $r$ members receive $b + 1$ paise; the remaining $K - r$ members receive $b$ paise.
   - Sum of shares $\equiv A$ paise exactly.
3. **Proportional Tax/Tip Allocation**:
   - For each member with subtotal share $s_i$ out of total subtotal $S$:
     $$\text{Raw Tax } = \frac{s_i \times T}{S}$$
   - Base integer tax is $\lfloor \text{Raw Tax} \rfloor$, with remaining tax paise distributed to members with the highest decimal remainders.
   - Sum of distributed tax $\equiv T$ paise exactly.

---

## Directory Structure

```
AmazonHackathon-2/
├── src/
│   ├── types/
│   │   └── ledger.schema.ts       # Zod schemas & TypeScript interfaces
│   ├── lib/
│   │   ├── db.ts                  # Dexie.js IndexedDB client & wipe utility
│   │   ├── moneyMath.ts           # Hare-Niemeyer integer paise allocator
│   │   ├── chatExtractor.ts       # Hinglish WhatsApp & Bank SMS parser
│   │   ├── receiptOcr.ts          # Canvas pre-processor & local OCR engine
│   │   ├── debtGraph.ts           # Min-Cash-Flow graph debt simplifier
│   │   └── upiGenerator.ts        # NPCI `upi://pay` URI builder
│   ├── hooks/
│   │   ├── useClipboardInterceptor.ts  # Focus-triggered clipboard auto-reader
│   │   └── useLocalMemoryStats.ts     # Live IndexedDB storage telemetry
│   ├── components/
│   │   ├── PrivacyShieldHeader.tsx    # Telemetry bar & local wipe trigger
│   │   ├── AutoIngestStream.tsx       # Incoming chat stream & dropzone
│   │   ├── SplitWorkbench.tsx         # Line-item table & member assignment
│   │   ├── MemoryGraphVault.tsx       # Debt graph cards & storage inspector
│   │   └── UpiSettlementModal.tsx     # NPCI UPI QR code modal & WhatsApp export
│   └── app/
│       ├── layout.tsx             # Fonts & dark obsidian slate theme
│       ├── page.tsx               # Unified single-screen workspace
│       ├── globals.css            # Custom typography & styles
│       └── api/
│           └── vision-parse/
│               └── route.ts       # Ephemeral PII-stripped vision parser
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   ├── spec.md
│   └── checklist.md
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## Failure Modes & Mitigations
1. **Clipboard API Blocked**:
   - If `navigator.clipboard.readText()` fails due to browser permissions, the app falls back transparently to global `Ctrl+V` paste and the one-click simulated feed without throwing any console errors.
2. **Blurry Receipt Photo**:
   - If Tesseract WASM cannot parse crumpled lines, the Canvas image pre-processor applies contrast binarization; if text is still ambiguous, the UI creates an editable line row with an obvious `"Add Line Item"` button.
3. **SSR Hydration Mismatch**:
   - All Dexie.js database hooks and browser APIs are strictly guarded by `typeof window !== "undefined"` and a client-mount check.
