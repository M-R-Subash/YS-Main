import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import CareersClient from "./CareersClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CareersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isPreview = params?.preview === "true";
  const page = await prisma.page.findUnique({
    where: { slug: "/careers" },
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

  return <CareersClient content={page.content} />;
}
