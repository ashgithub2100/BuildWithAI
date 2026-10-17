"use client";

import { useEffect } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";

export function useKeyboardShortcuts() {
  const {
    fsmState,
    completeActiveTask,
    triggerShrink,
    toggleVault,
    isVaultOpen,
    dismissAvoidanceAlert,
    avoidanceAlert,
  } = useAnchorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (fsmState === "ANCHOR_LOCKED") {
        if (e.key === "Enter") {
          e.preventDefault();
          completeActiveTask();
        } else if (e.code === "Space") {
          e.preventDefault();
          triggerShrink();
        } else if (e.key === "v" || e.key === "V") {
          e.preventDefault();
          toggleVault();
        } else if (e.key === "Escape") {
          if (isVaultOpen) {
            e.preventDefault();
            toggleVault(false);
          } else if (avoidanceAlert.detected) {
            e.preventDefault();
            dismissAvoidanceAlert();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    fsmState,
    completeActiveTask,
    triggerShrink,
    toggleVault,
    isVaultOpen,
    dismissAvoidanceAlert,
    avoidanceAlert,
  ]);
}
