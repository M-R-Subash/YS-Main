import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PreviewIsolator } from "@/components/PreviewIsolator";
import { PreviewInspector } from "@/components/PreviewInspector";
import PageTransitionLoader from "@/components/PageTransitionLoader";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "YS Innovations";
const appDescription =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "Innovate Today, Lead Tomorrow — Enterprise Software & Cloud Solutions";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} — Innovate Today, Lead Tomorrow`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  openGraph: {
    title: appName,
    description: appDescription,
    url: siteUrl,
    siteName: appName,
    locale: "en_US",
    type: "website",
  },
};

const DEFAULT_HEADER_DATA = {
  logo: {
    alt: "YS Innovations",
    url: "https://res.cloudinary.com/subash-cms/image/upload/v1788346719/image-8.png",
    title: "YS Innovations",
  },
  navItems: [
    {
      id: "1",
      label: "Home",
      url: { url: "/", newTab: false, noFollow: false },
      subItems: [],
    },
    {
      id: "2",
      label: "Our Services",
      url: { url: "#services", newTab: false, noFollow: false },
      subItems: [
        {
          label: "Digital Marketing",
          url: "/digital-marketing",
        },
        {
          label: "App development",
          url: "/app-development",
        },
        {
          label: "Website development",
          url: "/web-development",
        },
        {
          label: "Wordpress development",
          url: "/wordpress-development",
        },
      ],
    },
    {
      id: "3",
      label: "Contact Us",
      url: { url: "/contact", newTab: false, noFollow: false },
      subItems: [],
    },
    {
      id: "4",
      label: "Careers",
      url: { url: "/careers", newTab: false, noFollow: false },
      subItems: [],
    },
    {
      id: "5",
      label: "Blog",
      url: { url: "/blogs", newTab: false, noFollow: false },
      subItems: [],
    },
  ],
  ctaButton: {
    text: "Get Started",
    url: "/contact",
    newTab: false,
    noFollow: false,
  },
};

const DEFAULT_FOOTER_DATA = {
  cta: {
    title: "Let's Build Future Together.",
    button: {
      text: "Get In Touch",
      url: "/contact",
      newTab: false,
      noFollow: false,
    },
    image: { url: "", alt: "" },
  },
  columns: [
    {
      title: "Resources",
      links: [
        { text: "Our Products", url: "/our-products", newTab: false, noFollow: false },
        { text: "About Us", url: "/about-us", newTab: false, noFollow: false },
        { text: "Careers", url: "/careers", newTab: false, noFollow: false },
        { text: "Blog", url: "/blogs", newTab: false, noFollow: false },
        { text: "Our Story", url: "/our-story", newTab: false, noFollow: false },
      ],
    },
    {
      title: "Services",
      links: [
        { text: "SEO", url: "/seo", newTab: false, noFollow: false },
        { text: "Graphic Design & Branding", url: "/graphic-design-branding", newTab: false, noFollow: false },
        { text: "Ecommerce Solution", url: "/ecommerce-solution", newTab: false, noFollow: false },
        { text: "Web design and development", url: "/web-design-and-development", newTab: false, noFollow: false },
        { text: "Digital Marketing", url: "/digital-marketing", newTab: false, noFollow: false },
      ],
    },
  ],
  contact: {
    email: {
      text: "team@ysinnovations.com",
      url: "mailto:team@ysinnovations.com",
      newTab: false,
      noFollow: false,
    },
    phone: {
      text: "+91-8778900553",
      url: "tel:+918778900553",
      newTab: false,
      noFollow: false,
    },
    address: {
      text: "Ekta Plaza, Indira Garden Road, Uppilipalayam, Coimbatore – 641015",
      url: "https://maps.app.goo.gl/mi5NMsi5QnnwW8YDA",
      newTab: true,
      noFollow: false,
    },
  },
  copyright: `YSInnovations © ${new Date().getFullYear()}. All right reserved.`,
  newsletter: {
    title: "Subscribe to Our",
    highlight: "Newsletter",
  },
  policyLinks: [
    { text: "Privacy & Policy", url: "/privacy-policy", newTab: false, noFollow: false },
    { text: "Terms & Condition", url: "/terms-and-conditions", newTab: false, noFollow: false },
  ],
  socialLinks: [
    { text: "facebook", url: "https://www.facebook.com/ysinnovations", newTab: true, noFollow: false },
    { text: "x", url: "https://x.com/ysinnovations", newTab: true, noFollow: false },
    { text: "instagram", url: "https://www.instagram.com/ysinnovations/", newTab: true, noFollow: false },
    { text: "linkedin", url: "https://www.linkedin.com/company/ysinnovations", newTab: true, noFollow: false },
  ],
  backgroundImage: { url: "", alt: "" },
};

const getHeaderData = unstable_cache(
  async () => {
    try {
      const header = await prisma.header.findUnique({
        where: { id: "global" },
      });
      return (header?.content as any) || DEFAULT_HEADER_DATA;
    } catch (error) {
      console.error("Failed to query header data:", error);
      return DEFAULT_HEADER_DATA;
    }
  },
  ["global-header"],
  { revalidate: 86400, tags: ["global-header"] }
);

const getFooterData = unstable_cache(
  async () => {
    try {
      const footer = await prisma.footer.findUnique({
        where: { id: "global" },
      });
      return (footer?.content as any) || DEFAULT_FOOTER_DATA;
    } catch (error) {
      console.error("Failed to query footer data:", error);
      return DEFAULT_FOOTER_DATA;
    }
  },
  ["global-footer"],
  { revalidate: 86400, tags: ["global-footer"] }
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerData, footerData] = await Promise.all([
    getHeaderData(),
    getFooterData(),
  ]);

  return (
    <html lang="en" className={`${poppins.variable} font-sans antialiased`}>
      <body className="bg-background text-white font-sans">
        <PageTransitionLoader />
        <Suspense fallback={null}>
          <PreviewIsolator />
          <PreviewInspector />
        </Suspense>
        <Header data={headerData} />
        {children}
        <Footer data={footerData} />
      </body>
    </html>
  );
}
