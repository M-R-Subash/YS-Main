import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limiting (max 8 submissions per 2 minutes per IP)
    const clientIp = getClientIp(request.headers);
    const limitResult = rateLimit("forms-submit", clientIp, {
      windowMs: 2 * 60 * 1000,
      max: 8,
    });

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a couple minutes before submitting again." },
        { 
          status: 429,
          headers: { "Retry-After": "120" },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { formName, sourceUrl, payload, honeypot, website } = body;

    // 2. Anti-Bot Honeypot Defense
    if (honeypot || website || payload?.honeypot || payload?.website) {
      return NextResponse.json(
        { success: true, message: "Form submitted successfully" },
        { status: 200 }
      );
    }

    // 3. Validation
    if (!formName || !payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Missing required form data" },
        { status: 400 }
      );
    }

    const cleanFormName = String(formName).trim().slice(0, 100);
    const cleanSourceUrl = sourceUrl ? String(sourceUrl).trim().slice(0, 250) : null;

    // 4. Payload Size Limit Guard (prevent DoS via enormous payloads)
    const payloadString = JSON.stringify(payload);
    if (payloadString.length > 50000) {
      return NextResponse.json(
        { error: "Submission payload exceeds maximum allowed size" },
        { status: 413 }
      );
    }

    // Extract metadata
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || undefined;

    // 5. Store Form Submission
    await prisma.formSubmission.create({
      data: {
        formName: cleanFormName,
        sourceUrl: cleanSourceUrl,
        payload,
        ipAddress: clientIp,
        userAgent,
      },
    });

    // 6. Return minimal, sanitized success response (no internal IDs or client IP reflection)
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
    });
  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form. Please try again later." },
      { status: 500 }
    );
  }
}
