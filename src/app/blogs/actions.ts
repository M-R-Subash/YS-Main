"use server";

import prisma from "@/lib/prisma";

export async function getBlogs({ page = 1, limit = 15, category = "" }) {
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
      has: category
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

  return { blogs, total, hasMore: skip + blogs.length < total };
}

export async function getCategories(): Promise<string[]> {
  try {
    const results = await prisma.$queryRaw<{ category: string }[]>`
      SELECT DISTINCT unnest(categories) AS category
      FROM "Blog"
      WHERE status = 'published' AND "isTrashed" = false
      ORDER BY category ASC;
    `;
    return results.map((r) => r.category).filter(Boolean);
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

    return Array.from(categorySet).sort();
  }
}
