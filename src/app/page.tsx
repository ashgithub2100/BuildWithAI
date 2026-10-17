"use client";

import React, { useEffect } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { HeaderTelemetry } from "@/components/HeaderTelemetry";
import { BrainDumpTerminal } from "@/components/BrainDumpTerminal";
import { ActiveAnchorStage } from "@/components/ActiveAnchorStage";
import { AvoidanceInterceptor } from "@/components/AvoidanceInterceptor";
import { VaultSealBar } from "@/components/VaultSealBar";
import { usePassiveResistance } from "@/hooks/usePassiveResistance";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { CheckCircle2, RotateCcw, Cpu } from "lucide-react";
import confetti from "canvas-confetti";

export default function HomePage() {
  const { fsmState, _hasHydrated, telemetry, resetSession } = useAnchorStore();

  // Attach passive resistance telemetry (tab-switches & 45s idle monitor)
  usePassiveResistance();

  // Attach global keyboard shortcuts ([Enter], [Space], [V], [Esc])
  useKeyboardShortcuts();

  // Fire celebratory confetti when session is marked complete
  useEffect(() => {
    if (fsmState === "SESSION_COMPLETE") {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E59838", "#4E9A6F", "#F2F0EA"],
        });
      } catch {
        // Ignore canvas-confetti error in headless environments
      }
    }
  }, [fsmState]);

  // SSR Hydration Guard
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center font-mono text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-braun animate-pulse" />
          <span>INITIALIZING ANCHOR STATE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-canvas">
      {/* Top Telemetry Header */}
      <HeaderTelemetry />

      {/* Main View Controller Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 z-10 w-full">
        {/* Avoidance Warning & Friction Interceptor (Displays during focus) */}
        <AvoidanceInterceptor />

        {/* State 1: DUMP MODE */}
        {fsmState === "DUMP_MODE" && <BrainDumpTerminal />}

        {/* State 2: CALIBRATING */}
        {fsmState === "CALIBRATING" && (
          <div className="w-full max-w-md mx-auto bg-surface border border-surface-border rounded-xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl">
            <Cpu className="w-8 h-8 text-amber-braun animate-spin" />
            <div>
              <h3 className="font-mono text-sm font-semibold text-ink-primary mb-1">
                DECONSTRUCTING COGNITIVE LOAD
              </h3>
              <p className="font-mono text-xs text-ink-muted">
                Filtering noise // Isolating single atomic starting step...
              </p>
            </div>
          </div>
        )}

        {/* State 3: ANCHOR LOCKED or SHRINKING */}
        {(fsmState === "ANCHOR_LOCKED" || fsmState === "SHRINKING") && (
          <ActiveAnchorStage />
        )}

        {/* State 4: SESSION COMPLETE */}
        {fsmState === "SESSION_COMPLETE" && (
          <div className="w-full max-w-md mx-auto bg-surface border border-surface-border rounded-xl p-8 text-center flex flex-col items-center gap-5 shadow-2xl">
            <div className="h-12 w-12 rounded-full bg-oscilloscope-glow border border-oscilloscope/30 flex items-center justify-center text-oscilloscope">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-medium tracking-tight text-ink-primary mb-1">
                Cognitive Freeze Defeated
              </h2>
              <p className="text-xs font-mono text-ink-secondary">
                You converted paralysis into forward momentum.
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 p-3 bg-well border border-well-border rounded-lg font-mono text-xs">
              <div className="text-left">
                <span className="text-ink-muted text-[10px] uppercase block">Steps Cleared</span>
                <span className="text-ink-primary font-bold text-base">
                  +{telemetry.completedCount}
                </span>
              </div>
              <div className="text-left">
                <span className="text-ink-muted text-[10px] uppercase block">Shrink Interventions</span>
                <span className="text-ink-primary font-bold text-base">
                  {telemetry.shrinksTriggered}
                </span>
              </div>
            </div>

            <button
              onClick={resetSession}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-braun text-[#111110] font-mono font-bold text-xs hover:bg-[#F2A644] active:scale-[0.98] transition-all shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>START FRESH DUMP</span>
            </button>
          </div>
        )}
      </main>

      {/* Sealed Vault Drawer Bar (Collapsible Pill at bottom) */}
      <VaultSealBar />

      {/* Footer System Status */}
      <footer className="w-full border-t border-surface-border/50 py-3 px-6 text-[11px] font-mono text-ink-muted flex items-center justify-between">
        <div>ANCHOR // PROOF OF CONCEPT</div>
        <div>ZERO CLUTTER • RULE OF ONE</div>
      </footer>
    </div>
  );
}
