import { ExpenseRecord, Member, SimplifiedDebt } from "@/types/ledger.schema";
import { allocateSplitDeterministically } from "./moneyMath";

export interface DebtSimplificationResult {
  simplifiedDebts: SimplifiedDebt[];
  totalOwedPaise: number;
  originalTransactionCount: number;
  simplifiedTransactionCount: number;
  netBalances: Record<string, number>; // memberId -> net paise (+ means creditor, - means debtor)
}

/**
 * Min-Cash-Flow Algorithm:
 * Computes net balances for all members across all unsettled expenses,
 * and collapses complex multi-party debt webs into the minimum number
 * of direct two-party payments.
 */
export function simplifyDebts(
  expenses: ExpenseRecord[],
  members: Member[]
): DebtSimplificationResult {
  const memberMap: Record<string, Member> = {};
  const netBalances: Record<string, number> = {};

  members.forEach((m) => {
    memberMap[m.id] = m;
    netBalances[m.id] = 0;
  });

  let originalTransactionCount = 0;

  // 1. Calculate net balances across all unsettled expenses
  expenses
    .filter((e) => !e.settled)
    .forEach((expense) => {
      const splits = allocateSplitDeterministically(expense, members);
      const payerId = expense.paidByMemberId;

      Object.keys(splits).forEach((memberId) => {
        const share = splits[memberId].totalPaise;
        if (memberId !== payerId && share > 0) {
          originalTransactionCount += 1;
          // member owes payer
          netBalances[memberId] = (netBalances[memberId] || 0) - share;
          netBalances[payerId] = (netBalances[payerId] || 0) + share;
        }
      });
    });

  // 2. Separate creditors (+balance) and debtors (-balance)
  interface BalanceNode {
    memberId: string;
    amount: number;
  }

  const creditors: BalanceNode[] = [];
  const debtors: BalanceNode[] = [];

  Object.keys(netBalances).forEach((id) => {
    const bal = netBalances[id];
    if (bal > 0) {
      creditors.push({ memberId: id, amount: bal });
    } else if (bal < 0) {
      debtors.push({ memberId: id, amount: -bal });
    }
  });

  const simplifiedDebts: SimplifiedDebt[] = [];
  let totalOwedPaise = 0;

  // 3. Greedily match maximum debtor with maximum creditor
  let cIdx = 0;
  let dIdx = 0;

  // Sort descending by amount
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);

    if (settledAmount > 0) {
      const fromMem = memberMap[debtor.memberId];
      const toMem = memberMap[creditor.memberId];

      simplifiedDebts.push({
        fromMemberId: debtor.memberId,
        fromMemberName: fromMem?.name || "Member",
        toMemberId: creditor.memberId,
        toMemberName: toMem?.name || "Member",
        toMemberUpi: toMem?.upiId,
        amountPaise: settledAmount,
      });

      totalOwedPaise += settledAmount;
      creditor.amount -= settledAmount;
      debtor.amount -= settledAmount;
    }

    if (creditor.amount === 0) cIdx++;
    if (debtor.amount === 0) dIdx++;
  }

  return {
    simplifiedDebts,
    totalOwedPaise,
    originalTransactionCount,
    simplifiedTransactionCount: simplifiedDebts.length,
    netBalances,
  };
}
