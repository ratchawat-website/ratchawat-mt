"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import CreateBookingForm from "./CreateBookingForm";

export default function BookingsHeader() {
  const searchParams = useSearchParams();
  // Open form immediately if ?create=1 is in URL (from availability drawer link)
  const [showForm, setShowForm] = useState(
    () => searchParams.get("create") === "1",
  );

  const defaultDate = searchParams.get("date") ?? undefined;

  return (
    <>
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            + Create Booking
          </button>
        </div>
      )}

      {showForm && (
        <CreateBookingForm
          defaultDate={defaultDate}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
