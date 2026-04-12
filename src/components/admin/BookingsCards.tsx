import Link from "next/link";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";

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

export default function BookingsCards({ bookings }: Props) {
  if (bookings.length === 0) {
    return (
      <div className="md:hidden flex items-center justify-center py-20 text-on-surface-variant text-sm">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="md:hidden flex flex-col gap-3">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/admin/bookings/${booking.id}`}
          className="block bg-surface-lowest border-2 border-outline-variant rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <TypeBadge type={booking.type} />
            <StatusBadge status={booking.status} />
          </div>

          {/* Client */}
          <div className="mb-2">
            <div className="font-semibold text-on-surface">{booking.client_name}</div>
            <div className="text-xs text-on-surface-variant">{booking.client_email}</div>
          </div>

          {/* Dates */}
          <div className="text-xs text-on-surface-variant mb-3">
            {booking.start_date}
            {booking.end_date && booking.end_date !== booking.start_date
              ? ` - ${booking.end_date}`
              : ""}
          </div>

          {/* Amount */}
          <div className="text-lg font-bold text-on-surface">
            {booking.price_amount != null
              ? `${booking.price_amount.toLocaleString("en-US")} ฿`
              : "-"}
          </div>
        </Link>
      ))}
    </div>
  );
}
