/* ─────────────────────────────────────────────────────────────────────────
   app/dashboard/intern/page.tsx  — Server Component

   Fetches the signed-in user's own uploads (last 30 days) and renders the
   shared daily-report-upload dashboard.
───────────────────────────────────────────────────────────────────────── */
import { redirect }     from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUploadDashboardData } from '@/lib/dashboard/uploads';
import UploadDashboardClient from '../_components/UploadDashboardClient';

export default async function InternDashboardPage() {
  const supabase = await createClient();

  /* ── Auth guard ─────────────────────────────────────────────────── */
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) redirect('/login');

  /* ── Verify role ───────────────────────────────────────────────── */
  const { data: self } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (self?.role !== 'intern' && self?.role !== 'founder') redirect('/dashboard');

  const data = await getUploadDashboardData(supabase, user.id);

  return (
    <UploadDashboardClient
      userId={user.id}
      today={data.today}
      todayUpload={data.todayUpload}
      uploadHistory={data.uploadHistory}
      uploadsByDate={data.uploadsByDate}
    />
  );
}
