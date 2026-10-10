import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

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

    // Check if subscriber already exists to distinguish new vs returning vs already active
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    let subscriber;
    let message = "Thank you for subscribing to our newsletter!";

    if (!existing) {
      // 1. Brand new subscriber
      subscriber = await prisma.subscriber.create({
        data: {
          email,
          source,
          status: "active",
          resubscribeCount: 0,
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });
    } else if (existing.status === "unsubscribed") {
      // 2. Returning subscriber: previously unsubscribed, now opting back in!
      subscriber = await prisma.subscriber.update({
        where: { id: existing.id },
        data: {
          status: "active",
          source: source || existing.source,
          resubscribedAt: new Date(),
          resubscribeCount: { increment: 1 },
        },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });
      message = "Welcome back! You have successfully re-subscribed to our newsletter.";
    } else {
      // 3. Already active subscriber: do NOT double count return status
      subscriber = {
        id: existing.id,
        email: existing.email,
        status: existing.status,
      };
      message = "You are already subscribed to our newsletter!";
    }

    return NextResponse.json({
      success: true,
      message,
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
