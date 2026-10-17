"use client";

import React from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { ShieldAlert, X, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AvoidanceInterceptor: React.FC = () => {
  const { avoidanceAlert, dismissAvoidanceAlert, telemetry, triggerShrink, fsmState } =
    useAnchorStore();

  const isFocus = fsmState === "ANCHOR_LOCKED";
  const showTabSwitchAlert = isFocus && telemetry.resistanceAutoPrompted && telemetry.tabSwitchesDuringFocus > 0;
  const showAvoidanceAlert = avoidanceAlert.detected;

  if (!showAvoidanceAlert && !showTabSwitchAlert) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-4 px-2">
      <AnimatePresence>
        {/* Avoidance Task Quarantined Alert */}
        {showAvoidanceAlert && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full bg-rust-glow border border-rust/40 rounded-lg p-3.5 mb-2.5 flex items-start justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rust shrink-0 mt-0.5" />
              <div>
                <div className="text-rust font-bold mb-0.5 uppercase tracking-wide">
                  Productive Avoidance Intercepted
                </div>
                <div className="text-ink-secondary leading-relaxed">
                  {avoidanceAlert.diagnosticMessage ||
                    `"${avoidanceAlert.flaggedTaskTitle}" looks like comfort-zone avoidance. Quarantined at the bottom of your Vault.`}
                </div>
              </div>
            </div>

            <button
              onClick={dismissAvoidanceAlert}
              title="Dismiss alert"
              className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-rust/20 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Tab Switch / Idle Hesitation Alert */}
        {showTabSwitchAlert && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full bg-amber-glow border border-amber-braun/50 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-2.5 text-amber-braun">
              <Flame className="w-4 h-4 shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wide">
                  Friction Alert:
                </span>{" "}
                <span className="text-ink-primary">
                  Tab-switch or hesitation detected. Current task may be too intimidating.
                </span>
              </div>
            </div>

            <button
              onClick={() => triggerShrink()}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-braun text-[#111] font-bold hover:bg-[#F2A644] transition-colors shrink-0"
            >
              <span>Slice in Half</span>
              <kbd className="bg-[#B87524] text-white border-transparent">Space</kbd>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
