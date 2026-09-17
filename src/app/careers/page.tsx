import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import CareersClient from "./CareersClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

const getCareersPage = cache(async () => {
  return prisma.page.findUnique({
    where: { slug: "/careers" },
    include: { seo: true },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCareersPage();
  return constructMetadata({
    title: page?.title || "Careers | YS Innovations",
    description: "Explore career opportunities and open roles at YS Innovations.",
    seo: page?.seo,
  });
}

export default async function CareersPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await getCareersPage();

  if (!page || !page.content) {
    notFound();
  }

  if (page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <CareersClient content={page.content} />;
}
