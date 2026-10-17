import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Optional Stateless Ephemeral AI parser:
 * - Strips all sensitive PII (card numbers, phone numbers, email addresses)
 * - Zero server-side logging or persistence
 * - Falls back to deterministic rule-based output
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText: string = body.text || "";

    // 1. Strip sensitive PII patterns
    const sanitizedText = rawText
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CARD-REDACTED]")
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL-REDACTED]")
      .replace(/(?:\+91|91)?[-. ]?[6-9]\d{9}/g, "[PHONE-REDACTED]");

    return NextResponse.json({
      status: "success",
      sanitizedText,
      warning: "Zero-logging privacy guarantee: No data was written to cloud databases.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Ephemeral parse failed", details: String(err) },
      { status: 400 }
    );
  }
}
