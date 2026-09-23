import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { isPreviewAuthorized, getEffectiveContent, type SearchParamsPromise } from "@/lib/preview";
import ServicesClient from "../ServicesClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: SearchParamsPromise;
}

const getServicePage = cache(async (slug: string) => {
  const fullSlug = `/services/${slug}`;
  return prisma.page.findFirst({
    where: {
      OR: [
        { slug: fullSlug },
        { slug: `/${slug}` },
        { slug: slug },
      ],
    },
    include: { seo: true },
  });
});

export async function generateStaticParams() {
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: "published",
        isTrashed: false,
        slug: { startsWith: "/services/" },
      },
      select: { slug: true },
    });

    return pages.map((p) => ({
      slug: p.slug.replace(/^\/services\//, ""),
    }));
  } catch (err) {
    console.error("Failed to generateStaticParams for services:", err);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) {
    return constructMetadata({ title: "Service Not Found" });
  }

  return constructMetadata({
    title: page.title,
    seo: page.seo,
  });
}

export default async function ServiceSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const isPreview = await isPreviewAuthorized(searchParams);
  const page = await getServicePage(slug);

  if (!page || page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  const content = getEffectiveContent(page, isPreview);

  return <ServicesClient content={content} slug={slug} />;
}
