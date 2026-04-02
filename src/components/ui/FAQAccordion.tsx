"use client";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}
interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const num = String(i + 1).padStart(2, "0");

        return (
          <div
            key={i}
            className={`rounded-card bg-surface-lowest overflow-hidden border-l-2 transition-all duration-300 ${
              isOpen
                ? "border-l-primary"
                : "border-l-[var(--border-accent)]"
            }`}
          >
            {/* Top gradient line */}
            <div
              className={`h-[2px] bg-gradient-to-r from-transparent to-transparent transition-all duration-300 ${
                isOpen ? "via-primary" : "via-[#ff660040]"
              }`}
            />

            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-4 p-5 sm:p-6 text-left"
            >
              {/* Filigree number */}
              <span
                className={`font-serif text-[28px] font-bold leading-none select-none transition-opacity duration-300 shrink-0 w-10 text-primary ${
                  isOpen ? "opacity-30" : "opacity-[0.15]"
                }`}
              >
                {num}
              </span>

              {/* Question */}
              <span
                className={`font-serif text-base font-semibold flex-1 transition-colors duration-300 ${
                  isOpen ? "text-primary" : "text-on-surface"
                }`}
              >
                {item.question}
              </span>

              {/* Toggle icon */}
              <span className="text-primary text-lg font-semibold shrink-0 w-5 text-center select-none">
                {isOpen ? "\u2212" : "+"}
              </span>
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="pl-[72px] pr-5 sm:pr-6 pb-5 sm:pb-6 text-on-surface-variant text-[13px] leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
