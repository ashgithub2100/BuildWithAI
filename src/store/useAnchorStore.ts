import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  EnergyLevel,
  FSMState,
  MicroTask,
  TelemetryData,
} from "@/types/anchor.schema";
import { soundEngine } from "@/lib/soundEngine";
import { parseBrainDumpHeuristic, shrinkTaskHeuristic } from "@/lib/heuristicEngine";

interface AnchorStoreState {
  fsmState: FSMState;
  rawDump: string;
  energyLevel: EnergyLevel;
  activeTask: MicroTask | null;
  executionStack: MicroTask[]; // LIFO
  vaultQueue: MicroTask[]; // FIFO
  avoidanceAlert: {
    detected: boolean;
    flaggedTaskTitle?: string;
    diagnosticMessage?: string;
  };
  telemetry: TelemetryData;
  isVaultOpen: boolean;
  soundMuted: boolean;
  _hasHydrated: boolean;

  // Actions
  setRawDump: (dump: string) => void;
  setEnergyLevel: (level: EnergyLevel) => void;
  submitBrainDump: (overrideDump?: string) => Promise<void>;
  triggerShrink: () => Promise<void>;
  completeActiveTask: () => void;
  dismissAvoidanceAlert: () => void;
  toggleVault: (open?: boolean) => void;
  recordTabSwitch: () => void;
  setResistanceAutoPrompted: (prompted: boolean) => void;
  resetSession: () => void;
  toggleMute: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

const initialTelemetry: TelemetryData = {
  completedCount: 0,
  shrinksTriggered: 0,
  tabSwitchesDuringFocus: 0,
  resistanceAutoPrompted: false,
  sessionStartTime: Date.now(),
};

export const useAnchorStore = create<AnchorStoreState>()(
  persist(
    (set, get) => ({
      fsmState: "DUMP_MODE",
      rawDump: "",
      energyLevel: "STEADY",
      activeTask: null,
      executionStack: [],
      vaultQueue: [],
      avoidanceAlert: { detected: false },
      telemetry: initialTelemetry,
      isVaultOpen: false,
      soundMuted: false,
      _hasHydrated: false,

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      setRawDump: (dump) => set({ rawDump: dump }),

      setEnergyLevel: (level) => {
        soundEngine.playRelayClick();
        set({ energyLevel: level });
      },

      toggleMute: () => {
        const next = !get().soundMuted;
        soundEngine.setMuted(next);
        set({ soundMuted: next });
      },

      submitBrainDump: async (overrideDump?: string) => {
        const dumpToUse = (overrideDump ?? get().rawDump).trim();
        if (!dumpToUse) return;

        soundEngine.playRelayClick();
        set({ fsmState: "CALIBRATING" });

        const energy = get().energyLevel;

        try {
          const res = await fetch("/api/deconstruct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawDump: dumpToUse, energyLevel: energy }),
          });

          if (!res.ok) throw new Error("Deconstruct API request failed");
          const data = await res.json();

          set({
            activeTask: data.primaryAnchor,
            vaultQueue: data.vaultQueue || [],
            executionStack: [],
            avoidanceAlert: data.avoidanceDetected || { detected: false },
            telemetry: {
              ...initialTelemetry,
              sessionStartTime: Date.now(),
            },
            fsmState: "ANCHOR_LOCKED",
            isVaultOpen: false,
          });
          soundEngine.playRelaySnap();
        } catch {
          // Fallback to local heuristic engine
          const fallback = parseBrainDumpHeuristic(dumpToUse, energy);
          set({
            activeTask: fallback.primaryAnchor,
            vaultQueue: fallback.vaultQueue,
            executionStack: [],
            avoidanceAlert: fallback.avoidanceDetected,
            telemetry: {
              ...initialTelemetry,
              sessionStartTime: Date.now(),
            },
            fsmState: "ANCHOR_LOCKED",
            isVaultOpen: false,
          });
          soundEngine.playRelaySnap();
        }
      },

      triggerShrink: async () => {
        const { activeTask, energyLevel } = get();
        if (!activeTask) return;

        if (activeTask.shrinkDepth >= 3) {
          // Already at maximum atomic granularity
          soundEngine.playRelayClick();
          return;
        }

        soundEngine.playShrinkDown();
        set({ fsmState: "SHRINKING" });

        try {
          const res = await fetch("/api/shrink", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentTask: activeTask, energyLevel }),
          });

          if (!res.ok) throw new Error("Shrink API request failed");
          const data = await res.json();

          set((state) => ({
            activeTask: data.immediateMicroStep,
            executionStack: [data.deferredRemainder, ...state.executionStack], // LIFO push
            telemetry: {
              ...state.telemetry,
              shrinksTriggered: state.telemetry.shrinksTriggered + 1,
              resistanceAutoPrompted: false,
            },
            fsmState: "ANCHOR_LOCKED",
          }));
        } catch {
          const fallback = shrinkTaskHeuristic(activeTask, energyLevel);
          set((state) => ({
            activeTask: fallback.immediateMicroStep,
            executionStack: [fallback.deferredRemainder, ...state.executionStack], // LIFO push
            telemetry: {
              ...state.telemetry,
              shrinksTriggered: state.telemetry.shrinksTriggered + 1,
              resistanceAutoPrompted: false,
            },
            fsmState: "ANCHOR_LOCKED",
          }));
        }
      },

      completeActiveTask: () => {
        const { executionStack, vaultQueue, telemetry } = get();
        soundEngine.playRelaySnap();

        const updatedCompletedCount = telemetry.completedCount + 1;

        // Selection priority:
        // 1. Pop top of executionStack (LIFO - continuation of parent shrunk task)
        // 2. Shift first item from vaultQueue (FIFO)
        // 3. Complete session
        if (executionStack.length > 0) {
          const [nextTask, ...remainingStack] = executionStack;
          set({
            activeTask: nextTask,
            executionStack: remainingStack,
            telemetry: {
              ...telemetry,
              completedCount: updatedCompletedCount,
              resistanceAutoPrompted: false,
            },
          });
        } else if (vaultQueue.length > 0) {
          const [nextTask, ...remainingQueue] = vaultQueue;
          set({
            activeTask: nextTask,
            vaultQueue: remainingQueue,
            telemetry: {
              ...telemetry,
              completedCount: updatedCompletedCount,
              resistanceAutoPrompted: false,
            },
          });
        } else {
          set({
            activeTask: null,
            fsmState: "SESSION_COMPLETE",
            telemetry: {
              ...telemetry,
              completedCount: updatedCompletedCount,
              resistanceAutoPrompted: false,
            },
          });
        }
      },

      dismissAvoidanceAlert: () => {
        set({ avoidanceAlert: { detected: false } });
      },

      toggleVault: (open) => {
        soundEngine.playRelayClick();
        set((state) => ({
          isVaultOpen: open !== undefined ? open : !state.isVaultOpen,
        }));
      },

      recordTabSwitch: () => {
        set((state) => {
          if (state.fsmState !== "ANCHOR_LOCKED") return state;
          return {
            telemetry: {
              ...state.telemetry,
              tabSwitchesDuringFocus: state.telemetry.tabSwitchesDuringFocus + 1,
              resistanceAutoPrompted: true,
            },
          };
        });
      },

      setResistanceAutoPrompted: (prompted) => {
        set((state) => ({
          telemetry: {
            ...state.telemetry,
            resistanceAutoPrompted: prompted,
          },
        }));
      },

      resetSession: () => {
        soundEngine.playRelayClick();
        set({
          fsmState: "DUMP_MODE",
          rawDump: "",
          activeTask: null,
          executionStack: [],
          vaultQueue: [],
          avoidanceAlert: { detected: false },
          telemetry: initialTelemetry,
          isVaultOpen: false,
        });
      },
    }),
    {
      name: "anchor-session-v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
