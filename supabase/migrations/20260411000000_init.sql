-- Booking system initial schema
-- Phase 3 - Booking System Full Stack

-- ============================================================
-- Table: bookings
-- ============================================================
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  type text not null check (type in ('training','private','camp-stay','fighter')),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed')),

  price_id text not null,
  price_amount integer not null,
  num_participants integer not null default 1,

  start_date date not null,
  end_date date,
  time_slot text,

  camp text check (camp in ('bo-phut','plai-laem','both')),

  client_name text not null,
  client_email text not null,
  client_phone text not null,
  client_nationality text,
  notes text,

  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_payment_status text
);

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_email_idx on bookings (client_email);
create index if not exists bookings_status_idx on bookings (status);

-- ============================================================
-- Table: availability_blocks
-- ============================================================
create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('private','camp-stay','all')),
  date date not null,
  time_slot text,
  is_blocked boolean not null default true,
  reason text,
  created_by uuid references auth.users(id)
);

create index if not exists availability_blocks_date_idx on availability_blocks (date);
create index if not exists availability_blocks_type_date_idx on availability_blocks (type, date);

-- ============================================================
-- RLS: bookings
-- ============================================================
-- All inserts flow through /api/checkout which uses SUPABASE_SERVICE_ROLE_KEY
-- and bypasses RLS. There is intentionally NO insert policy for the anon role
-- so a malicious client cannot bypass the Zod validation in /api/checkout by
-- POSTing directly to the Supabase REST endpoint with the public anon key.
-- See migration 20260412023040_drop_anon_insert_bookings_policy.sql for the
-- security rationale.

alter table bookings enable row level security;

create policy "admin_read_bookings" on bookings
  for select to authenticated using (true);

create policy "admin_update_bookings" on bookings
  for update to authenticated using (true);

-- ============================================================
-- RLS: availability_blocks
-- ============================================================
alter table availability_blocks enable row level security;

create policy "public_read_availability" on availability_blocks
  for select to anon using (true);

create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (true);
