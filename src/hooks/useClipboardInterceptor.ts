"use client";

import { useEffect, useRef } from "react";
import { ExpenseRecord, Member } from "@/types/ledger.schema";
import { extractFromChatOrSms } from "@/lib/chatExtractor";

interface UseClipboardInterceptorProps {
  enabled: boolean;
  members: Member[];
  onExpenseIngested: (expense: ExpenseRecord, source: string) => void;
}

export function useClipboardInterceptor({
  enabled,
  members,
  onExpenseIngested,
}: UseClipboardInterceptorProps) {
  const lastProcessedHashRef = useRef<string>("");

  useEffect(() => {
    // 1. Global Paste Listener (Ctrl+V / Cmd+V anywhere on dashboard)
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text");
      if (text && text.trim().length >= 5) {
        // Check if text looks like an expense
        if (/(?:Rs\.?|INR|₹|\d+\s*(?:hua|total|paid|bill)|debited|swiggy|zomato)/i.test(text)) {
          const expense = extractFromChatOrSms(text, members);
          onExpenseIngested(expense, "Global Paste (Ctrl+V)");
        }
      }
    };

    window.addEventListener("paste", handlePaste);

    // 2. Auto-Scan on Window Focus (Tab Switching)
    const handleWindowFocus = async () => {
      if (!enabled) return;
      if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return;

      try {
        const clipboardText = await navigator.clipboard.readText();
        const trimmed = clipboardText?.trim();
        if (!trimmed || trimmed.length < 5) return;

        // Simple hash to avoid re-triggering the same clipboard content
        const hash = `${trimmed.length}_${trimmed.slice(0, 30)}`;
        if (hash === lastProcessedHashRef.current) return;

        if (/(?:Rs\.?|INR|₹|\d+\s*(?:hua|total|paid|bill)|debited|swiggy|zomato|social|uber|blinkit)/i.test(trimmed)) {
          lastProcessedHashRef.current = hash;
          const expense = extractFromChatOrSms(trimmed, members);
          onExpenseIngested(expense, "Clipboard Auto-Capture on Tab Focus");
        }
      } catch {
        // Browser clipboard permissions might be denied or prompt ignored
      }
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [enabled, members, onExpenseIngested]);
}
