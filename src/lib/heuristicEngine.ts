import { EnergyLevel, MicroTask, DeconstructResponse, ShrinkResponse } from "../types/anchor.schema";

const AVOIDANCE_REGEX = /\b(clean|organize|reorganize|folder|desk|room|wallpaper|theme|config|watch tutorial|read about|check email|sort|notion|color|format)\b/i;

function generateId(): string {
  return "task_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
}

function cleanTaskText(text: string): string {
  return text
    .replace(/^[-*•\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseBrainDumpHeuristic(rawDump: string, energyLevel: EnergyLevel): DeconstructResponse {
  // 1. Split raw text by newlines, semicolons, or conjunctions
  const rawLines = rawDump
    .split(/\r?\n|;|(?:\b(?:and then|also|plus|need to|have to|must)\b)/i)
    .map(cleanTaskText)
    .filter((line) => line.length >= 3);

  const fallbackTasks = rawLines.length > 0 ? rawLines : [rawDump.trim()];

  // 2. Classify tasks and check for avoidance
  let avoidanceDetected = {
    detected: false,
    flaggedTaskTitle: undefined as string | undefined,
    diagnosticMessage: undefined as string | undefined,
  };

  const highLeverageTasks: MicroTask[] = [];
  const avoidanceTasks: MicroTask[] = [];

  fallbackTasks.forEach((originalTask) => {
    const isAvoidance = AVOIDANCE_REGEX.test(originalTask);
    const id = generateId();

    let estimatedMinutes = 5;
    let microAction = "";
    let psychologicalWhy = "";

    if (energyLevel === "FRIED") {
      estimatedMinutes = 2;
      microAction = `Open notes and write 3-bullet outline for ${originalTask.slice(0, 40)}`;
      psychologicalWhy = "Low friction 2-minute physical start to break cognitive freeze without nervous system strain.";
    } else if (energyLevel === "WIRED") {
      estimatedMinutes = 15;
      microAction = `Execute a 15-minute deep sprint on core bottleneck of ${originalTask.slice(0, 40)}`;
      psychologicalWhy = "Channeling peak arousal directly into the hardest resistance point.";
    } else {
      // STEADY
      estimatedMinutes = 8;
      microAction = `Create primary file/workspace for ${originalTask.slice(0, 40)} and start first block`;
      psychologicalWhy = "Steady incremental execution to anchor momentum.";
    }

    const taskObj: MicroTask = {
      id,
      parentTaskTitle: originalTask,
      microAction,
      psychologicalWhy,
      estimatedMinutes,
      shrinkDepth: 0,
      isAvoidanceTask: isAvoidance,
      avoidanceReason: isAvoidance
        ? "Classified as Productive Avoidance (low-risk comfort task used to delay high-leverage execution). Quarantined at the bottom of the Vault."
        : undefined,
      createdAt: Date.now(),
    };

    if (isAvoidance) {
      avoidanceTasks.push(taskObj);
    } else {
      highLeverageTasks.push(taskObj);
    }
  });

  // If avoidance was detected alongside real tasks, flag it
  if (avoidanceTasks.length > 0) {
    const firstAvoidance = avoidanceTasks[0];
    avoidanceDetected = {
      detected: true,
      flaggedTaskTitle: firstAvoidance.parentTaskTitle,
      diagnosticMessage: `"${firstAvoidance.parentTaskTitle}" is comfort-zone avoidance. Locked at the bottom of the Vault until high-leverage build work is underway.`,
    };
  }

  // Combine tasks: high-leverage first, avoidance quarantined to the bottom
  const allOrdered = [...highLeverageTasks, ...avoidanceTasks];
  if (allOrdered.length === 0) {
    allOrdered.push({
      id: generateId(),
      parentTaskTitle: rawDump.trim(),
      microAction: `Open your workspace and write 1 line for ${rawDump.slice(0, 30)}`,
      psychologicalWhy: "Microscopic physical action to establish agency.",
      estimatedMinutes: 2,
      shrinkDepth: 0,
      isAvoidanceTask: false,
      createdAt: Date.now(),
    });
  }

  const primaryAnchor = allOrdered[0];
  const vaultQueue = allOrdered.slice(1);

  return {
    primaryAnchor,
    vaultQueue,
    avoidanceDetected,
  };
}

export function shrinkTaskHeuristic(currentTask: MicroTask, _energyLevel: EnergyLevel): ShrinkResponse {
  const nextDepth = Math.min(3, currentTask.shrinkDepth + 1) as 0 | 1 | 2 | 3;
  const parent = currentTask.parentTaskTitle;

  let immediateAction = "";
  let immediateMinutes = 1;
  let why = "";

  if (nextDepth === 1) {
    immediateMinutes = 2;
    immediateAction = `Open target file or page for ${parent.slice(0, 35)} and type a single TODO`;
    why = "Lowering cognitive barrier by defining the exact entry line.";
  } else if (nextDepth === 2) {
    immediateMinutes = 1;
    immediateAction = `Locate the exact screen or file for ${parent.slice(0, 35)} and place cursor on line 1`;
    why = "Reducing execution to a 60-second physical setup action.";
  } else {
    // Depth 3
    immediateMinutes = 1;
    immediateAction = `Take one deep breath, close other tabs, and type first 3 words for ${parent.slice(0, 30)}`;
    why = "Atomic 15-second initiation: friction is reduced to absolute zero.";
  }

  const immediateMicroStep: MicroTask = {
    id: generateId(),
    parentTaskTitle: currentTask.parentTaskTitle,
    microAction: immediateAction,
    psychologicalWhy: why,
    estimatedMinutes: immediateMinutes,
    shrinkDepth: nextDepth,
    isAvoidanceTask: false,
    createdAt: Date.now(),
  };

  const deferredRemainder: MicroTask = {
    id: generateId(),
    parentTaskTitle: currentTask.parentTaskTitle,
    microAction: `Continue and finish the next substantive block of ${parent.slice(0, 40)}`,
    psychologicalWhy: "Pushed to the top of execution stack to re-engage once initiation friction is broken.",
    estimatedMinutes: Math.max(2, currentTask.estimatedMinutes - immediateMinutes),
    shrinkDepth: Math.max(0, currentTask.shrinkDepth),
    isAvoidanceTask: false,
    createdAt: Date.now() + 1,
  };

  return {
    immediateMicroStep,
    deferredRemainder,
  };
}
