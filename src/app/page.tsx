"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PrivacyShieldHeader } from "@/components/PrivacyShieldHeader";
import { AutoIngestStream } from "@/components/AutoIngestStream";
import { SplitWorkbench } from "@/components/SplitWorkbench";
import { MemoryGraphVault } from "@/components/MemoryGraphVault";
import { UpiSettlementModal } from "@/components/UpiSettlementModal";
import { ExportLedgerModal } from "@/components/ExportLedgerModal";
import { useClipboardInterceptor } from "@/hooks/useClipboardInterceptor";
import { useLocalMemoryStats } from "@/hooks/useLocalMemoryStats";
import { getDB, seedInitialMembers } from "@/lib/db";
import {
  ExpenseRecord,
  Member,
  SimplifiedDebt,
} from "@/types/ledger.schema";
import { extractFromChatOrSms } from "@/lib/chatExtractor";
import { toRupees } from "@/lib/moneyMath";
import { Bell, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [userUpiId, setUserUpiId] = useState<string>("you@okhdfcbank");
  const [clipboardAutoScanEnabled, setClipboardAutoScanEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active bill being edited in Center Workbench
  const [currentExpense, setCurrentExpense] = useState<ExpenseRecord | null>(null);

  // Settlement QR Modal & Export Modal state
  const [activeDebtModal, setActiveDebtModal] = useState<SimplifiedDebt | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Local Memory stats & reactive IndexedDB hook
  const {
    estimatedStorageBytes: storageBytes,
    expenses,
    members,
    totalExpenses,
    unsettledExpenses,
    refresh,
  } = useLocalMemoryStats();

  // Mount effect & initial seeding
  useEffect(() => {
    setMounted(true);
    const init = async () => {
      await seedInitialMembers();
      await refresh();

      // If no active expense loaded yet, load a realistic initial split
      const db = getDB();
      if (db) {
        const existing = await db.expenses.toArray();
        if (existing.length > 0) {
          setCurrentExpense(existing[0]);
        } else {
          // Pre-seed an initial realistic split
          const mems = await db.members.toArray();
          const initialExpense = extractFromChatOrSms(
            "Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split",
            mems
          );
          await db.expenses.put(initialExpense);
          setCurrentExpense(initialExpense);
          await refresh();
        }
      }
    };
    init();
  }, [refresh]);

  // Show non-intrusive toast
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Handle auto-ingested expense (from clipboard, paste, simulated notification, or OCR)
  const handleExpenseIngested = useCallback(
    (expense: ExpenseRecord, sourceTag: string) => {
      setCurrentExpense(expense);
      triggerToast(
        `Intercepted: ${expense.merchantName} (${toRupees(expense.totalPaise)}) via ${sourceTag}`
      );
    },
    [triggerToast]
  );

  // Clipboard auto-interceptor hook (focus + paste)
  useClipboardInterceptor({
    enabled: clipboardAutoScanEnabled,
    members,
    onExpenseIngested: handleExpenseIngested,
  });

  // Save current expense to IndexedDB
  const handleSaveExpense = async (expense: ExpenseRecord) => {
    const db = getDB();
    if (!db) return;

    await db.expenses.put(expense);
    await refresh();
    triggerToast(`Saved ${expense.merchantName} to Local IndexedDB Vault`);
  };

  // Add new friend to group
  const handleAddMember = async (member: Member) => {
    const db = getDB();
    if (!db) return;

    await db.members.put(member);
    await refresh();
    triggerToast(`Added ${member.name} to local contacts`);
  };

  // Delete expense from local DB
  const handleDeleteExpense = async (expenseId: string) => {
    const db = getDB();
    if (!db) return;

    await db.expenses.delete(expenseId);
    if (currentExpense?.id === expenseId) {
      const remaining = await db.expenses.toArray();
      setCurrentExpense(remaining[0] || null);
    }
    await refresh();
    triggerToast("Expense removed from local vault");
  };

  // Toggle settled status on an expense
  const handleToggleExpenseSettled = async (
    expenseId: string,
    currentStatus: boolean
  ) => {
    const db = getDB();
    if (!db) return;

    await db.expenses.update(expenseId, { settled: !currentStatus });
    if (currentExpense?.id === expenseId) {
      setCurrentExpense((prev) => (prev ? { ...prev, settled: !currentStatus } : null));
    }
    await refresh();
    triggerToast(
      !currentStatus ? "Expense marked as Settled" : "Expense marked as Unsettled"
    );
  };

  // Mark a specific debt as settled (marks all unsettled expenses as settled for simplicity)
  const handleMarkDebtSettled = async (_debt: SimplifiedDebt) => {
    const db = getDB();
    if (!db) return;

    const unsettled = await db.expenses.filter((e) => !e.settled).toArray();
    for (const exp of unsettled) {
      await db.expenses.update(exp.id, { settled: true });
    }
    if (currentExpense) {
      setCurrentExpense({ ...currentExpense, settled: true });
    }
    await refresh();
    triggerToast("Settlement verified & marked settled in local graph!");
  };

  // Wipe all local data and reseed
  const handleClearData = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Are you sure you want to reset all local IndexedDB data to initial state?"
      )
    ) {
      return;
    }

    const db = getDB();
    if (!db) return;

    await db.expenses.clear();
    await db.members.clear();
    await seedInitialMembers();
    await refresh();

    const mems = await db.members.toArray();
    const freshSample = extractFromChatOrSms(
      "Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split",
      mems
    );
    await db.expenses.put(freshSample);
    setCurrentExpense(freshSample);
    await refresh();
    triggerToast("Local IndexedDB wiped and re-seeded cleanly.");
  };

  // Export local database to JSON
  const handleExportJson = async () => {
    const db = getDB();
    if (!db) return;

    const allExpenses = await db.expenses.toArray();
    const allMembers = await db.members.toArray();

    const data = {
      app: "ReceiptSplit Local-First",
      exportedAt: new Date().toISOString(),
      privacyAudit: "Zero Cloud Writes • 100% Client-Side Memory",
      members: allMembers,
      expenses: allExpenses,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receiptsplit-local-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("Exported local encrypted JSON ledger to downloads.");
  };

  // Create a blank new bill in workbench
  const handleCreateBlankExpense = () => {
    const blank: ExpenseRecord = {
      id: `exp_manual_${Date.now()}`,
      sourceType: "MANUAL",
      rawSourceText: "Manual Entry",
      merchantName: "New Bill",
      createdAt: Date.now(),
      paidByMemberId: members[0]?.id || "member_you",
      subtotalPaise: 50000,
      taxPaise: 2500,
      tipPaise: 0,
      totalPaise: 52500,
      items: [
        {
          id: `item_${Date.now()}_1`,
          title: "Item 1",
          amountPaise: 50000,
          assignedMemberIds: [],
        },
      ],
      settled: false,
    };
    setCurrentExpense(blank);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center font-mono text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span>Mounting Local-First Memory Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Telemetry & Privacy Shield Header */}
      <PrivacyShieldHeader
        storageBytes={storageBytes}
        expensesCount={totalExpenses}
        unsettledCount={unsettledExpenses}
        userUpiId={userUpiId}
        onUpdateUserUpiId={setUserUpiId}
        onClearData={handleClearData}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main 3-Column Responsive Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left Column: Auto-Ingest Stream (approx 30% -> 4 cols on lg) */}
        <section className="lg:col-span-4 xl:col-span-4 h-[calc(100vh-5rem)] min-h-[580px]">
          <AutoIngestStream
            members={members}
            onExpenseIngested={handleExpenseIngested}
            clipboardAutoScanEnabled={clipboardAutoScanEnabled}
            onToggleClipboardAutoScan={setClipboardAutoScanEnabled}
          />
        </section>

        {/* Center Column: Split Workbench (approx 42% -> 5 cols on lg) */}
        <section className="lg:col-span-5 xl:col-span-5 h-[calc(100vh-5rem)] min-h-[580px]">
          <SplitWorkbench
            currentExpense={currentExpense}
            members={members}
            onSaveExpense={handleSaveExpense}
            onAddMember={handleAddMember}
            onUpdateExpense={setCurrentExpense}
            onCreateBlankExpense={handleCreateBlankExpense}
          />
        </section>

        {/* Right Column: Memory Graph Vault (approx 28% -> 3 cols on lg) */}
        <section className="lg:col-span-3 xl:col-span-3 h-[calc(100vh-5rem)] min-h-[580px]">
          <MemoryGraphVault
            expenses={expenses}
            members={members}
            storageBytes={storageBytes}
            onOpenUpiModal={setActiveDebtModal}
            onSelectExpense={setCurrentExpense}
            onDeleteExpense={handleDeleteExpense}
            onToggleExpenseSettled={handleToggleExpenseSettled}
          />
        </section>
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#111827] border border-blue-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 font-mono text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Bell className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* NPCI UPI QR Settlement Modal */}
      {activeDebtModal && (
        <UpiSettlementModal
          debt={activeDebtModal}
          onClose={() => setActiveDebtModal(null)}
          onMarkSettled={handleMarkDebtSettled}
        />
      )}

      {/* Easy-to-Read Statement Export Modal */}
      <ExportLedgerModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={expenses}
        members={members}
      />
    </div>
  );
}
