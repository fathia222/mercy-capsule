// ============================================================
// WHAT THIS FILE DOES
// ADMIN PAGE (for you, not for her): see every memory and delete
// the ones you don't want her to see.
// Open it at:  yoursite.com/admin?key=YOUR_ADMIN_KEY
// ============================================================

import Link from "next/link";
import { getAdmin } from "../../lib/supabase-server-admin";
import { deleteMemory } from "./delete-memory-action";
import ConfirmDeleteButton from "../../components/ConfirmDeleteButton";


const short = t => (t.length > 220 ? t.slice(0, 220) + "..." : t);

export default async function ManageMemoriesPage({ searchParams }) {
  const { key } = await searchParams;

  if (!process.env.ADMIN_KEY) {
    return <p className="empty" style={{ paddingTop: 120 }}>Add ADMIN_KEY to your .env.local file, then restart the app.</p>;
  }
  if (key !== process.env.ADMIN_KEY) {
    return <p className="empty" style={{ paddingTop: 120 }}>This page is private.</p>;
  }

  const admin = getAdmin();
  if (!admin) {
    return <p className="empty" style={{ paddingTop: 120 }}>Supabase keys are missing. Fill in .env.local first.</p>;
  }

  const { data: list, error } = await admin
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="empty" style={{ paddingTop: 120 }}>Could not load memories. Open the connection check to see why.</p>;
  }

  return (
    <main className="admin">
      <h1>Manage memories</h1>
      <p className="sub">{list.length} saved. Newest first. Deleting is permanent.</p>

      <div className="admin-links">
        <Link href={`/admin/test?key=${encodeURIComponent(key)}`}>Run connection check</Link>
      </div>

      {list.length === 0 && <p className="sub">Nothing here yet.</p>}

      {list.map(m => (
        <div className="admin-row" key={m.id}>
          <div className="top">
            <b>{m.name}{m.relationship ? ` (${m.relationship})` : ""}</b>
            <span className="meta">{new Date(m.created_at).toLocaleString()}</span>
          </div>

          {m.message && <p><b>Message:</b> {short(m.message)}</p>}
          {m.memory && <p><b>Memory:</b> {short(m.memory)}</p>}
          {m.story && <p><b>Story:</b> {short(m.story)}</p>}

          {m.photos?.length > 0 && (
            <div className="thumbs">
              {m.photos.map(src => (
                <div className="thumb" key={src}><img src={src} alt="" loading="lazy" /></div>
              ))}
            </div>
          )}

          <form action={deleteMemory}>
            <input type="hidden" name="id" value={m.id} />
            <input type="hidden" name="key" value={key} />
            <ConfirmDeleteButton name={m.name} />
          </form>
        </div>
      ))}
    </main>
  );
}