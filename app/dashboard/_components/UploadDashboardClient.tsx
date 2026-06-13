'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
}                        from 'react';
import { createClient }  from '@/lib/supabase/client';
import type { Upload, UploadStatus } from '@/lib/supabase/types';

/* ── Types ────────────────────────────────────────────────────────────── */
interface Props {
  userId:        string;
  today:         string;
  todayUpload:   Upload | null;
  uploadHistory: Upload[];
  uploadsByDate: Record<string, UploadStatus>;
}

interface UploadState {
  phase:    'idle' | 'validating' | 'uploading' | 'inserting' | 'done' | 'error';
  progress: number;
  message:  string | null;
  fileName: string | null;
}

/* ── Constants ────────────────────────────────────────────────────────── */
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
];
// Extension whitelist — checked alongside MIME type, since `file.type` can
// be empty or unreliable depending on OS/browser and is attacker-controlled
// when the upload API is called directly (bypassing this UI).
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_B  = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILE_NAME_LENGTH = 150;
const STORAGE_BUCKET   = 'intern-uploads';

/* ── Formatters ───────────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
}

function getDeadlineCountdown(): string {
  const now      = new Date();
  const deadline = new Date();
  deadline.setHours(23, 59, 0, 0);
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return 'Deadline passed';
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${h}h ${m}m remaining`;
}

/* ── Status config ────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<UploadStatus, { label: string; badgeClass: string }> = {
  pending:  { label: 'Pending Review', badgeClass: 'badge-pending' },
  reviewed: { label: 'Reviewed',       badgeClass: 'badge-idle'    },
  approved: { label: 'Approved',       badgeClass: 'badge-success' },
  rejected: { label: 'Rejected',       badgeClass: 'badge-error'   },
};

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function getDayLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short' });
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function UploadDashboardClient({
  userId,
  today,
  todayUpload:   initialTodayUpload,
  uploadHistory: initialHistory,
  uploadsByDate: initialUploadsByDate,
}: Props) {

  const [todayUpload,   setTodayUpload]   = useState<Upload | null>(initialTodayUpload);
  const [uploadHistory, setUploadHistory] = useState<Upload[]>(initialHistory);
  const [uploadsByDate, setUploadsByDate] = useState(initialUploadsByDate);
  const [uploadState,   setUploadState]   = useState<UploadState>({
    phase: 'idle', progress: 0, message: null, fileName: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [countdown,  setCountdown]  = useState(getDeadlineCountdown);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Countdown ticker ─────────────────────────────────────────── */
  useEffect(() => {
    const id = setInterval(() => setCountdown(getDeadlineCountdown()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* ── Poll for status changes every 30s ───────────────────────── */
  useEffect(() => {
    const poll = async () => {
      try {
        const supabase      = createClient();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data } = await supabase
          .from('uploads')
          .select('*')
          .eq('user_id', userId)
          .gte('uploaded_at', thirtyDaysAgo.toISOString())
          .order('uploaded_at', { ascending: false });

        if (data) {
          setUploadHistory(data as Upload[]);
          setTodayUpload(
            (data as Upload[]).find(u => u.uploaded_at.startsWith(today)) ?? null
          );
          setUploadsByDate(
            Object.fromEntries(
              (data as Upload[]).map(u => [u.uploaded_at.split('T')[0], u.status])
            )
          );
        }
      } catch { /* silent */ }
    };

    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [userId, today]);

  /* ── File validation ──────────────────────────────────────────────
     Whitelist-based: MIME type AND extension must both be accepted,
     the file must be non-empty and within the size limit, and the
     filename must be a reasonable length before it's used to build
     the storage path below.
  ─────────────────────────────────────────────────────────────────*/
  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type))
      return 'File type not accepted. Use PDF, Word, TXT, PNG, or JPG.';

    const dotIndex = file.name.lastIndexOf('.');
    const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : '';
    if (!ACCEPTED_EXTENSIONS.includes(extension))
      return 'File extension not accepted. Use PDF, Word, TXT, PNG, or JPG.';

    if (file.name.length > MAX_FILE_NAME_LENGTH)
      return `File name too long. Maximum ${MAX_FILE_NAME_LENGTH} characters.`;

    if (file.size === 0)
      return 'File is empty.';

    if (file.size > MAX_FILE_SIZE_B)
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;

    return null;
  }, []);

  /* ── Upload handler ───────────────────────────────────────────── */
  const handleUpload = useCallback(async (file: File) => {
    setUploadState({ phase: 'validating', progress: 0,
                     message: 'Validating file…', fileName: file.name });

    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({ phase: 'error', progress: 0,
                       message: validationError, fileName: file.name });
      return;
    }

    const safeName    = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${today}/${Date.now()}_${safeName}`;
    const supabase    = createClient();

    try {
      setUploadState({ phase: 'uploading', progress: 10,
                       message: 'Uploading file…', fileName: file.name });

      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, { cacheControl: '3600', upsert: false });

      if (storageError) throw new Error(storageError.message);

      setUploadState({ phase: 'uploading', progress: 70,
                       message: 'Saving record…', fileName: file.name });

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      setUploadState({ phase: 'inserting', progress: 85,
                       message: 'Finalising…', fileName: file.name });

      const { data: insertedRow, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id:   userId,
          file_name: file.name,
          file_url:  urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          status:    'pending' as UploadStatus,
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      const newUpload = insertedRow as Upload;
      setTodayUpload(newUpload);
      setUploadHistory(prev => [newUpload, ...prev]);
      setUploadsByDate(prev => ({ ...prev, [today]: 'pending' }));
      setUploadState({
        phase: 'done', progress: 100,
        message: 'Upload successful! Your report is pending review.',
        fileName: file.name,
      });

    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message : 'Upload failed. Please try again.';
      setUploadState({ phase: 'error', progress: 0,
                       message, fileName: file.name });
    }
  }, [userId, today, validateFile]);

  /* ── Drag handlers ────────────────────────────────────────────── */
  const handleDragOver  = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = '';
    },
    [handleUpload]
  );

  /* ── Derived ──────────────────────────────────────────────────── */
  const hasUploadedToday = todayUpload !== null;
  const isUploading      = ['validating', 'uploading', 'inserting']
                             .includes(uploadState.phase);
  const last7Days        = getLast7Days();

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

      {/* ── Page header ─────────────────────────────────────────── */}
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
            <h1 className="text-gradient font-display text-3xl font-bold">
              Daily Report Upload
            </h1>
            <p className="mt-1 text-sm text-sage-400">
              Submit your daily activity report before midnight.
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2
                           border text-xs font-semibold shrink-0
                           ${hasUploadedToday
                             ? 'border-status-success/30 bg-status-success/10 text-status-success'
                             : 'border-status-warning/30 bg-status-warning/10 text-status-warning'
                           }`}
               style={{ boxShadow: hasUploadedToday
                 ? '0 0 20px rgba(34,197,94,0.18)'
                 : '0 0 20px rgba(245,158,11,0.18)' }}>
            <span className={`h-1.5 w-1.5 rounded-full
                              ${hasUploadedToday
                                ? 'bg-status-success'
                                : 'bg-status-warning animate-ping-slow'
                              }`} />
            {hasUploadedToday ? 'Submitted today' : countdown}
          </div>
        </div>
      </div>

      {/* ── Status + streak row ─────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Today status */}
        <div className="card hover-lift p-5 animate-in-delay-1">
          <p className="text-xs font-bold uppercase tracking-[0.15em]
                        text-sage-300 mb-3">
            Today's Status
          </p>
          {hasUploadedToday && todayUpload ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center
                                rounded-xl bg-status-success/15
                                border border-status-success/25 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none"
                       className="h-5 w-5 text-status-success"
                       stroke="currentColor" strokeWidth={2.5}
                       strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-sage-100">
                    Report Submitted
                  </p>
                  <p className="text-xs text-sage-400">
                    {formatTime(todayUpload.uploaded_at)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-forest-800 border border-sage-600/20
                              px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg viewBox="0 0 24 24" fill="none"
                       className="h-4 w-4 text-sage-400 shrink-0"
                       stroke="currentColor" strokeWidth={1.75}
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <span className="text-xs text-sage-300 truncate font-mono">
                    {todayUpload.file_name}
                  </span>
                </div>
                <span className="text-xs text-sage-400 shrink-0">
                  {formatBytes(todayUpload.file_size)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-sage-400">Review status</span>
                <span className={`badge ${STATUS_CONFIG[todayUpload.status].badgeClass}`}>
                  {STATUS_CONFIG[todayUpload.status].label}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center
                              rounded-xl bg-status-warning/15
                              border border-status-warning/25 shrink-0">
                <svg viewBox="0 0 24 24" fill="none"
                     className="h-5 w-5 text-status-warning"
                     stroke="currentColor" strokeWidth={2}
                     strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-sage-100">
                  Not Yet Submitted
                </p>
                <p className="text-xs text-sage-400">{countdown}</p>
              </div>
            </div>
          )}
        </div>

        {/* 7-day streak */}
        <div className="card hover-lift p-5 animate-in-delay-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em]
                        text-sage-300 mb-3">
            7-Day Streak
          </p>
          <div className="flex items-end justify-between gap-1.5">
            {last7Days.map(date => {
              const status    = uploadsByDate[date];
              const isToday   = date === today;
              const hasUpload = !!status;

              let dotClass = 'bg-forest-800 border-sage-600/20';
              if (hasUpload && status === 'approved')
                dotClass = 'bg-status-success border-status-success/30';
              else if (hasUpload && status === 'rejected')
                dotClass = 'bg-status-error border-status-error/30';
              else if (hasUpload)
                dotClass = 'bg-mint-500 border-mint-500/30';

              return (
                <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`w-full rounded-lg border transition-all duration-300
                      ${dotClass}
                      ${isToday
                        ? 'ring-2 ring-mint-500/40 ring-offset-1 ring-offset-forest-900'
                        : ''
                      }`}
                    style={{ height: '36px' }}
                    title={`${date}${status
                      ? ` — ${STATUS_CONFIG[status].label}`
                      : ' — No upload'}`}
                  />
                  <span className={`text-[9px] font-medium uppercase
                    ${isToday ? 'text-mint-500' : 'text-sage-400'}`}>
                    {getDayLabel(date)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {[
              { color: 'bg-mint-500',       label: 'Submitted' },
              { color: 'bg-status-success', label: 'Approved'  },
              { color: 'bg-status-error',   label: 'Rejected'  },
              { color: 'bg-forest-800',     label: 'No upload' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-sm ${color}`} />
                <span className="text-[10px] text-sage-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Upload zone ─────────────────────────────────────────── */}
      <div className={`animate-in-delay-3 transition-opacity duration-300
                       ${hasUploadedToday ? 'opacity-50 hover:opacity-100' : ''}`}>
        {hasUploadedToday && (
          <p className="mb-2 text-xs text-sage-400 text-center">
            Already submitted today — upload again to replace your report
          </p>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative overflow-hidden sheen rounded-2xl border-2 border-dashed
            p-10 text-center cursor-pointer transition-all duration-300
            ${isDragOver
              ? 'border-mint-500 bg-mint-500/8 scale-[1.01]'
              : isUploading
                ? 'border-sage-600/30 bg-forest-900/50 cursor-not-allowed'
                : 'border-sage-600/30 bg-forest-900/50 hover:border-sage-500/50 hover:bg-forest-800/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFileInput}
            className="sr-only"
            aria-label="Upload daily report"
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <svg className="h-10 w-10 text-mint-500 animate-spin"
                     viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor"
                          strokeWidth="2" className="opacity-20"/>
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" className="opacity-80"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-sage-300">
                {uploadState.message}
              </p>
              <div className="mx-auto max-w-xs">
                <div className="h-1.5 w-full rounded-full bg-forest-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-mint-500 shadow-mint-glow-sm
                               transition-all duration-500"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-sage-400 text-right font-mono">
                  {uploadState.progress}%
                </p>
              </div>
            </div>

          ) : uploadState.phase === 'done' ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center
                                rounded-2xl bg-status-success/15
                                border border-status-success/25">
                  <svg viewBox="0 0 24 24" fill="none"
                       className="h-6 w-6 text-status-success"
                       stroke="currentColor" strokeWidth={2.5}
                       strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-status-success">
                {uploadState.message}
              </p>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setUploadState({
                    phase: 'idle', progress: 0,
                    message: null, fileName: null,
                  });
                }}
                className="text-xs text-sage-400 hover:text-sage-300
                           transition-colors underline"
              >
                Upload another file
              </button>
            </div>

          ) : uploadState.phase === 'error' ? (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center
                                rounded-2xl bg-status-error/15
                                border border-status-error/25">
                  <svg viewBox="0 0 24 24" fill="none"
                       className="h-6 w-6 text-status-error"
                       stroke="currentColor" strokeWidth={2.5}
                       strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6"  y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-status-error">
                Upload failed
              </p>
              <p className="text-xs text-sage-400">{uploadState.message}</p>
              <button
                onClick={e => {
                  e.stopPropagation();
                  setUploadState({
                    phase: 'idle', progress: 0,
                    message: null, fileName: null,
                  });
                }}
                className="text-xs text-mint-500 hover:text-mint-400
                           transition-colors underline"
              >
                Try again
              </button>
            </div>

          ) : (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className={`flex h-12 w-12 items-center justify-center
                                 rounded-2xl border transition-all duration-300
                                 ${isDragOver
                                   ? 'border-mint-500 bg-mint-500/15'
                                   : 'border-sage-600/40 bg-forest-800'
                                 }`}>
                  <svg viewBox="0 0 24 24" fill="none"
                       className={`h-6 w-6 transition-colors duration-300
                                   ${isDragOver ? 'text-mint-500' : 'text-sage-400'}`}
                       stroke="currentColor" strokeWidth={1.75}
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-sage-200">
                  {isDragOver
                    ? 'Drop your file here'
                    : 'Drag & drop your daily report'
                  }
                </p>
                <p className="mt-1 text-xs text-sage-400">
                  or{' '}
                  <span className="text-mint-500 font-medium">click to browse</span>
                  {' '}— PDF, Word, TXT, PNG, JPG up to {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Upload history ───────────────────────────────────────── */}
      <div className="card overflow-hidden animate-in-delay-4">
        <div className="h-1 bg-gradient-to-r from-mint-500 via-mint-400 to-transparent" />
        <div className="flex items-center justify-between px-5 py-4
                        border-b border-sage-600/20">
          <h2 className="text-sm font-semibold text-sage-200">
            Upload History
          </h2>
          <span className="badge badge-idle">Last 30 days</span>
        </div>

        {uploadHistory.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-sage-400">No uploads yet.</p>
            <p className="mt-1 text-xs text-sage-400">
              Your submitted reports will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-600/20">
                  {['File', 'Date', 'Time', 'Size', 'Status'].map(col => (
                    <th key={col}
                        className="px-5 py-3 text-left text-xs font-semibold
                                   uppercase tracking-[0.1em] text-sage-400">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-600/10">
                {uploadHistory.map((upload, i) => (
                  <tr
                    key={upload.id}
                    className={`transition-colors duration-200
                                hover:bg-forest-800/50
                                ${i === 0 && upload.uploaded_at.startsWith(today)
                                  ? 'bg-mint-500/5' : ''}`}
                  >
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <div className="flex items-center gap-2.5">
                        <svg viewBox="0 0 24 24" fill="none"
                             className="h-4 w-4 text-sage-400 shrink-0"
                             stroke="currentColor" strokeWidth={1.75}
                             strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                        </svg>
                        <span className="truncate font-mono text-xs text-sage-300">
                          {upload.file_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-sage-400 whitespace-nowrap">
                      {formatDate(upload.uploaded_at)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-sage-400 whitespace-nowrap">
                      {formatTime(upload.uploaded_at)}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-sage-400 whitespace-nowrap">
                      {formatBytes(upload.file_size)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_CONFIG[upload.status].badgeClass}`}>
                        {STATUS_CONFIG[upload.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
