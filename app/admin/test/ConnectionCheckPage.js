// ============================================================
// WHAT THIS FILE DOES
// CONNECTION CHECK PAGE: press-and-see whether Supabase is set up
// right. Shows a tick or a cross for each step, with a fix.
// Open it at:  yoursite.com/admin/test?key=YOUR_ADMIN_KEY
// ============================================================

import Link from "next/link";
import { runSupabaseChecks } from "../../../lib/run-supabase-checks";


export default async function ConnectionCheckPage({ searchParams }) {
  const { key } = await searchParams;

  if (!process.env.ADMIN_KEY) {
    return <p className="empty" style={{ paddingTop: 120 }}>Add ADMIN_KEY to your .env.local file, then restart the app.</p>;
  }
  if (key !== process.env.ADMIN_KEY) {
    return <p className="empty" style={{ paddingTop: 120 }}>This page is private.</p>;
  }

  const results = await runSupabaseChecks();
  const allGood = results.every(r => r.ok);

  return (
    <main className="admin">
      <h1>Connection check</h1>
      <p className="sub">
        {allGood
          ? "Everything works. You're ready to share the link."
          : "Something needs fixing. Read the grey note under each cross."}
      </p>

      <div className="admin-links">
        <Link href={`/admin?key=${encodeURIComponent(key)}`}>Back to memories</Link>
      </div>

      {results.map(r => (
        <div className={`check ${r.ok ? "ok" : "bad"}`} key={r.label}>
          <span className="mark">{r.ok ? "✓" : "✗"}</span>
          <div>
            <div>{r.label}</div>
            {r.hint && <div className="hint">{r.hint}</div>}
          </div>
        </div>
      ))}

      <p className="sub" style={{ marginTop: 24 }}>
        Refresh this page to run the check again. It leaves no test data behind.
      </p>
    </main>
  );
}