"use client";
// ============================================================
// WHAT THIS FILE DOES
// The 3 photos that swipe by themselves (used on both pages).
// Change the speed with the `interval` number (4500 = 4.5 seconds).
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

// True once the image at `src` has loaded (so we can fall back to a monogram).
export function useImageOk(src) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!src) { setOk(false); return; }
    const img = new Image();
    img.onload = () => setOk(true);
    img.onerror = () => setOk(false);
    img.src = src;
  }, [src]);
  return ok;
}

// Self-swiping photo carousel. Fills its parent (parent needs position: relative).
export default function AutoSwipePhotos({ photos, interval = 4500 }) {
  const n = photos.length;
  const [idx, setIdx] = useState(0);        // 0..n  (n is a copy of slide 1 for a seamless loop)
  const [animate, setAnimate] = useState(true);
  const startX = useRef(null);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const next = useCallback(() => { setAnimate(true); setIdx(i => i + 1); }, []);
  const prev = useCallback(() => {
    if (idx === 0) {                         // jump to the copy silently, then step back
      setAnimate(false); setIdx(n);
      requestAnimationFrame(() => requestAnimationFrame(() => { setAnimate(true); setIdx(n - 1); }));
    } else { setAnimate(true); setIdx(i => i - 1); }
  }, [idx, n]);

  // autoplay: the timer restarts every time the slide changes
  useEffect(() => {
    if (n < 2 || reduce) return;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [idx, n, interval, reduce, next]);

  // after sliding onto the copy, reset to the real first slide without animation
  const onEnd = () => { if (idx === n) { setAnimate(false); setIdx(0); } };

  const onDown = e => { startX.current = e.clientX; };
  const onUp = e => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current; startX.current = null;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
  };

  if (n === 0) return null;
  const cur = idx % n;
  const slides = [...photos, photos[0]];

  return (
    <div className="carousel" style={{ "--dur": `${interval}ms` }} onPointerDown={onDown} onPointerUp={onUp}>
      <div
        className="slides"
        onTransitionEnd={onEnd}
        style={{ transform: `translateX(-${idx * 100}%)`, transition: animate ? undefined : "none" }}
      >
        {slides.map((src, i) => (
          <div className="slide" key={i} style={{ backgroundImage: `url("${src}")` }} />
        ))}
      </div>

      {n > 1 && (
        <div className="bars">
          {photos.map((_, k) => (
            <span key={k} className={k < cur || (reduce && k === cur) ? "done" : k === cur ? "active" : ""}>
              <i key={k === cur ? `a${idx}` : "x"} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}