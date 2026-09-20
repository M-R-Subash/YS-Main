"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusCircle, MinusCircle, Lightbulb } from "lucide-react";

interface FaqSectionProps {
  badge?: string;
  title?: string;
  graphicTitleLine1?: string;
  graphicTitleLine2?: string;
  graphicTitleLine3?: string;
  graphicTitleLine4?: string;
  graphicImage?: string;
  list?: Array<{ id?: string; question: string; answer: string }>;
}

export default function FaqSection({
  badge,
  title,
  graphicTitleLine1,
  graphicTitleLine2,
  graphicTitleLine3,
  graphicTitleLine4,
  graphicImage,
  list
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const activeList = (list || []).filter((item) => item && (item.question?.trim() || item.answer?.trim()));

  // If no items, render nothing
  if (activeList.length === 0) {
    return null;
  }

  const isHtml = (str: string) => {
    return typeof str === "string" && /<[a-z][\s\S]*>/i.test(str);
  };

  return (
    <section className="w-full bg-[#ffffff] py-16 sm:py-24">
      <div className="max-w-[1300px] mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* If no graphic image is provided, display a clean standalone section header */}
        {!graphicImage && (title || badge) && (
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            {badge && (
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 bg-zinc-100 border border-zinc-200/80 rounded-full">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-zinc-800 text-xs sm:text-[13px] font-bold tracking-wide">{badge}</span>
              </div>
            )}
            {title && (
              <h2 className="text-zinc-900 text-3xl sm:text-4xl font-extrabold tracking-tight">
                {title}
              </h2>
            )}
          </div>
        )}

        <div className={`flex flex-col ${graphicImage ? "lg:flex-row gap-12 lg:gap-16 items-start lg:items-center" : "max-w-4xl mx-auto items-stretch"}`}>
          
          {/* Left Side: Graphic + Text (Only when graphicImage is present) */}
          {graphicImage && (
            <div className="w-full lg:w-[45%] flex justify-center shrink-0">
              <div className="relative w-full max-w-[500px] lg:max-w-none aspect-[0.93] rounded-[32px] overflow-hidden shadow-2xl ">
                <Image 
                  src={graphicImage} 
                  alt="FAQ Background" 
                  fill 
                  className="object-cover" 
                  unoptimized 
                />
                <div className="absolute inset-0 flex flex-col justify-between">
                  {/* Top Section: FAQ Badge & Heading */}
                  <div className="p-8 sm:p-10 lg:p-12 text-left">
                    <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full w-max">
                      <Lightbulb className="w-4 h-4 text-[#FFA918] fill-[#FFA918]" />
                      <span className="text-white text-[13px] font-bold tracking-wide">{badge || "FAQ"}</span>
                    </div>
                    <h2 className="text-white text-4xl sm:text-[42px] font-bold leading-[1.1] tracking-tight">
                      {title}
                    </h2>
                  </div>

                  {/* Bottom Section: Graphic Title Lines */}
                  {(graphicTitleLine1 || graphicTitleLine2 || graphicTitleLine3 || graphicTitleLine4) && (
                    <div className="self-end pb-8 pr-12 sm:pb-8 sm:pr-8 w-[35%] flex flex-col items-start text-left">
                      {graphicTitleLine1 && <span className="text-white text-xl sm:text-[22px] font-bold leading-tight">{graphicTitleLine1}</span>}
                      {graphicTitleLine2 && <span className="text-white text-5xl sm:text-[30px] font-extrabold leading-[1.1] my-1">{graphicTitleLine2}</span>}
                      {graphicTitleLine3 && <span className="text-white text-xl sm:text-[22px] font-bold leading-tight">{graphicTitleLine3}</span>}
                      {graphicTitleLine4 && <span className="text-white text-xl sm:text-[22px] font-bold leading-tight">{graphicTitleLine4}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Accordion List */}
          <div className={`w-full ${graphicImage ? "lg:w-[55%]" : "w-full"} flex flex-col gap-4`}>
            {activeList.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={faq.id || index} 
                  className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen ? 'border-zinc-300 shadow-md' : 'border-zinc-200 shadow-sm'}`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none group cursor-pointer"
                  >
                    <span className={`text-[15px] sm:text-base font-bold transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-zinc-900 group-hover:text-primary'}`}>
                      {faq.question}
                    </span>
                    <span className={`ml-4 shrink-0 transition-colors ${isOpen ? 'text-primary' : 'text-zinc-400 group-hover:text-primary'}`}>
                      {isOpen ? (
                        <MinusCircle className="w-6 h-6 stroke-[1.5]" />
                      ) : (
                        <PlusCircle className="w-6 h-6 stroke-[1.5]" />
                      )}
                    </span>
                  </button>
                  
                  <div 
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-5 sm:px-6 pb-6 text-zinc-600 text-sm sm:text-[15px] leading-relaxed font-medium">
                        {isHtml(faq.answer) ? (
                          <div
                            className="prose prose-zinc max-w-none text-zinc-600 text-sm sm:text-[15px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1.5 [&_a]:text-primary [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        ) : (
                          <div className="whitespace-pre-line">{faq.answer}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
