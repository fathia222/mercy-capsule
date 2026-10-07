"use client";
// ============================================================
// WHAT THIS FILE DOES
// The whole form friends and family fill in: landing, name, choose,
// write, preview, thank you. Edit this file to change the form.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { CONFIG, PROMPTS } from "../lib/site-settings";
import AutoSwipePhotos, { useImageOk } from "./AutoSwipePhotos";
import { submitMemory } from "../lib/save-memory-to-supabase";

const FLOW = ["landing", "who", "choose", "write", "preview", "thanks"];
const RELATIONSHIPS = ["Friend", "Family", "Partner", "Classmate", "Colleague", "Other"];
const OPTIONS = [
  { key: "message", title: "A birthday message", hint: "A few words for their day" },
  { key: "memory",  title: "A memory",           hint: "Something you two shared" },
  { key: "photos",  title: "Photos",             hint: "Add pictures to the capsule" },
  { key: "story",   title: "A story",            hint: "A longer tale worth telling" },
];
const TITLES = { message: "Birthday message", memory: "Memory", story: "Story" };

/* ---------- small pieces ---------- */
function Avatar({ big }) {
  const photo = CONFIG.photos[0];
  const ok = useImageOk(photo);
  return (
    <div className={`avatar${big ? " big" : ""}`} style={ok ? { backgroundImage: `url("${photo}")` } : undefined}>
      {!ok && CONFIG.celebrantName.charAt(0)}
    </div>
  );
}

function Thumbs({ files, onRemove }) {
  const [urls, setUrls] = useState([]);
  useEffect(() => {
    const u = files.map(f => URL.createObjectURL(f));
    setUrls(u);
    return () => u.forEach(x => URL.revokeObjectURL(x));
  }, [files]);

  return (
    <div className="thumbs">
      {files.map((f, i) => urls[i] && (
        <div className="thumb" key={i}>
          <img src={urls[i]} alt="" />
          {onRemove && <button type="button" aria-label="Remove photo" onClick={() => onRemove(i)}>×</button>}
        </div>
      ))}
    </div>
  );
}

function Chips({ onPick }) {
  return (
    <>
      <p className="chips-label">Can't think of anything? Try one of these.</p>
      <div className="chips">
        {PROMPTS.map(p => <button type="button" className="chip" key={p} onClick={() => onPick(p)}>{p}</button>)}
      </div>
    </>
  );
}

/* ---------- the page ---------- */
export default function ContributorForm() {
  const celeb = CONFIG.celebrantName;
  const fileRef = useRef(null);

  const [step, setStep] = useState("landing");
  const [name, setName] = useState("");
  const [rel, setRel] = useState("");
  const [picks, setPicks] = useState([]);
  const [text, setText] = useState({ message: "", memory: "", story: "" });
  const [questions, setQuestions] = useState({});
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);

  const heroOk = useImageOk(CONFIG.photos[0]);
  const dark = step === "landing" || step === "thanks";
  const showBar = ["who", "choose", "write", "preview"].includes(step);
  const has = k => picks.includes(k);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    return () => document.body.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector("[data-focus]")?.focus({ preventScroll: true });
  }, [step]);

  const go = s => { setError(""); setStep(s); };

  const togglePick = key =>
    setPicks(p => (p.includes(key) ? p.filter(k => k !== key) : [...p, key]));

  const setField = (k, v) => setText(t => ({ ...t, [k]: v }));

  const addPhotos = e => {
    const room = CONFIG.maxPhotos - photos.length;
    setPhotos(p => [...p, ...Array.from(e.target.files).slice(0, room)]);
    e.target.value = "";
  };

  const continueWho = () => {
    if (!name.trim()) return setError("Add your name to continue.");
    go("choose");
  };
  const continueChoose = () => {
    if (!picks.length) return setError("Choose at least one to continue.");
    go("write");
  };
  const continueWrite = () => {
    const filled =
      ["message", "memory", "story"].some(k => has(k) && text[k].trim()) ||
      (has("photos") && photos.length);
    if (!filled) return setError("Add something to share before you continue.");
    go("preview");
  };

  const submit = async () => {
    setSending(true); setError("");
    try {
      await submitMemory({ name: name.trim(), rel, picks, text, photos });
      go("thanks");
    } catch {
      setError("That didn't send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const another = () => {
    setPicks([]); setPhotos([]); setQuestions({});
    setText({ message: "", memory: "", story: "" });
    go("choose");
  };

  const q = {
    memory: questions.memory ?? `Tell us about a memory with ${celeb}.`,
    story: questions.story ?? `Tell a story about ${celeb}.`,
  };

  return (
    <div className="app">
      {/* 1. LANDING */}
      {step === "landing" && (
        <section className="screen landing">
          <div className="hero">
            {heroOk ? <AutoSwipePhotos photos={CONFIG.photos} /> : <div className="initial-letter">{celeb.charAt(0)}</div>}
          </div>
          <div className="landing-body">
            <h1 tabIndex={-1} data-focus>Make my birthday unforgettable </h1>
            <p>You have celebrated {celeb} over the years,lets make this year's own special. Your response will become part of my birthday memories.</p>
            <button className="btn light" onClick={() => go("who")}>Share a memory</button>
          </div>
        </section>
      )}

      {/* progress bar stays mounted across the form steps so it animates */}
      {showBar && (
        <div className="topbar">
          <div className="topbar-row">
            <Avatar />
            <div className="topbar-text">A memory for <b>{celeb}</b></div>
          </div>
          <div className="progress"><i style={{ width: `${(FLOW.indexOf(step) / 4) * 100}%` }} /></div>
        </div>
      )}

      {/* 2. WHO */}
      {step === "who" && (
        <section className="screen">
          <div className="content">
            <h2 tabIndex={-1} data-focus>First, tell us who you are.</h2>
            <p className="lede">Just so {celeb} knows who it came from.</p>

            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" type="text" value={name} placeholder="Your name"
                autoComplete="name" autoCapitalize="words" onChange={e => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rel">Relationship to {celeb} <span className="optional">(optional)</span></label>
              <div className="select-wrap">
                <select id="rel" value={rel} onChange={e => setRel(e.target.value)}>
                  <option value="">Choose one</option>
                  {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="error" role="alert">{error}</p>}

            <div className="actions">
              <button className="btn" onClick={continueWho}>Continue</button>
              <button className="link" onClick={() => go("landing")}>Back</button>
            </div>
          </div>
        </section>
      )}

      {/* 3. CHOOSE */}
      {step === "choose" && (
        <section className="screen">
          <div className="content">
            <h2 tabIndex={-1} data-focus>What would you like to share?</h2>
            <p className="lede">Choose as many as you like.</p>

            <div className="tiles">
              {OPTIONS.map(o => (
                <button key={o.key} className="tile" aria-pressed={has(o.key)} onClick={() => togglePick(o.key)}>
                  <span>{o.title}<small>{o.hint}</small></span>
                  <span className="tick">
                    <svg viewBox="0 0 12 12" fill="none" strokeWidth="2"><path d="M2 6.5l2.5 2.5L10 3.5" /></svg>
                  </span>
                </button>
              ))}
            </div>
            {error && <p className="error" role="alert" style={{ marginTop: 16 }}>{error}</p>}

            <div className="actions">
              <button className="btn" onClick={continueChoose}>Continue</button>
              <button className="link" onClick={() => go("who")}>Back</button>
            </div>
          </div>
        </section>
      )}

      {/* 4. WRITE */}
      {step === "write" && (
        <section className="screen">
          <div className="content">
            <h2 tabIndex={-1} data-focus>Make it yours.</h2>
            <p className="lede">Write as much or as little as you want.</p>

            {has("message") && (
              <div className="field">
                <label htmlFor="message">Leave a birthday message</label>
                <textarea id="message" placeholder="Write your message here..."
                  value={text.message} onChange={e => setField("message", e.target.value)} />
              </div>
            )}

            {has("memory") && (
              <div className="field">
                <label htmlFor="memory">{q.memory}</label>
                <textarea id="memory" placeholder="Write your memory here..."
                  value={text.memory} onChange={e => setField("memory", e.target.value)} />
                <Chips onPick={p => { setQuestions(s => ({ ...s, memory: p })); document.getElementById("memory").focus(); }} />
              </div>
            )}

            {has("story") && (
              <div className="field">
                <label htmlFor="story">{q.story}</label>
                <textarea id="story" placeholder="Write your story here..."
                  value={text.story} onChange={e => setField("story", e.target.value)} />
                <Chips onPick={p => { setQuestions(s => ({ ...s, story: p })); document.getElementById("story").focus(); }} />
              </div>
            )}

            {has("photos") && (
              <div className="field">
                <span className="label">Add some photos</span>
                <button type="button" className="drop" onClick={() => fileRef.current.click()}>
                  + Add photos<span>Choose from your phone</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
                <Thumbs files={photos} onRemove={i => setPhotos(p => p.filter((_, k) => k !== i))} />
              </div>
            )}

            {error && <p className="error" role="alert">{error}</p>}

            <div className="actions">
              <button className="btn" onClick={continueWrite}>Preview</button>
              <button className="link" onClick={() => go("choose")}>Back</button>
            </div>
          </div>
        </section>
      )}

      {/* 5. PREVIEW */}
      {step === "preview" && (
        <section className="screen">
          <div className="content">
            <h2 tabIndex={-1} data-focus>Here's what you've shared</h2>
            <p className="lede">Take a last look before it goes into the capsule.</p>

            <div className="card">
              <div className="who">{name}</div>
              <div className="rel">{rel || "\u00A0"}</div>
              {["message", "memory", "story"].map(k =>
                has(k) && text[k].trim() ? (
                  <div className="part" key={k}>
                    <div className="part-title">{TITLES[k]}</div>
                    <div className="text">{text[k].trim()}</div>
                  </div>
                ) : null
              )}
              {has("photos") && photos.length > 0 && (
                <div className="part">
                  <div className="part-title">Photos</div>
                  <Thumbs files={photos} />
                </div>
              )}
            </div>
            {error && <p className="error" role="alert">{error}</p>}

            <div className="actions">
              <button className="btn" disabled={sending} onClick={submit}>{sending ? "Sending..." : "Submit memory"}</button>
              <button className="btn ghost" onClick={() => go("write")}>Edit</button>
            </div>
          </div>
        </section>
      )}

      {/* 6. THANK YOU */}
      {step === "thanks" && (
        <section className="screen">
          <div className="thanks">
            <Avatar big />
            <h2 tabIndex={-1} data-focus>{finished ? "See you at the celebration." : "Your memory has been added."}</h2>
            <p>{finished
              ? "Your words are safe in the capsule. You can close this page."
              : `Thanks for being part of ${celeb}'s birthday capsule.`}</p>
            {!finished && (
              <div className="actions">
                <button className="btn light" onClick={another}>Share another memory</button>
                <button className="btn ghost on-dark" onClick={() => setFinished(true)}>I'm done</button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}