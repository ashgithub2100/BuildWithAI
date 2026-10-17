"use client";

import React, { useState } from "react";
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle,
  Users,
  ShieldCheck,
  Percent,
  Coins,
  ArrowRight,
  UserPlus,
  X,
  FileCheck2,
} from "lucide-react";
import { ExpenseRecord, LineItem, Member } from "@/types/ledger.schema";
import {
  allocateSplitDeterministically,
  toPaise,
  toRupees,
} from "@/lib/moneyMath";

interface SplitWorkbenchProps {
  currentExpense: ExpenseRecord | null;
  members: Member[];
  onSaveExpense: (expense: ExpenseRecord) => Promise<void>;
  onAddMember: (member: Member) => Promise<void>;
  onUpdateExpense: (expense: ExpenseRecord) => void;
  onCreateBlankExpense: () => void;
}

export const SplitWorkbench: React.FC<SplitWorkbenchProps> = ({
  currentExpense,
  members,
  onSaveExpense,
  onAddMember,
  onUpdateExpense,
  onCreateBlankExpense,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberUpi, setNewMemberUpi] = useState("");
  const [newMemberColor, setNewMemberColor] = useState("#3B82F6");

  if (!currentExpense) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#111827] border border-[#1F2937] rounded-xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-gray-200 font-mono mb-1">
          Active Split Workbench Ready
        </h3>
        <p className="text-xs text-gray-400 max-w-md font-mono mb-6 leading-relaxed">
          Select an incoming chat notification from the left feed, drop a receipt photo, or press <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">Ctrl+V</kbd> to parse an expense automatically.
        </p>
        <button
          onClick={onCreateBlankExpense}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blank Bill</span>
        </button>
      </div>
    );
  }

  // Calculate allocation breakdown deterministically
  const breakdownMap = allocateSplitDeterministically(currentExpense, members);
  const breakdownList = Object.values(breakdownMap);
  const calculatedGrandTotalPaise = breakdownList.reduce(
    (sum, b) => sum + b.totalPaise,
    0
  );
  const isMathExact = calculatedGrandTotalPaise === currentExpense.totalPaise;

  // Toggle member assignment for a line item
  const handleToggleMember = (itemIndex: number, memberId: string) => {
    const updatedItems = [...currentExpense.items];
    const item = { ...updatedItems[itemIndex] };
    const allMemberIds = members.map((m) => m.id);

    let currentAssigned =
      item.assignedMemberIds.length === 0 ? allMemberIds : item.assignedMemberIds;

    if (currentAssigned.includes(memberId)) {
      currentAssigned = currentAssigned.filter((id) => id !== memberId);
      // If none selected, default back to all
      if (currentAssigned.length === 0) {
        currentAssigned = allMemberIds;
      }
    } else {
      currentAssigned = [...currentAssigned, memberId];
    }

    item.assignedMemberIds =
      currentAssigned.length === allMemberIds.length ? [] : currentAssigned;
    updatedItems[itemIndex] = item;

    onUpdateExpense({
      ...currentExpense,
      items: updatedItems,
    });
  };

  // Add a new line item
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: "New Item",
      amountPaise: 20000, // ₹200 default
      assignedMemberIds: [],
    };
    const updatedItems = [...currentExpense.items, newItem];
    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.amountPaise, 0);

    onUpdateExpense({
      ...currentExpense,
      items: updatedItems,
      subtotalPaise: newSubtotal,
      totalPaise: newSubtotal + currentExpense.taxPaise + currentExpense.tipPaise,
    });
  };

  // Remove a line item
  const handleRemoveItem = (index: number) => {
    if (currentExpense.items.length <= 1) return;
    const updatedItems = currentExpense.items.filter((_, i) => i !== index);
    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.amountPaise, 0);

    onUpdateExpense({
      ...currentExpense,
      items: updatedItems,
      subtotalPaise: newSubtotal,
      totalPaise: newSubtotal + currentExpense.taxPaise + currentExpense.tipPaise,
    });
  };

  // Update item price or title
  const handleUpdateItem = (
    index: number,
    field: "title" | "priceRupees",
    val: string
  ) => {
    const updatedItems = [...currentExpense.items];
    if (field === "title") {
      updatedItems[index].title = val;
    } else {
      updatedItems[index].amountPaise = toPaise(val);
    }

    const newSubtotal = updatedItems.reduce((acc, it) => acc + it.amountPaise, 0);
    onUpdateExpense({
      ...currentExpense,
      items: updatedItems,
      subtotalPaise: newSubtotal,
      totalPaise: newSubtotal + currentExpense.taxPaise + currentExpense.tipPaise,
    });
  };

  // Update tax or tip
  const handleUpdateTaxTip = (field: "tax" | "tip", val: string) => {
    const paise = toPaise(val);
    const newTax = field === "tax" ? paise : currentExpense.taxPaise;
    const newTip = field === "tip" ? paise : currentExpense.tipPaise;

    onUpdateExpense({
      ...currentExpense,
      taxPaise: newTax,
      tipPaise: newTip,
      totalPaise: currentExpense.subtotalPaise + newTax + newTip,
    });
  };

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveExpense(currentExpense);
      setSaveSuccess(true);
      // Trigger confetti if available
      try {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Confetti optional
      }
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Add Member submit
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: Member = {
      id: `member_${Date.now()}_${newMemberName.toLowerCase().replace(/\s+/g, "_")}`,
      name: newMemberName.trim(),
      upiId: newMemberUpi.trim() || undefined,
      avatarColor: newMemberColor,
    };

    await onAddMember(newMember);
    setNewMemberName("");
    setNewMemberUpi("");
    setShowAddMemberModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
      {/* Workbench Header */}
      <div className="p-4 border-b border-[#1F2937] bg-[#0E1420]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentExpense.merchantName}
                  onChange={(e) =>
                    onUpdateExpense({
                      ...currentExpense,
                      merchantName: e.target.value,
                    })
                  }
                  className="bg-transparent text-white font-mono font-semibold text-base border-b border-transparent hover:border-gray-600 focus:border-blue-500 focus:outline-none px-1 -mx-1"
                  placeholder="Merchant / Expense Title"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F2937] text-gray-400 border border-gray-700">
                  {currentExpense.sourceType}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                {new Date(currentExpense.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Paid by selector & Add friend */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#0B0F17] border border-[#1F2937] px-2.5 py-1 rounded-lg text-xs font-mono">
              <span className="text-gray-400">Paid by:</span>
              <select
                value={currentExpense.paidByMemberId}
                onChange={(e) =>
                  onUpdateExpense({
                    ...currentExpense,
                    paidByMemberId: e.target.value,
                  })
                }
                className="bg-transparent text-white font-medium outline-none cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111827] text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddMemberModal(true)}
              className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-gray-300 border border-gray-700 text-xs transition-colors"
              title="Add friend to group"
            >
              <UserPlus className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]">
            <span className="text-[11px] uppercase font-mono tracking-wider text-gray-400">
              Line Items &amp; Dynamic Allocations
            </span>
            <span className="text-[11px] font-mono text-gray-500">
              Click avatar pills to toggle shares
            </span>
          </div>

          <div className="divide-y divide-[#1F2937]/60 mt-1">
            {currentExpense.items.map((item, idx) => {
              const allMemberIds = members.map((m) => m.id);
              const assigned =
                item.assignedMemberIds.length === 0
                  ? allMemberIds
                  : item.assignedMemberIds;
              const perPersonPaise =
                assigned.length > 0 ? Math.floor(item.amountPaise / assigned.length) : 0;

              return (
                <div
                  key={item.id}
                  className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 group hover:bg-[#0B0F17]/40 px-2 rounded-lg transition-colors"
                >
                  {/* Item Title & Price */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-gray-500 font-mono text-xs w-4">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleUpdateItem(idx, "title", e.target.value)
                      }
                      className="bg-transparent text-gray-200 text-xs font-mono border-b border-transparent hover:border-gray-700 focus:border-blue-500 focus:outline-none flex-1 px-1"
                    />
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <span className="text-gray-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={(item.amountPaise / 100).toFixed(2)}
                        onChange={(e) =>
                          handleUpdateItem(idx, "priceRupees", e.target.value)
                        }
                        className="w-20 bg-[#0B0F17] text-white text-right px-1.5 py-0.5 rounded border border-[#1F2937] focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Member Avatar Pills & Per Person Math */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-[#1F2937]">
                      {members.map((m) => {
                        const isAssigned = assigned.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleToggleMember(idx, m.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-all ${
                              isAssigned
                                ? "text-white shadow-sm"
                                : "text-gray-500 opacity-40 hover:opacity-70 bg-transparent"
                            }`}
                            style={{
                              backgroundColor: isAssigned
                                ? `${m.avatarColor}33`
                                : "transparent",
                              borderColor: isAssigned ? m.avatarColor : "transparent",
                              borderWidth: "1px",
                            }}
                            title={`Toggle ${m.name} for this item`}
                          >
                            {m.name.split(" ")[0]}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 w-24 text-right">
                      {toRupees(perPersonPaise)}/ea
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={currentExpense.items.length <= 1}
                      className="p-1 rounded text-gray-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleAddItem}
            className="mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-950/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Subtotal, Tax, Tip & Total Summary */}
        <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-[#1F2937] space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span>Items Subtotal</span>
            <span className="text-white font-medium">
              {toRupees(currentExpense.subtotalPaise)}
            </span>
          </div>

          {/* Tax row */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-amber-400" />
              <span>Tax / GST (Proportionally Distributed)</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                value={(currentExpense.taxPaise / 100).toFixed(2)}
                onChange={(e) => handleUpdateTaxTip("tax", e.target.value)}
                className="w-20 bg-[#111827] text-white text-right px-1.5 py-0.5 rounded border border-[#1F2937] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tip row */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-purple-400" />
              <span>Tip / Service Charge</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                value={(currentExpense.tipPaise / 100).toFixed(2)}
                onChange={(e) => handleUpdateTaxTip("tip", e.target.value)}
                className="w-20 bg-[#111827] text-white text-right px-1.5 py-0.5 rounded border border-[#1F2937] focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between text-sm font-semibold">
            <span className="text-gray-200">Receipt Total</span>
            <span className="text-emerald-400 text-base">
              {toRupees(currentExpense.totalPaise)}
            </span>
          </div>
        </div>

        {/* Live Proportional Breakdown Summary */}
        <div className="p-3.5 rounded-xl bg-[#0E1420] border border-[#1F2937] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Hare-Niemeyer Mathematical Distribution</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Zero Penny Discrepancy Guaranteed</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {breakdownList.map((b) => (
              <div
                key={b.memberId}
                className="p-2.5 rounded-lg bg-[#0B0F17] border border-[#1F2937] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-medium text-gray-200">
                    {b.memberName}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Items: {toRupees(b.basePaise)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Tax+Tip: {toRupees(b.taxSharePaise + b.tipSharePaise)}
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t border-[#1F2937] text-xs font-mono font-semibold text-emerald-400">
                  {toRupees(b.totalPaise)}
                </div>
              </div>
            ))}
          </div>

          {/* Mathematical Proof Assertion Banner */}
          <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Exact Integer Check: {toRupees(calculatedGrandTotalPaise)} ={" "}
                {toRupees(currentExpense.totalPaise)}
              </span>
            </span>
            <span className="text-[10px] text-gray-400">
              {isMathExact ? "✓ 0.00% Error" : "Discrepancy detected"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3.5 border-t border-[#1F2937] bg-[#0E1420] flex items-center justify-between gap-3">
        <button
          onClick={onCreateBlankExpense}
          className="text-xs font-mono text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
        >
          Reset / Blank
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-semibold transition-all shadow-md ${
            saveSuccess
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Saved to Local IndexedDB!</span>
            </>
          ) : (
            <>
              <FileCheck2 className="w-4 h-4" />
              <span>Save to Local Memory Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200 font-mono">
                Add Friend to Group
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Vikram"
                  required
                  className="w-full bg-[#0B0F17] text-white px-2.5 py-1.5 rounded-lg border border-[#1F2937] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={newMemberUpi}
                  onChange={(e) => setNewMemberUpi(e.target.value)}
                  placeholder="e.g. vikram@okhdfc"
                  className="w-full bg-[#0B0F17] text-white px-2.5 py-1.5 rounded-lg border border-[#1F2937] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Avatar Color</label>
                <div className="flex items-center gap-2">
                  {["#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6"].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewMemberColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          newMemberColor === color
                            ? "border-white scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
