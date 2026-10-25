"use server";

import prisma from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

export async function getBlogs({ page = 1, limit = 15, category = "" }) {
  const cacheKey = `cache:main:blogs:${category || "all"}:${page}:${limit}`;
  const redis = getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get<{ blogs: any[]; total: number; hasMore: boolean }>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.warn("[Blogs:Redis] Failed to read from cache:", err);
    }
  }

  const skip = (page - 1) * limit;
  const now = new Date();
  const where: any = {
    isTrashed: false,
    OR: [
      { status: "published" },
      { status: "scheduled", scheduledAt: { lte: now } },
    ],
  };
  
  if (category && category !== "All") {
    where.categories = {
      has: category,
    };
  }

  const [rawBlogs, total] = await Promise.all([
    prisma.blog.findMany({  
      where,
      skip,
      take: limit,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        excerpt: true,
        publishedAt: true,
        readingTime: true,
        categories: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            authorRole: true,
            description: true,
          },
        },
        seo: {
          select: {
            metaDesc: true,
            authorName: true,
          },
        },
      },
    }),
    prisma.blog.count({ where }),
  ]);

  // Fix: Ensure publishedAt is consistently serialized to an ISO string
  // Prevents React Server Components / Client boundary hydration crashes between Date objects and cached strings
  const blogs = rawBlogs.map((blog) => ({
    ...blog,
    publishedAt: blog.publishedAt
      ? typeof blog.publishedAt === "string"
        ? blog.publishedAt
        : blog.publishedAt.toISOString()
      : null,
  }));

  const result = { blogs, total, hasMore: skip + blogs.length < total };

  if (redis) {
    // 60-second TTL ensures live updates appear quickly while still shielding PostgreSQL from traffic spikes
    redis.set(cacheKey, result, { ex: 60 }).catch((err) => {
      console.warn("[Blogs:Redis] Failed to write cache:", err);
    });
  }

  return result;
}

export async function getCategories(): Promise<string[]> {
  const cacheKey = "cache:main:categories";
  const redis = getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.warn("[Categories:Redis] Failed to read from cache:", err);
    }
  }

  let categories: string[] = [];
  try {
    // 1. Relational query: utilizes database indexes, ultra-fast, zero in-memory overhead
    const catRecords = await prisma.category.findMany({
      where: {
        blogs: {
          some: {
            status: "published",
            isTrashed: false,
          },
        },
      },
      select: { name: true },
      orderBy: { name: "asc" },
    });

    if (catRecords.length > 0) {
      categories = catRecords.map((c) => c.name);
    } else {
      // 2. DB-level DISTINCT unnest fallback for legacy string array column without pulling all blogs to Node
      const rawCategories = await prisma.$queryRaw<{ category: string }[]>`
        SELECT DISTINCT unnest(categories) as category 
        FROM "Blog" 
        WHERE status = 'published' AND "isTrashed" = false
        ORDER BY category ASC
      `;
      categories = rawCategories.map((r) => r.category).filter(Boolean);
    }
  } catch (err) {
    console.error("[Categories:Prisma] Failed to fetch categories:", err);
  }

  if (redis && categories.length > 0) {
    // Cache categories for 15 minutes
    redis.set(cacheKey, categories, { ex: 900 }).catch((err) => {
      console.warn("[Categories:Redis] Failed to write cache:", err);
    });
  }

  return categories;
}
