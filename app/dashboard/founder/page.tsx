/* ─────────────────────────────────────────────────────────────────────────
   app/dashboard/founder/page.tsx  — Server Component

   Fetches all data server-side:
   - Platform-wide upload stats for the metrics row
   - Full team member list from profiles
   - All uploads joined with uploader profile data
   - Passes to FounderDashboardClient for interactive review actions
───────────────────────────────────────────────────────────────────────── */
import { redirect }     from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Upload, Profile, UploadStatus } from '@/lib/supabase/types';
import FounderDashboardClient from './FounderDashboardClient';

/* ── Enriched upload type — upload row joined with uploader profile ───── */
export interface EnrichedUpload extends Upload {
  uploader_name:  string;
  uploader_email: string;
}

/* ── Platform metric shape ────────────────────────────────────────────── */
export interface PlatformMetrics {
  totalUploads:    number;
  pendingReviews:  number;
  approvedToday:   number;
  activeReporters: number;
}

export default async function FounderDashboardPage() {
  const supabase = await createClient();

  /* ── Auth guard ─────────────────────────────────────────────────── */
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) redirect('/login');

  /* ── Verify founder role ────────────────────────────────────────── */
  const { data: self } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (self?.role !== 'founder') redirect('/dashboard');

  /* ── Fetch all profiles ─────────────────────────────────────────── */
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  /* ── Fetch all uploads (last 60 days) ───────────────────────────── */
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const { data: uploads } = await supabase
    .from('uploads')
    .select('*')
    .gte('uploaded_at', sixtyDaysAgo.toISOString())
    .order('uploaded_at', { ascending: false });

  /* ── Join uploads with profile data ────────────────────────────── */
  const profileMap = new Map(
    (profiles ?? []).map(p => [p.id, p])
  );

  const enrichedUploads: EnrichedUpload[] = (uploads ?? []).map(upload => {
    const uploader = profileMap.get(upload.user_id);
    return {
      ...upload,
      uploader_name:  uploader?.full_name  ?? 'Unknown',
      uploader_email: uploader?.email      ?? upload.user_id,
    };
  });

  /* ── Compute platform metrics ───────────────────────────────────── */
  const today = new Date().toISOString().split('T')[0];

  const metrics: PlatformMetrics = {
    totalUploads:   enrichedUploads.length,
    pendingReviews: enrichedUploads.filter(u => u.status === 'pending').length,
    approvedToday:  enrichedUploads.filter(u =>
      u.status === 'approved' && u.reviewed_at?.startsWith(today)
    ).length,
    activeReporters: (profiles ?? []).filter(p =>
      p.role === 'intern' || p.role === 'staff' || p.role === 'researcher'
    ).length,
  };

  return (
    <FounderDashboardClient
      currentUserId={user.id}
      profiles={profiles as Profile[] ?? []}
      uploads={enrichedUploads}
      metrics={metrics}
    />
  );
}