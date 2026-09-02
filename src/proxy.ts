import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  // Use new URL(request.url) so Next-Url header during client-side navigation doesn't override current request URL
  const targetUrl = new URL(request.url);
  const pathname = targetUrl.pathname;
  const origin = targetUrl.origin;
  const href = targetUrl.href;

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
    // 2. Query active redirect rule for candidate source URLs
    const redirectRule = await prisma.redirection.findFirst({
      where: {
        sourceUrl: { in: validCandidates },
        status: "active",
      },
      select: {
        destinationUrl: true,
        statusCode: true,
      },
    });

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
