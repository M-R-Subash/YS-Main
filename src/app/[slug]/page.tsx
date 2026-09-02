import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ServicesClient from "../services/ServicesClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DynamicSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sParams = await searchParams;
  const isPreview = sParams?.preview === "true";

  // Match root slug or /services/ slug
  const page = await prisma.page.findFirst({
    where: {
      OR: [
        { slug: `/${slug}` },
        { slug: slug },
        { slug: `/services/${slug}` },
      ],
    },
  });

  if (!page || page.isTrashed) {
    notFound();
  }

  if (page.status === "draft" && !isPreview) {
    notFound();
  }

  return <ServicesClient content={page.content || null} slug={slug} />;
}
