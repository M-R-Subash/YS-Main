import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { isPreviewAuthorized, getEffectiveContent, type SearchParamsPromise } from "@/lib/preview";
import ServicesClient from "../services/ServicesClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: SearchParamsPromise;
}

const getDynamicPage = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: {
      OR: [
        { slug: `/${slug}` },
        { slug: slug },
        { slug: `/services/${slug}` },
      ],
    },
    include: { seo: true },
  });
});

export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({
      where: { status: "published", isTrashed: false },
      select: { slug: true },
    });

    return pages
      .filter((p) => p.slug && p.slug !== "/" && !p.slug.startsWith("/services/"))
      .map((p) => ({
        slug: p.slug.replace(/^\//, ""),
      }));
  } catch (err) {
    console.error("Failed to generateStaticParams for [slug]:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getDynamicPage(slug);
  if (!page) {
    return constructMetadata({ title: "Page Not Found" });
  }

  return constructMetadata({
    title: page.title,
    seo: page.seo,
  });
}

export default async function DynamicSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const isPreview = await isPreviewAuthorized(searchParams);
  const page = await getDynamicPage(slug);

  if (!page || page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  const content = getEffectiveContent(page, isPreview);

  return <ServicesClient content={content} slug={slug} />;
}
