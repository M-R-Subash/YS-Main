import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { isPreviewAuthorized, getEffectiveContent, type SearchParamsPromise } from "@/lib/preview";
import HomeClient from "./HomeClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

const getHomePage = cache(async () => {
  return prisma.page.findUnique({
    where: { slug: "/" },
    include: { seo: true },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage();
  return constructMetadata({
    title: page?.title || "YS Innovations — Innovate Today, Lead Tomorrow",
    seo: page?.seo,
  });
}

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const isPreview = await isPreviewAuthorized(searchParams);
  const page = await getHomePage();

  if (!page || (!page.content && !page.draftContent)) {
    notFound();
  }

  if (page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  const content = getEffectiveContent(page, isPreview);

  return <HomeClient content={content} />;
}
