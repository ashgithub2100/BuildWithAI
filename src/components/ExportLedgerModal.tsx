"use client";

import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  FileText,
  Code,
  Download,
  CheckCircle2,
  Share2,
  Copy,
} from "lucide-react";
import { ExpenseRecord, Member } from "@/types/ledger.schema";
import {
  generateCsvExport,
  generateTextStatement,
  downloadExportFile,
} from "@/lib/exportUtils";

interface ExportLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseRecord[];
  members: Member[];
}

export const ExportLedgerModal: React.FC<ExportLedgerModalProps> = ({
  isOpen,
  onClose,
  expenses,
  members,
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const timestamp = Date.now();

  const handleExportCsv = () => {
    const csvContent = generateCsvExport(expenses, members);
    downloadExportFile(
      csvContent,
      `receiptsplit-ledger-${timestamp}.csv`,
      "text/csv;charset=utf-8;"
    );
    onClose();
  };

  const handleExportText = () => {
    const textContent = generateTextStatement(expenses, members);
    downloadExportFile(
      textContent,
      `receiptsplit-statement-${timestamp}.txt`,
      "text/plain;charset=utf-8;"
    );
    onClose();
  };

  const handleExportJson = () => {
    const data = {
      app: "ReceiptSplit Local-First",
      exportedAt: new Date().toISOString(),
      privacyAudit: "Zero Cloud Writes • 100% Client-Side Memory",
      members,
      expenses,
    };
    downloadExportFile(
      JSON.stringify(data, null, 2),
      `receiptsplit-backup-${timestamp}.json`,
      "application/json"
    );
    onClose();
  };

  const handleCopyStatement = async () => {
    const textContent = generateTextStatement(expenses, members);
    try {
      await navigator.clipboard.writeText(textContent);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">
                Export Expense Statement
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Choose an easy-to-read format for your group
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 font-mono">
          {/* Option 1: CSV / Excel (Recommended) */}
          <div
            onClick={handleExportCsv}
            className="p-3.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white group-hover:text-emerald-300">
                    Excel &amp; Google Sheets (.csv)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Opens directly in Excel or Sheets. Formatted table with dates, items, tax, total in ₹, and who-owes-whom settlements.
                </p>
              </div>
            </div>
          </div>

          {/* Option 2: Human-readable Text Statement */}
          <div
            onClick={handleExportText}
            className="p-3.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1F2937] hover:border-blue-500/50 cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                  Readable Statement (.txt)
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Clean, formatted text invoice. Perfect for printing, opening in Notepad, or emailing to friends.
                </p>
              </div>
            </div>
          </div>

          {/* Option 3: Developer JSON Backup */}
          <div
            onClick={handleExportJson}
            className="p-3.5 rounded-xl bg-[#0B0F17] hover:bg-[#1E293B] border border-[#1F2937] hover:border-purple-500/50 cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 mt-0.5">
                <Code className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                  Raw JSON Backup (.json)
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                  Technical backup file containing full raw IndexedDB state and mathematical models.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Copy to Clipboard Button */}
        <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between">
          <button
            onClick={handleCopyStatement}
            className="w-full py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-gray-200 border border-gray-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedText ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Statement Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-400" />
                <span>Copy Formatted Statement to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
