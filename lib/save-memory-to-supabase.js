// ============================================================
// WHAT THIS FILE DOES
// Runs when someone presses "Submit memory": shrinks the photos, uploads
// them, then saves the memory in Supabase.
// ============================================================

import { getSupabase } from "./supabase-browser-client";

// Phone photos are huge. Shrink to max 1600px JPEG before uploading (faster on mobile data).
async function shrink(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob || file;
  } catch {
    return file; // if anything fails, upload the original
  }
}

export async function submitMemory({ name, rel, picks, text, photos }) {
  const supabase = getSupabase();

  // Test mode: Supabase keys not set yet, so just simulate.
  if (!supabase) {
    console.log("Test submission (Supabase not configured):", { name, rel, picks, text, photos });
    await new Promise(r => setTimeout(r, 700));
    return;
  }

  // 1. upload photos, collect their public links
  const urls = [];
  if (picks.includes("photos")) {
    for (const file of photos) {
      const blob = await shrink(file);
      const path = `${crypto.randomUUID()}.jpg`;
      const { error } = await supabase.storage
        .from("photos")
        .upload(path, blob, { contentType: blob.type || "image/jpeg" });
      if (error) throw error;
      urls.push(supabase.storage.from("photos").getPublicUrl(path).data.publicUrl);
    }
  }

  // 2. save the memory row
  const pick = k => (picks.includes(k) && text[k].trim()) || null;
  const { error } = await supabase.from("memories").insert({
    name,
    relationship: rel || null,
    message: pick("message"),
    memory: pick("memory"),
    story: pick("story"),
    photos: urls,
  });
  if (error) throw error;
}