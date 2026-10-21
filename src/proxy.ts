import { NextResponse, type NextRequest } from "next/server";
import { getRedisClient } from "@/lib/redis";

interface CachedRule {
  destinationUrl: string;
  statusCode: number;
}

// Memory cache (L1) - Persists across warm Edge functions for instant lookup
const localRedirectCache = new Map<string, CachedRule>();

export async function proxy(request: NextRequest) {
  const targetUrl = new URL(request.url);
  const pathname = targetUrl.pathname;
  const origin = targetUrl.origin;
  const href = targetUrl.href;

  // 1. Normalize pathname (strip trailing slash except for root "/")
  let normalizedPath = pathname.trim();
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
  }

  // 2. Intercept authorized preview requests and rewrite internally
  const isPreview = targetUrl.searchParams.get("preview") === "true";
  const previewSecret = targetUrl.searchParams.get("secret");
  if (isPreview && previewSecret && normalizedPath !== "/preview") {
    const previewRewriteUrl = request.nextUrl.clone();
    previewRewriteUrl.pathname = "/preview";
    previewRewriteUrl.searchParams.set("path", normalizedPath);
    previewRewriteUrl.searchParams.set("secret", previewSecret);
    return NextResponse.rewrite(previewRewriteUrl);
  }

  const originNoSlash = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  const originWithSlash = `${originNoSlash}/`;
  const fullUrl = `${originNoSlash}${normalizedPath}`;
  const isRoot = normalizedPath === "/";

  // Build candidate source URLs specifically for THIS requested path
  const candidatesSet = new Set<string>([
    normalizedPath,
    fullUrl,
    href,
  ]);

  if (isRoot) {
    candidatesSet.add(originNoSlash);
    candidatesSet.add(originWithSlash);
  }

  const validCandidates = Array.from(candidatesSet).filter(Boolean);

  try {
    let redirectRule: CachedRule | undefined;

    // 3. Fast-path: Check Local Edge Memory (L1)
    for (const candidate of validCandidates) {
      if (localRedirectCache.has(candidate)) {
        redirectRule = localRedirectCache.get(candidate);
        break;
      }
    }

    // 4. Fallback: Check Upstash Redis Hash (L2) - 100% Edge-Compatible (No Prisma)
    if (!redirectRule) {
      const redis = getRedisClient();
      if (redis) {
        const redisResults = await redis.hmget<Record<string, string | CachedRule>>("main:redirects", ...validCandidates);
        if (redisResults && typeof redisResults === "object") {
          for (const candidate of validCandidates) {
            const rawVal = redisResults[candidate];
            if (rawVal) {
              if (typeof rawVal === "object" && (rawVal as CachedRule).destinationUrl) {
                redirectRule = rawVal as CachedRule;
              } else if (typeof rawVal === "string") {
                try {
                  redirectRule = JSON.parse(rawVal);
                } catch {
                  redirectRule = { destinationUrl: rawVal, statusCode: 301 };
                }
              }
              if (redirectRule) {
                localRedirectCache.set(candidate, redirectRule);
                break;
              }
            }
          }
        }
      }
    }

    // 5. Execute Redirect if matching rule found
    if (redirectRule) {
      const destination = redirectRule.destinationUrl.trim();
      const status = redirectRule.statusCode === 302 ? 302 : 301;

      // Self-loop protection
      if (
        destination === normalizedPath ||
        destination === href ||
        destination === fullUrl ||
        (isRoot && (destination === originNoSlash || destination === originWithSlash))
      ) {
        return NextResponse.next();
      }

      // Handle relative vs absolute destination URLs
      if (destination.startsWith("http://") || destination.startsWith("https://")) {
        return NextResponse.redirect(destination, status);
      } else {
        const targetObj = new URL(destination, request.url);
        return NextResponse.redirect(targetObj, status);
      }
    }
  } catch (error) {
    console.error("[Middleware:Proxy] Redirection error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
