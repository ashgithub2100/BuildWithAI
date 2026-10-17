import { NextRequest, NextResponse } from "next/server";
import { DeconstructRequestSchema } from "@/types/anchor.schema";
import { deconstructBrainDump } from "@/lib/llmClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DeconstructRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { rawDump, energyLevel } = validated.data;
    const response = await deconstructBrainDump(rawDump, energyLevel);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/deconstruct:", error);
    return NextResponse.json(
      { error: "Failed to deconstruct brain dump" },
      { status: 500 }
    );
  }
}
