import Link from "next/link";
import { ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import { formatDateShort } from "@/lib/utils/date-format";

interface Booking {
  id: string;
  created_at: string;
  type: string;
  status: string;
  client_name: string;
  client_email: string;
  start_date: string;
  end_date?: string | null;
  price_amount: number;
}

interface Props {
  bookings: Booking[];
}

export default function BookingsTable({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="hidden md:flex items-center justify-center py-20 text-on-surface-variant text-sm">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-outline-variant">
            <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Created
            </th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Type
            </th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Status
            </th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Client
            </th>
            <th className="text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Dates
            </th>
            <th className="text-right py-3 px-4 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Amount
            </th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className="border-b border-outline-variant hover:bg-surface-lowest transition-colors"
            >
              <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                {formatDateShort(booking.created_at)}
              </td>
              <td className="py-3 px-4">
                <TypeBadge type={booking.type} />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={booking.status} />
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-on-surface">
                  {booking.client_name}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {booking.client_email}
                </div>
              </td>
              <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                {formatDateShort(booking.start_date)}
                {booking.end_date && booking.end_date !== booking.start_date
                  ? ` - ${formatDateShort(booking.end_date)}`
                  : ""}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-on-surface whitespace-nowrap">
                {booking.price_amount != null
                  ? `${booking.price_amount.toLocaleString("en-US")} ฿`
                  : "-"}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="flex items-center justify-center w-7 h-7 rounded hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={`View booking ${booking.id}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
