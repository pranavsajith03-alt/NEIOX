# Supabase Storage RLS for `intern-uploads`

Create a private bucket in Supabase named `intern-uploads` and apply the following Row Level Security rules.

> **Run `supabase/clean_slate.sql` (STEP 9) instead of copying the SQL below by hand.** That file is the
> source of truth and is kept in sync with the actual `profiles`/`uploads` schema. The policies below are
> kept for reference/explanation only.
>
> **Why the policies changed:** earlier versions of this doc checked `auth.jwt() ->> 'role' IN (...)` /
> `= 'founder'`. That JWT claim is the **Postgres role** (`'authenticated'` for any logged-in user) — it is
> never `'intern'`/`'staff'`/`'researcher'`/`'founder'`, so those conditions could never be true. As written,
> **no one — including founders — could upload, delete, or view files** in this bucket. The corrected
> policies check the real app role via `public.profiles.role`, through the `SECURITY DEFINER` helper
> functions `public.has_upload_role()` and `public.is_founder()` defined in `clean_slate.sql` (the same
> bypass-RLS-via-definer-function pattern used to fix the `profiles`/`uploads` table policy recursion).

> **Bucket name note:** the application code (`app/dashboard/_components/UploadDashboardClient.tsx` and
> `app/dashboard/founder/FounderDashboardClient.tsx`) uploads to and downloads from a bucket literally
> named `intern-uploads`. This doc previously referenced `activity-reports` — use `intern-uploads` for
> all bucket creation, policies, and bucket-level settings below so the configured RLS actually applies
> to the bucket the app talks to.

> **Role coverage:** the daily-report-upload dashboard (`UploadDashboardClient`) is shared by the
> `intern`, `staff`, and `researcher` roles — each uploads to their own `<uid>/...` prefix in this
> bucket. The INSERT policy below must allow all three roles.
>
> **Immutability:** once a file is uploaded, the uploader (intern/staff/researcher) cannot modify or
> delete it — there is intentionally no UPDATE or DELETE policy for team members on this bucket (RLS
> defaults to deny), matching the insert-only policy on `public.uploads` in `clean_slate.sql` STEP 5.

## 1. Enable RLS on the bucket

In the Supabase dashboard, select Storage > Buckets > intern-uploads and set `Public` to false. Then enable Row Level Security.

## 2. Policy: Interns, staff, and researchers can INSERT only their own files

```sql
create policy "Team members can upload their own report" on storage.objects
  for insert
  with check (
    bucket_id = 'intern-uploads'
    and auth.role() = 'authenticated'
    and public.has_upload_role()
    and name like auth.uid() || '/%'
  );
```


## 3. Policy: Only founders can SELECT files

```sql
create policy "Founders can view and download reports" on storage.objects
  for select
  using (
    bucket_id = 'intern-uploads'
    and auth.role() = 'authenticated'
    and public.is_founder()
  );
```

## 4. Bucket-level upload limits (server-enforced)

The app's client-side checks (`UploadDashboardClient.tsx` — MIME type, extension, and 10MB size
whitelist) are a UX convenience only; they run in the browser and can be bypassed by anyone calling
the Supabase Storage API directly with the user's anon key. The only checks that cannot be bypassed
are the bucket's own settings, configured in the Supabase dashboard under
Storage > Buckets > intern-uploads > Edit bucket:

- **File size limit**: set to `10MB` to match `MAX_FILE_SIZE_MB` in `UploadDashboardClient.tsx`.
- **Allowed MIME types**: restrict to
  `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, image/png, image/jpeg`
  to match `ACCEPTED_TYPES` in `UploadDashboardClient.tsx`.

If either value in the app code changes, update the bucket settings to match.

## Notes

- Store report files under a path that begins with the uploader's user ID, such as `user-id/Activity_Report.docx`.
- Only authenticated founder users should be able to list and download files from this bucket.
- `public.has_upload_role()` and `public.is_founder()` look up the current user's role from
  `public.profiles.role` (see `supabase/clean_slate.sql`, STEP 4). If the role-derivation logic in
  `handle_new_user()` changes, these helpers automatically reflect it — no Storage policy changes needed.
