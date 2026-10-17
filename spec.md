---
doc: spec
status: approved
---

# ReceiptSplit — Technical Spec

A technical blueprint for building ReceiptSplit: an AI-powered receipt and bill itemization agent with multimodal OCR, proportional tax/tip allocation, interactive line-item assignment, and instant UPI/Venmo settlement QR code generation.

---

## How This Works, In Plain Language
ReceiptSplit transforms an image or PDF of a restaurant bill into a fair, dispute-free group settlement in four automated steps:

1. **Optical Intake**: The user uploads an image or clicks a sample receipt. A Next.js API route passes the image to a multimodal AI model (with an instant deterministic OCR simulator fallback), returning structured JSON line items, subtotal, taxes, and tips.
2. **Interactive Assignment**: Diners are created in client state (Zustand). For each line item, the user taps diner chips to assign 100% ownership or split the item across multiple people (e.g., appetizers, bottles of wine).
3. **Proportional Math Engine**: Instead of flat-splitting tax and tips (which forces light eaters to overpay), ReceiptSplit calculates tax and tips strictly in proportion to each person's individual subtotal. All calculations run in integer cents to eliminate floating-point penny errors.
4. **Settlement Handoff**: The app generates dynamic UPI (`upi://pay`) and Venmo (`venmo://paycharge`) QR codes with pre-filled amounts so diners can scan and pay their exact share on the spot, plus copy an itemized summary to WhatsApp.

---

## The Core Journey Through the System
*PRD ref: [prd.md > The Core Journey](file:///c:/Users/ash76/OneDrive/Desktop/AmazonHackathon-2/prd.md#the-core-journey)*

```
[Receipt Image / PDF / Sample Preset]
                 │
                 ▼
     [POST /api/parse-receipt]
   (Gemini Vision + Deterministic Fallback)
                 │
                 ▼
       [ReceiptSplitStore]
      (State: ALLOCATING)
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
[Line-Item Grid]    [Participant Manager]
 (Assign Diners)      (Color Badges)
     │                       │
     └───────────┬───────────┘
                 │
                 ▼
    [Proportional Math Engine]
 (Base + Proportional Tax + Tip)
                 │
                 ▼
        [Settlement Cockpit]
  ┌──────────────┴──────────────┐
  ▼                             ▼
[Dynamic UPI/Venmo QR]   [WhatsApp Summary Export]
```

---

## Stack
- **Framework**: [Next.js 14 App Router](https://nextjs.org/) with React 18 & TypeScript (strict: true).
  - *Rationale*: Zero-config local development, built-in Route Handlers for OCR processing, and static export options.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with modern Fintech Slate palette and custom glassmorphism.
- **Icons**: [lucide-react](https://lucide.dev/) for clean modern financial icons.
- **QR Code Engine**: `qrcode` (SVG / Data URL generator).
  - *Rationale*: Zero external API network requests, works 100% offline in browser.
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/) with `persist` middleware for real-time local storage persistence.
- **AI & Computer Vision**: Google Generative AI SDK (`@google/generative-ai` Gemini 1.5 Flash Vision) with an embedded deterministic lexical parser fallback.
- **Celebration Feedback**: `canvas-confetti` on settlement completion.

---

## Where It Runs and How Someone Tries It
- **Runtime**: Local development process.
- **Start Command**:
  ```bash
  npm run dev
  ```
- **URL**: `http://localhost:3000`
- **Environment**: Optional `GEMINI_API_KEY` in `.env.local`. If not present, the built-in deterministic receipt engine seamlessly powers the entire experience with 3 rich sample bills and photo fallback.
- **1-Minute Demo Walkthrough**:
  1. Open `http://localhost:3000`.
  2. Click the sample bill *"Friday Sushi Feast"* ($142.50).
  3. Watch the scanning animation extract all 8 line items, tax, and tip.
  4. Add diners: "Alex", "Maya", "Sam".
  5. Assign Spicy Tuna to Alex, Dragon Roll to Maya, and tap both Alex & Sam on the Gyoza appetizer (splitting it 50/50).
  6. Adjust Tip to 18% with one click.
  7. View Maya's settlement card: see her exact proportional tax ($3.82) and tip ($6.94) calculated without flat-split penalties.
  8. Click "Pay Maya's Share" $\rightarrow$ scans the live UPI / Venmo QR code.
  9. Click "Copy WhatsApp Summary" $\rightarrow$ generates a clean group chat message.

---

## Look and Feel
*PRD ref: [prd.md > Look and Feel](file:///c:/Users/ash76/OneDrive/Desktop/AmazonHackathon-2/prd.md#look-and-feel)*

- **Color Tokens**:
  - Background Base: `#0B0F19` (Deep Charcoal Navy)
  - Card Surface: `#111827` (Fintech Slate) with `1px solid #1F2937` borders
  - Recessed Well: `#080C14`
  - Primary Accent: `#10B981` (Emerald Settlement Green)
  - Secondary Accent: `#6366F1` (Indigo Scanner Beam)
  - Text Primary: `#F9FAFB` (Crisp Off-White)
  - Text Muted: `#9CA3AF` (Slate 400)
- **Participant Hue Cycle**:
  - Participant 1: Emerald (`#10B981`)
  - Participant 2: Amber (`#F59E0B`)
  - Participant 3: Violet (`#8B5CF6`)
  - Participant 4: Rose (`#F43F5E`)
  - Participant 5: Cyan (`#06B6D4`)
  - Participant 6: Orange (`#F97316`)

---

## Mathematical Specification: Proportional Tax & Tip
To prevent unfair burdening, all calculations use integer cents with proportional weights:

$$\text{Diner Weight } w_i = \frac{\text{Diner Base Cents}}{\text{Total Base Cents}}$$
$$\text{Diner Tax Cents } t_i = \text{round}(w_i \times \text{Receipt Tax Cents})$$
$$\text{Diner Tip Cents } g_i = \text{round}(w_i \times \text{Receipt Tip Cents})$$
$$\text{Diner Total Cents } T_i = \text{Diner Base Cents} + t_i + g_i$$

**Penny-Rounding Reconciliation**:
Any leftover penny difference from rounding:
$$\Delta = \text{Receipt Grand Total} - \sum T_i$$
is automatically credited or debited to the participant with the largest subtotal, ensuring $\sum T_i \equiv \text{Grand Total}$ to the exact cent.

---

## Components

### `HeaderFintech.tsx`
- Minimal top bar: Logo, currency toggle ($ / ₹ / € / £), sample preset quick-loader, and session reset.

### `ReceiptDropzone.tsx`
- Multi-format file uploader (drag & drop images/PDFs) + 3 rich sample receipt preset cards with one-click preview.

### `ReceiptScanBeam.tsx`
- Visual scanning laser animation shown during optical OCR processing.

### `ItemizedBillTable.tsx`
- Structured line-item grid: Item name, quantity, price, and clickable participant assignment chips. Supports adding manual items.

### `ParticipantManager.tsx`
- Participant roster toolbar: Add diner with name, color badge generator, and "Split All" communal shortcut.

### `ProportionalMathLedger.tsx`
- Real-time accounting drawer: subtotal, tax amount, interactive tip selector (10%, 15%, 18%, 20%, Custom), and Penny Reconciliation badge.

### `SettlementCardsGrid.tsx`
- Grid of individual diner breakdown cards showing itemized list, proportional tax/tip, and "Settle Up" action.

### `PaymentQRModal.tsx`
- Dynamic modal rendering live scannable UPI (`upi://pay`) and Venmo (`venmo://paycharge`) QR codes with pre-filled amounts.

### `WhatsAppExportModal.tsx`
- Clean formatted text preview with "Copy to Clipboard" for sharing in group chats.

---

## Data Model (`src/types/receipt.ts`)

```typescript
export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // in dollars / main currency
  assignedParticipantIds: string[]; // empty means unassigned
}

export interface Participant {
  id: string;
  name: string;
  colorHex: string;
}

export interface ReceiptData {
  merchantName: string;
  date: string;
  currency: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
}

export interface DinerShare {
  participantId: string;
  baseAmount: number;
  proportionalTax: number;
  proportionalTip: number;
  totalAmount: number;
  itemsSummary: { name: string; sharePrice: number }[];
}

export interface PaymentHandles {
  upiId: string;
  venmoHandle: string;
  receiverName: string;
}
```

---

## File Structure

```
AmazonHackathon-2/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # App root layout with theme & metadata
│   │   ├── page.tsx                  # Master View Controller (intake -> split -> settle)
│   │   ├── globals.css               # Tailwind directives & fintech styling
│   │   └── api/
│   │       └── parse-receipt/
│   │           └── route.ts          # Multimodal Gemini Vision + fallback parser
│   ├── components/
│   │   ├── HeaderFintech.tsx         # Brand, currency selector, quick presets
│   │   ├── ReceiptDropzone.tsx       # File dropzone & 3 sample receipt cards
│   │   ├── ItemizedBillTable.tsx     # Editable line items & diner allocation chips
│   │   ├── ParticipantManager.tsx    # Diner chips & "everyone" shortcut
│   │   ├── ProportionalLedger.tsx    # Subtotal, tax, interactive tip adjuster
│   │   ├── SettlementCardsGrid.tsx   # Per-diner itemized breakdown cards
│   │   ├── PaymentQRModal.tsx        # Dynamic UPI / Venmo QR code modal
│   │   └── WhatsAppExportModal.tsx   # Copyable formatted group chat summary
│   ├── lib/
│   │   ├── mathEngine.ts             # Proportional tax/tip & penny rounding engine
│   │   ├── sampleReceipts.ts         # 3 rich realistic presets (Sushi, Costco, Brunch)
│   │   ├── qrGenerator.ts            # Client-side UPI & Venmo QR code generator
│   │   ├── ocrFallback.ts            # Heuristic receipt OCR parser (0ms fallback)
│   │   └── geminiVision.ts           # Multimodal Gemini 1.5 Flash Vision client
│   ├── store/
│   │   └── useReceiptStore.ts        # Zustand store with persistence & undo
│   └── types/
│       └── receipt.ts                # TypeScript interfaces & validation schemas
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Important Failure Modes
1. **Blurry / Unreadable Receipt Photo**:
   - *Failure*: OCR fails to extract some line items cleanly.
   - *Fallback*: ReceiptSplit displays the extracted items with an obvious "Add Custom Item" and inline price-editing button so users can correct any unreadable item in 5 seconds.
2. **Missing Gemini API Key or Rate Limit**:
   - *Failure*: No `GEMINI_API_KEY` configured.
   - *Fallback*: The route handler instantly delegates to `ocrFallback.ts`, parsing common receipt patterns or matching sample presets with zero latency and zero error alerts.
3. **Penny Rounding Imbalance**:
   - *Failure*: Sum of diners' rounded cents is off by $\pm 1$ or $2$ cents from grand total.
   - *Fallback*: `mathEngine.ts` uses penny-rounding reconciliation, automatically balancing the difference onto the highest subtotal diner.

---

## What Was Simplified and Why
- **Native UPI & Venmo Deep Links instead of Payment Gateway APIs**: Generates instant standard payment QR codes without requiring merchant onboarding, transaction fees, or API tokens.
- **Client-Side QR rendering (`qrcode`) instead of external QR APIs**: Guarantees zero latency and privacy (no financial data leaves the user's browser).
