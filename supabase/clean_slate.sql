-- ============================================================================
-- NEIOX Supabase clean-slate script
--
-- Context: the SQL editor history accumulated several conflicting fix
-- attempts (multiple DROP TABLE ... CASCADE on profiles, 4 different
-- handle_new_user() definitions, duplicate/incompatible RLS policies).
-- This script replaces ALL of that with one consistent setup matching
-- lib/supabase/types.ts and CLAUDE.md.
--
-- HOW TO USE:
--   1. Run STEP 0 first. Read the output — it tells you what state your
--      DB is currently in (this matters for the backfill in STEP 7).
--   2. Run STEPS 1-8 together (or one at a time, in order).
--   3. Run STEP 9 to confirm policies/columns look right.
--   4. In the Supabase dashboard, create the "intern-uploads" Storage
--      bucket (Public = OFF) if it doesn't exist yet — STEP 8 creates
--      its RLS policies via SQL, but bucket creation itself is a
--      dashboard-only action. See SUPABASE_STORAGE_RLS.md.
-- ============================================================================


-- ============================================================================
-- STEP 0 — DIAGNOSTICS (run first, read the results)
-- ============================================================================

-- Current profiles columns (after h/l, this may be missing email/full_name/
-- avatar_url/created_at — compare against the 7 columns created in STEP 2)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Current uploads columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'uploads'
ORDER BY ordinal_position;

-- All current policies on profiles/uploads
SELECT relname AS table_name, polname AS policy_name, polcmd AS command,
       pg_get_expr(polqual, polrelid)      AS using_expr,
       pg_get_expr(polwithcheck, polrelid) AS with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname IN ('profiles', 'uploads');

-- Which handle_new_user() is currently live
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- How many auth users exist vs. how many have a profile row
-- (if profiles count < users count, those users are currently locked out
-- with ?error=profile_missing and need the backfill in STEP 6)
SELECT
  (SELECT count(*) FROM auth.users)     AS auth_users,
  (SELECT count(*) FROM public.profiles) AS profile_rows;


-- ============================================================================
-- STEP 1 — Clean removal of everything we're about to replace
-- ============================================================================
DROP TRIGGER  IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_founder() CASCADE;

-- Drops uploads first so its FK to profiles doesn't block the profiles drop.
-- CASCADE here also removes any leftover/duplicate policies from g/m.
DROP TABLE IF EXISTS public.uploads  CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ============================================================================
-- STEP 2 — profiles (7 columns, matches lib/supabase/types.ts)
-- ============================================================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL UNIQUE,
  full_name  TEXT,
  role       TEXT NOT NULL CHECK (role IN ('founder', 'staff', 'researcher', 'intern')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================================
-- STEP 3 — uploads (11 columns, matches lib/supabase/types.ts)
-- ============================================================================
CREATE TABLE public.uploads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  notes       TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX uploads_user_id_idx     ON public.uploads (user_id);
CREATE INDEX uploads_status_idx      ON public.uploads (status);
CREATE INDEX uploads_uploaded_at_idx ON public.uploads (uploaded_at DESC);


-- ============================================================================
-- STEP 4 — is_founder() helper
--
-- SECURITY DEFINER functions run as the function owner (table owner),
-- which bypasses RLS. This lets "founder can read all" policies check
-- profiles.role WITHOUT the policy querying profiles-under-RLS again,
-- which is what caused the "infinite recursion detected in policy for
-- relation profiles" error from queries d/e/g/m.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'founder'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_founder() TO authenticated;

-- has_upload_role(): true for the three roles that use the daily-report
-- upload dashboard and the intern-uploads Storage bucket (intern/staff/
-- researcher). Used by both the uploads table policies (STEP 5) and the
-- Storage policies (STEP 9).
CREATE OR REPLACE FUNCTION public.has_upload_role()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('intern', 'staff', 'researcher')
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_upload_role() TO authenticated;


-- ============================================================================
-- STEP 5 — RLS policies
-- ============================================================================

-- ---- profiles -------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: user can read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: founder can read all"
  ON public.profiles FOR SELECT
  USING (public.is_founder());

CREATE POLICY "profiles: user can update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Column-level grant instead of a role-aware WITH CHECK: this is what
-- stops a user from UPDATE-ing their own `role` to 'founder'. The policy
-- above allows the UPDATE statement; this restricts which columns it can
-- touch. profiles.role is only ever set by handle_new_user() (SECURITY
-- DEFINER, bypasses RLS/grants entirely), never by the client.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (email, full_name, avatar_url, updated_at) ON public.profiles TO authenticated;

-- No INSERT policy for `authenticated` on purpose: profile rows are only
-- ever created by handle_new_user() below, which is SECURITY DEFINER and
-- therefore bypasses RLS. Don't add "WITH CHECK (true)" INSERT policies —
-- that's what let queries d/h allow arbitrary self-inserted profile rows.

-- ---- uploads ----------------------------------------------------------------
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploads: member can read own"
  ON public.uploads FOR SELECT
  USING (auth.uid() = user_id AND public.has_upload_role());

CREATE POLICY "uploads: member can insert own"
  ON public.uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_upload_role());

-- Intentionally no "member can update own" / "member can delete own"
-- policy: once a row is inserted, the uploader (intern/staff/researcher)
-- cannot modify or delete it - only a founder can change it (status
-- review below). RLS defaults to deny, so omitting these policies is
-- sufficient.

CREATE POLICY "uploads: founder can read all"
  ON public.uploads FOR SELECT
  USING (public.is_founder());

CREATE POLICY "uploads: founder can update status"
  ON public.uploads FOR UPDATE
  USING (public.is_founder())
  WITH CHECK (public.is_founder());


-- ============================================================================
-- STEP 6 — handle_new_user() trigger
--
-- Single source of truth for role assignment. Role is derived ONLY from
-- the verified auth.users.email (whitelist + dotted pattern), never from
-- client-supplied raw_user_meta_data->>'role' (that was the privilege-
-- escalation hole in queries h/i).
--
-- No match -> RETURN NEW without inserting a profile row. The auth user
-- is created, but middleware.ts's profile lookup will fail and redirect
-- to /login?error=profile_missing (the flow documented in CLAUDE.md).
-- This is the graceful behaviour from query f, NOT j's RAISE EXCEPTION
-- (which would surface as a raw signup error to the user).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_role TEXT;
  derived_name TEXT;
BEGIN
  derived_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  IF NEW.email IN (
    'sajith@nitc.ac.in',
    'hemalatha.tr@gmail.com',
    'akhilpottekkat@gmail.com',
    'neioxecocycle@gmail.com'
  ) THEN
    derived_role := 'founder';
  ELSIF NEW.email ILIKE '%.staff.%' THEN
    derived_role := 'staff';
  ELSIF NEW.email ILIKE '%.research.%' THEN
    derived_role := 'researcher';
  ELSIF NEW.email ILIKE '%.intern.%' THEN
    derived_role := 'intern';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, avatar_url, created_at, updated_at)
  VALUES (NEW.id, NEW.email, derived_name, derived_role, NEW.raw_user_meta_data->>'avatar_url', now(), now())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;


-- ============================================================================
-- STEP 7 — Backfill profiles for existing auth.users
--
-- STEP 1's CASCADE drop deletes any profile rows that existed before this
-- script ran. The trigger above only fires on NEW auth.users inserts, so
-- anyone who signed up earlier needs their profile row recreated here using
-- the same email-based role rules. If STEP 0 showed profile_rows = 0 and
-- auth_users > 0, this is required or those accounts will be locked out
-- with ?error=profile_missing.
-- ============================================================================
INSERT INTO public.profiles (id, email, full_name, role, avatar_url, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  CASE
    WHEN u.email IN (
      'sajith@nitc.ac.in',
      'hemalatha.tr@gmail.com',
      'akhilpottekkat@gmail.com',
      'neioxecocycle@gmail.com'
    ) THEN 'founder'
    WHEN u.email ILIKE '%.staff.%'    THEN 'staff'
    WHEN u.email ILIKE '%.research.%' THEN 'researcher'
    WHEN u.email ILIKE '%.intern.%'   THEN 'intern'
    ELSE NULL
  END AS role,
  u.raw_user_meta_data->>'avatar_url',
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
  AND (
    u.email IN (
      'sajith@nitc.ac.in',
      'hemalatha.tr@gmail.com',
      'akhilpottekkat@gmail.com',
      'neioxecocycle@gmail.com'
    )
    OR u.email ILIKE '%.staff.%'
    OR u.email ILIKE '%.research.%'
    OR u.email ILIKE '%.intern.%'
  );


-- ============================================================================
-- STEP 8 — Storage RLS for the intern-uploads bucket
--
-- Replaces the policies in SUPABASE_STORAGE_RLS.md, which checked
-- auth.jwt() ->> 'role' IN ('intern','staff','researcher') / = 'founder'.
-- That JWT claim is the POSTGRES role (always 'authenticated' for a
-- logged-in user) - it is NEVER 'intern'/'staff'/'researcher'/'founder',
-- so those conditions could never be true. As written, NO ONE - including
-- founders - could upload or view files in this bucket.
--
-- These versions check the real app role via public.profiles.role,
-- through the SECURITY DEFINER helpers from STEP 4 (same fix as the
-- profiles/uploads recursion issue: bypass RLS via a definer function
-- instead of an inline subquery / a non-existent JWT claim).
--
-- Upload path convention (set by UploadDashboardClient.tsx):
--   <uploader-uid>/<date>/<timestamp>_<filename>
-- so "name LIKE auth.uid() || '/%'" scopes a user to their own folder.
--
-- No DELETE (or UPDATE) policy for team members: once a file is uploaded
-- it's immutable from the uploader's side, matching the "uploads: member
-- can insert own"-only policy on the uploads table in STEP 5. RLS
-- defaults to deny, so a missing policy is sufficient - no "deny" rule
-- needed. The DROP below removes that policy if a previous run created it.
--
-- Prerequisite (dashboard only, not SQL): Storage > Buckets > create
-- bucket "intern-uploads" with Public = OFF, if it doesn't exist yet.
-- ============================================================================
DROP POLICY IF EXISTS "Team members can upload their own report" ON storage.objects;
DROP POLICY IF EXISTS "Team members can delete their own report" ON storage.objects;
DROP POLICY IF EXISTS "Founders can view and download reports"   ON storage.objects;

CREATE POLICY "Team members can upload their own report"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'intern-uploads'
    AND auth.role() = 'authenticated'
    AND public.has_upload_role()
    AND name LIKE auth.uid() || '/%'
  );

CREATE POLICY "Founders can view and download reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'intern-uploads'
    AND auth.role() = 'authenticated'
    AND public.is_founder()
  );


-- ============================================================================
-- STEP 9 — Verify
-- ============================================================================
SELECT id, email, full_name, role FROM public.profiles ORDER BY created_at;

SELECT relname AS table_name, polname AS policy_name, polcmd AS command
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname IN ('profiles', 'uploads')
ORDER BY table_name, command;
-- Expect: profiles -> 3 rows (2 SELECT, 1 UPDATE), uploads -> 4 rows
-- (2 SELECT, 1 INSERT, 1 UPDATE)

SELECT polname AS policy_name, polcmd AS command
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'storage' AND c.relname = 'objects'
  AND polname IN (
    'Team members can upload their own report',
    'Founders can view and download reports'
  );
-- Expect: 2 rows (1 INSERT, 1 SELECT) - no DELETE/UPDATE policy for
-- team members, so uploads are immutable once submitted.
