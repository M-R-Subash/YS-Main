import type { Metadata } from "next";

interface SeoRecord {
  metaTitle?: string | null;
  metaDesc?: string | null;
  focusKeyword?: string | null;
  ogImage?: string | null;
  ogTitle?: string | null;
  ogDesc?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
}

export function constructMetadata({
  title,
  description,
  seo,
  defaultTitle = "YS Innovations",
  defaultDescription = "Innovate Today, Lead Tomorrow",
  image,
}: {
  title?: string;
  description?: string;
  seo?: SeoRecord | null;
  defaultTitle?: string;
  defaultDescription?: string;
  image?: string | null;
}): Metadata {
  const finalTitle = seo?.metaTitle || seo?.ogTitle || title || defaultTitle;
  const finalDescription = seo?.metaDesc || seo?.ogDesc || description || defaultDescription;
  const ogImage = seo?.ogImage || image;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: seo?.focusKeyword ? [seo.focusKeyword] : undefined,
    alternates: seo?.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: seo?.ogTitle || finalTitle,
      description: seo?.ogDesc || finalDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || finalTitle,
      description: seo?.ogDesc || finalDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
