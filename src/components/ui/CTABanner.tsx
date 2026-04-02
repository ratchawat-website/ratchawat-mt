import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  title: string;
  description?: string;
  buttonText: string;
  href: string;
}

export default function CTABanner({ title, description, buttonText, href }: CTABannerProps) {
  return (
    <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-on-surface">{title}</h2>
        {description && <p className="mt-4 text-on-surface-variant max-w-2xl mx-auto">{description}</p>}
        <div className="mt-8">
          <Link href={href} className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold px-8 py-4 rounded-[0.5rem] hover:bg-primary-dim transition-colors">
            {buttonText} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
