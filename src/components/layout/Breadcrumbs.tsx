import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

interface BreadcrumbItem {
  label: string;
  href?: string;
}
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ratchawatmuaythai.com";
  const schemaItems = items.map((item, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: item.label,
    ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
  }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  };

  return (
    <>
      <JsonLd data={schema} />
      <nav
        aria-label="Breadcrumb"
        className="py-4 px-6 sm:px-10 md:px-16 lg:px-20"
      >
        <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.125em]">
          {/* Leading accent line */}
          <li className="w-4 h-px bg-primary mr-1" aria-hidden="true" />
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && (
                <span className="text-outline" aria-hidden="true">
                  /
                </span>
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-[#777] hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-on-surface font-semibold">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
