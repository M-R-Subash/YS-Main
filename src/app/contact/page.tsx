import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
import { isPreviewAuthorized, getEffectiveContent, type SearchParamsPromise } from "@/lib/preview";
import ContactClient from "./ContactClient";

export const revalidate = 86400; // 24 hours ISR (revalidated on-demand via CMS hook)

const getContactPage = cache(async () => {
  return prisma.page.findUnique({
    where: { slug: "/contact" },
    include: { seo: true },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage();
  return constructMetadata({
    title: page?.title || "Contact Us | YS Innovations",
    description:
      "Got a question, need advice, or ready to start your next big digital project? Contact the YS Innovations team.",
    seo: page?.seo,
  });
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const isPreview = await isPreviewAuthorized(searchParams);
  const page = await getContactPage();

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

  return <ContactClient content={content} />;
}
