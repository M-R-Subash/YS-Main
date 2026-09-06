import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import ServicesClient from "../ServicesClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
  const sParams = await searchParams;
  const isPreview =
    Boolean(process.env.PREVIEW_SECRET) &&
    sParams?.preview === "true" &&
    sParams?.secret === process.env.PREVIEW_SECRET;

  const page = await getServicePage(slug);

  if (!page || page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <ServicesClient content={page.content || null} slug={slug} />;
}
