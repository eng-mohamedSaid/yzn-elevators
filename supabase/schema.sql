-- ═══════════════════════════════════════════════════════════════════════════
--  Al-Yazen Elevators — Supabase schema
--  Run this in the Supabase dashboard → SQL Editor.
--
--  Design notes:
--  • Column names are camelCase (quoted) to match the TypeScript interfaces in
--    src/types.ts exactly, so the app's dataService reads/writes with no mapping.
--  • id is text (the app generates ids client-side: uuid, or SITE-000N/OFF-000N).
--  • Single-company build: NO tenant_id/RLS-by-tenant.
--
--  ⚠ SECURITY: Login is handled locally (hashed password), NOT Supabase Auth.
--    The anon key is public (shipped in the frontend). The permissive policies
--    below let anyone with the URL + anon key read/write. That is acceptable
--    only for a low-sensitivity internal tool. To lock down later: enable
--    Supabase Auth and replace the "true" policies with authenticated checks.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── offers ────────────────────────────────────────────────────────────────
create table if not exists public.offers (
  "id" text primary key,
  "offerNumber" text,
  "customerName" text,
  "phone" text,
  "address" text,
  "locationUrl" text,
  "date" text,
  "customerType" text,
  "elevatorType" text,
  "elevatorCount" numeric,
  "stops" numeric,
  "floors" numeric,
  "entrances" numeric,
  "load" text,
  "machineType" text,
  "controlBoard" text,
  "battery" text,
  "vvvf" text,
  "payment1" numeric,
  "payment2" numeric,
  "payment3" numeric,
  "payment4" numeric,
  "doorType" text,
  "innerDoor" text,
  "doorSize" numeric,
  "pitWidth" numeric,
  "lastFloorHeight" numeric,
  "pitDepth" numeric,
  "pitLength" numeric,
  "counterweightPosition" text,
  "cabinSize" text,
  "price" numeric,
  "note1" text,
  "note2" text,
  "note3" text,
  "representative" text,
  "engNotes1" text,
  "engNotes2" text,
  "oldElevatorRemoval" text,
  "rails" text,
  "createdAt" text
);

-- ── maintenance ───────────────────────────────────────────────────────────
create table if not exists public.maintenance (
  "id" text primary key,
  "maintenanceNumber" text,
  "customerName" text,
  "nationalId" text,
  "phone" text,
  "address" text,
  "locationUrl" text,
  "date" text,
  "elevatorType" text,
  "elevatorCount" numeric,
  "floors" numeric,
  "maintenanceStartDate" text,
  "contractDuration" text,
  "endDate" text,
  "price" numeric,
  "notes" text,
  "createdAt" text
);

-- ── sites ─────────────────────────────────────────────────────────────────
create table if not exists public.sites (
  "id" text primary key,
  "siteNumber" text,
  "siteName" text,
  "address" text,
  "mapUrl" text,
  "startDate" text,
  "endDate" text,
  "totalDays" numeric,
  "price" numeric,
  "elevatorCount" numeric,
  "elevatorType" text,
  "stopPrice" numeric,
  "stopsCount" numeric,
  "stagePrice" numeric,
  "stagesCount" numeric,
  "customerType" text,
  "currentStage" text,
  "createdAt" text
);

-- ── schedule (per-day site log) ───────────────────────────────────────────
create table if not exists public.schedule (
  "id" text primary key,
  "siteId" text,
  "day" text,
  "date" text,
  "stageType" text,
  "tech1Id" text,
  "tech2Id" text,
  "worker1Id" text,
  "worker2Id" text,
  "accomplished" text,
  "notes1" text,
  "notes2" text,
  "notes3" text,
  "notes" text,
  "adjustType" text,
  "bonusValue" numeric,
  "bonusReason" text,
  "deductionValue" numeric,
  "deductionReason" text
);

-- ── workers ───────────────────────────────────────────────────────────────
create table if not exists public.workers (
  "id" text primary key,
  "name" text,
  "role" text,
  "salaryType" text,
  "baseSalary" numeric,
  "joinDate" text,
  "notes" text,
  "createdAt" text
);

-- ── attendance (per-day worker log) ───────────────────────────────────────
create table if not exists public.attendance (
  "id" text primary key,
  "workerId" text,
  "day" text,
  "date" text,
  "status" text,
  "location" text,
  "adjustType" text,
  "bonusValue" numeric,
  "bonusReason" text,
  "deductionValue" numeric,
  "deductionReason" text
);

-- ── Permissive RLS (single internal manager; see security note above) ──────
do $$
declare t text;
begin
  foreach t in array array['offers','maintenance','sites','schedule','workers','attendance']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "public all" on public.%I;', t);
    execute format('create policy "public all" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
