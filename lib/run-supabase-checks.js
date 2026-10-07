// ============================================================
// WHAT THIS FILE DOES
// Tests your Supabase setup step by step, the same way a real
// visitor and your own server will use it. Each step returns
// pass or fail, with a plain-language fix if it fails.
// It cleans up after itself (leaves no test data behind).
// Shown at:  yoursite.com/admin/test?key=YOUR_ADMIN_KEY
// ============================================================

import { createClient } from "@supabase/supabase-js";

// a 1x1 pixel picture, used to test photo uploads
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

// Turn a technical error into a sentence you can act on
function explain(err) {
  const m = (err?.message || "").toLowerCase();
  if (m.includes("fetch failed") || m.includes("enotfound"))
    return "Can't reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL for typos.";
  if (m.includes("invalid api key") || m.includes("jwt"))
    return "A key is wrong. Copy the keys again from Supabase > Project Settings > API.";
  if (err?.code === "42P01" || err?.code === "PGRST205" || m.includes("could not find the table") || m.includes("does not exist"))
    return "The table is missing. Run supabase-setup.sql in the Supabase SQL Editor.";
  if (m.includes("row-level security") || err?.code === "42501")
    return "Permission blocked. Run supabase-setup.sql again (it adds the permission rules).";
  return err?.message || "Unknown error.";
}

export async function runSupabaseChecks() {
  const results = [];
  const add = (label, ok, hint = "") => results.push({ label, ok, hint });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // CHECK 1: are the keys in .env.local?
  const missing = [
    ["NEXT_PUBLIC_SUPABASE_URL", url],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey],
    ["SUPABASE_SERVICE_ROLE_KEY", serviceKey],
    ["CAPSULE_KEY", process.env.CAPSULE_KEY],
    ["ADMIN_KEY", process.env.ADMIN_KEY],
  ].filter(([, v]) => !v).map(([n]) => n);

  if (missing.length) {
    add("Keys are filled in", false, `Missing in .env.local: ${missing.join(", ")}. Add them, then stop and restart npm run dev.`);
    return results;
  }
  add("Keys are filled in", true);

  const opts = { auth: { persistSession: false } };
  const admin = createClient(url, serviceKey, opts); // the secret key (your server)
  const anon = createClient(url, anonKey, opts);     // the public key (visitors)

  // CHECK 2: does the memories table exist?
  const { count, error: tableErr } = await admin
    .from("memories").select("id", { count: "exact", head: true });
  if (tableErr) {
    add("Memories table exists", false, explain(tableErr));
    return results;
  }
  add("Memories table exists", true, `${count} memories saved so far.`);

  // CHECK 3: does the photos bucket exist and is it public?
  const { data: bucket, error: bucketErr } = await admin.storage.getBucket("photos");
  if (bucketErr || !bucket) {
    add("Photos storage exists", false, "The 'photos' bucket is missing. Run supabase-setup.sql in the SQL Editor.");
  } else if (!bucket.public) {
    add("Photos storage exists", false, "The bucket exists but is private, so photos won't show. In Supabase > Storage, make 'photos' public.");
  } else {
    add("Photos storage exists", true);
  }

  // CHECK 4: can a VISITOR submit a memory?
  const TEST_NAME = "__connection_test__";
  const { error: insertErr } = await anon
    .from("memories").insert({ name: TEST_NAME, message: "test", photos: [] });
  add("Visitors can submit a memory", !insertErr, insertErr ? explain(insertErr) : "");

  // CHECK 5: can a visitor READ memories? (they must NOT be able to)
  if (!insertErr) {
    const { data: seen } = await anon.from("memories").select("id").eq("name", TEST_NAME);
    const leaked = seen && seen.length > 0;
    add(
      "Visitors cannot read other people's memories",
      !leaked,
      leaked ? "Privacy problem: visitors can read memories. In Supabase > Authentication > Policies, delete any SELECT policy on 'memories'." : ""
    );

    // CHECK 6: can YOUR SERVER read it?
    const { data: rows, error: readErr } = await admin.from("memories").select("id").eq("name", TEST_NAME);
    add(
      "Your server can read memories (for her page)",
      !readErr && rows?.length > 0,
      readErr ? explain(readErr) : rows?.length ? "" : "The secret key could not see the test memory. Check SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  // always clean the test memory away
  await admin.from("memories").delete().eq("name", TEST_NAME);

  // CHECK 7: can a visitor upload a photo, and does its link open?
  const path = `connection-test-${Date.now()}.png`;
  const { error: uploadErr } = await anon.storage
    .from("photos").upload(path, TINY_PNG, { contentType: "image/png" });
  if (uploadErr) {
    add("Visitors can upload photos", false, explain(uploadErr));
  } else {
    add("Visitors can upload photos", true);
    const publicUrl = anon.storage.from("photos").getPublicUrl(path).data.publicUrl;
    try {
      const res = await fetch(publicUrl);
      add("Photo links open in the browser", res.ok, res.ok ? "" : "The photo uploaded but its link doesn't open. Make the 'photos' bucket public.");
    } catch {
      add("Photo links open in the browser", false, "Could not open the photo link.");
    }
    await admin.storage.from("photos").remove([path]); // clean up
  }

  return results;
}