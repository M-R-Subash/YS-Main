import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { clientConfig } from "@/lib/config/client";

const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  source: z.string().trim().max(50).optional().default("website"),
  honeypot: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req.headers);

    // Rate limit: Max 5 subscription attempts per hour per IP
    const limit = rateLimit("newsletter-subscribe", clientIp, {
      windowMs: 60 * 60 * 1000,
      max: 5,
    });

    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email, source, honeypot } = parsed.data;

    // Anti-bot trap: If honeypot is filled, silently return success
    if (honeypot) {
      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing to our newsletter!",
      });
    }

    // 1. Try to sync to admin.ys API if available
    try {
      const adminUrl = clientConfig.app.apiUrl.replace(/\/$/, "");
      const res = await fetch(`${adminUrl}/api/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": clientIp,
        },
        body: JSON.stringify({ email, source }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        // Also keep local database in sync
        try {
          await prisma.subscriber.upsert({
            where: { email },
            update: { status: "active", source },
            create: { email, source, status: "active" },
          });
        } catch {
          // Non-blocking
        }
        return NextResponse.json({
          success: true,
          message: data.message || "Thank you for subscribing to our newsletter!",
        });
      }
    } catch {
      // Admin API offline or unreachable; fall back to local database
    }

    // 2. Direct local database persistence
    const subscriber = await prisma.subscriber.upsert({
      where: { email },
      update: {
        status: "active",
        source,
      },
      create: {
        email,
        source,
        status: "active",
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
      },
    });
  } catch (error: any) {
    console.error("[API:Main:Newsletter:Subscribe] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your subscription." },
      { status: 500 }
    );
  }
}
