import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import prisma from "@/lib/prisma";
import { constructMetadata } from "@/lib/seo";
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

export default async function ContactPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await getContactPage();

  if (!page || !page.content) {
    notFound();
  }

  if (page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <ContactClient content={page.content} />;
}
