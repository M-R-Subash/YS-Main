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
            select: { visitorHash: true, visitedPaths: true },
          });
          const isNewVisitorToday = !existingSession;
          const isNewVisitorToPage = !existingSession || !existingSession.visitedPaths.includes(path);

          // Parse device and referrer
          const device = parseDeviceType(userAgent);
          const source = parseReferrerSource(referrer, utmSource, host);
          const campaign = (utmCampaign || "").trim();

          // Determine resource type if not provided
          let resolvedType = resourceType;
          if (!resolvedType) {
            if (path === "/") resolvedType = "home";
            else if (path.startsWith("/blogs/") || path.startsWith("/blog/")) resolvedType = "blog";
            else resolvedType = "page";
          }

          // Execute independent upserts and increments concurrently in parallel
          const rollupTasks: Promise<any>[] = [
            // A. Session upsert
            prisma.analyticsVisitorSession.upsert({
              where: { visitorHash },
              create: {
                visitorHash,
                lastPath: path,
                visitedPaths: [path],
                isEngaged: false,
                lastSeenAt: new Date(),
              },
              update: {
                lastPath: path,
                ...(isNewVisitorToPage && {
                  visitedPaths: {
                    push: path,
                  },
                }),
                lastSeenAt: new Date(),
              },
            }),

            // B. Rollup: Daily Totals
            prisma.analyticsDaily.upsert({
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
            }),

            // C. Rollup: Page Views
            prisma.analyticsPage.upsert({
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
                uniqueVisitors: isNewVisitorToPage ? 1 : 0,
              },
              update: {
                views: { increment: 1 },
                ...(title && { title }),
                ...(isNewVisitorToPage && { uniqueVisitors: { increment: 1 } }),
                ...(resolvedType && { resourceType: resolvedType }),
                ...(resourceId && { resourceId }),
              },
            }),

            // D. Rollup: Referrer & Campaign
            prisma.analyticsReferrer.upsert({
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
            }),
          ];

          // E. Rollup: Country (if valid 2-letter code)
          if (countryCode && countryCode.length === 2) {
            rollupTasks.push(
              prisma.analyticsCountry.upsert({
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
              })
            );
          }

          // F. Increment Blog or Page viewCount
          if (resolvedType === "blog") {
            const blogSlug = path.replace(/^\/(blogs|blog)\//, "").replace(/\/$/, "");
            if (resourceId) {
              rollupTasks.push(
                prisma.blog.update({
                  where: { id: resourceId },
                  data: { viewCount: { increment: 1 } },
                }).catch(() => {})
              );
            } else if (blogSlug) {
              rollupTasks.push(
                prisma.blog.update({
                  where: { slug: blogSlug },
                  data: { viewCount: { increment: 1 } },
                }).catch(() => {})
              );
            }
          } else if (resolvedType === "page" && path !== "/") {
            const pageSlug = path.replace(/^\//, "").replace(/\/$/, "");
            if (resourceId) {
              rollupTasks.push(
                prisma.page.update({
                  where: { id: resourceId },
                  data: { viewCount: { increment: 1 } },
                }).catch(() => {})
              );
            } else if (pageSlug) {
              rollupTasks.push(
                prisma.page.update({
                  where: { slug: pageSlug },
                  data: { viewCount: { increment: 1 } },
                }).catch(() => {})
              );
            }
          }

          await Promise.allSettled(rollupTasks);
        } else if (type === "engage") {
          // Increment engagement if user wasn't engaged yet for this page
          const session = await prisma.analyticsVisitorSession.findUnique({
            where: { visitorHash },
            select: { isEngaged: true, engagedPaths: true },
          });

          const isFirstSiteEngagement = !session || !session.isEngaged;
          const isFirstPageEngagement = !session || !session.engagedPaths.includes(path);

          if (isFirstPageEngagement) {
            const engageTasks: Promise<any>[] = [
              prisma.analyticsVisitorSession.upsert({
                where: { visitorHash },
                create: {
                  visitorHash,
                  lastPath: path,
                  visitedPaths: [path],
                  engagedPaths: [path],
                  isEngaged: true,
                  lastSeenAt: new Date(),
                },
                update: {
                  isEngaged: true,
                  engagedPaths: {
                    push: path,
                  },
                  lastSeenAt: new Date(),
                },
              }),
              prisma.analyticsPage.upsert({
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
              }),
            ];

            // Increment site-wide engagement if this visitor hadn't engaged anywhere today yet
            if (isFirstSiteEngagement) {
              engageTasks.push(
                prisma.analyticsDaily.upsert({
                  where: { date: todayUtc },
                  create: {
                    date: todayUtc,
                    engagedVisits: 1,
                  },
                  update: {
                    engagedVisits: { increment: 1 },
                  },
                })
              );
            }

            await Promise.allSettled(engageTasks);
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
