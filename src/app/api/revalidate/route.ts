import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import { serverConfig } from "@/lib/config/server";

function isSecretValid(providedSecret: string | null | undefined): boolean {
  const expectedSecret = serverConfig.security.revalidationSecret;
  if (!providedSecret || !expectedSecret) return false;

  const bufProvided = Buffer.from(providedSecret);
  const bufExpected = Buffer.from(expectedSecret);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, path, type, tag } = body;

    if (!isSecretValid(secret)) {
      return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
    }

    if (tag) {
      (revalidateTag as any)(tag, "max");
    }

    if (path) {
      if (type === "layout") {
        revalidatePath(path, "layout");
        (revalidateTag as any)("global-header", "max");
        (revalidateTag as any)("global-footer", "max");
      } else {
        revalidatePath(path, "page");
      }

      // Automatically purge corresponding Redis caches
      const { getRedisClient } = await import("@/lib/redis");
      const redis = getRedisClient();
      if (redis) {
        if (path.startsWith("/blogs")) {
          try {
            const blogKeys = await redis.keys("cache:main:blogs:*");
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
  } catch (err: any) {
    return NextResponse.json(
      { message: "Revalidation error", error: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");
  const type = (searchParams.get("type") as "page" | "layout") || "page";

  const tag = searchParams.get("tag");

  if (!isSecretValid(secret)) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  if (tag) {
    (revalidateTag as any)(tag, "max");
  }

  if (path) {
    if (type === "layout") {
      revalidatePath(path, "layout");
      (revalidateTag as any)("global-header", "max");
      (revalidateTag as any)("global-footer", "max");
    } else {
      revalidatePath(path, "page");
    }

    // Automatically purge corresponding Redis caches
    const { getRedisClient } = await import("@/lib/redis");
    const redis = getRedisClient();
    if (redis) {
      if (path.startsWith("/blogs")) {
        try {
          const blogKeys = await redis.keys("cache:main:blogs:*");
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
    type,
    timestamp: Date.now(),
  });
}
