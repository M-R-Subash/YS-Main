import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

interface CachedRule {
  destinationUrl: string;
  statusCode: number;
}

// In-memory cache for active redirection rules (TTL: 60 seconds)
let redirectsCache: Map<string, CachedRule> | null = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000;

async function getActiveRedirectsMap(): Promise<Map<string, CachedRule>> {
  const now = Date.now();
  if (redirectsCache && now - lastCacheFetchTime < CACHE_TTL_MS) {
    return redirectsCache;
  }

  try {
    const rules = await prisma.redirection.findMany({
      where: { status: "active" },
      select: {
        sourceUrl: true,
        destinationUrl: true,
        statusCode: true,
      },
    });

    const newMap = new Map<string, CachedRule>();
    for (const rule of rules) {
      newMap.set(rule.sourceUrl, {
        destinationUrl: rule.destinationUrl,
        statusCode: rule.statusCode,
      });
    }

    redirectsCache = newMap;
    lastCacheFetchTime = now;
    return newMap;
  } catch (err) {
    console.error("Failed to load redirect cache:", err);
    return redirectsCache || new Map();
  }
}

export async function proxy(request: NextRequest) {
  const targetUrl = new URL(request.url);
  const pathname = targetUrl.pathname;
  const origin = targetUrl.origin;
  const href = targetUrl.href;

  // 0. Intercept legacy preview queries for non-blog pages only (blogs use isolated token/secret without cookies)
  if (
    !pathname.startsWith("/blogs") &&
    targetUrl.searchParams.get("preview") === "true" &&
    targetUrl.searchParams.has("secret") &&
    !pathname.startsWith("/api/draft")
  ) {
    const draftUrl = new URL("/api/draft", origin);
    draftUrl.searchParams.set("secret", targetUrl.searchParams.get("secret")!);
    draftUrl.searchParams.set("slug", pathname);
    return NextResponse.redirect(draftUrl);
  }

  // 1. Normalize pathname (strip trailing slash except for root "/")
  let normalizedPath = pathname.trim();
  if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
    normalizedPath = normalizedPath.slice(0, -1);
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
    // 2. Query active redirect rule from cached redirects map
    const activeRedirects = await getActiveRedirectsMap();
    let redirectRule: CachedRule | undefined;
    for (const candidate of validCandidates) {
      if (activeRedirects.has(candidate)) {
        redirectRule = activeRedirects.get(candidate);
        break;
      }
    }

    if (redirectRule) {
      const destination = redirectRule.destinationUrl.trim();
      const status = redirectRule.statusCode === 302 ? 302 : 301;

      // Self-loop protection: if destination is same as current requested path/URL
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
        const targetUrl = new URL(destination, request.url);
        return NextResponse.redirect(targetUrl, status);
      }
    }
  } catch (error) {
    // Log error and fall through to standard page resolution
    console.error("Middleware redirection error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, public static assets
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
