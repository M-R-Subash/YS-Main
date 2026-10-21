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

  const [blogs, total] = await Promise.all([
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

  const result = { blogs, total, hasMore: skip + blogs.length < total };

  if (redis) {
    // Cache for 5 minutes (300 seconds)
    redis.set(cacheKey, result, { ex: 300 }).catch((err) => {
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
    const results = await prisma.$queryRaw<{ category: string }[]>`
      SELECT DISTINCT unnest(categories) AS category
      FROM "Blog"
      WHERE status = 'published' AND "isTrashed" = false
      ORDER BY category ASC;
    `;
    categories = results.map((r) => r.category).filter(Boolean);
  } catch {
    const blogs = await prisma.blog.findMany({
      where: { status: "published", isTrashed: false },
      select: { categories: true },
      take: 100,
    });

    const categorySet = new Set<string>();
    blogs.forEach((blog) => {
      if (Array.isArray(blog.categories)) {
        blog.categories.forEach((cat) => categorySet.add(cat));
      }
    });

    categories = Array.from(categorySet).sort();
  }

  if (redis && categories.length > 0) {
    // Cache categories for 15 minutes (900 seconds)
    redis.set(cacheKey, categories, { ex: 900 }).catch((err) => {
      console.warn("[Categories:Redis] Failed to write cache:", err);
    });
  }

  return categories;
}
