import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import BlogSingleClient from "./BlogSingleClient";
import { generateToc } from "@/lib/toc";
import { renderTipTap } from "@/lib/tiptap";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
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
          isAdmin: true,
        },
      },
    },
  });
});

export async function generateStaticParams() {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: "published", isTrashed: false },
      select: { slug: true },
    });

    return blogs.map((b) => ({
      slug: b.slug,
    }));
  } catch (err) {
    console.error("Failed to generateStaticParams for blogs:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const blog = await getBlog(slug, isPreview);

  if (!blog) return constructMetadata({ title: "Blog Not Found" });

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt || undefined,
    seo: blog.seo,
    image: blog.featuredImage,
  });
}

export default async function BlogSinglePage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const blog = await getBlog(slug, isPreview);

  if (!blog) notFound();

  // Blog-specific FAQs (stored in blog.content.faqs or blog.faqs or draftContent)
  const effectiveData = isPreview && (blog as any).draftContent
    ? (typeof (blog as any).draftContent === "string" ? JSON.parse((blog as any).draftContent) : (blog as any).draftContent)
    : blog;
  const rawBlogFaqs = (effectiveData?.content as any)?.faqs || (effectiveData as any)?.faqs || (blog?.content as any)?.faqs;
  const blogFaqList = Array.isArray(rawBlogFaqs)
    ? rawBlogFaqs.filter((item: any) => item && (item.question?.trim() || item.answer?.trim()))
    : [];

  const faqs = blogFaqList.length > 0 ? {
    title: "Frequently Asked Questions",
    badge: "FAQ",
    list: blogFaqList,
  } : null;

  const faqsGraphic = null;

  const faqSchema = blogFaqList.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": blogFaqList.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question || "",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": (faq.answer || "").replace(/<[^>]+>/g, " ").trim(),
      },
    })),
  } : null;

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
  if (blogFaqList.length > 0) {
    toc.push({ id: "faq", text: "Frequently Asked Questions" });
  }
  const htmlContent = renderTipTap(blog.content);

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ysinnovations.com";
  const articleUrl = `${siteUrl}/blogs/${blog.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.seo?.metaTitle || blog.title,
    "description": blog.seo?.metaDesc || blog.excerpt || "",
    "image": blog.featuredImage ? [blog.featuredImage] : undefined,
    "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date(blog.createdAt).toISOString(),
    "dateModified": new Date(blog.updatedAt).toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    "author": {
      "@type": "Person",
      "name": blog.seo?.authorName || blog.author?.name || "YS Innovations",
      ...(blog.seo?.authorRole || blog.author?.authorRole
        ? { "jobTitle": blog.seo?.authorRole || blog.author?.authorRole }
        : {}),
    },
    "publisher": {
      "@type": "Organization",
      "name": "YS Innovations",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/images/logo.png`,
      },
    },
    ...(Array.isArray(blog.tags) && blog.tags.length > 0 ? { "keywords": blog.tags.join(", ") } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blogs",
        "item": `${siteUrl}/blogs`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BlogSingleClient 
        blog={blog} 
        htmlContent={htmlContent} 
        toc={toc} 
        faqs={faqs} 
        faqsGraphic={faqsGraphic}
        relatedBlogs={relatedBlogs} 
      />
    </>
  );
}
