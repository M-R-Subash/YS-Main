"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface NavItem {
  id: string;
  label: string;
  url: { url: string; newTab?: boolean; noFollow?: boolean };
  subItems?: { label: string; url: string }[];
}

export interface HeaderData {
  ctaButton: { text: string; url: string; newTab?: boolean; noFollow?: boolean };
  navItems: NavItem[];
}

export default function Header({ data }: { data?: HeaderData | null }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [localData, setLocalData] = useState<HeaderData | null>(null);

  useEffect(() => {
    // Set initial data
    if (data) setLocalData(data);

    // Listen for live preview updates from the CMS iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "HEADER_UPDATE" && e.data.data) {
        setLocalData(e.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [data]);

  const displayData = localData || data;

  if (!displayData) return null; // Fallback if data is not available

  return (
    <header id="ys-header" className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/5 font-sans py-4 px-4 sm:px-6 lg:px-8 transition-all">
      <div className="max-w-325 mx-auto w-full flex items-center justify-between">
        
        {/* Left: Brand Logo Image */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="YS Innovations"
            width={210}
            height={44}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Center: Navigation Pill Container */}
        <nav className="hidden lg:flex items-center gap-7 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_srgb,var(--color-primary)_40%,transparent)_0%,#0c0a05_80%)] border border-primary/40 px-8 py-2.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.8)] transition-all">
          {displayData.navItems?.map((item, i) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;

            if (hasSubItems) {
              return (
                <div
                  key={item.id || `dropdown-${i}`}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-primary transition-colors cursor-pointer">
                    <span>{item.label}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`transition-transform duration-200 ${
                        activeDropdown === item.id ? "rotate-180 text-primary" : ""
                      }`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {activeDropdown === item.id && (
                    <div className="absolute top-full left-0 pt-3 w-66">
                      <div className="bg-white/90 border border-primary/30 rounded-sm p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                        {item.subItems?.map((sub, idx) => (
                          <Link
                            key={idx}
                            href={sub.url}
                            className="block px-4 py-2.5 text-xs font-medium text-black hover:text-white hover:bg-black rounded-sm transition-colors"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id || `item-${i}`}
                href={item.url?.url || "#"}
                target={item.url?.newTab ? "_blank" : undefined}
                rel={item.url?.noFollow ? "nofollow noopener noreferrer" : undefined}
                className="text-sm font-medium text-white hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Get Started CTA Button */}
        <div className="flex items-center gap-4">
          <Link
            href={displayData.ctaButton?.url || "#contact"}
            target={displayData.ctaButton?.newTab ? "_blank" : undefined}
            rel={displayData.ctaButton?.noFollow ? "nofollow noopener noreferrer" : undefined}
            className="bg-primary hover:bg-primary-hover text-black font-semibold text-sm pl-6 pr-2 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_30px_var(--color-primary)] transition-all group hover:scale-[1.02]"
          >
            <span>{displayData.ctaButton?.text || "Get Started"}</span>
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
          </Link>
        </div>

      </div>
    </header>
  );
}
