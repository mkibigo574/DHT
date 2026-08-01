-- Donation idempotency + an aggregate total.
--
-- Run this BEFORE deploying the code that depends on it, otherwise the
-- webhook insert will fail against the old schema.
--
--   Supabase dashboard -> SQL Editor -> paste -> Run
--   (or: supabase db push, if the CLI is linked to this project)

-- 1. Idempotency -------------------------------------------------------------
-- Stripe delivers webhooks at least once and retries on timeout, so the same
-- payment can arrive more than once. A single payment also produces two
-- different events in the hosted-checkout flow (checkout.session.completed and
-- payment_intent.succeeded), so de-duplicating on the event id is not enough --
-- both carry the same PaymentIntent id, which is what we key on.
alter table public.donations
  add column if not exists stripe_payment_intent_id text;

-- NULLs are distinct in Postgres, so manually entered donations (which have no
-- PaymentIntent) are unaffected and can still be added freely.
alter table public.donations
  drop constraint if exists donations_stripe_payment_intent_id_key;

alter table public.donations
  add constraint donations_stripe_payment_intent_id_key
  unique (stripe_payment_intent_id);

-- 2. Aggregate total ---------------------------------------------------------
-- The progress bar used to fetch every donation row and sum them in JS, which
-- silently under-reports once the table exceeds PostgREST's row cap and
-- transfers the whole table on each cache miss. Sum in the database instead.
--
-- SECURITY DEFINER so the public total keeps working even if row-level access
-- to `donations` is later restricted -- this exposes only the sum, never
-- individual donor rows.
create or replace function public.donations_total()
returns numeric
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(amount), 0)::numeric from public.donations;
$$;

grant execute on function public.donations_total() to anon, authenticated;
