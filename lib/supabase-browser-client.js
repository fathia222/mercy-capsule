// ============================================================
// WHAT THIS FILE DOES
// Connects the visitor's browser to Supabase using the PUBLIC key.
// This key can only ADD memories, never read them.
// ============================================================

import { createClient } from "@supabase/supabase-js";

let client = null;

// Browser client. Uses the PUBLIC anon key, which is safe to expose
// because Row Level Security (see supabase-setup.sql) only lets it ADD memories.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}