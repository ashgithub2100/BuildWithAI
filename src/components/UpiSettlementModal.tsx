"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Share2,
  CheckCircle2,
} from "lucide-react";
import { SimplifiedDebt } from "@/types/ledger.schema";
import { buildUpiUri } from "@/lib/upiGenerator";
import { toRupees } from "@/lib/moneyMath";

interface UpiSettlementModalProps {
  debt: SimplifiedDebt | null;
  onClose: () => void;
  onMarkSettled?: (debt: SimplifiedDebt) => void;
}

export const UpiSettlementModal: React.FC<UpiSettlementModalProps> = ({
  debt,
  onClose,
  onMarkSettled,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!debt) return null;

  const payeeUpi = debt.toMemberUpi || "payee@upi";
  const upiUri = buildUpiUri({
    payeeUpiId: payeeUpi,
    payeeName: debt.toMemberName,
    amountPaise: debt.amountPaise,
    note: `ReceiptSplit settlement from ${debt.fromMemberName}`,
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(upiUri);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopySummary = async () => {
    const text = `💸 *ReceiptSplit Settlement*\n${debt.fromMemberName} owes ${debt.toMemberName}: ${toRupees(debt.amountPaise)}\nPay via UPI: ${payeeUpi}\nUPI Link: ${upiUri}\n\n_Computed on-device via ReceiptSplit_`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1F2937] rounded-2xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">
                NPCI Instant UPI QR
              </h3>
              <p className="text-[11px] text-gray-400 font-mono">
                Direct peer-to-peer settlement
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

        {/* Transfer details */}
        <div className="p-3 rounded-xl bg-[#0B0F17] border border-[#1F2937] text-center font-mono space-y-1">
          <div className="text-xs text-gray-400">
            <span className="text-white font-medium">{debt.fromMemberName}</span> pays{" "}
            <span className="text-emerald-400 font-medium">{debt.toMemberName}</span>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {toRupees(debt.amountPaise)}
          </div>
          <div className="text-[11px] text-gray-500">
            UPI VPA: <span className="text-gray-300">{payeeUpi}</span>
          </div>
        </div>

        {/* Authentic QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white shadow-inner mx-auto w-fit">
          <QRCodeSVG
            value={upiUri}
            size={180}
            level="M"
            includeMargin={false}
          />
          <div className="mt-2 text-[10px] font-mono text-gray-600 font-semibold tracking-wider uppercase">
            Scan with GPay / PhonePe / Paytm / BHIM
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 font-mono text-xs">
          <a
            href={upiUri}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in UPI App (Mobile)</span>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-gray-200 border border-gray-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopySummary}
              className="py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-gray-200 border border-gray-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {onMarkSettled && (
            <button
              onClick={() => {
                onMarkSettled(debt);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Mark Debt as Settled</span>
            </button>
          )}
        </div>

        {/* Security watermark */}
        <div className="text-[10px] font-mono text-gray-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>NPCI Compliant • Zero Cloud Intermediaries</span>
        </div>
      </div>
    </div>
  );
};
