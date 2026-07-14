-- Multi-slot private bookings: N rows share one booking_group_id (one payment).
alter table public.bookings add column booking_group_id uuid;
create index idx_bookings_group on public.bookings (booking_group_id)
  where booking_group_id is not null;

-- Trainer capacity: a 1-on-1 booking for N people consumes N trainers (units),
-- a group session consumes 1. Existing rows keep 1 (historic behavior).
alter table public.availability_blocks add column units integer not null default 1;
