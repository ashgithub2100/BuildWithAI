import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DeconstructResponse,
  DeconstructResponseSchema,
  EnergyLevel,
  MicroTask,
  ShrinkResponse,
  ShrinkResponseSchema,
} from "@/types/anchor.schema";
import { parseBrainDumpHeuristic, shrinkTaskHeuristic } from "./heuristicEngine";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function deconstructBrainDump(
  rawDump: string,
  energyLevel: EnergyLevel
): Promise<DeconstructResponse> {
  if (!GEMINI_API_KEY) {
    // 0ms instant fallback to deterministic heuristic engine
    return parseBrainDumpHeuristic(rawDump, energyLevel);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const prompt = `You are Anchor, an anti-procrastination cognitive circuit-breaker.
The user is experiencing severe cognitive paralysis. Deconstruct this messy brain dump into a single primary micro-step and a vaulted backlog.

RAW DUMP:
"${rawDump}"

USER ENERGY LEVEL: ${energyLevel}
Rules based on energy:
- FRIED: Sliced into a ridiculously easy 2-minute physical micro-action (e.g. "Open auth.ts and type 1 comment on line 12").
- STEADY: 8-minute concrete initiation step.
- WIRED: 15-minute high-focus bottleneck sprint.

AVOIDANCE DETECTION:
Look for "fake productivity" comfort tasks (cleaning, reorganizing, wallpapers, tutorials, file organizing) when real work is present. If found, set avoidanceDetected.detected = true, explain why in diagnosticMessage, and put that task at the VERY BOTTOM of vaultQueue.

OUTPUT SCHEMA (Must match JSON strictly):
{
  "primaryAnchor": {
    "id": "task_1",
    "parentTaskTitle": "string",
    "microAction": "string (max 14 words, MUST start with physical verb: Open, Type, Create, Delete)",
    "psychologicalWhy": "string (1 candid grounding sentence explaining why this breaks inertia)",
    "estimatedMinutes": number (1 to 20),
    "shrinkDepth": 0,
    "isAvoidanceTask": false,
    "createdAt": ${Date.now()}
  },
  "vaultQueue": [
    {
      "id": "task_n",
      "parentTaskTitle": "string",
      "microAction": "string",
      "psychologicalWhy": "string",
      "estimatedMinutes": number,
      "shrinkDepth": 0,
      "isAvoidanceTask": boolean,
      "avoidanceReason": "string (optional)",
      "createdAt": ${Date.now()}
    }
  ],
  "avoidanceDetected": {
    "detected": boolean,
    "flaggedTaskTitle": "string (optional)",
    "diagnosticMessage": "string (optional)"
  }
}`;

    const result = await model.generateContent(prompt);
    clearTimeout(timeoutId);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return DeconstructResponseSchema.parse(parsed);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("LLM deconstruction failed or timed out. Engaging deterministic heuristic fallback:", error);
    return parseBrainDumpHeuristic(rawDump, energyLevel);
  }
}

export async function shrinkActiveTask(
  currentTask: MicroTask,
  energyLevel: EnergyLevel
): Promise<ShrinkResponse> {
  if (!GEMINI_API_KEY) {
    return shrinkTaskHeuristic(currentTask, energyLevel);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const nextDepth = Math.min(3, currentTask.shrinkDepth + 1);

    const prompt = `You are Anchor's task-shrinking circuit breaker.
The user is experiencing nervous-system resistance to this task:
Current Micro-Action: "${currentTask.microAction}"
Original Goal: "${currentTask.parentTaskTitle}"
Current Depth: L${currentTask.shrinkDepth} -> Next Depth: L${nextDepth}

RULES:
Cut the friction in half! Turn this into an embarrassingly small, 60-second or 15-second physical initiation action.
The remainder of the step that was split off will become deferredRemainder and pushed onto the execution stack.

OUTPUT SCHEMA (Must match JSON strictly):
{
  "immediateMicroStep": {
    "id": "task_shrink_${Date.now()}",
    "parentTaskTitle": "${currentTask.parentTaskTitle.replace(/"/g, '\\"')}",
    "microAction": "string (max 10 words, absurdly easy physical action taking under 60 seconds)",
    "psychologicalWhy": "string (1 grounding sentence)",
    "estimatedMinutes": 1,
    "shrinkDepth": ${nextDepth},
    "isAvoidanceTask": false,
    "createdAt": ${Date.now()}
  },
  "deferredRemainder": {
    "id": "task_deferred_${Date.now()}",
    "parentTaskTitle": "${currentTask.parentTaskTitle.replace(/"/g, '\\"')}",
    "microAction": "string (the continuation step that was split off)",
    "psychologicalWhy": "Pushed to execution stack behind the atomic step",
    "estimatedMinutes": ${Math.max(2, currentTask.estimatedMinutes - 1)},
    "shrinkDepth": ${currentTask.shrinkDepth},
    "isAvoidanceTask": false,
    "createdAt": ${Date.now() + 1}
  }
}`;

    const result = await model.generateContent(prompt);
    clearTimeout(timeoutId);

    const text = result.response.text();
    const parsed = JSON.parse(text);
    return ShrinkResponseSchema.parse(parsed);
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("LLM shrink failed or timed out. Engaging deterministic heuristic fallback:", error);
    return shrinkTaskHeuristic(currentTask, energyLevel);
  }
}
