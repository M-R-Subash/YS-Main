import { after } from "next/server";
import prisma from "@/lib/prisma";
import {
  getUtcTodayDate,
  normalizePath,
  isBot,
  parseDeviceType,
  parseReferrerSource,
  generateVisitorHash,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const userAgent = req.headers.get("user-agent") || "";

    // 1. Bot & Crawler Exclusion
    if (isBot(userAgent)) {
      return new Response(null, { status: 204 });
    }

    // 2. Ignore Admin & Preview Mode
    const cookieHeader = req.headers.get("cookie") || "";
    if (
      cookieHeader.includes("next-auth.session-token") ||
      cookieHeader.includes("__Secure-next-auth.session-token")
    ) {
      return new Response(null, { status: 204 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      type = "pageview",
      path: rawPath,
      title,
      referrer,
      utmSource,
      utmCampaign,
      resourceType,
      resourceId,
    } = body;

    const path = normalizePath(rawPath);

    // Skip internal admin/preview URLs
    if (path.startsWith("/api/") || path.startsWith("/preview") || path.startsWith("/_next")) {
      return new Response(null, { status: 204 });
    }

    // Extract Client IP (first IP if multi-hop proxy)
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

    // Extract Country (Vercel or Cloudflare header)
    const countryCode = (
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "UNKNOWN"
    ).toUpperCase();

    const todayUtc = getUtcTodayDate();
    const visitorHash = generateVisitorHash(ip, userAgent, todayUtc);
    const host = req.headers.get("host") || undefined;

    // 3. Respond with 204 No Content immediately in <10ms
    const response = new Response(null, { status: 204 });

    // 4. Execute atomic DB writes asynchronously via Next.js after()
    after(async () => {
      try {
        if (type === "pageview") {
          // Check if visitor has been seen today
          const existingSession = await prisma.analyticsVisitorSession.findUnique({
            where: { visitorHash },
            select: { visitorHash: true },
          });
          const isNewVisitorToday = !existingSession;

          // Upsert visitor session
          await prisma.analyticsVisitorSession.upsert({
            where: { visitorHash },
            create: {
              visitorHash,
              lastPath: path,
              isEngaged: false,
              lastSeenAt: new Date(),
            },
            update: {
              lastPath: path,
              lastSeenAt: new Date(),
            },
          });

          // Parse device and referrer
          const device = parseDeviceType(userAgent);
          const source = parseReferrerSource(referrer, utmSource, host);
          const campaign = (utmCampaign || "").trim();

          // A. Rollup: Daily Totals
          await prisma.analyticsDaily.upsert({
            where: { date: todayUtc },
            create: {
              date: todayUtc,
              totalViews: 1,
              uniqueVisitors: isNewVisitorToday ? 1 : 0,
              desktopViews: device === "desktop" ? 1 : 0,
              mobileViews: device === "mobile" ? 1 : 0,
              tabletViews: device === "tablet" ? 1 : 0,
            },
            update: {
              totalViews: { increment: 1 },
              ...(isNewVisitorToday && { uniqueVisitors: { increment: 1 } }),
              ...(device === "desktop" && { desktopViews: { increment: 1 } }),
              ...(device === "mobile" && { mobileViews: { increment: 1 } }),
              ...(device === "tablet" && { tabletViews: { increment: 1 } }),
            },
          });

          // Determine resource type if not provided
          let resolvedType = resourceType;
          if (!resolvedType) {
            if (path === "/") resolvedType = "home";
            else if (path.startsWith("/blogs/") || path.startsWith("/blog/")) resolvedType = "blog";
            else resolvedType = "page";
          }

          // B. Rollup: Page Views
          await prisma.analyticsPage.upsert({
            where: {
              date_path: { date: todayUtc, path },
            },
            create: {
              date: todayUtc,
              path,
              title: title || path,
              resourceType: resolvedType,
              resourceId: resourceId || undefined,
              views: 1,
              uniqueVisitors: isNewVisitorToday ? 1 : 0,
            },
            update: {
              views: { increment: 1 },
              ...(title && { title }),
              ...(isNewVisitorToday && { uniqueVisitors: { increment: 1 } }),
              ...(resolvedType && { resourceType: resolvedType }),
              ...(resourceId && { resourceId }),
            },
          });

          // C. Rollup: Referrer & Campaign
          await prisma.analyticsReferrer.upsert({
            where: {
              date_source_utmCampaign: {
                date: todayUtc,
                source,
                utmCampaign: campaign,
              },
            },
            create: {
              date: todayUtc,
              source,
              utmCampaign: campaign,
              views: 1,
            },
            update: {
              views: { increment: 1 },
            },
          });

          // D. Rollup: Country
          if (countryCode && countryCode.length === 2) {
            await prisma.analyticsCountry.upsert({
              where: {
                date_countryCode: {
                  date: todayUtc,
                  countryCode,
                },
              },
              create: {
                date: todayUtc,
                countryCode,
                views: 1,
              },
              update: {
                views: { increment: 1 },
              },
            });
          }

          // E. Increment Blog or Page viewCount
          if (resolvedType === "blog") {
            const blogSlug = path.replace(/^\/(blogs|blog)\//, "").replace(/\/$/, "");
            if (resourceId) {
              await prisma.blog.update({
                where: { id: resourceId },
                data: { viewCount: { increment: 1 } },
              }).catch(() => {});
            } else if (blogSlug) {
              await prisma.blog.update({
                where: { slug: blogSlug },
                data: { viewCount: { increment: 1 } },
              }).catch(() => {});
            }
          } else if (resolvedType === "page" && path !== "/") {
            const pageSlug = path.replace(/^\//, "").replace(/\/$/, "");
            if (resourceId) {
              await prisma.page.update({
                where: { id: resourceId },
                data: { viewCount: { increment: 1 } },
              }).catch(() => {});
            } else if (pageSlug) {
              await prisma.page.update({
                where: { slug: pageSlug },
                data: { viewCount: { increment: 1 } },
              }).catch(() => {});
            }
          }
        } else if (type === "engage") {
          // Increment engagement if user wasn't engaged yet
          const session = await prisma.analyticsVisitorSession.findUnique({
            where: { visitorHash },
            select: { isEngaged: true },
          });

          if (!session || !session.isEngaged) {
            await prisma.analyticsVisitorSession.upsert({
              where: { visitorHash },
              create: {
                visitorHash,
                lastPath: path,
                isEngaged: true,
                lastSeenAt: new Date(),
              },
              update: {
                isEngaged: true,
                lastSeenAt: new Date(),
              },
            });

            await prisma.analyticsDaily.upsert({
              where: { date: todayUtc },
              create: {
                date: todayUtc,
                engagedVisits: 1,
              },
              update: {
                engagedVisits: { increment: 1 },
              },
            });

            await prisma.analyticsPage.upsert({
              where: {
                date_path: { date: todayUtc, path },
              },
              create: {
                date: todayUtc,
                path,
                engagedVisits: 1,
              },
              update: {
                engagedVisits: { increment: 1 },
              },
            });
          }
        }

        // F. Auto-Pruning (prune sessions older than 48 hours with 2% probability)
        if (Math.random() < 0.02) {
          const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000);
          await prisma.analyticsVisitorSession.deleteMany({
            where: { lastSeenAt: { lt: twoDaysAgo } },
          }).catch(() => {});
        }
      } catch (err) {
        console.error("[ANALYTICS_TRACKING_ERROR]", err);
      }
    });

    return response;
  } catch (error) {
    console.error("[ANALYTICS_ROUTE_ERROR]", error);
    return new Response(null, { status: 204 });
  }
}
