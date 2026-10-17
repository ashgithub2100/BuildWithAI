import { ExpenseRecord, Member } from "@/types/ledger.schema";
import { allocateSplitDeterministically, toRupees } from "./moneyMath";
import { simplifyDebts } from "./debtGraph";

/**
 * Generates an Excel / Google Sheets compatible CSV export.
 * Formatted with clear headers, rupee amounts, and an attached settlement table.
 */
export function generateCsvExport(
  expenses: ExpenseRecord[],
  members: Member[]
): string {
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  const rows: string[][] = [];

  // Header 1: Bill Itemization Table
  rows.push(["RECEIPTSPLIT — LOCAL EXPENSE LEDGER"]);
  rows.push([`Exported on: ${new Date().toLocaleString("en-IN")}`]);
  rows.push([""]);
  rows.push([
    "Date",
    "Merchant / Bill Title",
    "Source",
    "Paid By",
    "Subtotal (₹)",
    "Tax / GST (₹)",
    "Tip / Service (₹)",
    "Total (₹)",
    "Status",
    "Itemized Shares Breakdown",
  ]);

  expenses.forEach((e) => {
    const dateStr = new Date(e.createdAt).toLocaleDateString("en-IN");
    const payerName = memberMap.get(e.paidByMemberId) || "Unknown";
    const subtotal = (e.subtotalPaise / 100).toFixed(2);
    const tax = (e.taxPaise / 100).toFixed(2);
    const tip = (e.tipPaise / 100).toFixed(2);
    const total = (e.totalPaise / 100).toFixed(2);
    const status = e.settled ? "Settled" : "Unsettled";

    // Compute member breakdowns for this expense
    const splits = allocateSplitDeterministically(e, members);
    const shareDetails = Object.values(splits)
      .map((s) => `${s.memberName}: ₹${(s.totalPaise / 100).toFixed(2)}`)
      .join(" | ");

    rows.push([
      `"${dateStr}"`,
      `"${e.merchantName.replace(/"/g, '""')}"`,
      `"${e.sourceType}"`,
      `"${payerName.replace(/"/g, '""')}"`,
      subtotal,
      tax,
      tip,
      total,
      `"${status}"`,
      `"${shareDetails.replace(/"/g, '""')}"`,
    ]);
  });

  // Header 2: Simplified Settlement Summary
  rows.push([""]);
  rows.push(["---"]);
  rows.push(["MIN-CASH-FLOW SIMPLIFIED SETTLEMENTS (WHO OWES WHOM)"]);
  rows.push(["From (Debtor)", "To (Creditor)", "Amount Due (₹)", "Payee UPI ID"]);

  const { simplifiedDebts } = simplifyDebts(expenses, members);
  if (simplifiedDebts.length === 0) {
    rows.push(["All balances settled", "None", "0.00", "-"]);
  } else {
    simplifiedDebts.forEach((debt) => {
      rows.push([
        `"${debt.fromMemberName.replace(/"/g, '""')}"`,
        `"${debt.toMemberName.replace(/"/g, '""')}"`,
        (debt.amountPaise / 100).toFixed(2),
        `"${(debt.toMemberUpi || "N/A").replace(/"/g, '""')}"`,
      ]);
    });
  }

  return rows.map((r) => r.join(",")).join("\r\n");
}

/**
 * Generates an easy-to-read, printable Plain Text / Statement (.txt).
 * Ideal for copying into WhatsApp groups, emails, or opening in Notepad.
 */
export function generateTextStatement(
  expenses: ExpenseRecord[],
  members: Member[]
): string {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const lines: string[] = [];

  const totalSpent = expenses.reduce((acc, e) => acc + e.totalPaise, 0);
  const unsettledTotal = expenses
    .filter((e) => !e.settled)
    .reduce((acc, e) => acc + e.totalPaise, 0);

  lines.push("================================================================");
  lines.push("               RECEIPTSPLIT — GROUP EXPENSE STATEMENT            ");
  lines.push("================================================================");
  lines.push(`Generated: ${new Date().toLocaleString("en-IN")}`);
  lines.push(`Total Group Spend:      ${toRupees(totalSpent)} (${expenses.length} bills)`);
  lines.push(`Unsettled Group Total:  ${toRupees(unsettledTotal)}`);
  lines.push("----------------------------------------------------------------");
  lines.push("");

  lines.push("1. WHO OWES WHOM (COLLAPSED DIRECT SETTLEMENTS):");
  lines.push("----------------------------------------------------------------");
  const { simplifiedDebts } = simplifyDebts(expenses, members);
  if (simplifiedDebts.length === 0) {
    lines.push("  ✓ All group bills are fully settled! No pending transfers.");
  } else {
    simplifiedDebts.forEach((d, idx) => {
      const upiNote = d.toMemberUpi ? ` (UPI: ${d.toMemberUpi})` : "";
      lines.push(
        `  [${idx + 1}] ${d.fromMemberName} owes ${d.toMemberName}: ${toRupees(
          d.amountPaise
        )}${upiNote}`
      );
    });
  }
  lines.push("");

  lines.push("2. ITEM-BY-ITEM EXPENSE RECORD:");
  lines.push("----------------------------------------------------------------");
  expenses.forEach((e, idx) => {
    const dateStr = new Date(e.createdAt).toLocaleDateString("en-IN");
    const payer = memberMap.get(e.paidByMemberId)?.name || "Unknown";
    const status = e.settled ? "[SETTLED]" : "[UNSETTLED]";

    lines.push(`\n#${idx + 1}. ${e.merchantName} — ${toRupees(e.totalPaise)} ${status}`);
    lines.push(`    Date: ${dateStr} | Paid By: ${payer} | Source: ${e.sourceType}`);
    lines.push(
      `    Subtotal: ${toRupees(e.subtotalPaise)} | Tax: ${toRupees(
        e.taxPaise
      )} | Tip: ${toRupees(e.tipPaise)}`
    );

    const splits = allocateSplitDeterministically(e, members);
    lines.push("    Member Allocations (Hare-Niemeyer Verified):");
    Object.values(splits).forEach((s) => {
      if (s.totalPaise > 0) {
        lines.push(`      • ${s.memberName.padEnd(16)}: ${toRupees(s.totalPaise)}`);
      }
    });
  });

  lines.push("\n================================================================");
  lines.push("Calculated on-device with zero penny loss via ReceiptSplit.");
  lines.push("Zero Cloud Leakage • 100% Private Local Storage");
  lines.push("================================================================");

  return lines.join("\n");
}

/**
 * Universal browser file download helper.
 */
export function downloadExportFile(
  content: string,
  filename: string,
  mimeType: string
) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
