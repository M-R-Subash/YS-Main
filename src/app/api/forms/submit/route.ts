import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formName, sourceUrl, payload } = body;

    if (!formName || !payload) {
      return NextResponse.json(
        { error: "Missing formName or payload" },
        { status: 400 }
      );
    }

    // Extract client IP and User Agent metadata
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || undefined;

    const submission = await prisma.formSubmission.create({
      data: {
        formName,
        sourceUrl: sourceUrl,
        payload,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}
