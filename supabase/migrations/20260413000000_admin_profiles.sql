-- Admin authentication: profiles table + is_admin() helper + RLS tightening
-- Phase 4 - Admin Dashboard

-- ============================================================
-- Table: profiles
-- ============================================================
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users_read_own_profile" on profiles
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- Function: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- Tighten bookings RLS: replace USING (true) with is_admin()
-- ============================================================
drop policy if exists "admin_read_bookings" on bookings;
drop policy if exists "admin_update_bookings" on bookings;

create policy "admin_read_bookings" on bookings
  for select to authenticated using (public.is_admin());

create policy "admin_update_bookings" on bookings
  for update to authenticated using (public.is_admin());

-- ============================================================
-- Tighten availability_blocks RLS
-- ============================================================
drop policy if exists "admin_manage_availability" on availability_blocks;

create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (public.is_admin());
