"use client";

import React from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { Volume2, VolumeX, RotateCcw, ShieldAlert, Zap } from "lucide-react";

export const HeaderTelemetry: React.FC = () => {
  const {
    fsmState,
    energyLevel,
    telemetry,
    soundMuted,
    toggleMute,
    resetSession,
  } = useAnchorStore();

  const isFocusMode = fsmState === "ANCHOR_LOCKED" || fsmState === "SHRINKING";

  return (
    <header className="w-full border-b border-surface-border bg-canvas/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between text-xs font-mono text-ink-secondary">
      {/* Brand & Mode Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-braun animate-pulse" />
          <span className="font-semibold text-ink-primary tracking-wider">
            ANCHOR
          </span>
        </div>
        <span className="hidden sm:inline text-surface-border">//</span>
        <span className="hidden sm:inline text-ink-muted uppercase">
          CIRCUIT-BREAKER
        </span>
      </div>

      {/* Center Hardware Telemetry */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Energy Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-surface-border bg-surface">
          <Zap className="w-3 h-3 text-amber-braun" />
          <span className="text-[10px] text-ink-muted">ENERGY:</span>
          <span className="text-ink-primary font-bold">{energyLevel}</span>
        </div>

        {/* Completed Counter */}
        {telemetry.completedCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-surface-border bg-surface text-oscilloscope">
            <span className="text-[10px] text-ink-muted">RESOLVED:</span>
            <span className="font-bold">+{telemetry.completedCount}</span>
          </div>
        )}

        {/* Tab Switches (Avoidance Telemetry) */}
        {telemetry.tabSwitchesDuringFocus > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-rust/40 bg-rust-glow text-rust animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            <span className="text-[10px]">TAB EXITS:</span>
            <span className="font-bold">{telemetry.tabSwitchesDuringFocus}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Audio & Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          title={soundMuted ? "Unmute hardware clicks" : "Mute hardware clicks"}
          className="p-1.5 rounded border border-surface-border bg-surface hover:bg-surface-hover text-ink-secondary hover:text-ink-primary transition-colors"
        >
          {soundMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rust" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-ink-secondary" />
          )}
        </button>

        {isFocusMode && (
          <button
            onClick={resetSession}
            title="Reset active session back to dump terminal"
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-surface-border bg-surface hover:bg-surface-hover text-ink-muted hover:text-ink-primary transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">RESET</span>
          </button>
        )}
      </div>
    </header>
  );
};
