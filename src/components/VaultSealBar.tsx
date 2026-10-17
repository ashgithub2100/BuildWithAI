"use client";

import React, { useState } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { Lock, Unlock, X, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const VaultSealBar: React.FC = () => {
  const { vaultQueue, isVaultOpen, toggleVault, fsmState } = useAnchorStore();
  const [hasConfirmedInspection, setHasConfirmedInspection] = useState<boolean>(false);
  const [showFrictionDialog, setShowFrictionDialog] = useState<boolean>(false);

  if (fsmState !== "ANCHOR_LOCKED" && fsmState !== "SHRINKING") return null;
  if (vaultQueue.length === 0) return null;

  const handlePillClick = () => {
    if (isVaultOpen) {
      toggleVault(false);
      return;
    }

    if (!hasConfirmedInspection) {
      setShowFrictionDialog(true);
    } else {
      toggleVault(true);
    }
  };

  const handleConfirmInspect = () => {
    setHasConfirmedInspection(true);
    setShowFrictionDialog(false);
    toggleVault(true);
  };

  return (
    <>
      {/* Bottom Collapsed Security Pill */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={handlePillClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-surface-border bg-surface/90 backdrop-blur-md text-ink-muted hover:text-ink-primary hover:border-amber-braun/50 text-xs font-mono shadow-xl transition-all"
        >
          {isVaultOpen ? (
            <Unlock className="w-3.5 h-3.5 text-amber-braun" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-ink-muted" />
          )}
          <span>
            {vaultQueue.length} task{vaultQueue.length > 1 ? "s" : ""} sealed in Vault — hidden to protect focus
          </span>
          <kbd className="ml-1">V</kbd>
        </button>
      </div>

      {/* Friction Confirmation Gatekeeper Modal */}
      <AnimatePresence>
        {showFrictionDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-surface-border rounded-xl p-6 shadow-2xl font-mono text-xs"
            >
              <div className="flex items-center gap-2 text-amber-braun font-bold mb-3 uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Intentional Friction Check</span>
              </div>

              <p className="text-ink-primary text-sm font-sans mb-3 leading-relaxed">
                Are you sure you want to inspect the full list?
              </p>
              <p className="text-ink-secondary mb-6 leading-relaxed">
                Viewing a backlog of unfinished tasks re-activates working-memory overload and triggers the exact avoidance response Anchor is designed to kill.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFrictionDialog(false)}
                  className="px-4 py-2 rounded bg-amber-braun text-[#111] font-bold hover:bg-[#F2A644] transition-colors"
                >
                  Stay Focused (Recommended)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInspect}
                  className="px-3 py-2 rounded border border-surface-border bg-well text-ink-muted hover:text-ink-primary hover:bg-surface transition-colors"
                >
                  Inspect Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Vault Drawer Overlay */}
      <AnimatePresence>
        {isVaultOpen && (
          <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-xl bg-surface border border-surface-border rounded-xl p-6 shadow-2xl max-h-[80vh] flex flex-col font-mono text-xs"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-braun" />
                  <span className="font-bold text-ink-primary uppercase tracking-wide">
                    Sealed Vault Queue ({vaultQueue.length} items)
                  </span>
                </div>
                <button
                  onClick={() => toggleVault(false)}
                  className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-surface-hover"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task List */}
              <div className="overflow-y-auto py-3 space-y-2 pr-1">
                {vaultQueue.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.isAvoidanceTask
                        ? "bg-rust-glow/30 border-rust/40"
                        : "bg-well border-well-border"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-ink-muted">QUEUE POSITION #{idx + 1}</span>
                      {task.isAvoidanceTask && (
                        <span className="flex items-center gap-1 text-rust text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" />
                          QUARANTINED AVOIDANCE
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-sans text-ink-primary font-medium mb-1">
                      {task.microAction}
                    </div>
                    <div className="text-[11px] text-ink-muted">
                      Original: {task.parentTaskTitle}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-ink-muted text-[11px]">
                  Press <kbd>V</kbd> or <kbd>Esc</kbd> to return to active anchor
                </span>
                <button
                  onClick={() => toggleVault(false)}
                  className="px-4 py-1.5 rounded bg-amber-braun text-[#111] font-bold hover:bg-[#F2A644]"
                >
                  Back to Focus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
