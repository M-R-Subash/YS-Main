import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * RFC 8058 One-Click Unsubscribe via HTTP POST (used by email clients like Gmail, Apple Mail)
 * or browser form submissions
 */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();

  const acceptHeader = req.headers.get("accept") || "";
  const wantsJson = acceptHeader.includes("application/json") && !acceptHeader.includes("text/html");

  if (!token) {
    if (wantsJson) {
      return NextResponse.json({ error: "Missing unsubscribe token" }, { status: 400 });
    }
    return new Response(renderErrorHtml("The unsubscribe link is missing or invalid."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (subscriber && subscriber.status !== "unsubscribed") {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { status: "unsubscribed" },
      });
    }

    if (wantsJson) {
      return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
    }

    // Default: render the branded UI with auto-redirect for browsers
    return new Response(
      renderSuccessHtml({
        type: "unsubscribed",
        email: subscriber?.email || "",
        token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("[API:Main:Newsletter:Unsubscribe:POST] Error:", error);
    if (wantsJson) {
      return NextResponse.json({ error: "Failed to process unsubscribe" }, { status: 500 });
    }
    return new Response(renderErrorHtml("An unexpected error occurred while processing your request."), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

/**
 * GET handler: Direct 1-click unsubscribe or re-subscribe with branded UI and auto-redirect
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token")?.trim();
  const isResubscribe = searchParams.get("resubscribe") === "true" || searchParams.get("action") === "resubscribe";

  if (!token) {
    return new Response(renderErrorHtml("The unsubscribe link is missing or invalid."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return new Response(
        renderErrorHtml("We could not find an active subscriber matching this link."),
        {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    if (isResubscribe) {
      // Re-subscribe flow
      if (subscriber.status !== "active") {
        await prisma.subscriber.update({
          where: { id: subscriber.id },
          data: { status: "active" },
        });
      }

      return new Response(
        renderSuccessHtml({
          type: "resubscribed",
          email: subscriber.email,
          token,
        }),
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // Default: Unsubscribe flow
    if (subscriber.status !== "unsubscribed") {
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { status: "unsubscribed" },
      });
    }

    return new Response(
      renderSuccessHtml({
        type: "unsubscribed",
        email: subscriber.email,
        token,
      }),
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    console.error("[API:Main:Newsletter:Unsubscribe:GET] Error:", error);
    return new Response(renderErrorHtml("An unexpected error occurred while processing your request."), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

/**
 * Renders the modern dark-themed Success UI with countdown auto-redirect
 */
function renderSuccessHtml({
  type,
  email,
  token,
}: {
  type: "unsubscribed" | "resubscribed";
  email: string;
  token: string;
}): string {
  const isUnsubscribed = type === "unsubscribed";

  const title = isUnsubscribed ? "Successfully Unsubscribed" : "Welcome Back!";
  const message = isUnsubscribed
    ? `You have been removed from our newsletter list${email ? ` (<strong>${email}</strong>)` : ""}. We're sorry to see you go!`
    : `You have been successfully re-subscribed to YS Innovations newsletter updates${email ? ` as <strong>${email}</strong>` : ""}.`;

  const toggleActionHtml = isUnsubscribed
    ? `
      <div style="margin-top: 20px;">
        <a href="/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}&resubscribe=true" class="btn-secondary">
          Unsubscribed by mistake? Click to Re-subscribe
        </a>
      </div>
    `
    : `
      <div style="margin-top: 20px;">
        <a href="/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}" class="btn-secondary">
          Changed your mind? Click to Unsubscribe
        </a>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | YS Innovations</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      background-color: #05070c;
      color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-image: 
        radial-gradient(circle at 50% 10%, rgba(255, 169, 24, 0.08), transparent 45%),
        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05), transparent 40%);
    }
    .card {
      background: #0d121d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 44px 36px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: ${isUnsubscribed ? 'linear-gradient(90deg, #10b981, #f59e0b)' : 'linear-gradient(90deg, #f59e0b, #10b981)'};
    }
    .icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      font-size: 28px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 22px;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.2);
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 12px 0;
      color: #ffffff;
    }
    p.desc {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    p.desc strong {
      color: #f1f5f9;
      font-weight: 600;
    }
    .btn-secondary {
      display: inline-block;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 10px;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.2);
    }
    .redirect-box {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .redirect-text {
      color: #64748b;
      font-size: 12px;
      margin-bottom: 14px;
    }
    .redirect-text strong {
      color: #FFA918;
    }
    .progress-bar-container {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 18px;
    }
    .progress-bar {
      height: 100%;
      width: 100%;
      background: #FFA918;
      transform-origin: left;
      animation: countdownBar 5s linear forwards;
    }
    @keyframes countdownBar {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }
    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFA918;
      color: #0b0f17;
      font-weight: 700;
      font-size: 13px;
      text-decoration: none;
      padding: 10px 22px;
      border-radius: 10px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(255, 169, 24, 0.2);
    }
    .btn-home:hover {
      background: #ffb738;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(255, 169, 24, 0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-wrapper">✓</div>
    <h1>${title}</h1>
    <p class="desc">${message}</p>
    
    ${toggleActionHtml}

    <div class="redirect-box">
      <div class="progress-bar-container">
        <div class="progress-bar"></div>
      </div>
      <div class="redirect-text">
        Redirecting to homepage in <strong id="countdown">5</strong> seconds...
      </div>
      <a href="/" class="btn-home">
        <span>Return to Homepage Now</span>
        <span>&rarr;</span>
      </a>
    </div>
  </div>

  <script>
    (function() {
      var remaining = 5;
      var countdownEl = document.getElementById('countdown');
      var timer = setInterval(function() {
        remaining--;
        if (countdownEl) {
          countdownEl.textContent = remaining;
        }
        if (remaining <= 0) {
          clearInterval(timer);
          window.location.href = '/';
        }
      }, 1000);
    })();
  </script>
</body>
</html>`;
}

/**
 * Renders modern error HTML page
 */
function renderErrorHtml(errorMessage: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invalid Request | YS Innovations</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 20px; background-color: #05070c; color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center; min-height: 100vh;
    }
    .card {
      background: #0d121d; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px;
      padding: 40px 32px; max-width: 440px; width: 100%; text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .icon {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444; font-size: 26px; font-weight: 800;
      display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;
    }
    h1 { font-size: 20px; font-weight: 700; margin: 0 0 10px 0; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    a.btn {
      display: inline-block; background: #FFA918; color: #0b0f17; font-weight: 700;
      font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">!</div>
    <h1>Invalid Request</h1>
    <p>${errorMessage}</p>
    <a href="/" class="btn">Return to Homepage</a>
  </div>
</body>
</html>`;
}
