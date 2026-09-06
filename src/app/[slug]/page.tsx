import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import ServicesClient from "../services/ServicesClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const sParams = await searchParams;
  const isPreview = Boolean(process.env.PREVIEW_SECRET) && sParams?.preview === "true" && sParams?.secret === process.env.PREVIEW_SECRET;

  const page = await getDynamicPage(slug);

  if (!page || page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <ServicesClient content={page.content || null} slug={slug} />;
}
