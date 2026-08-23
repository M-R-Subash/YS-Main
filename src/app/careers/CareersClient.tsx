"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Lightbulb, MapPin, Briefcase, Clock } from "lucide-react";
import FaqSection from "@/components/FaqSection";

const DEFAULT_IMAGE = "https://res.cloudinary.com/subash-cms/image/upload/v1787243108/placeholder.png";
const getImageSrc = (img: any) => { if (!img) return DEFAULT_IMAGE; if (typeof img === 'string') return img; if (typeof img === 'object' && img.url) return img.url; return DEFAULT_IMAGE; };
const getImageAlt = (img: any) => { if (img && typeof img === 'object' && img.alt) return img.alt; return ""; };

export default function CareersClient({ content: initialContent }: { content: any }) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PREVIEW_UPDATE_CAREERS" && e.data.content) {
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

  const hero = content?.hero;
  const marquee = content?.marquee;
  const whyHere = content?.whyHere;
  const openPositions = content?.openPositions;
  const realPeople = content?.realPeople;
  const testimonialsSection = content?.testimonialsSection;
  const faqs = content?.faqs;

  const departments = marquee?.departments ?? [];
  const features = whyHere?.features ?? [];
  const jobs = openPositions?.jobs ?? [];
  const testimonials = testimonialsSection?.testimonials ?? [];

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col pt-24 md:pt-32">
      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <section id="section-hero" className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 pt-10 pb-20">
          
          <div className="w-full lg:w-[45%] space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c160a] border border-primary/40 shadow-inner w-fit">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                {hero?.badge}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.1] whitespace-pre-wrap">
              {hero?.title}{" "}
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] bg-clip-text text-transparent">
                {hero?.highlight}
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-[15px] leading-relaxed max-w-lg">
              {hero?.description}
            </p>

            <div className="pt-2">
              <Link
                href={hero?.cta?.url ?? "#"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary/90 text-black font-bold text-sm transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                <span>{hero?.cta?.text}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[50%] relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] aspect-square rounded-[3rem] overflow-hidden bg-zinc-900 border border-white/5">
              <Image
                src={getImageSrc(hero?.image)}
                alt={getImageAlt(hero?.image)}
                fill
                className="object-cover opacity-90"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

        </section>
      </main>

      {/* Marquee Section */}
      <section id="section-marquee" className="w-full border-t border-b border-white/5 bg-black overflow-hidden py-6 mt-10">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 sm:gap-16">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 sm:gap-16">
                {departments.map((dept: any, idx: number) => {
                  const deptName = typeof dept === 'object' ? dept.name : dept;
                  return (
                    <div key={idx} className="flex items-center gap-8 sm:gap-16">
                      <span className="text-lg sm:text-xl font-medium text-zinc-400">{deptName}</span>
                      <span className="text-primary text-xl">✦</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Why Build Your Career Here Section */}
      <section id="section-whyHere" className="relative w-full bg-white text-zinc-900 py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#FFE4B5]/60 rounded-full blur-[100px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16 lg:gap-12 items-start">
          
          <div className="w-full lg:w-1/2 space-y-8 lg:pr-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-300 bg-white shadow-sm">
              <span className="text-[#FF8C00] text-sm">✦</span>
              <span className="text-xs font-bold text-zinc-900 tracking-wide">
                {whyHere?.badge}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-zinc-900 leading-[1.15]">
              {whyHere?.title} <span className="text-[#FFB347]">{whyHere?.highlight}</span>
            </h2>

            <p className="text-zinc-500 text-[15px] sm:text-base leading-relaxed max-w-md">
              {whyHere?.description}
            </p>

            <div className="relative w-full aspect-[4/3] max-w-[480px] rounded-3xl overflow-hidden mt-8 shadow-xl">
              <Image 
                src={getImageSrc(whyHere?.image)} 
                alt={getImageAlt(whyHere?.image)} 
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 lg:pt-0">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="bg-[#FCF9F0] rounded-3xl p-8 flex flex-col gap-4">
                <span className="text-6xl font-medium text-[#FFB347] w-fit">{feature.number}</span>
                <h3 className="text-xl font-bold text-zinc-900">{feature.title}</h3>
                <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Open Positions Section */}
      <section id="section-openPositions" className="relative w-full bg-[#FAFAFA] text-zinc-900 py-24 lg:py-32 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-[#FFE4B5]/60 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-start gap-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-300 bg-white shadow-sm">
              <span className="text-[#FF8C00] text-sm">✦</span>
              <span className="text-xs font-bold text-zinc-900 tracking-wide">
                {openPositions?.badge}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-zinc-900">
              {openPositions?.title} <span className="text-[#FFB347]">{openPositions?.highlight}</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {jobs.map((job: any, idx: number) => (
              <div key={idx} className="group bg-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-black/[0.03] border border-black/[0.04] hover:shadow-2xl hover:shadow-black/[0.05] transition-shadow">
                <div className="flex-1 max-w-2xl">
                  <h3 className="text-xl sm:text-2xl font-semibold text-zinc-900 mb-3">{job.title}</h3>
                  <p className="text-sm sm:text-[15px] text-zinc-500 leading-relaxed">
                    {job.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[13px] font-medium text-zinc-700">{job.location}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[13px] font-medium text-zinc-700">{job.experience}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[13px] font-medium text-zinc-700">{job.type}</span>
                  </div>
                </div>

                <div className="shrink-0 mt-4 md:mt-0">
                  <Link href={job.link?.url ?? "#"} target={job.link?.newTab ? "_blank" : undefined} rel={job.link?.noFollow ? "nofollow" : undefined} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFB347] hover:bg-[#FFA500] text-zinc-900 font-semibold text-sm transition-colors w-full md:w-auto justify-center">
                    <span>Apply</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Real People Section */}
      <section id="section-realPeople" className="w-full bg-black text-white py-24 lg:py-32">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c160a] border border-primary/40 shadow-inner w-fit">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  {realPeople?.badge}
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-white leading-[1.15]">
                {realPeople?.title} <br />
                <span className="text-primary">{realPeople?.highlight}</span>
              </h2>
            </div>
            
            <div className="lg:max-w-md pt-2">
              <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed">
                {realPeople?.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px] md:min-h-0 rounded-3xl overflow-hidden group">
                <Image 
                  src={getImageSrc(realPeople?.image1)} 
                  alt={getImageAlt(realPeople?.image1)} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-4 sm:gap-6 h-full">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden group">
                  <Image 
                    src={getImageSrc(realPeople?.image2)} 
                    alt={getImageAlt(realPeople?.image2)} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden group">
                  <Image 
                    src={getImageSrc(realPeople?.image3)} 
                    alt={getImageAlt(realPeople?.image3)} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[3/1] rounded-3xl overflow-hidden group">
              <Image 
                src={getImageSrc(realPeople?.image4)} 
                alt={getImageAlt(realPeople?.image4)} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section id="section-testimonialsSection" className="w-full bg-black text-white py-24 lg:py-32">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1c160a] border border-primary/40 shadow-inner">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                {testimonialsSection?.badge}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight text-white leading-[1.15]">
              {testimonialsSection?.title} <br />
              <span className="text-[#FFB347]">{testimonialsSection?.highlight}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial: any, idx: number) => (
              <div key={idx} className="bg-[#181614] border border-white/5 rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                <p className="text-zinc-300 text-lg leading-relaxed mb-12">
                  "{testimonial.quote}"
                </p>
                <div className="flex flex-col gap-6 mt-auto">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                    <Image src={getImageSrc(testimonial.avatar)} alt={getImageAlt(testimonial.avatar)} fill className="object-cover" />
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <h4 className="text-white font-semibold text-[15px] mb-1">{testimonial.name}</h4>
                    <p className="text-zinc-500 text-xs font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <div id="section-faqs">
        <FaqSection 
          badge={faqs?.badge}
          title={faqs?.title}
          graphicImage={getImageSrc(faqs?.graphicImage)}
          graphicTitleLine1={faqs?.graphicTitleLine1}
          graphicTitleLine2={faqs?.graphicTitleLine2}
          graphicTitleLine3={faqs?.graphicTitleLine3}
          graphicTitleLine4={faqs?.graphicTitleLine4}
          list={faqs?.list ?? []}
        />
      </div>

    </div>
  );
}
