"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import * as LucideIcons from "lucide-react";

const IconMap: Record<string, React.ComponentType<any>> = {
  Search: LucideIcons.Search,
  PenTool: LucideIcons.PenTool,
  Code: LucideIcons.Code,
  Rocket: LucideIcons.Rocket,
  ShoppingCart: LucideIcons.ShoppingCart,
  GraduationCap: LucideIcons.GraduationCap,
  Building: LucideIcons.Building,
  CircleDollarSign: LucideIcons.CircleDollarSign,
  HeartPulse: LucideIcons.HeartPulse,
  Utensils: LucideIcons.Utensils,
  Store: LucideIcons.Store,
  Cpu: LucideIcons.Cpu,
  TrendingUp: LucideIcons.TrendingUp,
  Maximize: LucideIcons.Maximize,
  ArrowUpRight: LucideIcons.ArrowUpRight,
  ArrowRight: LucideIcons.ArrowRight,
  Check: LucideIcons.Check,
  Lightbulb: LucideIcons.Lightbulb,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  Star: LucideIcons.Star,
};

const DEFAULT_IMAGE = "https://res.cloudinary.com/subash-cms/image/upload/v1787243108/placeholder.png";
const getImageSrc = (img: any) => { if (!img) return DEFAULT_IMAGE; if (typeof img === 'string') return img; if (typeof img === 'object' && img.url) return img.url; return DEFAULT_IMAGE; };
const getImageAlt = (img: any) => { if (typeof img === 'object' && img.alt) return img.alt; return ""; };

export default function HomeClient({ content: initialContent }: { content: any }) {
  const [content, setContent] = useState(initialContent);
  const [sliderIndex, setSliderIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeYsProductId, setActiveYsProductId] = useState("leadgen");

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_UPDATE_HOMEPAGE" && e.data.content) {
        setContent(e.data.content);
      }
      if (e.data?.type === "SCROLL_TO_SECTION" && e.data.section) {
        const sectionId = e.data.section;
        const element = document.querySelector(`[data-section~="${sectionId}"]`) || document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    window.addEventListener("message", handleMessage);
    
    // Prevent navigation if rendered inside the admin iframe
    if (window !== window.parent) {
      const handleIframeClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('a')) {
          e.preventDefault();
        }
      };
      document.addEventListener('click', handleIframeClick, true);
      return () => {
        window.removeEventListener("message", handleMessage);
        document.removeEventListener('click', handleIframeClick, true);
      };
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const projects = content.projects || [];
  const ysProducts = content.ysProducts || [];
  const logos = content.trusted?.logos || [];
  
  // Safe normalization of highlights to handle new 4-field format or fallback to corrupted DB string
  let highlights: string[] = [];
  if (content.hero?.highlight1) highlights.push(content.hero.highlight1);
  if (content.hero?.highlight2) highlights.push(content.hero.highlight2);
  if (content.hero?.highlight3) highlights.push(content.hero.highlight3);
  if (content.hero?.highlight4) highlights.push(content.hero.highlight4);

  if (highlights.length === 0) {
    const rawHighlights = content.hero?.highlights || [];
    highlights = Array.isArray(rawHighlights) 
      ? rawHighlights.map((h: any) => typeof h === 'object' ? h.text : h)
      : (typeof rawHighlights === 'string' 
          ? rawHighlights.split(',').map(s => s.trim()) 
          : []);
  }

  const services = content.services || [];
  const testimonials = content.testimonials || [];
  const processSteps = content.process?.steps || [];
  const simpleSteps = content.simpleSteps?.steps || [];
  const industriesList = content.industries?.list || [];
  const techList = content.technologies?.list || [];
  const whyChooseUs = content.whyChooseUs || { features: [], marquee: [] };
  const connectSection = content.connect || {};

  const activeProjectIndex = projects.length > 0 
    ? ((sliderIndex - 1) % projects.length + projects.length) % projects.length 
    : 0;

  const activeProject = projects[activeProjectIndex] || {};

  const handlePrevProject = () => {
    if (isAnimating || projects.length === 0) return;
    setIsAnimating(true);
    setSliderIndex((prev) => prev - 1);
  };

  const handleNextProject = () => {
    if (isAnimating || projects.length === 0) return;
    setIsAnimating(true);
    setSliderIndex((prev) => prev + 1);
  };

  const handleTransitionEnd = () => {
    if (projects.length === 0) return;
    if (sliderIndex === projects.length + 1) {
      setIsTransitioning(false);
      setSliderIndex(1);
    } else if (sliderIndex === 0) {
      setIsTransitioning(false);
      setSliderIndex(projects.length);
    }
    setIsAnimating(false);
  };

  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const marqueeLogos = [...logos, ...logos, ...logos];

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-black text-white">
      <main className="w-full flex-1 bg-black">
        
        <section data-section="hero" className="relative w-full bg-[#0c0a06] border-b border-primary/20 rounded-b-[50px] md:rounded-b-[80px] overflow-hidden shadow-2xl pt-6 pb-0">
          
          {getImageSrc(content.hero?.bgImage) && (
            <div className="absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none">
              <Image
                src={getImageSrc(content.hero.bgImage)}
                alt={getImageAlt(content.hero.bgImage)}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          )}

          <div className="absolute top-0 left-0 w-150 h-150 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-150 h-150 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col lg:flex-row items-end justify-between gap-6 lg:gap-8 pt-6 sm:pt-10 lg:pt-12 pb-0">
              
              <div className="w-full lg:w-[40%] space-y-6 text-left pb-10 sm:pb-14 lg:pb-16 shrink-0">
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c160a] border border-primary/40 shadow-inner">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {content.hero?.badge}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.08] whitespace-pre-line">
                  {content.hero?.title}
                </h1>

                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  {content.hero?.subtext}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={content.hero?.cta?.url || "#contact"}
                    className="inline-flex items-center gap-3 px-6 lg:pl-5 lg:pr-3 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/25 group"
                  >
                    <span>{content.hero?.cta?.text}</span>
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white text-xs group-hover:rotate-45 transition-transform">
                      <LucideIcons.ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </Link>

                  <Link
                    href={content.hero?.secondaryCta?.url || "#portfolio"}
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-black/60 hover:bg-white/10 border border-white/20 text-white font-semibold text-sm transition-all transform hover:scale-[1.02]"
                  >
                    <span>{content.hero?.secondaryCta?.text}</span>
                    <LucideIcons.ArrowUpRight className="w-4 h-4 text-white" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-6 border-t border-white/10">
                  {highlights.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <LucideIcons.Check className="w-3.5 h-3.5 text-black stroke-3" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

              {getImageSrc(content.hero?.image) && (
                <div className="w-full lg:w-[60%] relative flex justify-center lg:justify-end items-end h-full mt-4 lg:mt-0 self-end -mb-1">
                  <div className="relative w-full max-w-162.5 lg:max-w-195 h-95 sm:h-125 lg:h-155">
                    <Image
                      src={getImageSrc(content.hero.image)}
                      alt={getImageAlt(content.hero.image)}
                      fill
                      className="object-contain object-bottom lg:object-bottom-right drop-shadow-2xl"
                      priority
                    />
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        <section data-section="trusted" className="w-full bg-black py-14 border-b border-white/5">
          
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="text-sm md:text-base font-bold text-zinc-300 tracking-wide flex items-center justify-center gap-2 flex-wrap">
              <span>{content.trusted?.title}</span>
              <span className="bg-primary text-black font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-sm">
                {content.trusted?.count}
              </span>
              <span>{content.trusted?.subtext}</span>
            </p>

            <div className="relative w-full overflow-hidden mask-gradient-x py-2">
              <div className="animate-marquee flex items-center gap-12 sm:gap-16 md:gap-20">
                {marqueeLogos.map((logo: any, index: number) => (
                  <div
                    key={index}
                    className="h-10 md:h-12 flex items-center justify-center shrink-0 filter grayscale brightness-200 hover:grayscale-0 hover:brightness-100 transition-all duration-300"
                  >
                    <Image
                      src={getImageSrc(logo.src)}
                      alt={getImageAlt(logo.src) || logo.name}
                      width={120}
                      height={40}
                      className="object-contain max-h-full"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" data-section="servicesGroup" className="w-full bg-white text-zinc-900 py-20 sm:py-28 relative">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-16 sm:mb-20">
              <div className="lg:w-[70%] space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-300 shadow-sm">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                    {content.servicesSection?.badge}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-zinc-900 tracking-tight leading-tight">
                  {content.servicesSection?.title}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {services.map((service: any) => (
                <div
                  key={service.id}
                  className="group relative flex flex-col rounded-sm bg-white p-5 hover:shadow-md transition-all duration-500 hover:-translate-y-0.5 border border-zinc-200"
                >
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-zinc-100 mb-6">
                    <Image
                      src={getImageSrc(service.image)}
                      alt={getImageAlt(service.image) || service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                  </div>

                  <div className="flex flex-col flex-1 text-left">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-2">
                      {service.category}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-zinc-500 text-sm sm:text-[15px] leading-relaxed font-normal mb-6">
                      {service.description}
                    </p>

                    <div className="mt-auto flex flex-col gap-5">
                      <div className="flex flex-wrap gap-2">
                        {service.tags?.map((tag: string, i: number) => (
                          <span key={i} className="px-3 py-1 rounded-sm bg-[#FFF9F0] text-[#D97706] text-[11px] font-medium border border-[#FDE68A]">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={service.link?.url || "#"}
                        target={service.link?.newTab ? "_blank" : undefined}
                        rel={service.link?.noFollow ? "nofollow noopener noreferrer" : "noopener noreferrer"}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-black text-white text-sm font-bold hover:bg-zinc-800 transition-colors w-max"
                      >
                        {service.link?.text} <LucideIcons.ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section id="portfolio" data-section="projectsGroup" className="w-full bg-[#fafafa] text-zinc-900 py-20 sm:py-28 border-t border-b border-zinc-200">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-300 shadow-sm mb-6">
                <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                  {content.projectsSection?.badge}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight max-w-3xl mx-auto">
                {content.projectsSection?.title}
              </h2>
            </div>

            {projects.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                <div className="lg:col-span-7">
                  <div className="relative aspect-4/3 w-full rounded-3xl sm:rounded-3xl overflow-hidden group shadow-xl">
                    
                    <div 
                      className={`flex h-full w-full ${isTransitioning ? 'transition-transform duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''}`}
                      style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
                      onTransitionEnd={handleTransitionEnd}
                    >
                      {[projects[projects.length - 1], ...projects, projects[0]].map((proj: any, idx: number) => (
                        <div key={`${proj.id}-${idx}`} className="relative w-full h-full shrink-0">
                          <Image
                            src={getImageSrc(proj.img)}
                            alt={getImageAlt(proj.img) || proj.title}
                            fill
                            className="object-contain object-center"
                            priority
                          />
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-6 right-6 flex gap-2.5 z-20">
                      <button
                        onClick={handlePrevProject}
                        className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center border border-zinc-200 shadow-md backdrop-blur-sm transition-all transform active:scale-95"
                      >
                        <LucideIcons.ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={handleNextProject}
                        className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center border border-zinc-200 shadow-md backdrop-blur-sm transition-all transform active:scale-95"
                      >
                        <LucideIcons.ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col justify-center h-full py-2 min-h-90 text-left">
                  <div className="space-y-4 transition-all duration-800ms ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 leading-snug">
                      {activeProject.title}
                    </h3>
                    <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                      {activeProject.desc}
                    </p>
                    
                    <div className="pt-2">
                      {activeProject.tags && activeProject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {activeProject.tags.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-sm bg-zinc-100 text-zinc-600 text-[11px] font-bold border border-zinc-200 uppercase tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Link
                        href={activeProject.link?.url || "#"}
                        target={activeProject.link?.newTab ? "_blank" : undefined}
                        rel={activeProject.link?.noFollow ? "nofollow noopener noreferrer" : "noopener noreferrer"}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-md shadow-primary/20 group"
                      >
                        <span>{activeProject.link?.text || content.projectsSection?.cta?.text}</span>
                        <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-[10px] group-hover:rotate-45 transition-transform">
                          <LucideIcons.ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-8 w-full">
                    <div className="flex items-center gap-3 w-full relative min-h-22.5">
                      {[1, 2, 3, 4].map((offset) => {
                        const idx = (activeProjectIndex + offset) % projects.length;
                        const project = projects[idx];
                        if (!project) return null;
                        return (
                          <button
                            key={`${project.id}-${idx}-${activeProjectIndex}`}
                            onClick={() => {
                              if (!isAnimating) {
                                setIsAnimating(true);
                                setSliderIndex(idx + 1);
                              }
                            }}
                            className="animate-slide-in relative shrink-0 w-28 sm:w-32 aspect-3/2 rounded-xl opacity-60 hover:opacity-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                          >
                            <div className="relative w-full h-full rounded-lg overflow-hidden bg-white pointer-events-none">
                              <Image
                                src={getImageSrc(project.img)}
                                alt={getImageAlt(project.img) || project.title}
                                fill
                                className="object-contain object-center"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </section>

        <section data-section="process" className="w-full bg-white text-zinc-900 py-20 sm:py-24">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-5 items-start">
              
              <div className="w-full lg:w-[40%] lg:sticky lg:top-32 shrink-0">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-300 shadow-sm mb-6">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-zinc-900" />
                  <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                    {content.process?.badge}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-zinc-900 tracking-tight leading-tight mb-8">
                  {content.process?.title}
                </h2>

                <Link
                  href={content.process?.cta?.url || "/contact-us"}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-md shadow-primary/20 group"
                >
                  <span>{content.process?.cta?.text}</span>
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px] group-hover:rotate-45 transition-transform">
                    <LucideIcons.ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </div>

              <div className="w-full lg:w-[60%] space-y-6 lg:space-y-8">
                {processSteps.map((step: any, index: number) => {
                  const PROCESS_ICONS = [LucideIcons.Search, LucideIcons.PenTool, LucideIcons.Code, LucideIcons.Rocket, LucideIcons.TrendingUp];
                  const StepIcon = PROCESS_ICONS[index % PROCESS_ICONS.length];
                  return (
                    <div key={index} className="bg-[#FFF4E2] border border-orange-100 p-8 sm:p-15 flex flex-col sm:flex-row gap-6 sm:gap-20 shadow-sm hover:shadow-md transition-shadow">
                      <div className="sm:w-[45%] flex flex-col gap-5 sm:gap-6 text-left">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-inner shrink-0">
                          <StepIcon className="w-7 h-7 text-white stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 leading-snug">
                          {step.title}
                        </h3>
                      </div>
                      
                      <div className="sm:w-[55%] flex flex-col gap-6 text-left">
                        <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                          {step.desc}
                        </p>
                        <ul className="space-y-3">
                          {step.list.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-3">
                              <LucideIcons.ChevronsRight className="w-4 h-4 text-primary shrink-0 stroke-3" />
                              <span className="text-sm font-bold text-zinc-800 tracking-wide">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        <section data-section="simpleSteps" className="w-full bg-white text-zinc-900 pb-20 sm:py-24">
          <div 
            className="relative max-w-325 mx-auto w-full px-6 py-16 sm:py-20 lg:px-12 z-10 rounded-4xl overflow-hidden shadow-2xl"
            style={content.simpleSteps?.bgImage ? {
              backgroundImage: `url('${getImageSrc(content.simpleSteps.bgImage)}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10">
              
              <div className="text-center mb-16 sm:mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/80 border border-zinc-800 shadow-sm mb-6 backdrop-blur-sm">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {content.simpleSteps?.badge}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
                  {content.simpleSteps?.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {simpleSteps.map((step: any, index: number) => (
                  <div key={index} className="relative pt-7.5 w-full group">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-15 h-15 rounded-full bg-primary flex items-center justify-center text-black font-extrabold text-lg z-20 shadow-[0_4px_20px_rgba(255,184,0,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_4px_25px_rgba(255,184,0,0.5)]">
                      {step.num}
                    </div>

                    <div 
                      className="bg-[#0b0b0b] text-center p-8 pt-14 rounded-3xl w-full h-full shadow-2xl transition-all duration-300 group-hover:bg-[#111111]"
                      style={{
                        WebkitMaskImage: "radial-gradient(circle at 50% 0, transparent 40px, black 41px)",
                        maskImage: "radial-gradient(circle at 50% 0, transparent 40px, black 41px)"
                      }}
                    >
                      <h3 className="text-xl font-bold text-white mb-4 leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section data-section="industries" className="w-full bg-[#fcfcfc] text-zinc-900 py-20 sm:py-28 border-t border-zinc-200">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 sm:mb-20">
              <div className="max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-300 shadow-sm mb-6">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                    {content.industries?.badge}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-6">
                  {content.industries?.title}
                </h2>
                <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                  {content.industries?.description}
                </p>
              </div>
              
              <Link
                href={content.industries?.cta?.url || "/contact-us"}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-md shadow-primary/20 shrink-0 group"
              >
                <span>{content.industries?.cta?.text}</span>
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px] group-hover:rotate-45 transition-transform">
                  <LucideIcons.ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {industriesList.map((industry: any, index: number) => {
                const IND_ICONS = [LucideIcons.Building, LucideIcons.GraduationCap, LucideIcons.HeartPulse, LucideIcons.Utensils, LucideIcons.Store, LucideIcons.Cpu];
                const IndIcon = IND_ICONS[index % IND_ICONS.length];
                return (
                  <div key={index} className="bg-[#0b0b0b] rounded-sm p-8 flex flex-col gap-6 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group border border-zinc-900 hover:border-zinc-700 text-left">
                    <div className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center bg-[#141414] group-hover:bg-[#1a1a1a] transition-colors shadow-inner">
                      <IndIcon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-3">{industry.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{industry.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        <section data-section="technologies" className="w-full bg-[#030303] text-white py-20 sm:py-28 border-t border-zinc-900">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/80 border border-zinc-800 shadow-sm mb-6 backdrop-blur-sm">
                <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  {content.technologies?.badge}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
                {content.technologies?.title}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {techList.map((tech: any, index: number) => (
                <div key={index} className="bg-[#111111] rounded-3xl p-6 sm:p-8 flex flex-col gap-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group border border-zinc-800 hover:border-zinc-700 text-left">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-[#1a1a1a] border border-zinc-800 p-2.5 flex items-center justify-center">
                      <Image 
                        src={getImageSrc(tech.icon)} 
                        alt={getImageAlt(tech.icon) || tech.name} 
                        width={32} 
                        height={32} 
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <h3 className="text-white font-bold text-xl leading-snug">{tech.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section data-section="productsGroup" className="w-full bg-white text-zinc-900 py-20 sm:py-28 border-t border-zinc-200">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-300 shadow-sm mb-6">
                <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                  {content.productsSection?.badge}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-6">
                {content.productsSection?.title}
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
                {content.productsSection?.description}
              </p>
            </div>

            {ysProducts.length > 0 && (
              <div className="bg-[#f0f0f0] rounded-4xl p-4 lg:p-5 shadow-inner">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 lg:h-155">
                  
                  <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 grid-rows-[auto_auto] gap-4 lg:gap-5 h-full order-2 lg:order-1">
                    {ysProducts.map((p: any) => {
                      const isActive = activeYsProductId === p.id;
                      const isDisabled = p.comingSoon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => !isDisabled && setActiveYsProductId(p.id)}
                          disabled={isDisabled}
                          className={`
                            w-full h-full min-h-40 text-left rounded-3xl p-6 flex flex-col transition-all duration-300 border
                            ${isActive 
                              ? "bg-white border-zinc-300 shadow-lg" 
                              : isDisabled 
                                ? "bg-white/60 border-zinc-200 opacity-60 cursor-not-allowed" 
                                : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md cursor-pointer hover:bg-zinc-50"}
                          `}
                        >
                          <img src={getImageSrc(p.logo)} alt={getImageAlt(p.logo)} className="w-8 h-8 mb-4 object-contain shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-2 leading-snug">
                            {p.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-500 mb-4 line-clamp-3 leading-relaxed grow">
                            {p.desc}
                          </p>
                          <span className={`inline-block text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full mt-auto border w-max
                            ${isActive ? "bg-zinc-100 text-zinc-700 border-zinc-200" : "bg-zinc-50 text-zinc-500 border-zinc-100"}`}>
                            {p.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const activeProd = ysProducts.find((p: any) => p.id === activeYsProductId) || ysProducts[0];
                    if (!activeProd) return null;
                    return (
                      <div className="w-full lg:w-1/2 bg-[#0c0c0c] rounded-[28px] p-8 lg:p-10 pb-0 flex flex-col relative overflow-hidden order-1 lg:order-2 h-full min-h-110 lg:min-h-0 shadow-xl">
                        
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-[0.03]"
                          style={{
                            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                            backgroundSize: '36px 36px'
                          }}
                        ></div>
                        
                        <div key={`info-${activeProd.id}`} className="relative z-10 shrink-0 mb-6 lg:mb-10 animate-[slideUpFade_0.4s_ease-out_forwards] text-left">
                          <img src={getImageSrc(activeProd.logo)} alt={getImageAlt(activeProd.logo)} className="h-8 lg:h-10 mb-6 object-contain object-left" />
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight max-w-[95%]">
                            {activeProd.headline}
                          </h2>
                          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[90%]">
                            {activeProd.text}
                          </p>
                        </div>

                        <div className="relative z-10 w-[calc(100%+32px)] lg:w-[calc(100%+40px)] -mr-8 lg:-mr-10 mt-auto h-70 sm:h-90 lg:h-100 shrink-0">
                          <img 
                            key={`img-${activeProd.id}`}
                            src={getImageSrc(activeProd.img)} 
                            alt={getImageAlt(activeProd.img) || activeProd.title}
                            className="absolute bottom-0 right-0 w-full h-full object-contain object-bottom-right animate-[slideUpFade_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                          />
                        </div>
                      </div>
                    );
                  })()}
                  
                </div>
              </div>
            )}
            
            <style>{`
              @keyframes slideUpFade {
                0% { transform: translateY(30px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
              }
            `}</style>

          </div>
        </section>

        <section data-section="testimonialsGroup" className="w-full bg-white text-zinc-900 py-20 sm:py-28">
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-zinc-800 shadow-sm mb-8">
                <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-bold text-zinc-900 tracking-wide">
                  {content.testimonialsSection?.badge}
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-zinc-900 tracking-tight leading-tight mb-6">
                {content.testimonialsSection?.title}
              </h2>
              
              <p className="text-zinc-500 text-sm sm:text-[15px] leading-relaxed max-w-3xl mx-auto font-medium">
                {content.testimonialsSection?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {testimonials.map((testimonial: any, idx: number) => (
                <div key={idx} className="bg-[#fafafa] rounded-2xl p-8 flex flex-col justify-between border border-zinc-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-300">
                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <h3 className="font-bold text-zinc-900 text-lg">
                        {testimonial.name}
                      </h3>
                      <span className="px-2.5 py-1 rounded bg-[#FFA800] text-white text-[11px] font-bold tracking-wide">
                        {testimonial.role}
                      </span>
                    </div>
                    
                    <p className="text-zinc-500 text-sm leading-[1.8] mb-8 font-medium">
                      {testimonial.quote}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-auto">
                    {[...Array(5)].map((_, i) => (
                      <LucideIcons.Star key={i} className="w-4.5 h-4.5 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        <section 
          data-section="whyChooseUs"
          className="w-full relative overflow-hidden bg-black text-white pt-20 sm:pt-28 pb-10"
          style={{
            backgroundImage: `url('${getImageSrc(whyChooseUs.bgImage)}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16 sm:mb-20">
              <div className="lg:w-[55%] space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/80 border border-zinc-800 shadow-sm backdrop-blur-sm">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {whyChooseUs.badge}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-white tracking-tight leading-tight">
                  {whyChooseUs.title}
                </h2>
              </div>
              <div className="lg:w-[45%] text-left">
                <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed max-w-lg lg:ml-auto font-medium">
                  {whyChooseUs.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mb-16 sm:mb-24">
              <div className="w-full lg:w-1/2 space-y-8 sm:space-y-10 text-left">
                {whyChooseUs.features.map((feature: any, idx: number) => {
                  const WHY_ICONS = [LucideIcons.TrendingUp, LucideIcons.Search, LucideIcons.Maximize, LucideIcons.Star, LucideIcons.Check];
                  const FeatureIcon = WHY_ICONS[idx % WHY_ICONS.length];
                  return (
                    <div key={idx} className="flex gap-5 sm:gap-6 items-start">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                        <FeatureIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                        <p className="text-zinc-400 text-sm leading-[1.7]">{feature.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-125 aspect-4/3 rounded-3xl overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
                  <Image
                    src={getImageSrc(whyChooseUs.rightImage)}
                    alt={getImageAlt(whyChooseUs.rightImage)}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full py-5 sm:py-8 overflow-hidden relative border-t border-white/10 group">
            <div className="absolute inset-y-0 left-0 w-12.5 md:w-30 bg-linear-to-r from-black/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12.5 md:w-30 bg-linear-to-l from-black/80 to-transparent z-10 pointer-events-none"></div>

            <div className="flex w-max animate-marquee [animation-duration:40s] group-hover:[animation-play-state:paused] gap-7.5 md:gap-12.5 lg:gap-17.5">
              {whyChooseUs.marquee.map((text: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3.5 md:gap-5.5 shrink-0">
                  <LucideIcons.Asterisk className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-[#FFB800] shrink-0" />
                  <span className="text-[28px] md:text-[44px] lg:text-[64px] font-medium leading-none text-[#E2E2E2]/[0.28] whitespace-nowrap" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section data-section="connect" className="w-full py-20 sm:py-28 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(180deg, #1D1300 41%, #000000 100%)' }}>
          <div className="max-w-325 mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              
              {connectSection.image && (
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                  <div className="relative w-full max-w-125 lg:max-w-none aspect-4/3 lg:h-125">
                    <Image
                      src={getImageSrc(connectSection.image)}
                      alt={getImageAlt(connectSection.image)}
                      fill
                      className="object-contain lg:object-left"
                    />
                  </div>
                </div>
              )}

              <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111111]/80 border border-zinc-800 shadow-sm backdrop-blur-sm">
                  <LucideIcons.Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary tracking-wide">
                    {connectSection.badge}
                  </span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  {connectSection.title} <span className="text-primary">{connectSection.titleHighlight}</span>
                </h2>
                
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {connectSection.description}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Link
                    href={connectSection.cta?.url || "#contact"}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-md shadow-primary/20 group"
                  >
                    <span>{connectSection.cta?.text}</span>
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs group-hover:rotate-45 transition-transform">
                      <LucideIcons.ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                  <Link
                    href={connectSection.secondaryCta?.url || "#services"}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all transform hover:scale-[1.02] border border-white/10 backdrop-blur-sm"
                  >
                    <span>{connectSection.secondaryCta?.text}</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div data-section="faqs">
          <FaqSection {...content.faqs} graphicImage={getImageSrc(content.faqs?.graphicImage)} />
        </div>

      </main> 
    </div>
  );
}
