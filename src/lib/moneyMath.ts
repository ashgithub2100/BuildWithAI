import { ExpenseRecord, Member, MemberSplitBreakdown } from "@/types/ledger.schema";

/**
 * Converts rupees float/string to integer paise.
 * ₹10.50 -> 1050 paise
 */
export function toPaise(rupees: number | string): number {
  if (typeof rupees === "string") {
    const clean = rupees.replace(/[^\d.-]/g, "");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  }
  return Math.round(rupees * 100);
}

/**
 * Formats integer paise to clean localized rupee string.
 * 1050 paise -> "₹10.50"
 */
export function toRupees(paise: number, includeSymbol: boolean = true): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = (absPaise / 100).toFixed(2);
  const formatted = Number(rupees).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = isNegative ? "-" : "";
  return includeSymbol ? `${prefix}₹${formatted}` : `${prefix}${formatted}`;
}

/**
 * Largest Remainder / Hare-Niemeyer Algorithm:
 * Distributes integer `totalUnits` proportionally according to `weights`,
 * guaranteeing that sum(allocated) === totalUnits down to the exact integer unit.
 */
export function distributeLargestRemainder(
  totalUnits: number,
  weights: { id: string; weight: number }[]
): Record<string, number> {
  const result: Record<string, number> = {};
  if (totalUnits === 0 || weights.length === 0) {
    weights.forEach((w) => (result[w.id] = 0));
    return result;
  }

  const sumWeights = weights.reduce((acc, w) => acc + w.weight, 0);
  if (sumWeights === 0) {
    // If all weights are 0, split evenly
    const base = Math.floor(totalUnits / weights.length);
    const rem = totalUnits % weights.length;
    weights.forEach((w, idx) => {
      result[w.id] = base + (idx < rem ? 1 : 0);
    });
    return result;
  }

  interface RemainderEntry {
    id: string;
    integerPart: number;
    fractionalPart: number;
  }

  const entries: RemainderEntry[] = weights.map((w) => {
    const raw = (w.weight / sumWeights) * totalUnits;
    const integerPart = Math.floor(raw);
    const fractionalPart = raw - integerPart;
    return { id: w.id, integerPart, fractionalPart };
  });

  let allocatedSum = entries.reduce((acc, e) => acc + e.integerPart, 0);
  let remainderToDistribute = totalUnits - allocatedSum;

  // Sort descending by fractional part to give +1 unit to largest remainders
  entries.sort((a, b) => b.fractionalPart - a.fractionalPart);

  for (let i = 0; i < entries.length; i++) {
    if (remainderToDistribute > 0) {
      entries[i].integerPart += 1;
      remainderToDistribute -= 1;
    }
  }

  entries.forEach((e) => {
    result[e.id] = e.integerPart;
  });

  return result;
}

/**
 * Deterministically allocates an ExpenseRecord across members using
 * Hare-Niemeyer integer arithmetic.
 * GUARANTEES: sum(member.totalPaise) === expense.totalPaise to the exact paisa.
 */
export function allocateSplitDeterministically(
  expense: ExpenseRecord,
  allMembers: Member[]
): Record<string, MemberSplitBreakdown> {
  const breakdowns: Record<string, MemberSplitBreakdown> = {};
  const activeMemberIds = allMembers.map((m) => m.id);

  allMembers.forEach((m) => {
    breakdowns[m.id] = {
      memberId: m.id,
      memberName: m.name,
      basePaise: 0,
      taxSharePaise: 0,
      tipSharePaise: 0,
      totalPaise: 0,
      items: [],
    };
  });

  // 1. Allocate Line Items
  expense.items.forEach((item) => {
    const assignedIds =
      item.assignedMemberIds.length > 0
        ? item.assignedMemberIds.filter((id) => breakdowns[id])
        : activeMemberIds;

    const targetIds = assignedIds.length > 0 ? assignedIds : activeMemberIds;
    if (targetIds.length === 0) return;

    // Largest Remainder item division
    const weights = targetIds.map((id) => ({ id, weight: 1 }));
    const itemSplit = distributeLargestRemainder(item.amountPaise, weights);

    targetIds.forEach((id) => {
      const share = itemSplit[id] || 0;
      breakdowns[id].basePaise += share;
      breakdowns[id].items.push({
        title: item.title,
        sharePaise: share,
      });
    });
  });

  // 2. Proportional Tax & Tip Allocation
  const subtotalWeights = Object.keys(breakdowns).map((id) => ({
    id,
    weight: breakdowns[id].basePaise,
  }));

  const taxDistribution = distributeLargestRemainder(expense.taxPaise, subtotalWeights);
  const tipDistribution = distributeLargestRemainder(expense.tipPaise, subtotalWeights);

  let calculatedGrandTotal = 0;

  Object.keys(breakdowns).forEach((id) => {
    const taxShare = taxDistribution[id] || 0;
    const tipShare = tipDistribution[id] || 0;
    breakdowns[id].taxSharePaise = taxShare;
    breakdowns[id].tipSharePaise = tipShare;
    breakdowns[id].totalPaise = breakdowns[id].basePaise + taxShare + tipShare;
    calculatedGrandTotal += breakdowns[id].totalPaise;
  });

  // 3. Reconcile any remaining difference with expense.totalPaise
  const delta = expense.totalPaise - calculatedGrandTotal;
  if (delta !== 0) {
    // Find member with largest totalPaise to absorb rounding delta
    const sortedMembers = Object.keys(breakdowns).sort(
      (a, b) => breakdowns[b].totalPaise - breakdowns[a].totalPaise
    );
    if (sortedMembers.length > 0) {
      breakdowns[sortedMembers[0]].totalPaise += delta;
    }
  }

  return breakdowns;
}
