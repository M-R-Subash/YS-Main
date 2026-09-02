"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  Search,
  Code2,
  MapPin,
  Target,
  Share2,
  MessageCircle,
  BarChart3,
  Mail,
  Zap,
  Crosshair,
  RefreshCw,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Percent,
  Clock,
  CheckCircle2,
  Lightbulb,
  Smartphone,
  Tablet,
  AppWindow,
  Cpu,
  ShieldCheck,
  Lock,
  Activity,
  Gauge,
  Terminal,
  Database,
  Sliders,
  Monitor,
  Layout,
  Laptop,
  Server,
  ShoppingBag,
} from "lucide-react";
import FaqSection from "@/components/FaqSection";

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/subash-cms/image/upload/v1787243108/placeholder.png";

// Dynamic Lucide Icon Resolver based on page slug or content title
const getIconSetsForSlug = (slug?: string, title?: string) => {
  const text = `${slug || ""} ${title || ""}`.toLowerCase();

  // WordPress / WooCommerce / Elementor / CMS Development
  if (
    text.includes("wordpress") ||
    text.includes("woocommerce") ||
    text.includes("elementor") ||
    text.includes("wp")
  ) {
    return {
      whyItMatters: [ShoppingBag, Layout, Gauge, ShieldCheck],
      services: [
        Layout,
        ShoppingBag,
        Sliders,
        Code2,
        ShieldCheck,
        Gauge,
        Globe,
        Zap,
        Database,
        Layers,
        RefreshCw,
        Lock,
      ],
      layers: [Layout, ShoppingBag, Lock, RefreshCw],
      outcomes: [
        Gauge,
        ShieldCheck,
        TrendingUp,
        CheckCircle2,
        ArrowUpRight,
        Percent,
        CheckCircle2,
        Clock,
      ],
      whoWeAre: [Layout, ShoppingBag, ShieldCheck, Clock],
      problems: [Zap, Gauge, ShieldCheck, ShoppingBag, RefreshCw, Sliders],
    };
  }

  // Mobile App Development / iOS / Android / Flutter
  if (
    text.includes("app") ||
    text.includes("mobile") ||
    text.includes("ios") ||
    text.includes("android") ||
    text.includes("flutter")
  ) {
    return {
      whyItMatters: [Smartphone, Zap, Sparkles, Cpu],
      services: [
        Smartphone,
        Tablet,
        Code2,
        Sparkles,
        Database,
        Zap,
        AppWindow,
        ShieldCheck,
        Activity,
      ],
      layers: [AppWindow, Lock, Database, RefreshCw],
      outcomes: [
        Activity,
        ShieldCheck,
        TrendingUp,
        CheckCircle2,
        ArrowUpRight,
        Percent,
        CheckCircle2,
        Clock,
      ],
      whoWeAre: [AppWindow, Users, ShieldCheck, Clock],
      problems: [Zap, Activity, ShieldCheck, Smartphone, RefreshCw, Layers],
    };
  }

  // Web Development / Website Development / Cloud / Software Engineering
  if (
    text.includes("web") ||
    text.includes("website") ||
    text.includes("cloud") ||
    text.includes("software") ||
    text.includes("dev")
  ) {
    return {
      whyItMatters: [Gauge, Monitor, Layout, Server],
      services: [
        Code2,
        Layout,
        Server,
        Globe,
        Database,
        Terminal,
        Cpu,
        Monitor,
        Zap,
        Sliders,
        Lock,
        Layers,
      ],
      layers: [Terminal, Server, Database, RefreshCw],
      outcomes: [
        Gauge,
        ShieldCheck,
        TrendingUp,
        CheckCircle2,
        ArrowUpRight,
        Percent,
        CheckCircle2,
        Clock,
      ],
      whoWeAre: [Layout, Laptop, ShieldCheck, Clock],
      problems: [Zap, Gauge, ShieldCheck, Monitor, RefreshCw, Layers],
    };
  }

  // Digital Marketing / SEO / Growth (Default)
  return {
    whyItMatters: [Globe, Users, TrendingUp, DollarSign],
    services: [
      Search,
      Code2,
      MapPin,
      Target,
      Share2,
      MessageCircle,
      BarChart3,
      Mail,
      Zap,
    ],
    layers: [Crosshair, TrendingUp, RefreshCw, Layers],
    outcomes: [
      ArrowUpRight,
      TrendingDown,
      Percent,
      ArrowUpRight,
      TrendingDown,
      Percent,
      CheckCircle2,
      Clock,
    ],
    whoWeAre: [TrendingUp, Zap, Percent, DollarSign],
    problems: [Layers, BarChart3, Code2, Clock, RefreshCw, Share2],
  };
};

const getImageSrc = (img: any) => {
  if (!img) return DEFAULT_IMAGE;
  if (typeof img === "string" && img.trim() !== "") return img;
  if (typeof img === "object" && img.url && img.url.trim() !== "") return img.url;
  return DEFAULT_IMAGE;
};

interface ServicesClientProps {
  content: any;
  slug?: string;
}

export default function ServicesClient({
  content: initialContent,
  slug,
}: ServicesClientProps) {
  const [content, setContent] = useState(initialContent);
  const [heroImgError, setHeroImgError] = useState(false);
  const [section2ImgError, setSection2ImgError] = useState(false);
  const [activeStrategyIndex, setActiveStrategyIndex] = useState(0);

  // Dynamically resolve section icon arrays based on page slug or content title
  const iconSets = getIconSetsForSlug(slug, content?.hero?.title || content?.hero?.badge);
  const WHY_IT_MATTERS_ICONS = iconSets.whyItMatters;
  const SERVICES_ICONS = iconSets.services;
  const LAYERS_ICONS = iconSets.layers;
  const OUTCOMES_ICONS = iconSets.outcomes;
  const WHO_WE_ARE_ICONS = iconSets.whoWeAre;
  const PROBLEMS_ICONS = iconSets.problems;

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        (e.data?.type === "PREVIEW_UPDATE_DIGITAL_MARKETING" ||
          e.data?.type === "PREVIEW_UPDATE_PAGE") &&
        e.data.content
      ) {
        setContent(e.data.content);
      } else if (e.data?.type === "SCROLL_TO_SECTION" && e.data.section) {
        const sectionId = e.data.section;
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Extract content sections directly from database content JSON
  const hero = content?.hero;
  const whyItMatters = content?.whyItMatters;
  const fullStackEngine = content?.fullStackEngine;
  const processSection = content?.processSection;
  const caseStudiesSection = content?.caseStudiesSection;
  const whoWeAreSection = content?.whoWeAreSection;
  const problemsSection = content?.problemsSection;
  const perspectivesSection = content?.perspectivesSection;
  const faqsSection = content?.faqsSection;

  // Extract arrays directly from content
  const heroTags: string[] = hero?.tags ?? [];
  const metrics: any[] = whyItMatters?.metrics ?? [];
  const services: any[] = fullStackEngine?.services ?? [];
  const layers: any[] = fullStackEngine?.layers ?? [];
  const processSteps: any[] = processSection?.steps ?? [];
  const outcomes: any[] = processSection?.outcomes ?? [];
  const caseStudies: any[] = caseStudiesSection?.items ?? [];
  const strategyPoints: any[] = caseStudiesSection?.strategyPoints ?? [];
  const whoWeAreMetrics: any[] = whoWeAreSection?.metrics ?? [];
  const problemCards: any[] = problemsSection?.cards ?? [];
  const insightCards: any[] = perspectivesSection?.cards ?? [];
  const faqsList: any[] = faqsSection?.list ?? [];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#F5A817]/30">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section id="section-hero" className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        <div className="site-container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6 md:space-y-8">
              {/* Top Tag Pill */}
              {hero?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hero.badge}</span>
                </div>
              )}

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] text-white">
                {hero?.title}{" "}
                {hero?.titleHighlight && (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A817] via-[#f59e0b] to-[#E07A5F]">
                    {hero.titleHighlight}
                  </span>
                )}
              </h1>

              {/* Description */}
              {hero?.description && (
                <p className="text-zinc-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal">
                  {hero.description}
                </p>
              )}

              {/* Category / Skill Pills */}
              {heroTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {heroTags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-300 text-xs md:text-sm font-medium transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                {(hero?.cta?.text || hero?.ctaPrimaryText) && (
                  <a
                    href={(typeof hero?.cta === "object" ? hero?.cta?.url : hero?.ctaPrimaryLink) || "/contact"}
                    target={hero?.cta?.newTab ? "_blank" : undefined}
                    rel={hero?.cta?.noFollow ? "nofollow" : undefined}
                    className="group inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#F5A817] hover:bg-[#e59807] text-black font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[#F5A817]/20"
                  >
                    <span>{hero?.cta?.text || hero?.ctaPrimaryText}</span>
                    <span className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                )}

                {(hero?.secondaryCta?.text || hero?.ctaSecondaryText) && (
                  <a
                    href={(typeof hero?.secondaryCta === "object" ? hero?.secondaryCta?.url : hero?.ctaSecondaryLink) || "/contact"}
                    target={hero?.secondaryCta?.newTab ? "_blank" : undefined}
                    rel={hero?.secondaryCta?.noFollow ? "nofollow" : undefined}
                    className="group inline-flex items-center gap-2 px-4 py-3 text-zinc-300 hover:text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    <span>{hero?.secondaryCta?.text || hero?.ctaSecondaryText}</span>
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Visual / Image Box */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[500px] lg:max-w-none aspect-square rounded-3xl md:rounded-[32px] overflow-hidden relative border border-white/10 shadow-2xl bg-zinc-900">
                <Image
                  src={
                    heroImgError
                      ? DEFAULT_IMAGE
                      : getImageSrc(hero?.image)
                  }
                  alt={hero?.title || "Digital Marketing Services"}
                  fill
                  className="object-cover opacity-90"
                  onError={() => setHeroImgError(true)}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: WHY IT MATTERS (COMPOUND SYSTEM) */}
      {/* ========================================================================= */}
      {whyItMatters && (
        <section id="section-whyItMatters" className="relative w-full bg-white text-zinc-900 py-20 lg:py-28 overflow-hidden">
          <div className="site-container px-4 sm:px-6 lg:px-8">
            {/* Top Grid: Image + Copy */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16 lg:mb-20">
              {/* Left Image */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full aspect-[4/3] rounded-3xl md:rounded-[32px] overflow-hidden bg-zinc-200 border border-zinc-200/80 shadow-xl">
                  <Image
                    src={
                      section2ImgError
                        ? DEFAULT_IMAGE
                        : getImageSrc(whyItMatters?.image)
                    }
                    alt={whyItMatters?.title || "Why It Matters"}
                    fill
                    className="object-cover"
                    onError={() => setSection2ImgError(true)}
                  />
                </div>
              </div>

              {/* Right Text Content */}
              <div className="lg:col-span-6 flex flex-col items-start space-y-6">
                {/* Badge */}
                {whyItMatters?.badge && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-300 bg-white shadow-xs">
                    <span className="text-[#F5A817] text-sm font-bold">✦</span>
                    <span className="text-xs font-bold text-zinc-900 tracking-wide">
                      {whyItMatters.badge}
                    </span>
                  </div>
                )}

                {/* Title */}
                {whyItMatters?.title && (
                  <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-zinc-900 tracking-tight leading-[1.18]">
                    {whyItMatters.title}
                  </h2>
                )}

                {/* Description */}
                {whyItMatters?.description && (
                  <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
                    {whyItMatters.description}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Grid: 4 Metric Cards with Hardcoded Icons */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m: any, idx: number) => {
                  const IconComp = WHY_IT_MATTERS_ICONS[idx % WHY_IT_MATTERS_ICONS.length];
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:border-zinc-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                            {m.stat}
                          </div>

                          <div className="w-11 h-11 rounded-full bg-[#F5A817] flex items-center justify-center text-black shrink-0 shadow-sm">
                            <IconComp className="w-5 h-5 text-black stroke-[2.5]" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 mb-1">
                            {m.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: FULL-STACK MARKETING ENGINE & 4 WIRED LAYERS */}
      {/* ========================================================================= */}
      {fullStackEngine && (
        <section id="section-fullStackEngine" className="relative w-full bg-black text-white py-24 lg:py-36 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={DEFAULT_IMAGE}
              alt="Marketing Engine Background"
              fill
              className="object-cover opacity-25 filter blur-lg scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/85 to-[#050505]" />
          </div>

          <div className="relative z-10 site-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              {fullStackEngine?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
                  <span className="text-[#F5A817]">✦</span>
                  <span>{fullStackEngine.badge}</span>
                </div>
              )}

              {fullStackEngine?.title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  {fullStackEngine.title}
                </h2>
              )}

              {fullStackEngine?.description && (
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  {fullStackEngine.description}
                </p>
              )}
            </div>

            {services.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
                {services.map((item: any, idx: number) => {
                  const IconComp = SERVICES_ICONS[idx % SERVICES_ICONS.length];
                  return (
                    <div
                      key={idx}
                      className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 hover:border-[#F5A817]/40 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 shadow-2xl group flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-[#F5A817]/10 border border-[#F5A817]/30 flex items-center justify-center text-[#F5A817] group-hover:scale-110 transition-transform">
                          <IconComp className="w-5 h-5" />
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-[#F5A817] transition-colors">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(fullStackEngine?.layersTitle || layers.length > 0) && (
              <>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                  {fullStackEngine?.layersBadge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
                      <span className="text-[#F5A817]">✦</span>
                      <span>{fullStackEngine.layersBadge}</span>
                    </div>
                  )}

                  {fullStackEngine?.layersTitle && (
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {fullStackEngine.layersTitle}
                    </h2>
                  )}
                </div>

                {layers.length > 0 && (
                  <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                    {layers.map((layer: any, idx: number) => {
                      const IconComp = LAYERS_ICONS[idx % LAYERS_ICONS.length];
                      return (
                        <div
                          key={idx}
                          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 hover:border-[#F5A817]/40 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                        >
                          <div className="flex items-center gap-4 sm:gap-6 min-w-[280px]">
                            <div className="w-11 h-11 rounded-xl bg-[#F5A817]/10 border border-[#F5A817]/30 flex items-center justify-center text-[#F5A817] shrink-0 group-hover:scale-105 transition-transform">
                              <IconComp className="w-5 h-5" />
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-extrabold text-zinc-500 font-mono">
                                {layer.num}
                              </span>
                              <span className="text-[#F5A817] text-xs font-bold">●</span>
                              <h3 className="text-base font-bold text-white tracking-tight">
                                {layer.title}
                              </h3>
                            </div>
                          </div>

                          <div className="hidden md:block w-px h-10 bg-white/10 shrink-0" />

                          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed md:max-w-md">
                            {layer.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: STRUCTURED PATH & OUTCOMES */}
      {/* ========================================================================= */}
      {processSection && (
        <section id="section-processSection" className="relative w-full bg-white text-zinc-900 py-24 lg:py-36 overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-[#FFE4B5]/60 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-[#FFE4B5]/60 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 site-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              {processSection?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-300 bg-white shadow-xs mb-6">
                  <span className="text-[#F5A817] text-sm font-bold">✦</span>
                  <span className="text-xs font-bold text-zinc-900 tracking-wide">
                    {processSection.badge}
                  </span>
                </div>
              )}

              {processSection?.title && (
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-zinc-900 tracking-tight mb-4 leading-tight">
                  {processSection.title}
                </h2>
              )}

              {processSection?.description && (
                <p className="text-zinc-500 text-sm sm:text-base font-normal">
                  {processSection.description}
                </p>
              )}
            </div>

            {/* 6 Process Cards Grid */}
            {processSteps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 lg:gap-16 mb-32">
                {processSteps.map((step: any, idx: number) => (
                  <div key={idx} className="relative pt-7 pl-7 sm:pt-9 sm:pl-9 group">
                    <div className="absolute top-[-20] left-[-20] w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-[#F5A817] p-3.5 sm:p-4 z-0 flex items-start justify-start shadow-sm">
                      <span className="text-2xl sm:text-3xl font-extrabold text-black font-sans tracking-tight leading-none pt-0.5 pl-0.5">
                        {step.num}
                      </span>
                    </div>

                    <div className="relative z-10 bg-[#FFFDF6]/80 backdrop-blur-md border border-white/90 rounded-[28px] p-6 sm:p-8 text-center shadow-xl shadow-black/[0.04] hover:shadow-2xl hover:bg-[#FFFDF6]/90 transition-all duration-300 min-h-[170px] flex flex-col items-center justify-center">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-2 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed max-w-[260px] mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(processSection?.outcomesTitle || outcomes.length > 0) && (
              <>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                  {processSection?.outcomesBadge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 bg-[#FFFDF0] shadow-xs mb-6">
                      <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">
                        {processSection.outcomesBadge}
                      </span>
                    </div>
                  )}

                  {processSection?.outcomesTitle && (
                    <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-zinc-900 tracking-tight mb-4 leading-tight">
                      {processSection.outcomesTitle}
                    </h2>
                  )}

                  {processSection?.outcomesDescription && (
                    <p className="text-zinc-500 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
                      {processSection.outcomesDescription}
                    </p>
                  )}
                </div>

                {outcomes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {outcomes.map((item: any, idx: number) => {
                      const IconComp = OUTCOMES_ICONS[idx % OUTCOMES_ICONS.length];
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-zinc-200/70 rounded-3xl p-6 shadow-md shadow-black/[0.03] hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="w-10 h-10 rounded-full bg-[#F5A817] flex items-center justify-center text-black shadow-sm">
                              <IconComp className="w-4 h-4 text-black stroke-[2.5]" />
                            </div>

                            <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight pt-1">
                              {item.stat}
                            </div>

                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 mb-1">
                                {item.title}
                              </h3>
                              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: CASE STUDIES, STRATEGY ACCORDION & ENTERPRISE ASSURANCE */}
      {/* ========================================================================= */}
      {caseStudiesSection && (
        <section id="section-caseStudiesSection" className="relative w-full bg-[#050505] text-white py-24 lg:py-36 overflow-hidden border-t border-zinc-900">
          <div className="site-container px-4 sm:px-6 lg:px-8">
            {/* PART A: FEATURED CASE STUDIES */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              {caseStudiesSection?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{caseStudiesSection.badge}</span>
                </div>
              )}

              {caseStudiesSection?.title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  {caseStudiesSection.title}{" "}
                  {caseStudiesSection?.titleHighlight && (
                    <span className="text-[#F5A817]">
                      {caseStudiesSection.titleHighlight}
                    </span>
                  )}
                </h2>
              )}

              {caseStudiesSection?.description && (
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  {caseStudiesSection.description}
                </p>
              )}
            </div>

            {/* 3 Case Study Cards */}
            {caseStudies.length > 0 && (
              <div className="space-y-8 mb-32">
                {caseStudies.map((cs: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:border-zinc-700 transition-all duration-300 shadow-2xl"
                  >
                    <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-zinc-900 overflow-hidden">
                      <Image
                        src={getImageSrc(cs.image)}
                        alt={cs.title}
                        fill
                        className="object-cover opacity-85"
                      />
                      {cs.category && (
                        <div className="absolute top-6 left-6 z-10 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md text-[11px] font-bold text-white uppercase tracking-wider">
                          {cs.category}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                          {cs.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                          {cs.desc}
                        </p>

                        {cs.tags && cs.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {cs.tags.map((t: string, tidx: number) => (
                              <span
                                key={tidx}
                                className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-400 text-xs font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-zinc-800/80 flex items-center gap-10 sm:gap-16">
                        <div>
                          <div className="text-2xl sm:text-3xl font-extrabold text-[#F5A817] tracking-tight">
                            {cs.stat1}
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {cs.label1}
                          </div>
                        </div>

                        <div>
                          <div className="text-2xl sm:text-3xl font-extrabold text-[#F5A817] tracking-tight">
                            {cs.stat2}
                          </div>
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                            {cs.label2}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PART B: STRATEGY FIRST */}
            {strategyPoints.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-32">
                <div className="lg:col-span-6 space-y-8">
                  {caseStudiesSection?.strategyBadge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider shadow-xs">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{caseStudiesSection.strategyBadge}</span>
                    </div>
                  )}

                  <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-white tracking-tight leading-[1.12]">
                    {caseStudiesSection?.strategyTitleLine1 || "Strategy first."}{" "}
                    <br />
                    {caseStudiesSection?.strategyTitleLine2 ||
                      "Execution second."}{" "}
                    <br />
                    {caseStudiesSection?.strategyTitleHighlight && (
                      <span className="text-[#F5A817]">
                        {caseStudiesSection.strategyTitleHighlight}
                      </span>
                    )}
                  </h2>

                  <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
                    <div className="text-xl font-extrabold text-[#F5A817] font-mono">
                      {strategyPoints[activeStrategyIndex]?.num || "01"}
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {strategyPoints[activeStrategyIndex]?.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                      {strategyPoints[activeStrategyIndex]?.desc}
                    </p>
                    {strategyPoints[activeStrategyIndex]?.footerTag && (
                      <div className="pt-4 border-t border-zinc-800/80">
                        <span className="text-[10px] font-bold text-[#F5A817] tracking-widest uppercase">
                          {strategyPoints[activeStrategyIndex]?.footerTag}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-0 divide-y divide-zinc-800/80 pt-4 lg:pt-16">
                  {strategyPoints.map((sp: any, idx: number) => {
                    const isActive = activeStrategyIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveStrategyIndex(idx)}
                        className="py-4 sm:py-5 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs sm:text-sm font-mono font-bold ${
                              isActive ? "text-[#F5A817]" : "text-zinc-500"
                            }`}
                          >
                            {sp.num}
                          </span>
                          <h4
                            className={`text-sm sm:text-base font-bold transition-colors ${
                              isActive
                                ? "text-[#F5A817]"
                                : "text-zinc-300 group-hover:text-white"
                            }`}
                          >
                            {sp.title}
                          </h4>
                        </div>

                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isActive
                              ? "text-[#F5A817] translate-x-1"
                              : "text-zinc-600 group-hover:text-zinc-[#F5A817] group-hover:translate-x-0.5"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART C: ENTERPRISE ASSURANCE */}
            {caseStudiesSection?.assuranceTitle && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-8">
                <div className="lg:col-span-6 space-y-6">
                  {caseStudiesSection?.assuranceBadge && (
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider shadow-xs">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{caseStudiesSection.assuranceBadge}</span>
                    </div>
                  )}

                  <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-white tracking-tight leading-[1.12]">
                    {caseStudiesSection.assuranceTitle} <br />
                    {caseStudiesSection?.assuranceHighlight && (
                      <span className="text-[#F5A817]">
                        {caseStudiesSection.assuranceHighlight}
                      </span>
                    )}
                  </h2>

                  {caseStudiesSection?.assuranceDescription && (
                    <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                      {caseStudiesSection.assuranceDescription}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-6 flex justify-center lg:justify-end">
                  <div className="w-full max-w-[580px] aspect-[4/3] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl bg-zinc-900">
                    <Image
                      src={getImageSrc(caseStudiesSection?.assuranceImage)}
                      alt={caseStudiesSection?.assuranceTitle || "Enterprise Delivery"}
                      fill
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: WHO WE ARE */}
      {/* ========================================================================= */}
      {whoWeAreSection && (
        <section id="section-whoWeAreSection" className="relative w-full bg-white text-zinc-900 py-20 lg:py-28 overflow-hidden border-t border-zinc-100">
          <div className="site-container px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-16 lg:mb-20">
              <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                {whoWeAreSection?.badge && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-300 bg-white shadow-xs">
                    <span className="text-[#F5A817] text-sm font-bold">✦</span>
                    <span className="text-xs font-bold text-zinc-900 tracking-wide">
                      {whoWeAreSection.badge}
                    </span>
                  </div>
                )}

                {whoWeAreSection?.title && (
                  <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-zinc-900 tracking-tight leading-[1.15]">
                    {whoWeAreSection.title}{" "}
                    {whoWeAreSection?.titleHighlight && (
                      <span className="text-[#F5A817]">
                        {whoWeAreSection.titleHighlight}
                      </span>
                    )}{" "}
                    {whoWeAreSection?.titleEnd}
                  </h2>
                )}

                {whoWeAreSection?.description && (
                  <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
                    {whoWeAreSection.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {(whoWeAreSection?.cta?.text || whoWeAreSection?.ctaPrimaryText) && (
                    <a
                      href={(typeof whoWeAreSection?.cta === "object" ? whoWeAreSection?.cta?.url : whoWeAreSection?.ctaPrimaryLink) || "/services"}
                      target={whoWeAreSection?.cta?.newTab ? "_blank" : undefined}
                      rel={whoWeAreSection?.cta?.noFollow ? "nofollow" : undefined}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm transition-colors cursor-pointer"
                    >
                      <span>{whoWeAreSection?.cta?.text || whoWeAreSection?.ctaPrimaryText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}

                  {(whoWeAreSection?.secondaryCta?.text || whoWeAreSection?.ctaSecondaryText) && (
                    <a
                      href={(typeof whoWeAreSection?.secondaryCta === "object" ? whoWeAreSection?.secondaryCta?.url : whoWeAreSection?.ctaSecondaryLink) || "/contact"}
                      target={whoWeAreSection?.secondaryCta?.newTab ? "_blank" : undefined}
                      rel={whoWeAreSection?.secondaryCta?.noFollow ? "nofollow" : undefined}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-300 hover:bg-zinc-50 text-zinc-900 font-semibold text-sm transition-colors cursor-pointer"
                    >
                      <span>{whoWeAreSection?.secondaryCta?.text || whoWeAreSection?.ctaSecondaryText}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[480px] aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xl">
                  <Image
                    src={getImageSrc(whoWeAreSection?.image)}
                    alt={whoWeAreSection?.title || "Who We Are"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {whoWeAreMetrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {whoWeAreMetrics.map((m: any, idx: number) => {
                  const IconComp = WHO_WE_ARE_ICONS[idx % WHO_WE_ARE_ICONS.length];
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:border-zinc-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                            {m.stat}
                          </div>

                          <div className="w-11 h-11 rounded-full bg-[#F5A817] flex items-center justify-center text-black shrink-0 shadow-sm">
                            <IconComp className="w-5 h-5 text-black stroke-[2.5]" />
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 mb-1">
                            {m.title}
                          </h3>
                          <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                            {m.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: BUSINESS CHALLENGES */}
      {/* ========================================================================= */}
      {problemsSection && (
        <section id="section-problemsSection" className="relative w-full bg-white text-zinc-900 py-20 lg:py-28 overflow-hidden border-t border-zinc-100">
          <div className="site-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              {problemsSection?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300 bg-[#FFFDF0] text-xs font-bold text-zinc-900 shadow-xs mb-6">
                  <span className="text-[#F5A817] text-sm font-bold">✦</span>
                  <span>{problemsSection.badge}</span>
                </div>
              )}

              {problemsSection?.title && (
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-bold text-zinc-900 tracking-tight mb-4 leading-tight">
                  {problemsSection.title}{" "}
                  {problemsSection?.titleHighlight && (
                    <span className="text-[#F5A817]">
                      {problemsSection.titleHighlight}
                    </span>
                  )}
                </h2>
              )}

              {problemsSection?.description && (
                <p className="text-zinc-500 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
                  {problemsSection.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full aspect-square lg:aspect-auto min-h-[320px] rounded-3xl overflow-hidden bg-[#18181B] border border-zinc-800 shadow-2xl flex items-center justify-center p-6">
                  <Image
                    src={getImageSrc(problemsSection?.image)}
                    alt={problemsSection?.title || "Business Challenges"}
                    fill
                    className="object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {problemCards.length > 0 && (
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {problemCards.map((card: any, idx: number) => {
                    const IconComp = PROBLEMS_ICONS[idx % PROBLEMS_ICONS.length];
                    return (
                      <div
                        key={idx}
                        className="bg-[#FFFDF9] border border-amber-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                            <IconComp className="w-4.5 h-4.5 text-zinc-800" />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 mb-1">
                              {card.title}
                            </h3>
                            <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                              {card.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: PERSPECTIVES FROM OUR DELIVERY PRACTICE */}
      {/* ========================================================================= */}
      {perspectivesSection && (
        <section id="section-perspectivesSection" className="relative w-full bg-[#050505] text-white py-24 lg:py-32 overflow-hidden border-t border-zinc-900">
          <div className="site-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start max-w-3xl mb-16">
              {perspectivesSection?.badge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F5A817]/30 bg-[#F5A817]/10 text-[#F5A817] text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{perspectivesSection.badge}</span>
                </div>
              )}

              {perspectivesSection?.title && (
                <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-extrabold text-white tracking-tight leading-[1.12]">
                  {perspectivesSection.title} <br />
                  {perspectivesSection?.titleHighlight && (
                    <span className="text-[#F5A817]">
                      {perspectivesSection.titleHighlight}
                    </span>
                  )}
                </h2>
              )}
            </div>

            {insightCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {insightCards.map((card: any, idx: number) => (
                  <div key={idx} className="group cursor-pointer flex flex-col">
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 mb-4 shadow-xl group-hover:border-[#F5A817]/40 transition-all duration-300">
                      <Image
                        src={getImageSrc(card.image)}
                        alt={card.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {card.category && (
                      <span className="text-[11px] font-bold text-[#F5A817] tracking-wider uppercase mb-2">
                        {card.category}
                      </span>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#F5A817] transition-colors">
                      {card.title}
                    </h3>

                    {card.readTime && (
                      <p className="text-xs text-zinc-500 font-medium">
                        {card.readTime}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 9: FREQUENTLY ASKED QUESTIONS */}
      {/* ========================================================================= */}
      <div id="section-faqsSection">
        <FaqSection
          badge={faqsSection?.badge}
          title={faqsSection?.title}
          graphicImage={getImageSrc(faqsSection?.graphicImage)}
          graphicTitleLine1={faqsSection?.graphicTitleLine1}
          graphicTitleLine2={faqsSection?.graphicTitleLine2}
          graphicTitleLine3={faqsSection?.graphicTitleLine3}
          graphicTitleLine4={faqsSection?.graphicTitleLine4}
          list={faqsList}
        />
      </div>
    </main>
  );
}
