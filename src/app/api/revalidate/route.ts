import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { serverConfig } from "@/lib/config/server";
import { getRedisClient } from "@/lib/redis";

function isSecretValid(providedSecret: string | null | undefined): boolean {
  const expectedSecret = serverConfig.security.revalidationSecret;
  if (!providedSecret || !expectedSecret) return false;

  const bufProvided = Buffer.from(providedSecret);
  const bufExpected = Buffer.from(expectedSecret);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  // Elite security: Prevents string comparison timing attacks
  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

// Extracted shared logic for both POST and GET revalidation triggers
async function handleRevalidation(data: {
  secret?: string | null;
  path?: string | null;
  type?: string | null;
  tag?: string | null;
}) {
  const { secret, path, type, tag } = data;

  if (!isSecretValid(secret)) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  // Next.js 16 tag revalidation requires profile parameter (e.g. "max")
  if (tag) {
    revalidateTag(tag, "max");
  }

  if (path) {
    if (type === "layout") {
      revalidatePath(path, "layout");
      revalidateTag("global-header", "max");
      revalidateTag("global-footer", "max");
    } else {
      revalidatePath(path, "page");
    }

    // Automatically purge corresponding Redis caches
    const redis = getRedisClient();
    if (redis) {
      if (path.startsWith("/blogs")) {
        try {
          let cursor = "0";
          const blogKeys: string[] = [];
          do {
            const [nextCursor, matched] = await redis.scan(cursor, {
              match: "cache:main:blogs:*",
              count: 100,
            });
            cursor = nextCursor;
            blogKeys.push(...matched);
          } while (cursor !== "0" && blogKeys.length < 500);

          if (blogKeys.length > 0) {
            await redis.del(...blogKeys);
          }
          await redis.del("cache:main:categories");
        } catch (e) {
          console.warn("[Revalidate:Redis] Error purging blog cache:", e);
        }
      }

      if (path.includes("redirect")) {
        try {
          // Purges both the Redis Hash and fallback cache
          await redis.del("main:redirects");
          await redis.del("cache:main:redirects");
        } catch (e) {
          console.warn("[Revalidate:Redis] Error purging redirects cache:", e);
        }
      }
    }
  }

  return NextResponse.json({
    revalidated: true,
    path: path || null,
    tag: tag || null,
    type: type || "page",
    timestamp: Date.now(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    return await handleRevalidation(body);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Revalidation error", error: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = {
      secret: searchParams.get("secret"),
      path: searchParams.get("path"),
      type: searchParams.get("type") || "page",
      tag: searchParams.get("tag"),
    };

    return await handleRevalidation(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Revalidation error", error: err?.message },
      { status: 500 }
    );
  }
}
