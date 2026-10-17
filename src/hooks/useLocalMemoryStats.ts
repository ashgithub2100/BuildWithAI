"use client";

import { useState, useEffect, useCallback } from "react";
import { getDB } from "@/lib/db";
import { ExpenseRecord, Member } from "@/types/ledger.schema";

export interface LocalMemoryStats {
  totalExpenses: number;
  unsettledExpenses: number;
  totalSpentPaise: number;
  estimatedStorageBytes: number;
  topMerchant: string;
  members: Member[];
  expenses: ExpenseRecord[];
  refresh: () => Promise<void>;
}

export function useLocalMemoryStats(): LocalMemoryStats {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [unsettledExpenses, setUnsettledExpenses] = useState(0);
  const [totalSpentPaise, setTotalSpentPaise] = useState(0);
  const [estimatedStorageBytes, setEstimatedStorageBytes] = useState(1420);
  const [topMerchant, setTopMerchant] = useState("Swiggy");
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const refresh = useCallback(async () => {
    const db = getDB();
    if (!db) return;

    try {
      const allExpenses = await db.expenses.toArray();
      const allMembers = await db.members.toArray();

      setExpenses(allExpenses);
      setMembers(allMembers);
      setTotalExpenses(allExpenses.length);

      const unsettled = allExpenses.filter((e) => !e.settled);
      setUnsettledExpenses(unsettled.length);

      const totalPaise = allExpenses.reduce((sum, e) => sum + e.totalPaise, 0);
      setTotalSpentPaise(totalPaise);

      // Estimate bytes
      const rawJson = JSON.stringify({ allExpenses, allMembers });
      setEstimatedStorageBytes(new Blob([rawJson]).size || 1420);

      // Compute top merchant
      const merchantCounts: Record<string, number> = {};
      allExpenses.forEach((e) => {
        merchantCounts[e.merchantName] = (merchantCounts[e.merchantName] || 0) + 1;
      });
      let maxCount = 0;
      let topM = "Swiggy";
      Object.keys(merchantCounts).forEach((m) => {
        if (merchantCounts[m] > maxCount) {
          maxCount = merchantCounts[m];
          topM = m;
        }
      });
      setTopMerchant(topM);
    } catch (err) {
      console.warn("Failed to read local IndexedDB stats:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    totalExpenses,
    unsettledExpenses,
    totalSpentPaise,
    estimatedStorageBytes,
    topMerchant,
    members,
    expenses,
    refresh,
  };
}
