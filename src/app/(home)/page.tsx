import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
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

export default async function Home() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await getHomePage();

  if (!page || !page.content) {
    notFound();
  }

  if (page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <HomeClient content={page.content} />;
}
