import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PreviewIsolator } from "@/components/PreviewIsolator";
import { Suspense } from "react";
import prisma from "@/lib/prisma";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YS Innovations — Innovate Today, Lead Tomorrow",
  description: "Innovate Today, Lead Tomorrow",
};

const DEFAULT_HEADER_DATA = {
  logo: { url: "/logo.png", alt: "YS Innovations" },
  ctaButton: { text: "Get Started", url: "/contact", newTab: false, noFollow: false },
  navItems: [
    { id: "1", label: "Home", url: { url: "/", newTab: false, noFollow: false } },
    { id: "2", label: "Careers", url: { url: "/careers", newTab: false, noFollow: false } },
    { id: "3", label: "Blogs", url: { url: "/blogs", newTab: false, noFollow: false } },
    { id: "4", label: "Contact", url: { url: "/contact", newTab: false, noFollow: false } },
  ],
};

const DEFAULT_FOOTER_DATA = {
  cta: {
    title: "Let's build something extraordinary together.",
    button: { text: "Start a Conversation", url: "/contact", newTab: false, noFollow: false },
    image: { url: "/placeholder.png", alt: "Footer CTA" },
  },
  socialLinks: [],
  newsletter: { title: "Stay Ahead", highlight: "with industry insights" },
  columns: [],
  contact: {
    address: { text: "Bengaluru, India", url: "#" },
    phone: { text: "+91 98765 43210", url: "tel:+919876543210" },
    email: { text: "contact@ysinnovations.com", url: "mailto:contact@ysinnovations.com" },
  },
  backgroundImage: { url: "/placeholder.png", alt: "Footer Background" },
  copyright: `© ${new Date().getFullYear()} YS Innovations. All rights reserved.`,
  policyLinks: [],
};

async function getHeaderData() {
  try {
    const header = await prisma.header.findUnique({
      where: { id: "global" },
    });
    return (header?.content as any) || DEFAULT_HEADER_DATA;
  } catch (error) {
    console.error("Failed to query header data:", error);
    return DEFAULT_HEADER_DATA;
  }
}

async function getFooterData() {
  try {
    const footer = await prisma.footer.findUnique({
      where: { id: "global" },
    });
    return (footer?.content as any) || DEFAULT_FOOTER_DATA;
  } catch (error) {
    console.error("Failed to query footer data:", error);
    return DEFAULT_FOOTER_DATA;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerData = await getHeaderData();
  const footerData = await getFooterData();

  return (
    <html lang="en" className={`${poppins.variable} font-sans antialiased`}>
      <body className="bg-[#050505] text-white font-sans">
        <Suspense fallback={null}>
          <PreviewIsolator />
        </Suspense>
        <Header data={headerData} />
        {children}
        <Footer data={footerData} />
      </body>
    </html>
  );
}
