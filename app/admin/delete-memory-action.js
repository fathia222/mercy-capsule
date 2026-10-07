"use server";
// ============================================================
// WHAT THIS FILE DOES
// Deletes one memory (and its photos) when you press "Delete"
// on the admin page. It runs on the server, never in the browser.
// ============================================================

import { revalidatePath } from "next/cache";
import { getAdmin } from "../../lib/supabase-server-admin";

export async function deleteMemory(formData) {
  // Safety: only works if the secret ADMIN_KEY matches
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || formData.get("key") !== adminKey) return;

  const id = formData.get("id");
  const admin = getAdmin();
  if (!admin || !id) return;

  // 1. find the photo files that belong to this memory
  const { data } = await admin.from("memories").select("photos").eq("id", id).single();
  const files = (data?.photos || []).map(url =>
    decodeURIComponent(url.split("/photos/").pop().split("?")[0])
  );

  // 2. delete the photo files, then the memory itself
  if (files.length) await admin.storage.from("photos").remove(files);
  await admin.from("memories").delete().eq("id", id);

  // 3. refresh the admin list
  revalidatePath("/admin");
}