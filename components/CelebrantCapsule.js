"use client";
// ============================================================
// WHAT THIS FILE DOES
// The page the birthday person sees: swiping cover photos, then every
// memory, then the closing screen. Edit this to change how her page looks.
// ============================================================

import { useEffect, useState } from "react";
import { CONFIG } from "../lib/site-settings";
import AutoSwipePhotos, { useImageOk } from "./AutoSwipePhotos";

const PARTS = [
  ["message", "Birthday message"],
  ["memory", "Memory"],
  ["story", "Story"],
];

export default function CelebrantCapsule({ memories }) {
  const celeb = CONFIG.celebrantName;
  const ok = useImageOk(CONFIG.photos[0]);
  const list = memories;
  const [openSrc, setOpenSrc] = useState(null);

  useEffect(() => {
    const onKey = e => e.key === "Escape" && setOpenSrc(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const count = list
    ? list.length
      ? `${list.length} ${list.length === 1 ? "person" : "people"} shared something for you.`
      : "Your capsule is on its way."
    : "";

  return (
    <>
      {/* COVER */}
      <header className="cover">
        {ok ? <AutoSwipePhotos photos={CONFIG.photos} /> : <div className="initial-letter">{celeb.charAt(0)}</div>}
        <div className="cover-text">
          <h1>Happy birthday, {celeb}</h1>
          <p>{count}</p>
          <a className="cover-btn" href="#capsule">Open your capsule</a>
        </div>
      </header>

      {/* MEMORIES */}
      <main className="wrap" id="capsule">
        <div className="section-head">
          <h2>Made for you</h2>
          <p>Everything the people who love you wanted you to have today.</p>
        </div>

        {list && list.length === 0 && <p className="empty">No memories yet. Check back soon.</p>}

        {list && list.map((m, i) => (
          <article className="entry" key={i}>
            <div className="from">
              <b>{m.name}</b>
              {m.relationship && <span>{m.relationship}</span>}
            </div>

            {PARTS.map(([key, title]) => m[key] ? (
              <div className="part" key={key}>
                <div className="part-title">{title}</div>
                <div className="text">{m[key]}</div>
              </div>
            ) : null)}

            {m.photos?.length > 0 && (
              <div className={`gallery ${m.photos.length === 1 ? "one" : "many"}`}>
                {m.photos.map(src => (
                  <button type="button" key={src} aria-label="Open photo" onClick={() => setOpenSrc(src)}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </main>

      {/* CLOSING */}
      <section className="closing">
        <div className="wrap">
          <h2>That's everyone, for now.</h2>
          <p>Happy birthday, {celeb}. You are deeply loved.</p>
        </div>
      </section>

      {/* LIGHTBOX */}
      {openSrc && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpenSrc(null)}>
          <button aria-label="Close photo">&times;</button>
          <img src={openSrc} alt="" />
        </div>
      )}
    </>
  );
}