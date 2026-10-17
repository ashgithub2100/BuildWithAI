import { ExpenseRecord, Member, MemberSplitBreakdown } from "@/types/ledger.schema";
import { toRupees } from "./moneyMath";

export interface UpiUriParams {
  payeeUpiId: string;
  payeeName: string;
  amountPaise: number;
  note?: string;
  currency?: string;
}

/**
 * Builds standard NPCI-compliant `upi://pay` deep link URI.
 */
export function buildUpiUri({
  payeeUpiId,
  payeeName,
  amountPaise,
  note = "ReceiptSplit settlement",
  currency = "INR",
}: UpiUriParams): string {
  const amountRupees = (amountPaise / 100).toFixed(2);
  const cleanUpi = payeeUpiId.trim();
  const cleanName = payeeName.trim();
  const cleanNote = note.trim();

  return `upi://pay?pa=${encodeURIComponent(cleanUpi)}&pn=${encodeURIComponent(
    cleanName
  )}&am=${encodeURIComponent(amountRupees)}&cu=${encodeURIComponent(
    currency
  )}&tn=${encodeURIComponent(cleanNote)}`;
}

/**
 * Builds clean formatted WhatsApp / clipboard text breakdown.
 */
export function formatWhatsAppSettlementText(
  expense: ExpenseRecord,
  breakdowns: Record<string, MemberSplitBreakdown>,
  payerMember: Member
): string {
  const lines: string[] = [
    `🧾 *ReceiptSplit: ${expense.merchantName}*`,
    `Total: ${toRupees(expense.totalPaise)} (incl. ${toRupees(expense.taxPaise)} tax)`,
    `Paid by: *${payerMember.name}*`,
    `----------------------------------------`,
  ];

  Object.values(breakdowns).forEach((b) => {
    const isPayer = b.memberId === payerMember.id;
    const tag = isPayer ? " (Payer)" : "";
    const itemsSummary = b.items.map((i) => i.title).join(", ");
    lines.push(`👤 *${b.memberName}${tag}*: ${toRupees(b.totalPaise)}`);
    if (itemsSummary) {
      lines.push(`   └ ${itemsSummary}`);
    }
  });

  lines.push(`----------------------------------------`);
  if (payerMember.upiId) {
    lines.push(`💸 *Pay via UPI*: \`${payerMember.upiId}\``);
  }
  lines.push(`_Split computed on-device with zero penny error via ReceiptSplit_`);

  return lines.join("\n");
}
