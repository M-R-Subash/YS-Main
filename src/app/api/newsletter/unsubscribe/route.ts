import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { clientConfig } from "@/lib/config/client";

// RFC 8058 One-Click Unsubscribe via HTTP POST (used by email clients like Gmail, Apple Mail)
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json({ error: "Missing unsubscribe token" }, { status: 400 });
  }

  try {
    // 1. Sync to admin.ys if available
    try {
      const adminUrl = clientConfig.app.apiUrl.replace(/\/$/, "");
      await fetch(`${adminUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      // Non-blocking fallback
    }

    // 2. Direct database update
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (subscriber) {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { status: "unsubscribed" },
      });
    }

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("[API:Main:Newsletter:Unsubscribe:POST] Error:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe" }, { status: 500 });
  }
}

// GET handler: Process unsubscribe and return a simple confirmation message
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  if (token) {
    try {
      const subscriber = await prisma.subscriber.findUnique({
        where: { unsubscribeToken: token },
      });

      if (subscriber) {
        await prisma.subscriber.update({
          where: { id: subscriber.id },
          data: { status: "unsubscribed" },
        });
      }
    } catch {
      // Non-blocking
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed | YS Innovations</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f17; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 10px; color: #fff; }
    p { font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }
    a { display: inline-block; background: #FFA918; color: #000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You have been unsubscribed</h1>
    <p>You will no longer receive newsletter updates from YS Innovations.</p>
    <a href="/">Return to Website</a>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
