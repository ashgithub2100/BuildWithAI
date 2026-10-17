---
doc: prd
status: approved
---

# ReceiptSplit — Product Requirements

An AI-powered receipt and bill itemization web application that transforms chaotic bill photos and PDFs into transparent, proportional group settlements with scannable UPI and Venmo payment QR codes.

*Source: [scope.md](file:///c:/Users/ash76/OneDrive/Desktop/AmazonHackathon-2/scope.md)*

---

## The Core Journey
1. **Intake & Optical Scanning**:
   - The user lands on a clean, modern dropzone: *"Drop your receipt image or PDF, or pick a sample bill"*.
   - User drops an image or clicks one of three realistic sample presets:
     - 🍣 *Friday Sushi Feast* ($142.50 — 8 items, 8.875% tax, 18% tip)
     - 🛒 *Roommate Costco Haul* ($218.40 — 12 grocery/household items, mixed tax)
     - 🥞 *Sunday Brunch & Mimosas* ($84.20 — 5 items, discount coupon applied, tip)
2. **AI Line-Item Extraction**:
   - The multimodal engine parses the receipt in under 2 seconds, displaying an editable structured table:
     - Merchant Name, Date, Detected Currency ($ / ₹ / € / £)
     - Extracted Line Items: Item Name, Quantity, Unit Price, Total
     - Financial Totals: Subtotal, Tax, Tip/Gratuity, Discounts, Grand Total
3. **Participant Setup & Interactive Allocation**:
   - The user adds participant chips (e.g., "Alex", "Maya", "Sam", "Priya") with unique color badges.
   - For each line item, the user taps the participant chips:
     - **Single Owner**: Tap "Alex" $\rightarrow$ 100% assigned to Alex.
     - **Shared Subset**: Tap "Alex" and "Maya" $\rightarrow$ 50/50 split.
     - **Split All**: One-click button to divide communal items (e.g., bread, nachos, pitchers) across all diners.
4. **Proportional Mathematical Engine**:
   - Calculates the exact burden for each participant using fair proportional weighting:
     $$\text{Diner Tax} = \text{Receipt Tax} \times \left(\frac{\text{Diner Base Subtotal}}{\text{Receipt Subtotal}}\right)$$
     $$\text{Diner Tip} = \text{Receipt Tip} \times \left(\frac{\text{Diner Base Subtotal}}{\text{Receipt Subtotal}}\right)$$
     $$\text{Diner Total} = \text{Diner Base Subtotal} + \text{Diner Tax} + \text{Diner Tip}$$
   - Includes an interactive Tip Adjuster (No Tip, 10%, 15%, 18%, 20%, or custom dollar amount).
5. **Settlement & QR Generation**:
   - Displays real-time settlement cards per diner.
   - User inputs the bill-payer's payment details:
     - **UPI ID** (e.g., `payer@okhdfcbank`) $\rightarrow$ generates instant `upi://pay` dynamic QR code.
     - **Venmo Handle** (e.g., `PayerName`) $\rightarrow$ generates instant `venmo://paycharge` QR code.
   - Tapping any diner's card reveals their individual scannable QR code pre-filled with their exact amount.
   - One-click **"Copy WhatsApp Summary"** generates a friendly, formatted message ready to paste into group chats.

---

## Screens and Layout
1. **Intake Surface (Upload & Presets)**:
   - Minimalist drag-and-drop receipt zone supporting images and PDFs.
   - Camera snap trigger for mobile browsers.
   - One-click sample bill tiles with preview thumbnails.
2. **Itemization & Allocation Workspace**:
   - Responsive two-column cockpit:
     - **Left Column**: Itemized Bill Table (Item, Qty, Price, interactive participant selection chips, and "Add Custom Item" button for missed receipts).
     - **Right Column**: Participant Ledger & Financial Summary (Subtotal, Tax, Tip adjustments, and live individual balances).
3. **Settlement Modal & QR Scanner View**:
   - Tabbed QR code modal (UPI / Venmo / Cash).
   - Dynamic SVG QR code generated with exact payment deep link.
   - Full breakdown breakdown (Base + Tax + Tip).
   - "Copy Breakdown to Clipboard" formatted for WhatsApp / iMessage.

---

## Look and Feel
- **Color Palette (Modern Fintech Slate)**:
  - Background Base: `#0B0F19` (Deep Charcoal Navy)
  - Card Surfaces: `#111827` (Rich Slate) with `1px solid #1F2937` borders
  - Primary Accent: `#10B981` (Vibrant Emerald / Settlement Green)
  - Secondary Accent: `#6366F1` (Indigo Pay / Scanner Beam)
  - Primary Text: `#F9FAFB` (Off-white Crisp)
  - Muted Text: `#9CA3AF` (Slate 400)
- **Participant Color Palette**:
  - Color-coded avatar chips: Emerald, Amber, Violet, Rose, Cyan, Orange.
- **Typography**: Inter for UI labels; Tabular Monospace (JetBrains Mono / Roboto Mono) for price alignments.

---

## Features and Behavior

### 1. Multimodal OCR & Receipt Parsing Engine
- Upload JPG, PNG, WebP images or PDF documents.
- Uses Google Gemini 1.5 Flash multimodal vision API with fallback to an intelligent local deterministic parser that simulates high-fidelity OCR on sample bills.
- *Acceptance Criteria*:
  - Dropping any valid receipt image extracts items, subtotal, and tax within 3 seconds.
  - Clicking any of the 3 sample presets instantly loads the parsed receipt without external API calls.

### 2. Participant Management
- Add/remove unlimited diners with customizable names.
- Automatic distinct color allocation per participant.
- Quick action: "Everyone" chip for rapid communal item splitting.
- *Acceptance Criteria*:
  - Adding a diner dynamically updates all line-item assignment selectors.
  - Deleting a diner smoothly reallocates their shared items among remaining assignees.

### 3. Proportional Tax & Tip Mathematical Distribution
- Automatically detects tax and tip from the receipt.
- Tip can be modified dynamically via percentage chips (10%, 15%, 18%, 20%) or custom dollar input.
- Distributes tax, tip, and discounts strictly in proportion to each diner's base spend.
- *Acceptance Criteria*:
  - The sum of all individual diner totals equals the receipt grand total down to the exact cent (rounding penny allocated to highest subtotal).

### 4. Dynamic Payment QR Code Generation
- Instant client-side QR generation using SVG / Canvas.
- **UPI Support**: Formats standard UPI URI `upi://pay?pa={upiId}&pn={name}&am={amount}&cu={currency}&tn=ReceiptSplit` compatible with Google Pay, PhonePe, and Paytm.
- **Venmo Support**: Formats Venmo URI `https://venmo.com/{handle}?txn=pay&amount={amount}&note=ReceiptSplit`.
- *Acceptance Criteria*:
  - Scanning the generated QR code on a mobile device immediately opens the respective payment app with the exact amount pre-populated.

### 5. Group Chat Export
- One-click copy formatted breakdown:
  ```
  🧾 ReceiptSplit: Friday Sushi Feast
  Total: $142.50 (incl. $11.60 tax + $21.73 tip)
  ------------------------------------
  👤 Alex: $48.20 (Spicy Tuna, Gyoza (1/2) + tax/tip)
  👤 Maya: $52.10 (Dragon Roll, Miso + tax/tip)
  👤 Sam: $42.20 (Sashimi Combo, Gyoza (1/2) + tax/tip)
  ------------------------------------
  💸 Pay via UPI: alex@upi or Venmo: @Alex-M
  ```

---

## States and Boundaries
- **Empty State**: Drag-and-drop card with sample receipt buttons.
- **Scanning State**: Elegant scanning laser animation over receipt preview.
- **Allocating State**: Interactive bill grid with live balance drawer.
- **Settlement State**: Scannable QR modal with deep-link payment triggers.
- **Persistence**: All parsed items and diner assignments sync to `localStorage`.

---

## Product Decisions
- **Proportional vs. Flat Tax/Tip**: Proportional distribution was chosen because flat splits unfairly burden light eaters and punish non-drinkers.
- **Client-Side QR vs. Third-Party Payment Gateway**: Generating native UPI/Venmo QR codes requires zero merchant accounts, zero transaction fees, and zero banking API keys.

---

## What We're Building (POC Scope)
1. Next.js 14 App Router application with Tailwind CSS and Lucide icons.
2. Drag-and-drop upload zone + 3 rich sample receipt presets.
3. Multimodal vision parsing API (`/api/parse-receipt`) + deterministic fallback.
4. Interactive diner assignment matrix with color-coded chips.
5. Proportional tax/tip calculation engine with penny-rounding reconciliation.
6. Dynamic UPI and Venmo payment QR code generator.
7. One-click formatted WhatsApp summary generator.
8. Local storage persistence.

---

## Deferred From the POC
- Multi-user live collaborative sessions (WebSockets).
- Automated receipt skew correction / edge cropping.
- Splitwise OAuth export.

---

## Non-Goals
- Credit card processing or acting as a custodial financial intermediary.
- Long-term personal budget tracking.
