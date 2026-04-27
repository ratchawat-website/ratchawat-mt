-- Stripe webhook idempotency: prevent duplicate processing of replayed events.
-- Inserts via service_role from /api/webhooks/stripe; unique violation on
-- event_id signals "already processed" so the handler can return 200 early.

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies: service_role bypasses RLS, no other role should ever read or
-- write this table.
