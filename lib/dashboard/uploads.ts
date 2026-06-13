/* ─────────────────────────────────────────────────────────────────────────
   lib/dashboard/uploads.ts

   Shared server-side data fetch for the daily-report-upload dashboard.
   Used by the intern, staff, and researcher dashboard pages — each shows
   only the signed-in user's own uploads (last 30 days).
───────────────────────────────────────────────────────────────────────── */
import type { createClient } from '@/lib/supabase/server';
import type { Upload, UploadStatus } from '@/lib/supabase/types';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export interface UploadDashboardData {
  today:         string;
  todayUpload:   Upload | null;
  uploadHistory: Upload[];
  uploadsByDate: Record<string, UploadStatus>;
}

export async function getUploadDashboardData(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<UploadDashboardData> {
  const today = new Date().toISOString().split('T')[0];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .gte('uploaded_at', thirtyDaysAgo.toISOString())
    .order('uploaded_at', { ascending: false });

  const uploadHistory = (data ?? []) as Upload[];

  return {
    today,
    todayUpload: uploadHistory.find(u => u.uploaded_at.startsWith(today)) ?? null,
    uploadHistory,
    uploadsByDate: Object.fromEntries(
      uploadHistory.map(u => [u.uploaded_at.split('T')[0], u.status])
    ),
  };
}
