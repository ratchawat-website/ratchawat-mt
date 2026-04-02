"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem { question: string; answer: string; }
interface FAQAccordionProps { items: FAQItem[]; }

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-card bg-surface-lowest shadow-card overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 sm:p-6 text-left">
            <span className="font-serif text-base sm:text-lg text-on-surface pr-4">{item.question}</span>
            <ChevronDown size={20} className={`text-primary shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-on-surface-variant text-sm leading-relaxed">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
