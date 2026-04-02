import Image from "next/image";
import Link from "next/link";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaHref?: string;
  kicker?: string;
  titleLine2?: string;
  outlineLine2?: boolean;
  ghostText?: string;
  ghostHref?: string;
  established?: string;
}

export default function HeroSection({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  ctaText,
  ctaHref,
  kicker,
  titleLine2,
  outlineLine2 = false,
  ghostText,
  ghostHref,
  established,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {imageSrc ? (
        <Image src={imageSrc} alt={imageAlt || title} fill className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0a0a_0%,#1a1200_50%,#0a0a0a_100%)]" />
      )}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,102,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        {/* Top accent bar */}
        <div className="w-[60px] h-[3px] bg-primary mb-8" />

        {/* Kicker */}
        {kicker && (
          <p className="text-primary text-xs uppercase tracking-[0.25em] font-semibold mb-4">
            {kicker}
          </p>
        )}

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-on-surface leading-tight tracking-tight uppercase">
          {title}
        </h1>

        {/* Title line 2 (optional outline) */}
        {titleLine2 && (
          <span
            className={`font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight uppercase mt-1 block ${
              outlineLine2
                ? "text-transparent [-webkit-text-stroke:1.5px_#ff6600]"
                : "text-on-surface"
            }`}
          >
            {titleLine2}
          </span>
        )}

        {/* Description */}
        {subtitle && (
          <p className="mt-6 text-[15px] text-on-surface-variant max-w-[480px] mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Buttons */}
        {(ctaText || ghostText) && (
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            {ctaText && ctaHref && (
              <Link href={ctaHref} className="btn-primary">
                {ctaText} <span className="btn-arrow">&rarr;</span>
              </Link>
            )}
            {ghostText && ghostHref && (
              <Link href={ghostHref} className="btn-ghost">
                {ghostText}
              </Link>
            )}
          </div>
        )}

        {/* Established line */}
        {established && (
          <div className="mt-12 flex items-center gap-4 text-outline text-xs tracking-widest uppercase">
            <span className="w-10 h-px bg-outline" />
            <span>{established}</span>
            <span className="w-10 h-px bg-outline" />
          </div>
        )}
      </div>
    </section>
  );
}
