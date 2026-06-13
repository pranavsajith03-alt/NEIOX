/* ─────────────────────────────────────────────────────────────────────────
   lib/supabaseClient.ts  ← MIGRATION SHIM

   This file previously exported a singleton `getSupabaseClient()`.
   It now re-exports from the new split architecture so any existing
   imports don't break while you migrate component by component.

   TODO: Once all components import directly from lib/supabase/client
         or lib/supabase/server, delete this file.
───────────────────────────────────────────────────────────────────────── */
export { createClient as getSupabaseClient } from "./supabase/client";