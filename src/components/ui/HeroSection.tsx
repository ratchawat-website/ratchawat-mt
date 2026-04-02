import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function HeroSection({ title, subtitle, imageSrc, imageAlt, ctaText, ctaHref }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {imageSrc ? (
        <Image src={imageSrc} alt={imageAlt || title} fill className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-deep via-surface to-surface" />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight uppercase">{title}</h1>
        {subtitle && <p className="mt-6 text-lg sm:text-xl text-white/80 font-sans max-w-2xl mx-auto">{subtitle}</p>}
        {ctaText && ctaHref && (
          <div className="mt-8">
            <a href={ctaHref} className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-[0.5rem] hover:bg-primary-dim transition-colors text-lg">
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
