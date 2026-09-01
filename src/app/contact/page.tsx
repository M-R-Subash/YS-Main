import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ContactClient from "./ContactClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: "Contact Us | YS Innovations",
  description:
    "Got a question, need advice, or ready to start your next big digital project? Contact the YS Innovations team.",
};

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isPreview = params?.preview === "true";

  const page = await prisma.page.findUnique({
    where: { slug: "/contact" },
  });

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
