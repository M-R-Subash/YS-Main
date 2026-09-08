"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Send, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

export interface FooterLink {
  text: string;
  url: string;
  newTab?: boolean;
  noFollow?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterData {
  cta: {
    title: string;
    button: FooterLink;
    image: { url: string; alt: string };
  };
  socialLinks: FooterLink[];
  newsletter: {
    title: string;
    highlight: string;
  };
  columns: FooterColumn[];
  contact: {
    address: FooterLink;
    phone: FooterLink;
    email: FooterLink;
  };
  backgroundImage: { url: string; alt: string };
  copyright: string;
  policyLinks: FooterLink[];
}

function getSocialIcon(link: FooterLink, className = "w-4 h-4") {
  const text = (link.text || "").toLowerCase().trim();
  const url = (link.url || "").toLowerCase().trim();
  const target = `${text} ${url}`;

  if (target.includes("facebook") || target.includes("fb.com") || text === "fb") {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }

  if (target.includes("instagram") || target.includes("instagr.am") || text === "ig") {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  if (text === "x" || target.includes("x.com") || target.includes("twitter")) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (target.includes("linkedin")) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (target.includes("youtube") || target.includes("youtu.be")) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
      </svg>
    );
  }

  if (target.includes("github")) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }

  return <Globe className={className} />;
}

export default function Footer({ data }: { data?: FooterData | null }) {
  const [localData, setLocalData] = useState<FooterData | null>(null);
  const pathname = usePathname();
  const hideCTA = pathname === "/careers";

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "FOOTER_UPDATE" && e.data.data) {
        setLocalData(e.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const displayData = localData || data;

  if (!displayData) return null;

  return (
    <div id="ys-footer" className="w-full flex flex-col">
      {/* Outer White Div for Top Half of CTA */}
      {!hideCTA && (
        <div className="w-full bg-white pt-20">
        {/* We use a negative bottom margin here so the dark footer overlaps behind this CTA box */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mb-28 sm:-mb-32 lg:-mb-40">
          
          {/* Top Yellow CTA Box */}
          <div className="flex flex-col lg:flex-row bg-[#FFA918] rounded-[32px] shadow-2xl relative z-30">
            {/* Left Content */}
            <div className="w-full lg:w-[55%] p-10 sm:p-14 lg:p-16 flex flex-col justify-center">
              <h2 className="text-[32px] sm:text-[44px] lg:text-[54px] font-extrabold text-black leading-[1.1] mb-10 tracking-tight">
                {displayData.cta?.title}
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-10">
                <Link 
                  href={displayData.cta?.button?.url || "/contact-us"} 
                  target={displayData.cta?.button?.newTab ? "_blank" : undefined}
                  rel={displayData.cta?.button?.noFollow ? "nofollow" : undefined}
                  className="inline-flex items-center justify-between gap-4 bg-black text-white px-5 py-3.5 rounded-full hover:bg-black/80 transition-colors group"
                >
                  <span className="font-semibold text-[15px] px-2">{displayData.cta?.button?.text}</span>
                  <div className="w-[38px] h-[38px] bg-[#FFA918] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-black font-semibold text-[15px]">Follow us:</span>
                  <div className="flex gap-2.5">
                    {displayData.socialLinks?.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target={link.newTab ? "_blank" : undefined} 
                        rel={link.noFollow ? "nofollow" : "noopener noreferrer"} 
                        className="w-9 h-9 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform text-[#FFA918]"
                        title={link.text}
                      >
                        {getSocialIcon(link, "w-4 h-4 text-[#FFA918]")}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Right Image */}
            <div className="w-full lg:w-[45%] relative pointer-events-none mt-8 lg:mt-0">
              <div className="lg:absolute lg:bottom-0 lg:right-6 lg:w-[120%] lg:h-[135%] relative w-full h-[350px]">
                <Image 
                  src={displayData.cta?.image?.url || "https://ysinnovations.com/wp-content/uploads/2026/06/image-31.webp"} 
                  alt={displayData.cta?.image?.alt || "Let's build future together"} 
                  fill 
                  className="object-contain object-bottom lg:object-right-bottom drop-shadow-2xl"
                  unoptimized
                />
              </div>
            </div>
          </div>

        </div>
      </div>
      )}

      {/* Actual Dark Footer */}
      <footer className={`relative w-full overflow-hidden bg-[#181818] ${hideCTA ? 'pt-20 sm:pt-24' : 'pt-40 sm:pt-48 lg:pt-64'}`}>
        {/* Background Image for the whole footer */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url('${displayData.backgroundImage?.url || "https://ysinnovations.com/wp-content/uploads/2026/06/start_-Working-Process-Section-1-1-scaled.webp"}')`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        ></div>

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
            {/* Newsletter */}
            <div className="lg:col-span-4">
              <h3 className="text-2xl sm:text-[26px] font-bold text-white mb-6 leading-tight">
                {displayData.newsletter?.title} <br />
                <span className="text-[#FFA918]">{displayData.newsletter?.highlight}</span>
              </h3>
              <form className="relative w-full max-w-[360px]" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-[#111] border border-white/10 text-white placeholder-zinc-500 rounded-[8px] py-3.5 pl-4 pr-14 outline-none focus:border-[#FFA918] transition-colors text-sm shadow-inner"
                  required
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 w-10 bg-[#FFA918] rounded-[6px] flex items-center justify-center hover:bg-[#e59815] transition-colors">
                  <Send className="w-[18px] h-[18px] text-black" />
                </button>
              </form>
            </div>

            {/* Dynamic Columns */}
            {displayData.columns?.map((col, i) => (
              <div key={i} className={`lg:col-span-2 ${i === 0 ? 'lg:col-start-6' : ''}`}>
                <h5 className="text-white font-bold mb-6 text-[17px] tracking-wide">{col.title}</h5>
                <ul className="flex flex-col gap-3.5">
                  {col.links?.map((link, j) => (
                    <li key={j}>
                      <Link 
                        href={link.url} 
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.noFollow ? "nofollow" : undefined}
                        className="text-[#888888] hover:text-[#FFA918] transition-colors text-[14px]"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info */}
            <div className="lg:col-span-3">
              <h5 className="text-white font-bold mb-6 text-[17px] tracking-wide">Contact Info</h5>
              <div className="flex flex-col gap-4 text-[#888888] text-[14px] leading-[1.6]">
                <p>
                  <a href={displayData.contact?.address?.url || "#"} target={displayData.contact?.address?.newTab ? "_blank" : undefined} rel={displayData.contact?.address?.noFollow ? "nofollow" : "noopener noreferrer"} className="hover:text-[#FFA918] transition-colors block max-w-[240px]">
                    {displayData.contact?.address?.text}
                  </a>
                </p>
                <p>
                  <a href={displayData.contact?.phone?.url || "#"} target={displayData.contact?.phone?.newTab ? "_blank" : undefined} rel={displayData.contact?.phone?.noFollow ? "nofollow" : undefined} className="hover:text-[#FFA918] transition-colors">
                    {displayData.contact?.phone?.text}
                  </a>
                </p>
                <p>
                  <a href={displayData.contact?.email?.url || "#"} target={displayData.contact?.email?.newTab ? "_blank" : undefined} rel={displayData.contact?.email?.noFollow ? "nofollow" : undefined} className="hover:text-[#FFA918] transition-colors">
                    {displayData.contact?.email?.text}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 relative z-20">
            <p className="text-[#555555] text-[13px] font-medium">{displayData.copyright}</p>
            <div className="flex items-center gap-2">
              {displayData.socialLinks?.map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target={link.newTab ? "_blank" : undefined} 
                  rel={link.noFollow ? "nofollow" : "noopener noreferrer"} 
                  className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center hover:bg-[#FFA918] group transition-colors text-[#888888] hover:text-black"
                  title={link.text}
                >
                  {getSocialIcon(link, "w-3.5 h-3.5 text-[#888888] group-hover:text-black transition-colors")}
                </a>
              ))}
            </div>
            <p className="text-[#555555] text-[13px] font-medium flex gap-2">
              {displayData.policyLinks?.map((link, i) => (
                <span key={i}>
                  <Link 
                    href={link.url} 
                    target={link.newTab ? "_blank" : undefined}
                    rel={link.noFollow ? "nofollow" : undefined}
                    className="hover:text-[#a0a0a0] transition-colors"
                  >
                    {link.text}
                  </Link>
                  {i < (displayData.policyLinks?.length || 0) - 1 && " . "}
                </span>
              ))}
            </p>
          </div>

          {/* Full Width Bottom Text */}
          <div className="w-full flex justify-center mt-4 pb-2 overflow-hidden">
            <h2 
              className="text-[14vw] sm:text-[15vw] lg:text-[140px] xl:text-[170px] font-bold leading-none whitespace-nowrap tracking-tight select-none"
              style={{
                background: "linear-gradient(175deg, #414240 40%, #413119 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent"
              }}
            >
              YSInnovations
            </h2>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
