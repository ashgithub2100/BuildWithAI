"use client";

import React, { useState } from "react";
import {
  GitCommit,
  QrCode,
  CheckCircle2,
  TrendingUp,
  History,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { ExpenseRecord, Member, SimplifiedDebt } from "@/types/ledger.schema";
import { simplifyDebts } from "@/lib/debtGraph";
import { toRupees } from "@/lib/moneyMath";

interface MemoryGraphVaultProps {
  expenses: ExpenseRecord[];
  members: Member[];
  storageBytes: number;
  onOpenUpiModal: (debt: SimplifiedDebt) => void;
  onSelectExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onToggleExpenseSettled: (expenseId: string, currentStatus: boolean) => Promise<void>;
}

export const MemoryGraphVault: React.FC<MemoryGraphVaultProps> = ({
  expenses,
  members,
  storageBytes,
  onOpenUpiModal,
  onSelectExpense,
  onDeleteExpense,
  onToggleExpenseSettled,
}) => {
  const [activeTab, setActiveTab] = useState<"settle" | "history">("settle");

  // Run Min-Cash-Flow debt simplification across unsettled expenses
  const simplification = simplifyDebts(expenses, members);
  const {
    simplifiedDebts,
    originalTransactionCount,
    simplifiedTransactionCount,
    totalOwedPaise,
  } = simplification;

  const totalSpentPaise = expenses.reduce((sum, e) => sum + e.totalPaise, 0);
  const unsettledExpenses = expenses.filter((e) => !e.settled);

  // Top merchant
  const merchantCounts: Record<string, number> = {};
  expenses.forEach((e) => {
    merchantCounts[e.merchantName] = (merchantCounts[e.merchantName] || 0) + 1;
  });
  let topMerchant = "Swiggy";
  let maxCount = 0;
  Object.keys(merchantCounts).forEach((m) => {
    if (merchantCounts[m] > maxCount) {
      maxCount = merchantCounts[m];
      topMerchant = m;
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1F2937] bg-[#0E1420]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-200 font-mono">
                Memory Graph Vault
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Min-Cash-Flow Directed Graph
              </p>
            </div>
          </div>

          <div className="flex rounded-md bg-[#1F2937] p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab("settle")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "settle"
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Settlement ({simplifiedDebts.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "history"
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              History ({expenses.length})
            </button>
          </div>
        </div>

        {/* Graph Reduction Metric Banner */}
        {originalTransactionCount > simplifiedTransactionCount && (
          <div className="mt-3 p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>
              Graph solver collapsed {originalTransactionCount} IOUs into {simplifiedTransactionCount} direct transfers!
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-mono">
        {activeTab === "settle" && (
          <>
            {/* Quick Stats overview */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1F2937]">
                <div className="text-[10px] text-gray-400 uppercase">Unsettled Balance</div>
                <div className="text-sm font-semibold text-amber-400 mt-0.5">
                  {toRupees(totalOwedPaise)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1F2937]">
                <div className="text-[10px] text-gray-400 uppercase">Top Merchant</div>
                <div className="text-sm font-semibold text-white mt-0.5 truncate">
                  {topMerchant}
                </div>
              </div>
            </div>

            {/* Simplified Debts List */}
            <div className="space-y-2">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 pb-1">
                Direct Settlement Transfers
              </div>

              {simplifiedDebts.length === 0 ? (
                <div className="p-6 rounded-xl bg-[#0B0F17] border border-[#1F2937] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-300 font-medium">
                    All balances are settled!
                  </div>
                  <p className="text-[11px] text-gray-500">
                    No outstanding IOUs across {expenses.length} recorded bills.
                  </p>
                </div>
              ) : (
                simplifiedDebts.map((debt, idx) => (
                  <div
                    key={`${debt.fromMemberId}_${debt.toMemberId}_${idx}`}
                    className="p-3 rounded-lg bg-[#0B0F17] border border-[#1F2937] hover:border-purple-500/40 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white">
                          {debt.fromMemberName}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-emerald-400">
                          {debt.toMemberName}
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        {toRupees(debt.amountPaise)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1F2937]">
                      <span className="text-[10px] text-gray-500">
                        {debt.toMemberUpi ? `UPI: ${debt.toMemberUpi}` : "UPI QR Ready"}
                      </span>
                      <button
                        onClick={() => onOpenUpiModal(debt)}
                        className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs flex items-center gap-1 transition-colors"
                      >
                        <QrCode className="w-3 h-3 text-purple-400" />
                        <span>Generate QR</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Local Spending Intelligence Card */}
            <div className="p-3 rounded-lg bg-[#0E1420] border border-[#1F2937] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>On-Device Spending Memory</span>
              </div>
              <div className="text-[11px] text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Total Group Spend:</span>
                  <span className="text-white font-medium">{toRupees(totalSpentPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recorded Expenses:</span>
                  <span className="text-white">{expenses.length} bills</span>
                </div>
                <div className="flex justify-between">
                  <span>Local IndexedDB Size:</span>
                  <span className="text-emerald-400">
                    {storageBytes > 1024
                      ? `${(storageBytes / 1024).toFixed(1)} KB`
                      : `${storageBytes} B`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>External Cloud Calls:</span>
                  <span className="text-emerald-400 font-bold">0 calls</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 pb-1">
              Historical Ledger ({expenses.length})
            </div>

            {expenses.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                No recorded expenses yet. Save a bill from the Workbench to view it here.
              </div>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-3 rounded-lg bg-[#0B0F17] border border-[#1F2937] hover:border-gray-600 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        onClick={() => onSelectExpense(expense)}
                        className="text-xs font-semibold text-white hover:text-blue-400 cursor-pointer flex items-center gap-1"
                      >
                        <span>{expense.merchantName}</span>
                        <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-blue-400" />
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(expense.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {expense.items.length} items
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">
                      {toRupees(expense.totalPaise)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1F2937] text-[10px]">
                    <button
                      onClick={() =>
                        onToggleExpenseSettled(expense.id, expense.settled)
                      }
                      className={`px-2 py-0.5 rounded border transition-colors ${
                        expense.settled
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-950/40 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {expense.settled ? "Settled" : "Unsettled"}
                    </button>

                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                      title="Delete expense from local DB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
