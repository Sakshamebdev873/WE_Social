-- WeSocial prototype schema
-- Run against a fresh Supabase project (SQL editor or `supabase db push`).

create extension if not exists pgcrypto; -- gen_random_uuid()

create type module_name as enum ('sports', 'events', 'care');

create type booking_status as enum (
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'QUEUED',
  'SYNCING',
  'CONFLICT_REJECTED'
);

create table providers (
  id uuid primary key default gen_random_uuid(),
  module module_name not null default 'care',
  display_name text not null,
  hourly_rate numeric(6, 2) not null,
  -- Exact coordinates. Never selected by the client directly for an
  -- unconfirmed booking — see the RLS note at the bottom of this file.
  exact_lat double precision not null,
  exact_lng double precision not null,
  address_line text not null,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  -- Client-generated id assigned at enqueue time (core/offline/queue.ts),
  -- before the row exists here. Lets the client reconcile "this queued
  -- booking became that server row" once the sync engine's insert succeeds.
  local_id text,
  module module_name not null,
  provider_id uuid not null references providers (id),
  user_id uuid not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status booking_status not null default 'PENDING',
  -- Optimistic-concurrency counter. The sync engine's insert/update is
  -- expected to pass the version it last saw; a mismatch (or the unique
  -- index below firing) is what a real backend would surface as 409.
  version integer not null default 1,
  context_booking_id uuid references bookings (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_id_idx on bookings (user_id);
create index bookings_provider_id_idx on bookings (provider_id);

-- Conflict resolution support (Part 3): only one CONFIRMED booking per
-- provider per start_time may exist. A second client trying to confirm the
-- same provider/slot after this index already has a row hits a unique
-- violation, which the API layer translates into the 409 the client's sync
-- engine expects (core/offline/syncEngine.ts's ConflictError path).
-- A production system would replace this with a `tstzrange` EXCLUDE
-- constraint (via btree_gist) to catch overlapping, not just identical,
-- start times — left as a unique index here to keep the prototype schema
-- readable.
create unique index bookings_no_double_confirmed_slot
  on bookings (provider_id, start_time)
  where status = 'CONFIRMED';

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_set_updated_at
before update on bookings
for each row
execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Production hardening note (not enabled here — auth is mocked for this
-- assessment per the brief's FAQ, so there is no real auth.uid() to key
-- policies off of):
--
-- Client-side gating (modules/care/geo/addressReveal.ts) is a UX safeguard,
-- not the actual security boundary. The real boundary belongs in Postgres:
-- Row Level Security on `providers` should prevent `exact_lat`/`exact_lng`/
-- `address_line` from being selected directly at all. Instead, expose a
-- SECURITY DEFINER RPC (e.g. `get_provider_address(provider_id)`) that
-- checks for a CONFIRMED booking belonging to auth.uid() against that
-- provider before returning the real address, and returns the obfuscated
-- pin otherwise. That closes the gap where a client could otherwise just
-- read the "hidden" columns directly from the REST API.
-- ---------------------------------------------------------------------------
