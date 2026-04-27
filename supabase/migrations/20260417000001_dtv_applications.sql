-- DTV visa applications
-- Phase 5 Wave 5b — dedicated table for Destination Thailand Visa applications.
-- DTV-specific fields (passport, arrival_date, currently_in_thailand) do not
-- belong in `bookings`, hence a separate table.

create table if not exists dtv_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  first_name text not null,
  last_name text not null,
  nationality text not null,
  phone text not null,
  email text not null,

  passport_number text not null,
  passport_expiry date not null,

  currently_in_thailand boolean not null default false,
  training_start_date date not null,
  arrival_date date not null,

  price_id text not null check (price_id in ('dtv-6m-2x','dtv-6m-4x','dtv-6m-unlimited')),
  price_amount integer not null,

  committed_at timestamptz not null default now(),

  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_payment_status text default 'pending',

  status text not null default 'pending'
    check (status in ('pending','paid','docs_sent','cancelled','refused_voucher_issued')),

  docs_sent_at timestamptz,
  admin_notes text
);

create index if not exists dtv_applications_created_at_idx on dtv_applications (created_at desc);
create index if not exists dtv_applications_email_idx on dtv_applications (email);
create index if not exists dtv_applications_stripe_session_idx on dtv_applications (stripe_session_id);
create index if not exists dtv_applications_status_idx on dtv_applications (status);

-- ============================================================
-- RLS: dtv_applications
-- ============================================================
-- Inserts flow through /api/visa/dtv/apply using SUPABASE_SERVICE_ROLE_KEY
-- which bypasses RLS. No anon insert policy is granted, to prevent direct
-- REST submissions that would skip Zod validation.
-- Mirrors the `bookings` RLS model (see 20260411000000_init.sql).
-- Read/update restricted to admins only via is_admin() (see 20260413000000_admin_profiles.sql).

alter table dtv_applications enable row level security;

create policy "admin_read_dtv_applications" on dtv_applications
  for select to authenticated using (is_admin());

create policy "admin_update_dtv_applications" on dtv_applications
  for update to authenticated using (is_admin()) with check (is_admin());
