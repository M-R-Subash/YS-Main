"use server";

import prisma from "@/lib/prisma";

export async function getBlogs({ page = 1, limit = 15, category = "" }) {
  const skip = (page - 1) * limit;
  const where: any = {
    status: "published",
    isTrashed: false,
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
      orderBy: { publishedAt: "desc" },
      include: {
        author: true,
        seo: true,
      },
    }),
    prisma.blog.count({ where }),
  ]);

  return { blogs, total, hasMore: skip + blogs.length < total };
}

export async function getCategories() {
  const blogs = await prisma.blog.findMany({
    where: { status: "published", isTrashed: false },
    select: { categories: true },
  });

  const categorySet = new Set<string>();
  blogs.forEach(blog => {
    if (Array.isArray(blog.categories)) {
      blog.categories.forEach(cat => categorySet.add(cat));
    }
  });

  return Array.from(categorySet).sort();
}
