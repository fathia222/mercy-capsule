// ============================================================
// WHAT THIS FILE DOES
// THE CELEBRANT PAGE (yoursite.com/capsule?key=...): loads the memories
// from Supabase and passes them to components/CelebrantCapsule.jsx.
// ============================================================

import CelebrantCapsule from "../../components/CelebrantCapsule";
import { SAMPLE_MEMORIES } from "../../lib/site-settings";
import { getAdmin } from "../../lib/supabase-server-admin";


// Her link:  yoursite.com/capsule?key=YOUR_CAPSULE_KEY
export default async function CelebrantCapsulePage({ searchParams }) {
  const { key } = await searchParams;
  const admin = getAdmin();

  // Supabase not set up yet: show sample memories so you can still design
  if (!admin) return <CelebrantCapsule memories={SAMPLE_MEMORIES} />;

  // Only people with the secret link can open the capsule
  if (!process.env.CAPSULE_KEY || key !== process.env.CAPSULE_KEY) {
    return <p className="empty" style={{ paddingTop: 120 }}>This capsule is private.</p>;
  }

  const { data, error } = await admin
    .from("memories")
    .select("name, relationship, message, memory, story, photos")
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="empty" style={{ paddingTop: 120 }}>We could not load the memories. Refresh to try again.</p>;
  }

  return <CelebrantCapsule memories={data.map(m => ({ ...m, photos: m.photos || [] }))} />;
}