import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryBookings, PAGE_SIZE } from "@/lib/admin/bookings-query";
import BookingsFilters from "@/components/admin/BookingsFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingsCards from "@/components/admin/BookingsCards";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function buildPageParams(
  current: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `?${params.toString()}`;
}

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const params = {
    type: sp.type,
    status: sp.status,
    from: sp.from,
    to: sp.to,
    q: sp.q,
    page,
  };

  const { bookings, total } = await queryBookings(params);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
            Bookings
          </h1>
          <p className="text-on-surface-variant text-sm mt-0.5">
            {total === 0
              ? "No bookings found"
              : `${total.toLocaleString("en-US")} booking${total === 1 ? "" : "s"} total`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Suspense>
        <BookingsFilters />
      </Suspense>

      {/* Table (desktop) + Cards (mobile) */}
      <div className="bg-surface border-2 border-outline-variant rounded-xl overflow-hidden">
        <BookingsTable bookings={bookings} />
        <BookingsCards bookings={bookings} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            Showing {rangeStart}-{rangeEnd} of{" "}
            {total.toLocaleString("en-US")}
          </p>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildPageParams(sp, page - 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-on-surface border-2 border-outline-variant rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-on-surface-variant border-2 border-outline-variant rounded-lg opacity-40 cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                Prev
              </span>
            )}

            <span className="text-sm text-on-surface-variant px-2">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={buildPageParams(sp, page + 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-on-surface border-2 border-outline-variant rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-on-surface-variant border-2 border-outline-variant rounded-lg opacity-40 cursor-not-allowed">
                Next
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
