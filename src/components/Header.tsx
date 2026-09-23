"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

export interface NavLinkUrl {
  url: string;
  newTab?: boolean;
  noFollow?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  url: NavLinkUrl | string;
  subItems?: { label: string; url: NavLinkUrl | string }[];
}

export interface HeaderData {
  logo?: { url?: string; alt?: string; title?: string };
  ctaButton: { text: string; url: string | NavLinkUrl; newTab?: boolean; noFollow?: boolean };
  navItems: NavItem[];
}

function getLinkProps(url: NavLinkUrl | string | undefined, defaultHref = "#") {
  if (!url) return { href: defaultHref, target: undefined, rel: undefined };
  if (typeof url === "object") {
    return {
      href: url.url || defaultHref,
      target: url.newTab ? "_blank" : undefined,
      rel: url.noFollow ? "nofollow noopener noreferrer" : undefined,
    };
  }
  return { href: url || defaultHref, target: undefined, rel: undefined };
}

export default function Header({ data }: { data?: HeaderData | null }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedId, setMobileExpandedId] = useState<string | null>(null);
  const [localData, setLocalData] = useState<HeaderData | null>(null);

  const pathname = usePathname();

  // Close mobile menu on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen for live preview updates from the CMS iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "HEADER_UPDATE" && e.data.data) {
        setLocalData(e.data.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const toggleMobileSubmenu = useCallback((id: string) => {
    setMobileExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const displayData = localData || data;

  if (!displayData) return null;

  const ctaRaw = displayData.ctaButton;
  const ctaProps = getLinkProps(ctaRaw?.url, "#contact");

  return (
    <header
      id="ys-header"
      className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-white/5 font-sans py-4 px-4 sm:px-6 lg:px-8 transition-all"
    >
      <div className="max-w-325 mx-auto w-full flex items-center justify-between">
        {/* Left: Brand Logo Image */}
        <Link href="/" className="flex items-center group">
          <Image
            src={displayData.logo?.url || "/logo.png"}
            alt={displayData.logo?.alt || "YS Innovations"}
            width={210}
            height={44}
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            priority
          />
        </Link>

        {/* Center: Desktop Navigation Pill Container */}
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
                        {item.subItems?.map((sub, idx) => {
                          const subProps = getLinkProps(sub.url);
                          return (
                            <Link
                              key={idx}
                              href={subProps.href}
                              target={subProps.target}
                              rel={subProps.rel}
                              className="block px-4 py-2.5 text-xs font-medium text-black hover:text-white hover:bg-black rounded-sm transition-colors"
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const itemProps = getLinkProps(item.url);
            return (
              <Link
                key={item.id || `item-${i}`}
                href={itemProps.href}
                target={itemProps.target}
                rel={itemProps.rel}
                className="text-sm font-medium text-white hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: CTA Button & Mobile/Tablet Hamburger Toggle */}
        <div className="flex items-center gap-3">
          {/* Header Bar CTA Button — visible on tablet & desktop, hidden on mobile (<md) */}
          <div className="hidden md:flex items-center">
            <Link
              href={ctaProps.href}
              target={ctaProps.target}
              rel={ctaProps.rel}
              className="bg-primary hover:bg-primary-hover text-black font-semibold text-sm pl-6 pr-2 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_30px_var(--color-primary)] transition-all group hover:scale-[1.02]"
            >
              <span>{ctaRaw?.text || "Get Started"}</span>
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

          {/* Hamburger Menu Button (Mobile & Tablet: < lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-primary transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-6 h-6 text-white transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Backdrop overlay */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        className={`lg:hidden fixed inset-0 top-[72px] bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Mobile & Tablet Dropdown Navigation Menu (Floating Absolute Overlay with Smooth Slide & Fade Animation) */}
      <div
        id="mobile-navigation"
        className={`lg:hidden absolute top-full left-0 w-full px-4 sm:px-6 pt-2 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="max-w-325 mx-auto bg-[#0b0b0e]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)] ring-1 ring-white/5 space-y-4">
          <nav className="flex flex-col space-y-1">
            {displayData.navItems?.map((item, i) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = mobileExpandedId === (item.id || `item-${i}`);

              if (hasSubItems) {
                return (
                  <div key={item.id || `mobile-nav-${i}`} className="border-b border-white/5 pb-1">
                    <button
                      type="button"
                      onClick={() => toggleMobileSubmenu(item.id || `item-${i}`)}
                      className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="pl-4 pr-2 py-1.5 space-y-1 bg-white/2 rounded-lg my-1 border-l-2 border-primary/40 ml-3">
                        {item.subItems?.map((sub, idx) => {
                          const subProps = getLinkProps(sub.url);
                          return (
                            <Link
                              key={idx}
                              href={subProps.href}
                              target={subProps.target}
                              rel={subProps.rel}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-3 py-2 text-xs font-medium text-zinc-300 hover:text-primary hover:bg-white/5 rounded-md transition-colors"
                            >
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const itemProps = getLinkProps(item.url);
              return (
                <Link
                  key={item.id || `mobile-nav-${i}`}
                  href={itemProps.href}
                  target={itemProps.target}
                  rel={itemProps.rel}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 px-3 text-sm font-semibold text-white hover:text-primary hover:bg-white/5 rounded-lg transition-colors border-b border-white/5"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile-only CTA button inside dropdown */}
          <div className="pt-2 md:hidden">
            <Link
              href={ctaProps.href}
              target={ctaProps.target}
              rel={ctaProps.rel}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-primary hover:bg-primary-hover text-black font-bold text-sm px-6 py-3 rounded-full flex items-center justify-center gap-3 shadow-[0_0_25px_var(--color-primary)] transition-all group"
            >
              <span>{ctaRaw?.text || "Get Started"}</span>
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
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
      </div>
    </header>
  );
}
