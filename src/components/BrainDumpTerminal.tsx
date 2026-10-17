"use client";

import React, { useRef } from "react";
import { useAnchorStore } from "@/store/useAnchorStore";
import { EnergyLevel } from "@/types/anchor.schema";
import { ArrowRight, Sparkles, BatteryCharging, BatteryMedium, BatteryWarning } from "lucide-react";

const DEMO_DUMP = `Need to debug the Next.js auth token refresh issue
Prepare linear algebra notes for tomorrow's exam
Reorganize desktop folders and clean keyboard
Write Devpost submission draft and record 1-minute demo`;

export const BrainDumpTerminal: React.FC = () => {
  const { rawDump, setRawDump, energyLevel, setEnergyLevel, submitBrainDump } =
    useAnchorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleQuickLoad = () => {
    setRawDump(DEMO_DUMP);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submitBrainDump();
    }
  };

  const energyOptions: { level: EnergyLevel; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      level: "FRIED",
      label: "FRIED",
      desc: "Nervous system drained. 2-min micro-starts only.",
      icon: <BatteryWarning className="w-3.5 h-3.5 text-rust" />,
    },
    {
      level: "STEADY",
      label: "STEADY",
      desc: "Moderate focus. 8-min structured chunks.",
      icon: <BatteryMedium className="w-3.5 h-3.5 text-amber-braun" />,
    },
    {
      level: "WIRED",
      label: "WIRED",
      desc: "High adrenaline. 15-min deep work sprint.",
      icon: <BatteryCharging className="w-3.5 h-3.5 text-oscilloscope" />,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Title & Philosophy Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-ink-primary mb-2">
          Dump the noise. Lock the rest away.
        </h1>
        <p className="text-sm text-ink-secondary max-w-md mx-auto">
          Unload chaotic tasks, unfinished loops, and overwhelm. Anchor will
          suppress the list and present exactly <span className="text-ink-primary font-semibold">one physical step</span>.
        </p>
      </div>

      {/* Main Terminal Input Card */}
      <div className="w-full bg-surface border border-surface-border rounded-xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Quick Fill Preset Toolbar */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-border/50 text-xs font-mono">
          <span className="text-ink-muted">INPUT BUFFER // UNSTRUCTURED</span>
          <button
            type="button"
            onClick={handleQuickLoad}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-hover hover:bg-[#252420] text-ink-secondary hover:text-amber-braun border border-surface-border transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-braun" />
            <span>Load Demo Overload Scenario</span>
          </button>
        </div>

        {/* Recessed Textarea Well */}
        <div className="bg-well border border-well-border rounded-lg p-3">
          <textarea
            ref={textareaRef}
            value={rawDump}
            onChange={(e) => setRawDump(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste your messy thoughts, tasks, bug notes, or deadlines here. Don't organize or categorize—just dump it all out..."
            rows={6}
            className="w-full bg-transparent text-ink-primary placeholder:text-ink-muted/50 text-sm focus:outline-none resize-none font-mono leading-relaxed"
          />
        </div>

        {/* 3-State Hardware Energy Selector */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-ink-muted uppercase">COGNITIVE ENERGY CALIBRATION:</span>
            <span className="text-amber-braun font-semibold">
              {energyOptions.find((o) => o.level === energyLevel)?.desc}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1 bg-well border border-well-border rounded-lg">
            {energyOptions.map((opt) => {
              const isSelected = energyLevel === opt.level;
              return (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => setEnergyLevel(opt.level)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-mono transition-all ${
                    isSelected
                      ? "bg-surface border border-surface-border text-ink-primary shadow-sm font-bold"
                      : "text-ink-secondary hover:text-ink-primary hover:bg-surface/50 border border-transparent"
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button & Shortcut Banner */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border/50">
          <div className="text-xs font-mono text-ink-muted flex items-center gap-1.5">
            <kbd>Ctrl</kbd>
            <span>+</span>
            <kbd>Enter</kbd>
            <span className="hidden sm:inline">to submit immediately</span>
          </div>

          <button
            type="button"
            disabled={!rawDump.trim()}
            onClick={() => submitBrainDump()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-braun text-[#111110] font-mono font-bold text-xs hover:bg-[#F2A644] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            <span>ANCHOR ME</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
