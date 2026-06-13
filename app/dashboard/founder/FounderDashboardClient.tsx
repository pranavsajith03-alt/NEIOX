/* ─────────────────────────────────────────────────────────────────────────
   app/dashboard/founder/FounderDashboardClient.tsx
───────────────────────────────────────────────────────────────────────── */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter }                       from 'next/navigation';
import { createClient }                    from '@/lib/supabase/client';
import type { Profile, UploadStatus }      from '@/lib/supabase/types';
import type { EnrichedUpload, PlatformMetrics } from './page';

/* ── Types ────────────────────────────────────────────────────────────── */
interface Props {
  currentUserId: string;
  profiles:      Profile[];
  uploads:       EnrichedUpload[];
  metrics:       PlatformMetrics;
}

type ActiveTab = 'queue' | 'team' | 'all';

type ReviewAction = 'approved' | 'rejected';

interface ReviewingState {
  uploadId: string;
  action:   ReviewAction;
}

/* ── Status config ────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<UploadStatus, { label: string; badgeClass: string }> = {
  pending:  { label: 'Pending',  badgeClass: 'badge-pending' },
  reviewed: { label: 'Reviewed', badgeClass: 'badge-idle'    },
  approved: { label: 'Approved', badgeClass: 'badge-success' },
  rejected: { label: 'Rejected', badgeClass: 'badge-error'   },
};

const ROLE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
  founder:    { label: 'Founder',    badgeClass: 'badge-warning' },
  staff:      { label: 'Staff',      badgeClass: 'badge-pending' },
  researcher: { label: 'Researcher', badgeClass: 'badge-success' },
  intern:     { label: 'Intern',     badgeClass: 'badge-idle'    },
};

/* ── Formatters ───────────────────────────────────────────────────────── */
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/* ── Metric card ──────────────────────────────────────────────────────── */
const ENTRANCE_DELAYS = ['animate-in', 'animate-in-delay-1', 'animate-in-delay-2', 'animate-in-delay-3', 'animate-in-delay-4'];

function MetricCard({
  label, value, sub, accent = false, delay = 0,
}: {
  label:   string;
  value:   number | string;
  sub?:    string;
  accent?: boolean;
  delay?:  0 | 1 | 2 | 3 | 4;
}) {
  return (
    <div className={`card-terminal hover-lift group relative overflow-hidden
      p-5 rounded-xl transition-colors duration-300 ${ENTRANCE_DELAYS[delay]}
      ${accent ? 'border-mint-500/30 bg-forest-800 shadow-mint-glow-sm' : 'hover:border-mint-500/30'}`}>
      {/* decorative glow on hover */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12
                      h-28 w-28 rounded-full opacity-0 transition-opacity duration-500
                      group-hover:opacity-100"
           style={{ background: 'radial-gradient(circle, rgba(164,212,138,0.35), transparent 70%)' }} />
      <p className="relative text-xs font-bold uppercase tracking-[0.15em]
                    text-sage-300 mb-2">
        {label}
      </p>
      <p className={`relative font-display text-3xl font-bold tabular-nums
                     ${accent ? 'text-mint-600' : 'text-sage-100'}`}>
        {value}
      </p>
      {sub && (
        <p className="relative mt-1 text-xs text-sage-400">{sub}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function FounderDashboardClient({
  currentUserId,
  profiles,
  uploads,
  metrics,
}: Props) {
  const router = useRouter();

  const [activeTab,  setActiveTab]  = useState<ActiveTab>('queue');
  const [reviewing,  setReviewing]  = useState<ReviewingState | null>(null);
  const [localUploads, setLocalUploads] = useState<EnrichedUpload[]>(uploads);
  const [searchQuery, setSearchQuery]   = useState('');
  const [errorMsg,    setErrorMsg]      = useState<string | null>(null);
  const [localMetrics, setLocalMetrics] = useState<PlatformMetrics>(metrics);

  /* ── Filtered views ───────────────────────────────────────────── */
  const pendingQueue = useMemo(() =>
    localUploads.filter(u => u.status === 'pending'),
    [localUploads]
  );

  const filteredUploads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return localUploads;
    return localUploads.filter(u =>
      u.uploader_name.toLowerCase().includes(q)  ||
      u.uploader_email.toLowerCase().includes(q) ||
      u.file_name.toLowerCase().includes(q)
    );
  }, [localUploads, searchQuery]);

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return profiles;
    return profiles.filter(p =>
      p.full_name?.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)      ||
      p.role.toLowerCase().includes(q)
    );
  }, [profiles, searchQuery]);

  /* ── Review action ───────────────────────────────────────────────
     Updates DB row status + reviewed_at + reviewed_by,
     then updates local state optimistically.
  ─────────────────────────────────────────────────────────────────*/
  const handleReview = useCallback(async (
    uploadId: string,
    action:   ReviewAction,
  ) => {
    setReviewing({ uploadId, action });
    setErrorMsg(null);

    try {
      const supabase   = createClient();
      const reviewedAt = new Date().toISOString();

      const { error } = await supabase
        .from('uploads')
        .update({
          status:      action,
          reviewed_at: reviewedAt,
          reviewed_by: currentUserId,
        })
        .eq('id', uploadId);

      if (error) throw new Error(error.message);

      /* Optimistic local update */
      setLocalUploads(prev =>
        prev.map(u =>
          u.id === uploadId
            ? { ...u, status: action as UploadStatus,
                reviewed_at: reviewedAt,
                reviewed_by: currentUserId }
            : u
        )
      );

      /* Update metrics */
      if (action === 'approved') {
        setLocalMetrics(prev => ({
          ...prev,
          pendingReviews: Math.max(0, prev.pendingReviews - 1),
          approvedToday:  prev.approvedToday + 1,
        }));
      } else {
        setLocalMetrics(prev => ({
          ...prev,
          pendingReviews: Math.max(0, prev.pendingReviews - 1),
        }));
      }

    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message : 'Review action failed.';
      setErrorMsg(message);
    } finally {
      setReviewing(null);
    }
  }, [currentUserId]);

  /* ── Download handler ─────────────────────────────────────────── */
  const handleDownload = useCallback(async (upload: EnrichedUpload) => {
    try {
      const supabase = createClient();
      /* Extract storage path from public URL */
      const urlParts   = upload.file_url.split('/intern-uploads/');
      const storagePath = urlParts[1] ?? upload.file_name;

      const { data, error } = await supabase.storage
        .from('intern-uploads')
        .download(storagePath);

      if (error || !data) throw new Error(error?.message ?? 'Download failed.');

      const url  = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href     = url;
      link.download = upload.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Download failed.';
      setErrorMsg(message);
    }
  }, []);

  /* ════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Ambient background glows — fill the rest of the screen */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-32
                      h-[32rem] w-[32rem] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(164,212,138,0.16), transparent 70%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -left-48
                      h-[30rem] w-[30rem] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(63,105,44,0.10), transparent 70%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-1/4
                      h-[28rem] w-[28rem] rounded-full"
           style={{ background: 'radial-gradient(circle, rgba(164,212,138,0.12), transparent 70%)' }} />

      <div className="relative z-10 space-y-6 max-w-[1800px] mx-auto p-6 sm:p-8 lg:p-10">

      {/* ── Terminal header ────────────────────────────────────── */}
      <div className="page-header relative overflow-hidden animate-in">
        {/* Decorative glow accents */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16
                        h-64 w-64 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(164,212,138,0.18), transparent 70%)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/4
                        h-72 w-72 rounded-full"
             style={{ background: 'radial-gradient(circle, rgba(63,105,44,0.10), transparent 70%)' }} />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            {/* Terminal-style label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs text-mint-500">~/</span>
              <span className="font-mono text-xs text-sage-400">
                neiox-admin
              </span>
              <span className="font-mono text-xs text-sage-400">—</span>
              <span className="font-mono text-xs text-sage-400">
                founder terminal
              </span>
              <span className="h-2 w-1.5 bg-mint-500 animate-ping-slow
                               inline-block ml-1" />
            </div>
            <h1 className="text-gradient font-display text-3xl font-bold">
              Admin Terminal
            </h1>
            <p className="mt-1 text-sm text-sage-400">
              Review submissions, manage team members, monitor platform activity.
            </p>
          </div>

          {/* Pending badge */}
          {localMetrics.pendingReviews > 0 && (
            <div className="flex items-center gap-2 rounded-full
                            border border-status-warning/30
                            bg-status-warning/10 px-4 py-2"
                 style={{ boxShadow: '0 0 20px rgba(245,158,11,0.18)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-status-warning
                               animate-ping-slow" />
              <span className="text-xs font-semibold text-status-warning">
                {localMetrics.pendingReviews} pending{' '}
                {localMetrics.pendingReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Metrics row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total Uploads"
          value={localMetrics.totalUploads}
          sub="Last 60 days"
          delay={1}
        />
        <MetricCard
          label="Pending Review"
          value={localMetrics.pendingReviews}
          sub="Awaiting action"
          accent={localMetrics.pendingReviews > 0}
          delay={2}
        />
        <MetricCard
          label="Approved Today"
          value={localMetrics.approvedToday}
          sub="Since midnight"
          delay={3}
        />
        <MetricCard
          label="Active Reporters"
          value={localMetrics.activeReporters}
          sub="Intern · Staff · Researcher"
          delay={4}
        />
      </div>

      {/* ── Error banner ───────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl
                        border border-status-error/25
                        bg-status-error/10 px-4 py-3">
          <span className="text-xs font-bold text-status-error">✕</span>
          <span className="text-sm text-status-error">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-xs text-sage-400 hover:text-sage-300
                       transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Tab bar + search ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center
                      sm:justify-between">

        {/* Tabs */}
        <div className="flex rounded-xl bg-forest-900 p-1
                        border border-sage-600/20 w-fit">
          {(
            [
              { key: 'queue', label: 'Review Queue',
                count: pendingQueue.length },
              { key: 'all',   label: 'All Uploads',
                count: localUploads.length },
              { key: 'team',  label: 'Team Members',
                count: profiles.length },
            ] as { key: ActiveTab; label: string; count: number }[]
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                sheen flex items-center gap-2 rounded-lg px-4 py-2
                text-sm font-medium transition-all duration-300
                ${activeTab === tab.key
                  ? 'bg-forest-700 text-sage-100 shadow-card'
                  : 'text-sage-400 hover:text-sage-300'
                }
              `}
            >
              {tab.label}
              <span className={`
                flex h-5 min-w-[20px] items-center justify-center
                rounded-full px-1.5 text-[10px] font-bold
                ${activeTab === tab.key
                  ? tab.key === 'queue' && tab.count > 0
                    ? 'bg-status-warning/30 text-status-warning'
                    : 'bg-sage-600/30 text-sage-400'
                  : 'bg-forest-800 text-sage-400'
                }
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none"
               className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
                          text-sage-400 pointer-events-none"
               stroke="currentColor" strokeWidth={1.75}
               strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search name, email, file…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            maxLength={100}
            className="field focus-glow pl-9 py-2 text-sm w-full sm:w-64"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB: REVIEW QUEUE
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'queue' && (
        <div className="card overflow-hidden animate-in">
          <div className="h-1 bg-gradient-to-r from-mint-500 via-mint-400 to-transparent" />
          <div className="flex items-center justify-between
                          border-b border-sage-600/20 px-5 py-4">
            <h2 className="text-sm font-semibold text-sage-200">
              Pending Review Queue
            </h2>
            <span className={`badge ${
              pendingQueue.length > 0 ? 'badge-warning' : 'badge-idle'
            }`}>
              {pendingQueue.length} items
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center
                              justify-center rounded-2xl
                              border border-sage-600/20 bg-forest-800">
                <svg viewBox="0 0 24 24" fill="none"
                     className="h-6 w-6 text-sage-400"
                     stroke="currentColor" strokeWidth={1.75}
                     strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-sage-300">
                All caught up
              </p>
              <p className="mt-1 text-xs text-sage-400">
                No pending submissions to review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-sage-600/10">
              {pendingQueue.map(upload => (
                <ReviewRow
                  key={upload.id}
                  upload={upload}
                  reviewing={reviewing}
                  onApprove={() => handleReview(upload.id, 'approved')}
                  onReject={()  => handleReview(upload.id, 'rejected')}
                  onDownload={() => handleDownload(upload)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: ALL UPLOADS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'all' && (
        <div className="card overflow-hidden animate-in">
          <div className="h-1 bg-gradient-to-r from-mint-500 via-mint-400 to-transparent" />
          <div className="flex items-center justify-between
                          border-b border-sage-600/20 px-5 py-4">
            <h2 className="text-sm font-semibold text-sage-200">
              All Submissions
            </h2>
            <span className="badge badge-idle">
              {filteredUploads.length} records
            </span>
          </div>

          {filteredUploads.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-sage-400">
                {searchQuery ? 'No results match your search.' : 'No uploads yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sage-600/20">
                    {['Intern', 'File', 'Uploaded', 'Size', 'Status', 'Actions']
                      .map(col => (
                      <th key={col}
                          className="px-5 py-3 text-left text-xs font-semibold
                                     uppercase tracking-[0.1em] text-sage-400">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-600/10">
                  {filteredUploads.map(upload => (
                    <tr key={upload.id}
                        className="transition-colors hover:bg-forest-800/40">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-xs font-semibold text-sage-200">
                            {upload.uploader_name}
                          </p>
                          <p className="text-[10px] font-mono text-sage-400 mt-0.5">
                            {upload.uploader_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[160px]">
                        <span className="font-mono text-xs text-sage-400 truncate block">
                          {upload.file_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-sage-400">
                          {formatDateTime(upload.uploaded_at)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-sage-400">
                          {formatBytes(upload.file_size)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge
                          ${STATUS_CONFIG[upload.status].badgeClass}`}>
                          {STATUS_CONFIG[upload.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {upload.status === 'pending' && (
                            <>
                              <button
                                onClick={() =>
                                  handleReview(upload.id, 'approved')}
                                disabled={!!reviewing}
                                className="rounded-lg border border-status-success/30
                                           bg-status-success/10 px-3 py-1.5
                                           text-xs font-semibold text-status-success
                                           transition-all duration-200
                                           hover:bg-status-success/20
                                           disabled:opacity-40"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleReview(upload.id, 'rejected')}
                                disabled={!!reviewing}
                                className="rounded-lg border border-status-error/30
                                           bg-status-error/10 px-3 py-1.5
                                           text-xs font-semibold text-status-error
                                           transition-all duration-200
                                           hover:bg-status-error/20
                                           disabled:opacity-40"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDownload(upload)}
                            className="rounded-lg border border-sage-600/30
                                       bg-forest-800 px-3 py-1.5
                                       text-xs font-medium text-sage-400
                                       transition-all duration-200
                                       hover:text-sage-200 hover:border-sage-500/50"
                          >
                            ↓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB: TEAM MEMBERS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'team' && (
        <div className="card overflow-hidden animate-in">
          <div className="h-1 bg-gradient-to-r from-mint-500 via-mint-400 to-transparent" />
          <div className="flex items-center justify-between
                          border-b border-sage-600/20 px-5 py-4">
            <h2 className="text-sm font-semibold text-sage-200">
              Team Members
            </h2>
            <span className="badge badge-idle">
              {filteredProfiles.length} members
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-600/20">
                  {['Member', 'Role', 'Joined', 'Uploads', 'Last Active']
                    .map(col => (
                    <th key={col}
                        className="px-5 py-3 text-left text-xs font-semibold
                                   uppercase tracking-[0.1em] text-sage-400">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-600/10">
                {filteredProfiles.map(profile => {
                  /* Count uploads for this member */
                  const memberUploads = localUploads.filter(
                    u => u.user_id === profile.id
                  );
                  const lastUpload = memberUploads[0];
                  const isCurrentUser = profile.id === currentUserId;

                  return (
                    <tr key={profile.id}
                        className={`transition-colors hover:bg-forest-800/40
                          ${isCurrentUser ? 'bg-mint-500/5' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar initials */}
                          <div className="flex h-8 w-8 shrink-0 items-center
                                          justify-center rounded-lg
                                          bg-gradient-to-br from-mint-300/50 to-mint-500/15
                                          text-xs font-bold
                                          text-mint-700 ring-1 ring-mint-500/20">
                            {(profile.full_name ?? profile.email)
                              .split(' ')
                              .map(n => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-sage-200">
                              {profile.full_name ?? '—'}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-[10px]
                                                 text-mint-500 font-normal">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] font-mono text-sage-400">
                              {profile.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge
                          ${ROLE_CONFIG[profile.role]?.badgeClass
                            ?? 'badge-idle'}`}>
                          {ROLE_CONFIG[profile.role]?.label ?? profile.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-sage-400">
                          {new Date(profile.created_at)
                            .toLocaleDateString('en-GB', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-sage-400">
                          {memberUploads.length}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs text-sage-400">
                          {lastUpload
                            ? formatDateTime(lastUpload.uploaded_at)
                            : '—'
                          }
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

/* ── ReviewRow ────────────────────────────────────────────────────────────
   Extracted component for the review queue rows — rich card layout
   with approve/reject/download actions prominently displayed.
─────────────────────────────────────────────────────────────────────────*/
function ReviewRow({
  upload,
  reviewing,
  onApprove,
  onReject,
  onDownload,
}: {
  upload:     EnrichedUpload;
  reviewing:  ReviewingState | null;
  onApprove:  () => void;
  onReject:   () => void;
  onDownload: () => void;
}) {
  const isThisReviewing = reviewing?.uploadId === upload.id;

  return (
    <div className="px-5 py-4 border-l-2 border-l-transparent
                    hover:border-l-mint-500 hover:bg-forest-800/30
                    transition-all duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center
                      sm:justify-between">

        {/* Left: intern info + file */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center
                          rounded-xl bg-gradient-to-br from-mint-300/50 to-mint-500/15
                          text-sm font-bold
                          text-mint-700 ring-1 ring-mint-500/20">
            {(upload.uploader_name)
              .split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-sage-100">
              {upload.uploader_name}
            </p>
            <p className="text-xs font-mono text-sage-400 mt-0.5">
              {upload.uploader_email}
            </p>
            {/* File details */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 rounded-lg
                               bg-forest-800 border border-sage-600/20
                               px-2.5 py-1 font-mono text-[11px] text-sage-400">
                <svg viewBox="0 0 24 24" fill="none"
                     className="h-3 w-3 shrink-0"
                     stroke="currentColor" strokeWidth={1.75}
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {upload.file_name}
              </span>
              <span className="text-[11px] font-mono text-sage-400">
                {formatBytes(upload.file_size)}
              </span>
              <span className="text-[11px] font-mono text-sage-400">
                {formatDateTime(upload.uploaded_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDownload}
            className="btn-ghost px-3 py-2 text-xs gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none"
                 className="h-3.5 w-3.5"
                 stroke="currentColor" strokeWidth={1.75}
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>

          <button
            onClick={onReject}
            disabled={!!reviewing}
            className="rounded-xl border border-status-error/30
                       bg-status-error/10 px-4 py-2
                       text-xs font-semibold text-status-error
                       transition-all duration-200
                       hover:bg-status-error/20
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isThisReviewing && reviewing?.action === 'rejected'
              ? 'Rejecting…' : 'Reject'}
          </button>

          <button
            onClick={onApprove}
            disabled={!!reviewing}
            className="rounded-xl border border-status-success/30
                       bg-status-success/15 px-4 py-2
                       text-xs font-semibold text-status-success
                       transition-all duration-200
                       hover:bg-status-success/25 hover:shadow-sm
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isThisReviewing && reviewing?.action === 'approved'
              ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}