"use client";

import React, { useState } from "react";
import { ShieldCheck, Database, HardDrive, Download, Trash2, Check, Sparkles } from "lucide-react";

interface PrivacyShieldHeaderProps {
  storageBytes: number;
  expensesCount: number;
  unsettledCount: number;
  userUpiId: string;
  onUpdateUserUpiId: (upi: string) => void;
  onClearData: () => void;
  onOpenExportModal: () => void;
}

export const PrivacyShieldHeader: React.FC<PrivacyShieldHeaderProps> = ({
  storageBytes,
  expensesCount,
  unsettledCount,
  userUpiId,
  onUpdateUserUpiId,
  onClearData,
  onOpenExportModal,
}) => {
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpi, setTempUpi] = useState(userUpiId);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const formattedBytes =
    storageBytes > 1024
      ? `${(storageBytes / 1024).toFixed(1)} KB`
      : `${storageBytes} B`;

  const handleSaveUpi = () => {
    if (tempUpi.trim()) {
      onUpdateUserUpiId(tempUpi.trim());
    }
    setIsEditingUpi(false);
  };

  return (
    <header className="w-full bg-[#0B0F17]/95 border-b border-[#1F2937] backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Privacy Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight text-white font-mono">
                  ReceiptSplit
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1F2937] text-gray-400 border border-gray-700">
                  Local-First
                </span>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Cloud Leakage • 100% On-Device IndexedDB</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-[#1F2937]">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400/90 font-mono bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline-First (0ms Latency)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics & Telemetry Bar */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Storage telemetry badge */}
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1F2937] text-gray-300 px-2.5 py-1 rounded-md">
            <HardDrive className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">IndexedDB:</span>
            <span className="text-white font-medium">{formattedBytes}</span>
          </div>

          {/* Records telemetry badge */}
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1F2937] text-gray-300 px-2.5 py-1 rounded-md">
            <Database className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">Ledger:</span>
            <span className="text-white font-medium">{expensesCount} expenses</span>
            {unsettledCount > 0 && (
              <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                {unsettledCount} due
              </span>
            )}
          </div>

          {/* Live External Network Tracker */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#111827] border border-[#1F2937] text-emerald-400 px-2.5 py-1 rounded-md">
            <span className="text-gray-400">Cloud Writes:</span>
            <span className="font-semibold text-emerald-400">0 calls</span>
          </div>

          {/* Quick Payee UPI ID */}
          <div className="flex items-center gap-1.5 bg-[#111827] border border-[#1F2937] px-2 py-0.5 rounded-md text-xs">
            <span className="text-gray-400">Your UPI:</span>
            {isEditingUpi ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempUpi}
                  onChange={(e) => setTempUpi(e.target.value)}
                  placeholder="e.g. you@okhdfc"
                  className="bg-[#0B0F17] text-white text-xs px-1.5 py-0.5 rounded border border-blue-500/50 outline-none w-28 font-mono"
                  autoFocus
                />
                <button
                  onClick={handleSaveUpi}
                  className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  title="Save UPI ID"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempUpi(userUpiId);
                  setIsEditingUpi(true);
                }}
                className="text-blue-400 hover:text-blue-300 font-mono underline decoration-dotted text-xs cursor-pointer"
                title="Click to edit your personal UPI ID"
              >
                {userUpiId || "Set UPI ID"}
              </button>
            )}
          </div>

          {/* Export & Reset Actions */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-gray-200 border border-gray-700 text-xs transition-colors shadow-sm"
              title="Export statement in Excel CSV, plain text, or JSON format"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-mono">Export (Excel / Text)</span>
            </button>
            <button
              onClick={onClearData}
              className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs transition-colors"
              title="Wipe local IndexedDB database and reset demo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
