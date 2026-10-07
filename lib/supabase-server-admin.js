// ============================================================
// WHAT THIS FILE DOES
// Connects the SERVER to Supabase using the SECRET key. Used by her page
// and your admin page. Never import this into a "use client" file.
// ============================================================

import { createClient } from "@supabase/supabase-js";

// SERVER ONLY. Uses the secret service-role key, which can read everything.
// Never import this file from a "use client" component, and never put
// NEXT_PUBLIC_ in front of this key's name.
export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}