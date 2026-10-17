---
doc: scope
status: approved
---

# ReceiptSplit

An AI-powered receipt and bill itemization agent that turns messy receipts into instant, proportional, dispute-free group settlements with automated UPI and Venmo QR codes.

## The Unique Kernel
Group bill splitting is notoriously awkward, tedious, and inaccurate. Even splits penalize those who ordered less, while manual itemization requires painful arithmetic to distribute tax, service charges, discounts, and tips fairly. ReceiptSplit eliminates all friction with **Zero-Friction Optical Itemization + Proportional Split Engine**: upload any crumpled restaurant bill or utility statement, AI extracts every line item with quantities and tax rates in seconds, diners tap items to claim or split them N-ways, and the engine mathematically distributes tax and tips proportionally—instantly generating scannable UPI and Venmo payment QR codes pre-filled with the exact amount.

## Who It's For
Friends dining out, roommates managing shared grocery/utility receipts, and trip organizers who are tired of being the group "accountant" and chasing people for vague estimates.

## The Core Loop
1. **Capture**: The user uploads a photo, takes a picture, or drops a receipt PDF (with instant one-click sample bills for fast testing).
2. **Deconstruct**: Multimodal OCR extracts items, quantities, prices, subtotal, tax, and gratuity.
3. **Assign**: The user adds names (e.g. Alex, Maya, Sam) and taps items to allocate them (single-owner or co-shared across any subset of people).
4. **Settle**: The engine calculates each person's exact share (Base + Proportional Tax + Proportional Tip) and generates scannable UPI/Venmo QR codes plus a copyable WhatsApp breakdown.

## Inspiration & Identity
- **Aesthetic**: Modern high-trust fintech. Clean slate dark mode with emerald green settlement accents, crisp tabular typography, and smooth micro-interactions.
- **Tone**: Effortless, transparent, mathematically pristine, and dispute-free.
- **References**: Stripe Checkout clarity meets Apple Wallet minimalism and Wise cross-border simplicity.

## Why This Matters to the Learner
Group dining math is a universal daily friction. Building ReceiptSplit creates an immediately useful, high-impact tool combining multimodal computer vision, clean algorithmic distribution, and frictionless fintech QR integration.

## What "Working" Looks Like
In a 60-second live screen demo:
1. User drops a photo of a restaurant receipt with 5 items, 8.5% sales tax, and an 18% tip.
2. AI parses the bill in under 2 seconds, displaying an editable line-item table.
3. User adds "Alex", "Maya", and "Sam".
4. Alex claimed the burger; Maya claimed the salad; all three shared the nachos appetizer.
5. ReceiptSplit computes the exact proportional tax and tip for each person down to the cent.
6. Maya scans her personalized QR code on screen and pays her exact $18.42 via Venmo or UPI instantly.

## The POC Boundary
- **In Scope (POC)**:
  - Image (JPG, PNG, WebP) and PDF upload + drag-and-drop.
  - Pre-loaded one-click sample receipts ("Friday Night Dinner", "Roommate Grocery Run", "Brunch & Drinks").
  - Multimodal AI extraction (Google Gemini 1.5 Flash Vision + robust deterministic fallback parser).
  - Interactive participant manager (add/remove participants, color-coded avatars).
  - Line-item assignment matrix: assign item to 1 person, split evenly among subset, or split custom.
  - Proportional tax, tip, and discount math engine:
    $$\text{Person Total} = \text{Person Base} \times \left(1 + \frac{\text{Tax} + \text{Tip} - \text{Discount}}{\text{Subtotal}}\right)$$
  - Real-time settlement breakdown cards per participant.
  - Dynamic QR code generation for UPI (`upi://pay?pa=...&am=...`) and Venmo (`venmo://paycharge?...`).
  - One-click formatted WhatsApp / clipboard breakdown message generator.
  - LocalStorage persistence for ongoing splits.

## Later
- Real-time peer-to-peer room sync (QR code for diners to join on their own phones and tap items).
- Direct Splitwise API sync.
- Automatic currency conversion for international group travel.

## Explicitly Cut
- Bank account / card processing integration (adds regulatory friction; QR deep-links handle payment natively).
- User authentication and cloud accounts (unnecessary barrier to an instant utility).
- Long-term multi-month expense ledgers.
