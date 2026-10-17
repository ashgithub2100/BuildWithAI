import { NextRequest, NextResponse } from "next/server";
import { ShrinkRequestSchema } from "@/types/anchor.schema";
import { shrinkActiveTask } from "@/lib/llmClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ShrinkRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { currentTask, energyLevel } = validated.data;
    const response = await shrinkActiveTask(currentTask, energyLevel);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/shrink:", error);
    return NextResponse.json(
      { error: "Failed to shrink task" },
      { status: 500 }
    );
  }
}
