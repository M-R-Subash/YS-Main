import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { serverConfig } from "@/lib/config/server";
import { generateToc } from "@/lib/toc";
import { renderTipTap } from "@/lib/tiptap";

// Client components
import HomeClient from "../(home)/HomeClient";
import CareersClient from "../careers/CareersClient";
import ContactClient from "../contact/ContactClient";
import ServicesClient from "../services/ServicesClient";
import BlogSingleClient from "../blogs/[slug]/BlogSingleClient";

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  searchParams: Promise<{ path?: string; slug?: string; secret?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Live Preview | YS CMS",
    robots: { index: false, follow: false },
  };
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const secret = params?.secret;
  const expectedSecret = serverConfig.security.previewSecret;

  if (!secret || !expectedSecret || secret !== expectedSecret) {
    notFound();
  }

  let rawPath = params?.path || params?.slug || "/";
  if (rawPath.length > 1 && rawPath.endsWith("/")) {
    rawPath = rawPath.slice(0, -1);
  }

  // 1. Homepage preview
  if (rawPath === "/" || rawPath === "") {
    const page = await prisma.page.findUnique({
      where: { slug: "/" },
      include: { seo: true },
    });
    const content = page?.draftContent || page?.content;
    if (!content) notFound();
    return <HomeClient content={content} />;
  }

  // 2. Careers preview
  if (rawPath === "/careers") {
    const page = await prisma.page.findUnique({
      where: { slug: "/careers" },
      include: { seo: true },
    });
    const content = page?.draftContent || page?.content;
    if (!content) notFound();
    return <CareersClient content={content} />;
  }

  // 3. Contact preview
  if (rawPath === "/contact") {
    const page = await prisma.page.findUnique({
      where: { slug: "/contact" },
      include: { seo: true },
    });
    const content = page?.draftContent || page?.content;
    if (!content) notFound();
    return <ContactClient content={content} />;
  }

  // 4. Blog preview (/blogs/[slug])
  if (rawPath.startsWith("/blogs/")) {
    const slug = rawPath.replace(/^\/blogs\//, "");
    const blog = await prisma.blog.findFirst({
      where: {
        slug,
        isTrashed: false,
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

    if (!blog) notFound();

    const effectiveData = blog.draftContent
      ? typeof blog.draftContent === "string"
        ? JSON.parse(blog.draftContent)
        : blog.draftContent
      : blog;

    const effectiveBlog = blog.draftContent
      ? {
          ...blog,
          title: effectiveData.title ?? blog.title,
          content: effectiveData.content ?? blog.content,
          featuredImage: effectiveData.featuredImage ?? blog.featuredImage,
          excerpt: effectiveData.excerpt ?? blog.excerpt,
          tags: effectiveData.tags ?? blog.tags,
          categories: effectiveData.categories ?? blog.categories,
          readingTime: effectiveData.readingTime ?? blog.readingTime,
          seo: effectiveData.seo || blog.seo,
        }
      : blog;

    const rawBlogFaqs =
      (effectiveData?.content as any)?.faqs ||
      (effectiveData as any)?.faqs ||
      (blog?.content as any)?.faqs;
    const blogFaqList = Array.isArray(rawBlogFaqs)
      ? rawBlogFaqs.filter((item: any) => item && (item.question?.trim() || item.answer?.trim()))
      : [];

    const faqs =
      blogFaqList.length > 0
        ? {
            title: "Frequently Asked Questions",
            badge: "FAQ",
            list: blogFaqList,
          }
        : null;

    const toc = generateToc(effectiveBlog.content);
    if (blogFaqList.length > 0) {
      toc.push({ id: "faq", text: "Frequently Asked Questions" });
    }
    const htmlContent = renderTipTap(effectiveBlog.content);

    const categoryFilter =
      Array.isArray(effectiveBlog.categories) && effectiveBlog.categories.length > 0
        ? { hasSome: effectiveBlog.categories }
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

    const now = new Date();
    const publicBlogFilter = {
      isTrashed: false,
      OR: [
        { status: "published" },
        { status: "scheduled", scheduledAt: { lte: now } },
      ],
    };

    const relatedBlogs = await prisma.blog.findMany({
      where: {
        ...publicBlogFilter,
        id: { not: blog.id },
        ...(categoryFilter ? { categories: categoryFilter } : {}),
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      include: { author: authorSelect, seo: true },
    });

    if (relatedBlogs.length < 3) {
      const moreRelated = await prisma.blog.findMany({
        where: {
          ...publicBlogFilter,
          id: { not: blog.id },
          NOT: { id: { in: relatedBlogs.map((b) => b.id) } },
        },
        take: 3 - relatedBlogs.length,
        orderBy: { publishedAt: "desc" },
        include: { author: authorSelect, seo: true },
      });
      relatedBlogs.push(...moreRelated);
    }

    return (
      <BlogSingleClient
        blog={effectiveBlog}
        htmlContent={htmlContent}
        toc={toc}
        faqs={faqs}
        faqsGraphic={null}
        relatedBlogs={relatedBlogs}
        isPreview={true}
      />
    );
  }

  // 5. Service preview (/services/[slug])
  if (rawPath.startsWith("/services/")) {
    const slug = rawPath.replace(/^\/services\//, "");
    const page = await prisma.page.findFirst({
      where: {
        OR: [
          { slug: `/services/${slug}` },
          { slug: `/${slug}` },
          { slug: slug },
        ],
      },
      include: { seo: true },
    });

    if (!page || page.isTrashed) notFound();
    const content = page.draftContent || page.content;
    if (!content) notFound();

    return <ServicesClient content={content} slug={slug} />;
  }

  // 6. Generic dynamic page preview (/[slug])
  const slug = rawPath.replace(/^\//, "");
  const page = await prisma.page.findFirst({
    where: {
      OR: [
        { slug: `/${slug}` },
        { slug: slug },
        { slug: `/services/${slug}` },
      ],
    },
    include: { seo: true },
  });

  if (!page || page.isTrashed) notFound();
  const content = page.draftContent || page.content;
  if (!content) notFound();

  return <ServicesClient content={content} slug={slug} />;
}
