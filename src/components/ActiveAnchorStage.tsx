"use client";

import React, { useState, useEffect } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { Check, Flame, Layers, Clock, ShieldCheck, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ActiveAnchorStage: React.FC = () => {
  const {
    activeTask,
    executionStack,
    vaultQueue,
    fsmState,
    completeActiveTask,
    triggerShrink,
    telemetry,
  } = useAnchorStore();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const isShrinking = fsmState === "SHRINKING";

  // Initialize and tick countdown timer for the step
  useEffect(() => {
    if (activeTask) {
      setSecondsRemaining(activeTask.estimatedMinutes * 60);
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  if (!activeTask) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const shrinkColors = [
    "text-ink-secondary border-surface-border",
    "text-amber-braun border-amber-braun/40 bg-amber-glow",
    "text-rust border-rust/40 bg-rust-glow",
    "text-rust border-rust/70 bg-rust-glow font-bold",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Top Status Strip */}
      <div className="w-full flex items-center justify-between text-xs font-mono mb-4 text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-oscilloscope" />
          <span className="uppercase text-ink-secondary">THE RULE OF ONE // FOCUS COCKPIT</span>
        </div>

        <div className="flex items-center gap-3">
          {executionStack.length > 0 && (
            <span className="flex items-center gap-1 text-amber-braun" title="Remaining portions of shrunk steps waiting in execution stack">
              <Layers className="w-3 h-3" />
              <span>STACK: +{executionStack.length}</span>
            </span>
          )}
          <span>VAULT: {vaultQueue.length} SEALED</span>
        </div>
      </div>

      {/* Center Anchor Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTask.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full bg-surface border border-surface-border rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Accent Glow Line at Top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-braun to-transparent opacity-60" />

          {/* Context Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-ink-muted mb-4">
            <span className="truncate max-w-[320px]">
              GOAL: {activeTask.parentTaskTitle}
            </span>
            <ChevronRight className="w-3 h-3 text-surface-border" />
            <span className="text-amber-braun font-medium">NEXT ACTION</span>
          </div>

          {/* Micro-Action Headline (The Rule of One centerpiece) */}
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink-primary leading-snug mb-5">
            {activeTask.microAction}
          </h2>

          {/* Psychological Why Banner */}
          <div className="p-3 bg-well border border-well-border rounded-lg text-xs font-mono text-ink-secondary flex items-start gap-2.5 mb-6">
            <ShieldCheck className="w-4 h-4 text-oscilloscope shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="text-ink-primary font-semibold">WHY THIS STEP: </span>
              {activeTask.psychologicalWhy}
            </div>
          </div>

          {/* Hardware Telemetry Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-6 border-b border-surface-border/50 text-xs font-mono">
            <div className="flex items-center gap-2">
              {/* Shrink Depth Pill */}
              <div
                className={`px-2.5 py-1 rounded border text-[11px] ${
                  shrinkColors[activeTask.shrinkDepth] || shrinkColors[0]
                }`}
              >
                SHRINK DEPTH: L{activeTask.shrinkDepth}
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-surface-border bg-well text-ink-primary">
                <Clock className="w-3.5 h-3.5 text-amber-braun" />
                <span>{timeFormatted}</span>
              </div>
            </div>

            {/* Total Cleared in Session */}
            {telemetry.completedCount > 0 && (
              <div className="text-ink-muted text-[11px]">
                {telemetry.completedCount} steps cleared this session
              </div>
            )}
          </div>

          {/* Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5">
            {/* Secondary Action: Shrink */}
            <button
              type="button"
              disabled={isShrinking || activeTask.shrinkDepth >= 3}
              onClick={() => triggerShrink()}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                activeTask.shrinkDepth >= 3
                  ? "opacity-40 border-surface-border text-ink-muted cursor-not-allowed"
                  : telemetry.resistanceAutoPrompted
                  ? "border-amber-braun bg-amber-glow text-amber-braun animate-pulse hover:bg-amber-braun hover:text-[#111]"
                  : "border-surface-border bg-surface-hover hover:border-amber-braun/50 text-ink-secondary hover:text-ink-primary"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-braun" />
              <span>{isShrinking ? "SLICING..." : "I'M RESISTING — SHRINK STEP"}</span>
              <kbd className="ml-1">Space</kbd>
            </button>

            {/* Primary Action: Complete */}
            <button
              type="button"
              onClick={() => completeActiveTask()}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg bg-ink-primary text-[#111110] font-mono font-bold text-xs hover:bg-white active:scale-[0.98] transition-all shadow-md"
            >
              <Check className="w-4 h-4 text-oscilloscope stroke-[3]" />
              <span>MARK COMPLETE</span>
              <kbd className="ml-1 bg-[#262522] text-[#F2F0EA] border-[#383731]">Enter</kbd>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
