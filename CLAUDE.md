# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

NEIOX is a Next.js 14 (App Router) site combining:
- A public marketing site (`app/page.tsx`, `components/*`) for a sustainability/ESG consulting brand.
- An authenticated, role-based dashboard (`app/dashboard/**`) for founders, staff, researchers, and interns, backed by Supabase (auth, Postgres, storage).

## Commands

- `npm run dev` — start the Next.js dev server
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — Next.js/ESLint checks
- `npx tsc --noEmit` — type-check (no separate `typecheck` script defined)

There is no test framework configured (no Jest/Vitest/Playwright config or `*.test.*` files).

## Environment

Required vars in `.env.local` (see `lib/supabase/types.ts` `assertEnv`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, bypasses RLS; never prefix with `NEXT_PUBLIC_`

## Architecture

### Two design systems in one app

`app/RootLayoutClient.tsx` toggles a `dashboard` class on `<body>` based on the route prefix (`/dashboard`), and hides the marketing `Navbar` for `/dashboard` and `/login`. `app/globals.css` / `tailwind.config.ts` define two parallel token sets:
- **Public site** — light "Stitch" tokens (`neiox-*` colors, `--n-*` CSS vars, Hanken Grotesk display font).
- **Dashboard** — dark `forest`/`sage`/`mint` palette, applied via `body.dashboard`.

Don't mix the two systems within a single page.

### Auth & role-based access — three layers of defense

1. **`middleware.ts`** (matches nearly all routes): redirects unauthenticated users away from `/dashboard/*` to `/login?redirectTo=...`; redirects authenticated users away from `/login` to their role's dashboard; enforces `ROLE_ROUTE_ACCESS` for role-scoped subpaths (`/dashboard/founder`, `/dashboard/staff`, `/dashboard/researcher`, `/dashboard/intern`); signs out and redirects with `?error=profile_missing` if a `profiles` row doesn't exist yet.
2. **Each role page** (e.g. `app/dashboard/founder/page.tsx`) is a server component that *independently* re-checks `supabase.auth.getUser()` and the `profiles.role` value and redirects again — middleware is not trusted as the sole guard.
3. **`app/auth/callback/route.ts`** handles the OAuth/email-confirmation redirect, exchanges the code for a session, polls `profiles` (a DB trigger creates the row asynchronously, so it retries up to 3x with a 500ms delay), then redirects to the role-specific dashboard.

`UserRole` and `ROLE_DASHBOARD_PATHS` (`lib/supabase/types.ts`) are the single source of truth for role → dashboard-path mapping; middleware, the auth callback, and the login page each duplicate this map locally — keep them in sync if it changes.

### Supabase client variants (`lib/supabase/`)

- **`client.ts`** — browser client (anon key). Import only from `'use client'` components.
- **`server.ts`** — two exports:
  - `createClient()` — anon key, RLS enforced, for server components/actions (cookie-based session via `next/headers`).
  - `createAdminClient()` — service role key, **bypasses RLS**. Reserve for founder-only admin actions / background jobs; never expose to the browser.
- **`lib/supabaseClient.ts`** — deprecated re-export shim for the old singleton `getSupabaseClient()`. Don't add new imports from it; migrate callers to `lib/supabase/client` or `lib/supabase/server` when touched.

### Database schema (`lib/supabase/types.ts`)

- `profiles`: `id` (= `auth.users.id`), `email`, `full_name`, `role` (`UserRole`), `avatar_url`, timestamps.
- `uploads`: `id`, `user_id`, `file_name`, `file_url`, `file_size`, `mime_type`, `status` (`UploadStatus`: `pending | reviewed | approved | rejected`), `notes`, `uploaded_at`, `reviewed_at`, `reviewed_by`.
- `ActionResult<T>` / `ok()` / `err()` are the intended return shape for server actions and API routes — use these for new server-side mutations rather than throwing/returning raw data.

### Storage RLS

`SUPABASE_STORAGE_RLS.md` documents the required Supabase Storage policies for the `intern-uploads` bucket: `intern`/`staff`/`researcher` roles can insert/delete only files under `<their-uid>/...`, only founders can `select`/list.

### Daily report upload dashboard

`app/dashboard/_components/UploadDashboardClient.tsx` is a shared `'use client'` component rendering the "Daily Report Upload" UI (today's status, 7-day streak, drag-and-drop upload zone, upload history). It's used by the `intern`, `staff`, and `researcher` role pages (`app/dashboard/{intern,staff,researcher}/page.tsx`), each a server component that auth/role-guards, fetches the signed-in user's own `uploads` rows via `lib/dashboard/uploads.ts#getUploadDashboardData`, and passes them in as props. All three roles upload to the same `intern-uploads` storage bucket and `uploads` table, keyed by `user_id` — the founder's review queue (`FounderDashboardClient.tsx`) shows submissions from all of them.

## Known WIP areas / inconsistencies

These exist in the current tree — don't assume they're intentional final states without checking with the user:

- `app/dashboard/layout.tsx` is a `'use client'` passthrough that performs no auth check and does not render `DashboardShell` — per-page server components handle their own auth/role guards.
- `components` does **not** contain `DashboardShell`; it lives at `app/dashboard/DashboardShell.tsx` and is currently unused (not imported anywhere). Its `NAV_ITEMS` reference routes that don't exist yet: `/dashboard/founder/team`, `/dashboard/founder/reports`, `/dashboard/settings`.
- `app/dashboard/page.tsx` currently renders the public marketing homepage sections (`Navbar`, `HeroSection`, `SolutionsGrid`, etc.), not a dashboard overview page.
- `@upstash/ratelimit` and `@upstash/redis` are dependencies but have no usages in `app/`, `components/`, or `lib/` yet.
