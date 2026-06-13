/* ─────────────────────────────────────────────────────────────────────────
   lib/supabase/types.ts

   Single source of truth for:
   - Database schema types (expand as your schema grows)
   - Shared application-level types used across client + server
   - Role definitions tied to your dashboard routing
───────────────────────────────────────────────────────────────────────── */

/* ── User Roles ───────────────────────────────────────────────────────────
   Must match the `role` column values in your `profiles` table exactly.
   Used in middleware for route protection and dashboard routing.
─────────────────────────────────────────────────────────────────────────*/
export type UserRole = 'founder' | 'staff' | 'researcher' | 'intern';

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  founder:    '/dashboard/founder',
  staff:      '/dashboard/staff',
  researcher: '/dashboard/researcher',
  intern:     '/dashboard/intern',
} as const;

/* ── Database Schema Interface ────────────────────────────────────────────
   Extend each table interface as you add columns.
   `Row`    = shape returned by SELECT
   `Insert` = shape required for INSERT (omit generated fields)
   `Update` = shape accepted by UPDATE (all fields optional)
─────────────────────────────────────────────────────────────────────────*/
export interface Database {
  public: {
    Tables: {

      profiles: {
        Row: {
          id:         string;       // uuid — matches auth.users.id
          email:      string;
          full_name:  string | null;
          role:       UserRole;
          avatar_url: string | null;
          created_at: string;       // ISO timestamp
          updated_at: string;
        };
        Insert: {
          id:         string;
          email:      string;
          full_name?: string | null;
          role:       UserRole;
          avatar_url?: string | null;
        };
        Update: {
          full_name?:  string | null;
          role?:       UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };

      uploads: {
        Row: {
          id:          string;       // uuid
          user_id:     string;       // fk → profiles.id
          file_name:   string;
          file_url:    string;
          file_size:   number;       // bytes
          mime_type:   string;
          status:      UploadStatus;
          notes:       string | null;
          uploaded_at: string;       // ISO timestamp
          reviewed_at: string | null;
          reviewed_by: string | null; // fk → profiles.id
        };
        Insert: {
          user_id:    string;
          file_name:  string;
          file_url:   string;
          file_size:  number;
          mime_type:  string;
          status?:    UploadStatus;
          notes?:     string | null;
        };
        Update: {
          status?:      UploadStatus;
          notes?:       string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };

    };

    Views:   Record<string, never>;  // Add views here as you create them
    Functions: Record<string, never>; // Add RPC functions here
    Enums:   Record<string, never>;
  };
}

/* ── Upload Status ────────────────────────────────────────────────────── */
export type UploadStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

/* ── Convenience row-type aliases ─────────────────────────────────────── */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Upload  = Database['public']['Tables']['uploads']['Row'];

/* ── API response wrapper ─────────────────────────────────────────────────
   Use this as the return type for all server actions and API routes.
   Forces every caller to handle the error case explicitly.
─────────────────────────────────────────────────────────────────────────*/
export type ActionResult<T> =
  | { success: true;  data: T;      error: null }
  | { success: false; data: null;   error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data, error: null };
}

export function err(message: string): ActionResult<never> {
  return { success: false, data: null, error: message };
}

/* ── Environment variable guard ───────────────────────────────────────────
   Call this once at module init in both client.ts and server.ts.
   Throws at startup — not silently at runtime — if env vars are missing.
─────────────────────────────────────────────────────────────────────────*/
export function assertEnv(
  url: string | undefined,
  key: string | undefined,
  context: 'browser' | 'server'
): asserts url is string {
  if (!url || !key) {
    throw new Error(
      `[Supabase ${context}] Missing environment variables.\n` +
      `  NEXT_PUBLIC_SUPABASE_URL     → ${url  ? '✓' : '✗ NOT SET'}\n` +
      (context === 'server'
        ? `  SUPABASE_SERVICE_ROLE_KEY    → ${key ? '✓' : '✗ NOT SET'}`
        : `  NEXT_PUBLIC_SUPABASE_ANON_KEY → ${key ? '✓' : '✗ NOT SET'}`)
    );
  }
}