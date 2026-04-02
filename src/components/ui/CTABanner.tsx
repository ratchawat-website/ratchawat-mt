import Link from "next/link";

interface CTABannerProps {
  title: string;
  description?: string;
  buttonText: string;
  href: string;
  kicker?: string;
  ghostText?: string;
  ghostHref?: string;
}

export default function CTABanner({
  title,
  description,
  buttonText,
  href,
  kicker = "Ready to train?",
  ghostText,
  ghostHref,
}: CTABannerProps) {
  return (
    <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-[linear-gradient(180deg,#0a0a0a_0%,#1a1200_50%,#0a0a0a_100%)]">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Top accent line */}
        <div className="w-[60px] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-8" />

        {/* Kicker */}
        <p className="text-primary text-xs uppercase tracking-[0.25em] font-semibold mb-4">
          {kicker}
        </p>

        {/* Title */}
        <h2 className="font-serif text-2xl sm:text-[30px] lg:text-4xl font-bold text-on-surface">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="mt-4 text-sm text-[#777] max-w-[460px]">{description}</p>
        )}

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href={href} className="btn-primary">
            {buttonText} <span className="btn-arrow">&rarr;</span>
          </Link>
          {ghostText && ghostHref && (
            <Link href={ghostHref} className="btn-ghost">
              {ghostText}
            </Link>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="w-[60px] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mt-8" />
      </div>
    </section>
  );
}
