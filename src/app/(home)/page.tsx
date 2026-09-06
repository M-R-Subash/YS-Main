import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const isPreview =
    Boolean(process.env.PREVIEW_SECRET) &&
    params?.preview === "true" &&
    params?.secret === process.env.PREVIEW_SECRET;
  const page = await prisma.page.findUnique({
    where: { slug: "/" },
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

  return <HomeClient content={page.content} />;
}
