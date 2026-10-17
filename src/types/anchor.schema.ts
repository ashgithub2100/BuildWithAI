import { z } from "zod";

export const EnergyLevelSchema = z.enum(["FRIED", "STEADY", "WIRED"]);
export type EnergyLevel = z.infer<typeof EnergyLevelSchema>;

export const FSMStateSchema = z.enum([
  "DUMP_MODE",
  "CALIBRATING",
  "ANCHOR_LOCKED",
  "SHRINKING",
  "SESSION_COMPLETE",
]);
export type FSMState = z.infer<typeof FSMStateSchema>;

export const MicroTaskSchema = z.object({
  id: z.string(),
  parentTaskTitle: z.string(),
  microAction: z.string(),
  psychologicalWhy: z.string(),
  estimatedMinutes: z.number().min(1).max(20),
  shrinkDepth: z.number().int().min(0).max(3),
  isAvoidanceTask: z.boolean(),
  avoidanceReason: z.string().optional(),
  createdAt: z.number(),
});
export type MicroTask = z.infer<typeof MicroTaskSchema>;

export const DeconstructRequestSchema = z.object({
  rawDump: z.string().min(3).max(4000),
  energyLevel: EnergyLevelSchema,
});
export type DeconstructRequest = z.infer<typeof DeconstructRequestSchema>;

export const DeconstructResponseSchema = z.object({
  primaryAnchor: MicroTaskSchema,
  vaultQueue: z.array(MicroTaskSchema),
  avoidanceDetected: z.object({
    detected: z.boolean(),
    flaggedTaskTitle: z.string().optional(),
    diagnosticMessage: z.string().optional(),
  }),
});
export type DeconstructResponse = z.infer<typeof DeconstructResponseSchema>;

export const ShrinkRequestSchema = z.object({
  currentTask: MicroTaskSchema,
  energyLevel: EnergyLevelSchema,
});
export type ShrinkRequest = z.infer<typeof ShrinkRequestSchema>;

export const ShrinkResponseSchema = z.object({
  immediateMicroStep: MicroTaskSchema,
  deferredRemainder: MicroTaskSchema,
});
export type ShrinkResponse = z.infer<typeof ShrinkResponseSchema>;

export interface TelemetryData {
  completedCount: number;
  shrinksTriggered: number;
  tabSwitchesDuringFocus: number;
  resistanceAutoPrompted: boolean;
  sessionStartTime: number;
}
