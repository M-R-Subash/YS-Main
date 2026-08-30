import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BlogSingleClient from "./BlogSingleClient";
import { generateToc } from "@/lib/toc";
import { renderTipTap } from "@/lib/tiptap";

export async function generateMetadata({ params }: any) {
  const p = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug: p.slug },
    include: { seo: true },
  });

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDesc || blog.excerpt,
  };
}

export default async function BlogSinglePage({ params }: any) {
  const p = await params;
  
  const blog = await prisma.blog.findUnique({
    where: { slug: p.slug, status: "published", isTrashed: false },
    include: {
      author: true,
      seo: true,
    },
  });

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

  const relatedBlogs = await prisma.blog.findMany({
    where: {
      status: "published",
      isTrashed: false,
      id: { not: blog.id },
      ...(categoryFilter ? { categories: categoryFilter } : {})
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { author: true, seo: true }
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
      include: { author: true, seo: true }
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
