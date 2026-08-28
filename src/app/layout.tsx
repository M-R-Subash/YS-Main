import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PreviewIsolator } from "@/components/PreviewIsolator";
import { Suspense } from "react";

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

async function getHeaderData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/api/header`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getFooterData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${baseUrl}/api/footer`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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
