-- Client brief July 2026 (5.2): date of birth on the DTV application form.
-- Nullable: applications submitted before this migration have no value.
alter table public.dtv_applications add column date_of_birth date;
