import { createClient } from "@/lib/supabase/server";

export interface BookingsQueryParams {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
}

export const PAGE_SIZE = 25;

export async function queryBookings(params: BookingsQueryParams) {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.from) {
    query = query.gte("start_date", params.from);
  }
  if (params.to) {
    query = query.lte("start_date", params.to);
  }
  if (params.q) {
    query = query.or(
      `client_name.ilike.%${params.q}%,client_email.ilike.%${params.q}%`,
    );
  }

  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("Bookings query error:", error);
    return { bookings: [], total: 0 };
  }
  return { bookings: data ?? [], total: count ?? 0 };
}
