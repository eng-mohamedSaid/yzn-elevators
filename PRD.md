# Product Requirements Document (PRD)

## نظام اليزن لإدارة المصاعد — Al-Yazen Elevators Management System

**Version:** 2.1 · **Currency standard:** جنيه (EGP) everywhere

---

## 0. Progress Tracker

> Tick a box when its phase is fully landed (green `tsc` + build) and verified.

- [x] **Phase 0 — Types foundation** (Site, SiteSchedule, Worker, Attendance, enums)
- [x] **Phase 1 — Sites module** (list + detail + daily log)
- [x] **Phase 2 — Workers module** (list + detail + attendance)
- [x] **Phase 3 — Salary print report** (Arabic RTL print-to-PDF)
- [x] **Phase 4 — Activate routes + currency sweep**
- [x] **Phase 5 — Supabase backend** (client, schema, async migration) — *code done; paste keys into `.env` + run `supabase/schema.sql` to go live*

Detailed per-task checklists live in §3.

---

## 1. Product Overview

A mobile-first, Arabic-RTL elevator management system for small-to-medium elevator companies. It manages price offers, maintenance contracts, installation **sites** (with a per-day work log), and **workers** (attendance, additions/deductions, and monthly salary reports) — replacing paper workflows.

### 1.1 Lifecycle

1. **Offer** (عرض) → price quote
2. **Contract** (صيانة) → maintenance deal
3. **Site** (موقع) → installation work with a daily log
4. **Worker** (موظف) → field teams, attendance & salaries

### 1.2 Platform constraints (current reality)

- **Data:** `localStorage` via `dataService` (key `alyazen_<module>`). No migration layer → **all new fields must be optional-safe on read** (`?? ''` / `?? 0`).
- **Currency:** جنيه (EGP) is the single standard across all pages and reports.
- **Arabic PDF:** browser **print-to-PDF** (styled RTL HTML + `window.print()`), never jsPDF (no Arabic glyphs).

---

## 2. Module Status

| Module | Route | Detail UX | Status |
|--------|-------|-----------|--------|
| Dashboard | `/` | — | Active |
| Offers (عروض الأسعار) | `/offers` | Modal | Active — modular (`components/offers/*`) |
| Maintenance (عقود الصيانة) | `/maintenance` | Modal | Active — modular (`components/maintenance/*`) |
| Sites (المواقع) | `/sites`, `/sites/:id` | Routed page | **Active — rebuilt to full spec** |
| Workers (الموظفين) | `/workers`, `/workers/:id` | Routed page | **Active — rebuilt to full spec** |
| Login | `/login` | — | Active |

**Module pattern (gold standard):** thin page + per-module folder of 6 files (`<Module>FormFields`, `Add<Module>Modal`, `<Module>DetailView/Modal`, `<module>Constants`, `<module>FormDefaults`) reusing `components/{Modal,Input,Select,DetailField}` and `components/shared/{ConfirmEdit,ConfirmDelete,DownloadRange}Modal`. Reference: `components/maintenance/*`.

**Detail UX split (intentional):** Offers & Maintenance use **modal** detail (flat records); Sites & Workers use a **routed detail page** because the spec needs large per-day tables.

### 2.1 Sites (المواقع)

**List fields:** رقم الموقع (auto `SITE-000N`), اسم الموقع, العنوان, رابط الخريطة, تاريخ البداية/النهاية, **إجمالي أيام العمل (auto)**, السعر الكلي, عدد المصاعد, نوع المصاعد (free text), سعر الوقفة, عدد الوقفات, سعر المرحلة, عدد المراحل, نوع العميل (شركة/عميل), المرحلة الحالية (برج/باب وعمود/ماكينة وكابينة/كهرباء).

**Detail page — per-day work log:** اليوم, التاريخ, نوع المرحلة, الفني الأول/الثاني (مهندس/فني), العامل الأول/الثاني (مساعد/مساعد أول), ما تم إنجازه, **3 notes columns**, per-day إضافي/خصم/لا يوجد (value + reason). Persists to `localStorage['alyazen_schedule']`.

### 2.2 Workers (الموظفين)

**List fields:** اسم الموظف, نوع الموظف (مهندس/فني/مساعد/مساعد أول), نوع الراتب (يومية/راتب شهري), قيمة الراتب, تاريخ الالتحاق, ملاحظات.

**Detail page — daily attendance:** التاريخ, اليوم, الحالة (حاضر/غائب), **مكان العمل** (select built from Sites + Offers), per-day إضافي/خصم/لا يوجد (value + reason). Date-range filter. **Net salary** footer by salary type:
- راتب شهري → `salary + Σbonus − Σdeduction`
- يومية → `(presentDays × dailyRate) + Σbonus − Σdeduction`

Persists to `localStorage['alyazen_attendance']`.

**Monthly salary report (print-to-PDF):** worker data, present/absent counts, work locations, base salary, additions, deductions, **net salary**, receipt date. Via `services/reportPrint.ts` → `window.print()`.

---

## 3. Delivery Phases (with checklists)

### Phase 0 — Types foundation ✅
- [x] `SiteStage`, `AdjustType`, `WorkerRole`, `SalaryType` enums
- [x] `Site` +elevatorCount/elevatorType/stopsCount/currentStage, customerType→Arabic
- [x] `SiteSchedule` +stageType/accomplished/notes1-3/adjust fields
- [x] `Worker` role→WorkerRole, +salaryType/createdAt
- [x] `AttendanceRecord` structured adjust fields
- [x] `tsc --noEmit` clean

### Phase 1 — Sites module ✅
- [x] `components/sites/` (siteConstants, siteFormDefaults, SiteFormFields, AddSiteModal)
- [x] `Sites.tsx` rewritten (chips, table+cards, DownloadRange, SITE-000N, جنيه)
- [x] `SiteDetails.tsx` daily log (stage, 2 tech + 2 worker slots, accomplished, 3 notes, additions/deductions)

### Phase 2 — Workers module ✅
- [x] `components/workers/` (workerConstants incl. `getWorkLocations`, workerFormDefaults, WorkerFormFields, AddWorkerModal)
- [x] `Workers.tsx` rewritten (chips, download, cards w/ role+salaryType)
- [x] `WorkerDetails.tsx` (attendance w/ location select + structured adjust, net salary by salary type, date filter)
- [x] `SiteDetails` slot filtering switched to `TECH_ROLES`/`WORKER_ROLES`
- [x] Demo seed (`main.tsx`) updated to new Worker shape

### Phase 3 — Salary print report ✅
- [x] `services/reportPrint.ts` → `printWorkerReport(...)` styled RTL Arabic + `window.print()`
- [x] Printer button wired in `WorkerDetails.tsx`

### Phase 4 — Activate routes + currency ✅
- [x] `App.tsx` — sites + workers routes activated
- [x] `Navigation.tsx` — الموظفين link restored
- [x] Currency sweep to جنيه (SiteDetails, WorkerDetails, Dashboard)
- [x] `tsc` + `npm run build` clean

### Phase 5 — Supabase backend ✅ (code complete; awaiting keys)
**Decisions (owner):** Full migration · **local hashed login** (no Supabase Auth) · single-company (no tenant/RLS-by-tenant).
- [x] `@supabase/supabase-js` installed + `services/supabaseClient.ts` (env-based; `null` when unconfigured)
- [x] `services/dataService.ts` rewritten **async**, Supabase-primary + **localStorage fallback/cache**; added `bulkUpsert` for the schedule/attendance grids
- [x] All 7 pages `await` the async dataService (Offers, Maintenance, Sites, SiteDetails, Workers, WorkerDetails, Dashboard)
- [x] `supabase/schema.sql` — 6 tables, camelCase columns matching `src/types.ts`, permissive RLS
- [x] Login hardened: password stored as **SHA-256 hash** in `AuthContext` (no plaintext), not Supabase Auth
- [x] `tsc` + `npm run build` clean
- [ ] **Owner action to go live:** create Supabase project → run `supabase/schema.sql` → copy `.env.example` to `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` → restart dev server
- [ ] Verify against live Supabase: create/read/update/delete across modules; offline falls back to cache

> ⚠ **Security:** the anon key ships in the frontend and the RLS policies are permissive, so anyone with URL+key can read/write. Acceptable for a low-sensitivity internal tool only. To lock down later: enable Supabase Auth + authenticated RLS policies (see `supabase/schema.sql` header).

---

## 4. Data Schema (target Supabase; mirrors `src/types.ts`)

### 4.1 `offers` / 4.2 `maintenance_contracts`
Unchanged — see `Offer` / `MaintenanceContract` interfaces.

### 4.3 `sites`
```sql
create table sites (
  id text primary key,                 -- SITE-0001
  site_number text not null,
  site_name text not null,
  address text, map_url text,
  start_date date, end_date date,
  total_days int default 0,            -- auto
  price numeric(12,2) default 0,       -- جنيه
  elevator_count int default 0,
  elevator_type text,                  -- free text
  stop_price numeric(12,2) default 0,
  stops_count int default 0,
  stage_price numeric(12,2) default 0,
  stages_count int default 0,
  customer_type text default 'عميل',   -- شركة | عميل
  current_stage text,                  -- برج | باب وعمود | ماكينة وكابينة | كهرباء
  created_at timestamptz default now()
);
```

### 4.4 `site_schedule`
```sql
create table site_schedule (
  id text primary key,
  site_id text references sites(id),
  day text, date date,
  stage_type text,
  tech1_id text, tech2_id text,
  worker1_id text, worker2_id text,
  accomplished text,
  notes1 text, notes2 text, notes3 text,
  adjust_type text default 'لا يوجد',
  bonus_value numeric(12,2) default 0, bonus_reason text,
  deduction_value numeric(12,2) default 0, deduction_reason text
);
```

### 4.5 `workers`
```sql
create table workers (
  id text primary key,
  name text not null,
  role text not null,                  -- مهندس | فني | مساعد | مساعد أول
  salary_type text not null,           -- يومية | راتب شهري
  base_salary numeric(12,2) default 0,
  join_date date, notes text,
  created_at timestamptz default now()
);
```

### 4.6 `attendance`
```sql
create table attendance (
  id text primary key,
  worker_id text references workers(id),
  day text, date date,
  status text,                         -- present | absent
  location text,                       -- from sites / offers
  adjust_type text default 'لا يوجد',
  bonus_value numeric(12,2) default 0, bonus_reason text,
  deduction_value numeric(12,2) default 0, deduction_reason text
);
```

### 4.7 Multi-tenancy (optional, future)
Add `tenant_id uuid` to every table + `tenant_users` map + RLS (`tenant_id = auth.uid()`).

---

## 5. Tech Stack

React 19 · TypeScript 5.8 · Vite 6 · Tailwind 4 · react-router 7 · lucide-react · motion · date-fns 4 · xlsx (Excel) · jspdf (Latin PDF) · **window.print()** (Arabic reports) · docx (Word) · localStorage (`dataService`).

---

## 6. Supabase — go-live steps

Decisions locked: **full migration** · **local hashed login** (not Supabase Auth) · **single company**. The code is done; to connect a real backend:

1. **Create a project** at supabase.com (free tier is fine).
2. **Run the schema** — open Supabase → SQL Editor → paste all of `supabase/schema.sql` → Run. Creates `offers, maintenance, sites, schedule, workers, attendance`.
3. **Add credentials** — copy `.env.example` → `.env`, fill from Supabase → Project Settings → API:
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-public-key>
   ```
4. **Restart** `npm run dev` (Vite reads env at startup). The app now reads/writes Supabase; localStorage becomes the offline cache.
5. **(Optional) migrate existing local data** — currently in `localStorage.alyazen_*`. A small one-off import script can push it into Supabase if the manager already entered records offline.

**How the fallback works:** `dataService` uses Supabase when `.env` is set and calls succeed; otherwise it transparently serves the localStorage cache, so the app never hard-fails offline.

**Change the login password:**
```
node -e "console.log(require('crypto').createHash('sha256').update('NEW_PASSWORD').digest('hex'))"
```
Paste the hash into `ADMIN_PASSWORD_SHA256` in `src/context/AuthContext.tsx`.

⚠ **Security caveat:** the anon key is public (shipped in the bundle) and RLS policies are permissive → anyone with URL+key can read/write. Fine for a single-manager internal tool; before wider exposure, enable Supabase Auth + authenticated RLS.

---

## 7. Verification checklist

- [x] `npx tsc --noEmit` clean · `npm run build` clean
- [ ] Sites: create (auto totalDays + `SITE-000N`), open, fill a day row, save, reload → persists
- [ ] Workers: create each role + both salary types, mark attendance, pick location from dropdown, add bonus + deduction, net salary matches salary type, reload → persists
- [ ] Print button → RTL Arabic salary report renders; browser "Save as PDF" works
- [ ] Currency reads جنيه across Sites, Workers, Dashboard
- [ ] Regression: Offers & Maintenance still create/edit/export
- [ ] Login works with the hashed password
- [ ] After `.env` + schema: records land in Supabase (check the table editor); offline still works via cache

> The manual/browser rows are pending a click-through (dev server on :3000). Automated `tsc` + `build` pass.
