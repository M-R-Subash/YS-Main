"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface BlogFaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface BlogFaqSectionProps {
  list?: BlogFaqItem[];
  title?: string;
  badge?: string;
}

export default function BlogFaqSection({
  list,
  title = "Frequently Asked Questions",
  badge = "FAQ",
}: BlogFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const activeList = (list || []).filter(
    (item) => item && (item.question?.trim() || item.answer?.trim())
  );

  if (activeList.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isHtml = (str: string) => {
    return typeof str === "string" && /<[a-z][\s\S]*>/i.test(str);
  };

  return (
    <section id="faq" className="mt-14 pt-10 border-t border-zinc-200/80 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-zinc-100 border border-zinc-200/80 rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          <span className="text-zinc-800 text-xs font-bold tracking-wide uppercase">
            {badge}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-zinc-500 mt-1.5 font-medium">
          Quick answers to common questions related to this article.
        </p>
      </div>

      {/* Accordion Items */}
      <div className="space-y-3.5">
        {activeList.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.id || index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "bg-zinc-50/50 border-primary/40 shadow-sm"
                  : "bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none group cursor-pointer"
              >
                <span
                  className={`text-base sm:text-lg font-bold transition-colors duration-200 pr-4 ${
                    isOpen
                      ? "text-primary"
                      : "text-zinc-900 group-hover:text-primary"
                  }`}
                >
                  {faq.question}
                </span>
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 border ${
                    isOpen
                      ? "bg-primary text-white border-primary rotate-180"
                      : "bg-zinc-50 text-zinc-500 border-zinc-200 group-hover:border-zinc-300 group-hover:text-zinc-800"
                  }`}
                >
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>

              {/* Collapsible Answer Body */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-zinc-600 text-sm sm:text-[15px] leading-relaxed font-normal border-t border-zinc-100/80 mt-1">
                    <div className="pt-4">
                      {isHtml(faq.answer) ? (
                        <div
                          className="prose prose-zinc max-w-none text-zinc-600 text-sm sm:text-[15px] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80 [&_strong]:text-zinc-900 [&_code]:text-primary [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      ) : (
                        <div className="whitespace-pre-line">{faq.answer}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
