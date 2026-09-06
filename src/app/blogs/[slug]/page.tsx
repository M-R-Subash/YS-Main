import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import BlogSingleClient from "./BlogSingleClient";
import { generateToc } from "@/lib/toc";
import { renderTipTap } from "@/lib/tiptap";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; secret?: string }>;
}

function checkIsPreview(searchParams?: { preview?: string; secret?: string }) {
  return (
    Boolean(process.env.PREVIEW_SECRET) &&
    searchParams?.preview === "true" &&
    searchParams?.secret === process.env.PREVIEW_SECRET
  );
}

const getBlog = cache(async (slug: string, isPreview: boolean) => {
  return prisma.blog.findFirst({
    where: {
      slug,
      isTrashed: false,
      ...(isPreview ? {} : { status: "published" }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          authorRole: true,
          description: true,
        },
      },
      seo: true,
      comments: {
        where: { isApproved: true, isTrashed: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          content: true,
          createdAt: true,
          parentId: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = await searchParams;
  const isPreview = checkIsPreview(s);
  const blog = await getBlog(slug, isPreview);

  if (!blog) return constructMetadata({ title: "Blog Not Found" });

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt || undefined,
    seo: blog.seo,
    image: blog.featuredImage,
  });
}

export default async function BlogSinglePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const s = await searchParams;
  const isPreview = checkIsPreview(s);
  const blog = await getBlog(slug, isPreview);

  if (!blog) notFound();

  // Fetch FAQ from homepage
  const homepage = await prisma.page.findUnique({
    where: { slug: "/" }
  });
  
  const faqs = (homepage?.content as any)?.faqs || null;
  const faqsGraphic = (homepage?.content as any)?.faqs?.graphicImage || null;

  // Get related blogs
  const categoryFilter = Array.isArray(blog.categories) && blog.categories.length > 0 
    ? { hasSome: blog.categories } 
    : undefined;

  const authorSelect = {
    select: {
      id: true,
      name: true,
      profilePicture: true,
      authorRole: true,
      description: true,
    },
  };

  const relatedBlogs = await prisma.blog.findMany({
    where: {
      status: "published",
      isTrashed: false,
      id: { not: blog.id },
      ...(categoryFilter ? { categories: categoryFilter } : {})
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { author: authorSelect, seo: true }
  });

  // If not enough related blogs by category, just get latest
  if (relatedBlogs.length < 3) {
    const moreRelated = await prisma.blog.findMany({
      where: {
        status: "published",
        isTrashed: false,
        id: { not: blog.id },
        NOT: { id: { in: relatedBlogs.map(b => b.id) } }
      },
      take: 3 - relatedBlogs.length,
      orderBy: { publishedAt: "desc" },
      include: { author: authorSelect, seo: true }
    });
    relatedBlogs.push(...moreRelated);
  }

  const toc = generateToc(blog.content);
  const htmlContent = renderTipTap(blog.content);

  return (
    <BlogSingleClient 
      blog={blog} 
      htmlContent={htmlContent} 
      toc={toc} 
      faqs={faqs} 
      faqsGraphic={faqsGraphic}
      relatedBlogs={relatedBlogs} 
    />
  );
}
