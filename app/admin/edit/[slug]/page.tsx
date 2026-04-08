"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Plus, X, Star,
  ChevronDown, ChevronUp, Loader2, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSongStore } from "@/lib/store";
import { toast } from "sonner";
import type { ItunesTrack, LyricLine, HighlightedWord, Song } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   ITUNES SEARCH
───────────────────────────────────────────────────── */
async function searchItunes(query: string): Promise<ItunesTrack[]> {
  try {
    const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=8`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────────────────
   LYRIC LINE EDITOR (identyczny jak w add/page.tsx)
───────────────────────────────────────────────────── */
function LyricLineEditor({
  line, index, onChange, onRemove,
}: {
  line: LyricLine;
  index: number;
  onChange: (u: LyricLine) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasHL = (line.highlighted?.length ?? 0) > 0;

  const addHL = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange({
      ...line,
      highlighted: [...(line.highlighted ?? []), { word: "", note: "", color: "gold" }],
    });
    setOpen(true);
  };

  const updateHL = (i: number, field: keyof HighlightedWord, val: string) => {
    const hl = [...(line.highlighted ?? [])];
    hl[i] = { ...hl[i], [field]: val };
    onChange({ ...line, highlighted: hl });
  };

  const removeHL = (i: number) => {
    const hl = (line.highlighted ?? []).filter((_, idx) => idx !== i);
    onChange({ ...line, highlighted: hl });
    if (hl.length === 0) setOpen(false);
  };

  return (
    <div style={{
      background: "rgba(22,8,14,0.7)",
      border: `1px solid ${hasHL ? "rgba(212,168,83,0.2)" : "rgba(240,160,184,0.09)"}`,
      borderRadius: "0.75rem",
      padding: "0.7rem 0.9rem",
      marginBottom: "0.45rem",
      transition: "border-color 0.2s",
    }}>
      {/* Main row */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="number" min={0} step={0.5}
          value={line.time}
          onChange={(e) => onChange({ ...line, time: parseFloat(e.target.value) || 0 })}
          title="Czas w sekundach" aria-label="Czas (sekundy)"
          style={{ ...inputSm, width: "58px", textAlign: "center", color: "rgba(212,168,83,0.85)" }}
        />
        <span style={{ color: "rgba(240,160,184,0.2)", fontSize: "0.7rem" }}>s</span>
        <input
          type="text" value={line.text}
          onChange={(e) => onChange({ ...line, text: e.target.value })}
          placeholder={`Wers ${index + 1}...`}
          style={{ ...inputSm, flex: 1 }}
        />
        <button onClick={addHL} type="button" title="Oznacz ważne słowo"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: hasHL ? "#d4a853" : "rgba(240,160,184,0.2)",
            transition: "color 0.2s, transform 0.2s", padding: "0.2rem", flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#d4a853"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = hasHL ? "#d4a853" : "rgba(240,160,184,0.2)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          <Star size={13} fill={hasHL ? "#d4a853" : "none"} />
        </button>
        {hasHL && (
          <button onClick={() => setOpen(o => !o)} type="button"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,160,184,0.3)", padding: "0.2rem", flexShrink: 0, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.7)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.3)"}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
        <button onClick={onRemove} type="button" title="Usuń wers"
          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,100,100,0.25)", padding: "0.2rem", flexShrink: 0, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.6)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.25)"}
        >
          <X size={13} />
        </button>
      </div>

      {/* Highlights */}
      <AnimatePresence>
        {open && hasHL && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: "0.65rem", paddingTop: "0.65rem",
              borderTop: "1px solid rgba(212,168,83,0.1)",
              display: "flex", flexDirection: "column", gap: "0.4rem",
            }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,168,83,0.45)" }}>
                ✦ Ważne słowa
              </p>
              {(line.highlighted ?? []).map((hl, hi) => (
                <div key={hi} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <Star size={10} style={{ color: "#d4a853", flexShrink: 0 }} />
                  <input value={hl.word} onChange={(e) => updateHL(hi, "word", e.target.value)} placeholder="Słowo..." style={{ ...inputXs, width: "120px" }} />
                  <input value={hl.note} onChange={(e) => updateHL(hi, "note", e.target.value)} placeholder="Notatka dla Izy..." style={{ ...inputXs, flex: 1 }} />
                  <select value={hl.color} onChange={(e) => updateHL(hi, "color", e.target.value as HighlightedWord["color"])} style={{ ...inputXs, width: "82px", cursor: "pointer" }}>
                    <option value="gold">🟡 złoty</option>
                    <option value="pink">🩷 różowy</option>
                    <option value="rose">🌹 rose</option>
                  </select>
                  <button onClick={() => removeHL(hi)} type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(240,100,100,0.25)", padding: "0.2rem", flexShrink: 0, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.6)"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.25)"}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.1rem" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "#d4a853",
      }}>
        {number}
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 400, color: "rgba(247,205,216,0.85)" }}>
        {label}
      </h2>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: "rgba(240,160,184,0.3)", marginBottom: "0.4rem",
    }}>
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
export default function EditSongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug }               = use(params);
  const router                 = useRouter();
  const { updateSong, getSong } = useSongStore();

  const [authed, setAuthed]   = useState(false);
  const [ready,  setReady]    = useState(false);
  const [saving, setSaving]   = useState(false);

  /* Form state */
  const [memoryDate,        setMemoryDate]        = useState("");
  const [shortDescription,  setShortDescription]  = useState("");
  const [whyOurSong,        setWhyOurSong]        = useState("");
  const [lyrics,            setLyrics]            = useState<LyricLine[]>([]);

  /* iTunes change-track state */
  const [changingTrack, setChangingTrack] = useState(false);
  const [query,         setQuery]         = useState("");
  const [results,       setResults]       = useState<ItunesTrack[]>([]);
  const [searching,     setSearching]     = useState(false);
  const [newTrack,      setNewTrack]      = useState<ItunesTrack | null>(null);

  /* Current song preview */
  const [currentSong,   setCurrentSong]   = useState<Song | null>(null);

  /* ── Auth + hydration ── */
  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
      return;
    }
    setAuthed(true);

    const load = () => {
      const song = useSongStore.getState().getSong(slug);
      if (!song) {
        toast.error("Nie znaleziono piosenki");
        router.replace("/admin/dashboard");
        return;
      }
      /* Prefill form */
      setCurrentSong(song);
      setMemoryDate(song.memoryDate);
      setShortDescription(song.shortDescription);
      setWhyOurSong(song.whyOurSong);
      setLyrics(song.lyrics.length > 0 ? song.lyrics : [{ time: 0, text: "" }]);
      setReady(true);
    };

    if (useSongStore.getState()._hasHydrated) {
      load();
    } else {
      const unsub = useSongStore.persist.onFinishHydration(load);
      useSongStore.persist.rehydrate();
      return () => unsub();
    }
  }, [slug, router]);

  /* ── iTunes search ── */
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    const res = await searchItunes(query);
    setResults(res);
    setSearching(false);
    if (res.length === 0) toast.error("Nie znaleziono piosenek");
  };

  const selectNewTrack = (track: ItunesTrack) => {
    setNewTrack(track);
    setResults([]);
    setQuery("");
    setChangingTrack(false);
  };

  /* ── Line handlers ── */
  const addLine   = () => {
    const last = lyrics[lyrics.length - 1]?.time ?? 0;
    setLyrics(l => [...l, { time: Math.round(last + 4), text: "" }]);
  };
  const updateLine = (i: number, u: LyricLine) =>
    setLyrics(l => l.map((line, idx) => (idx === i ? u : line)));
  const removeLine = (i: number) =>
    setLyrics(l => l.filter((_, idx) => idx !== i));

  /* ── Save ── */
  const handleSave = () => {
    if (!memoryDate.trim()) { toast.error("Podaj datę wspomnienia!"); return; }
    if (!shortDescription.trim()) { toast.error("Dodaj krótki opis!"); return; }

    setSaving(true);

    const cleanLyrics = lyrics.filter(l => l.text.trim());

    /* Jeśli zmieniono utwór — aktualizuj też dane z iTunes */
    const trackFields = newTrack
      ? {
          title:      newTrack.trackName,
          artist:     newTrack.artistName,
          album:      newTrack.collectionName ?? "",
          coverUrl:   newTrack.artworkUrl100 ?? "",
          itunesId:   newTrack.trackId,
          previewUrl: newTrack.previewUrl ?? null,
          itunesUrl:  newTrack.trackViewUrl,
        }
      : {};

    updateSong(slug, {
      ...trackFields,
      memoryDate:       memoryDate.trim(),
      shortDescription: shortDescription.trim(),
      whyOurSong:       whyOurSong.trim(),
      lyrics:           cleanLyrics,
    });

    toast.success("Zapisano zmiany ♥");
    setTimeout(() => router.push("/admin/dashboard"), 700);
  };

  /* ── Loading ── */
  if (!authed || !ready) {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "rgba(247,205,216,0.3)" }}
        >
          ♥
        </motion.div>
      </main>
    );
  }

  const displaySong = newTrack
    ? {
        title:     newTrack.trackName,
        artist:    newTrack.artistName,
        album:     newTrack.collectionName ?? "",
        coverUrl:  newTrack.artworkUrl100,
        previewUrl: newTrack.previewUrl,
      }
    : currentSong;

  /* ─────────────── RENDER ─────────────── */
  return (
    <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1.5rem 7rem", position: "relative" }}>

      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1,
        background: "radial-gradient(ellipse 50% 40% at 50% 20%, rgba(212,168,83,0.05), transparent)",
      }} />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: "2.25rem" }}>
        <Link
          href="/admin/dashboard"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.78rem", color: "rgba(240,160,184,0.35)",
            marginBottom: "1.1rem", transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.75)"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.35)"}
        >
          <ArrowLeft size={13} /> Powrót do panelu
        </Link>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 300, color: "#f7cdd8", lineHeight: 1.1 }}>
          Edytuj rozdział
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(240,160,184,0.3)", marginTop: "0.35rem" }}>
          {currentSong?.title} · {currentSong?.artist}
        </p>
      </motion.div>

      {/* ══════════════════════
          STEP 1 — Track
      ══════════════════════ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} style={{ marginBottom: "2rem" }}>
        <SectionLabel number="1" label="Piosenka" />

        {/* Current / new track card */}
        {displaySong && (
          <div style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "rgba(22,8,14,0.75)",
            border: `1px solid ${newTrack ? "rgba(212,168,83,0.25)" : "rgba(240,160,184,0.1)"}`,
            borderRadius: "1rem", padding: "1rem 1.1rem", marginBottom: "0.75rem",
          }}>
            {displaySong.coverUrl && (
              <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "0.55rem", overflow: "hidden", flexShrink: 0 }}>
                <Image src={displaySong.coverUrl} alt={displaySong.title} fill className="object-cover" sizes="56px" unoptimized />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "#f7cdd8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displaySong.title}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(240,160,184,0.4)" }}>
                {displaySong.artist}{displaySong.album ? ` · ${displaySong.album}` : ""}
              </p>
              {newTrack && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "rgba(212,168,83,0.6)", marginTop: "3px" }}>
                  ✦ Zmieniono utwór
                </p>
              )}
            </div>
            <button
              onClick={() => setChangingTrack(c => !c)}
              type="button"
              style={{
                padding: "0.4rem 0.8rem", borderRadius: "0.5rem",
                border: "1px solid rgba(240,160,184,0.12)",
                background: "transparent", cursor: "pointer", flexShrink: 0,
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.73rem",
                color: "rgba(240,160,184,0.45)", transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.3)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)"}
            >
              {changingTrack ? "Anuluj" : "Zmień utwór"}
            </button>
          </div>
        )}

        {/* iTunes search panel */}
        <AnimatePresence>
          {changingTrack && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ paddingTop: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.75rem" }}>
                  <input
                    type="text" value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Szukaj nowego utworu..."
                    autoComplete="off"
                    style={inputBase}
                  />
                  <button
                    onClick={handleSearch} disabled={searching || !query.trim()} type="button"
                    style={{
                      padding: "0.75rem 1.1rem", borderRadius: "0.75rem", border: "none",
                      background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.85))",
                      color: "#100508", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem",
                      fontWeight: 500, cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      opacity: searching || !query.trim() ? 0.6 : 1, transition: "opacity 0.2s",
                    }}
                  >
                    {searching
                      ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      : <Search size={13} />
                    }
                  </button>
                </div>

                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        background: "rgba(16,5,8,0.95)", border: "1px solid rgba(240,160,184,0.1)",
                        borderRadius: "0.85rem", overflow: "hidden",
                      }}
                    >
                      {results.map((track, i) => (
                        <button
                          key={track.trackId} onClick={() => selectNewTrack(track)} type="button"
                          style={{
                            display: "flex", alignItems: "center", gap: "0.85rem",
                            padding: "0.7rem 1rem", width: "100%", background: "transparent",
                            border: "none",
                            borderBottom: i < results.length - 1 ? "1px solid rgba(240,160,184,0.06)" : "none",
                            cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,160,184,0.05)"}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                        >
                          <div style={{ position: "relative", width: "40px", height: "40px", borderRadius: "0.35rem", overflow: "hidden", flexShrink: 0, background: "rgba(212,168,83,0.08)" }}>
                            {track.artworkUrl100 && (
                              <Image src={track.artworkUrl100} alt={track.trackName} fill className="object-cover" sizes="40px" unoptimized />
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#f7cdd8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {track.trackName}
                            </p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(240,160,184,0.4)" }}>
                              {track.artistName}
                            </p>
                          </div>
                          {track.previewUrl && (
                            <span style={{ fontSize: "0.62rem", color: "rgba(100,220,130,0.5)", background: "rgba(100,220,130,0.07)", border: "1px solid rgba(100,220,130,0.12)", borderRadius: "999px", padding: "1px 6px", flexShrink: 0 }}>
                              ▶ 30s
                            </span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* ══════════════════════
          STEP 2 — Memory
      ══════════════════════ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} style={{ marginBottom: "2rem" }}>
        <SectionLabel number="2" label="Wspomnienie" />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <FieldLabel>Data wspomnienia</FieldLabel>
            <input type="text" value={memoryDate} onChange={e => setMemoryDate(e.target.value)} placeholder="np. 14 lutego 2024" style={inputBase} />
          </div>
          <div>
            <FieldLabel>Krótki opis na osi czasu</FieldLabel>
            <input type="text" value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="np. Pierwszy wieczór kiedy pomyślałem, że to właśnie Ty..." style={inputBase} />
          </div>
          <div>
            <FieldLabel>Twój osobisty list do Izy</FieldLabel>
            <textarea
              value={whyOurSong} onChange={e => setWhyOurSong(e.target.value)}
              placeholder="Napisz dlaczego ta piosenka jest wasza..."
              rows={6}
              style={{ ...inputBase, resize: "vertical", lineHeight: 1.75, minHeight: "130px" }}
            />
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════
          STEP 3 — Lyrics
      ══════════════════════ */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} style={{ marginBottom: "2.5rem" }}>
        <SectionLabel number="3" label="Tekst piosenki z oznaczeniami" />

        <div style={{
          background: "rgba(212,168,83,0.04)", border: "1px solid rgba(212,168,83,0.1)",
          borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1rem",
          display: "flex", alignItems: "flex-start", gap: "0.5rem",
        }}>
          <Star size={12} style={{ color: "#d4a853", marginTop: "1px", flexShrink: 0 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(212,168,83,0.65)", lineHeight: 1.6 }}>
            Kliknij ⭐ przy wersie aby oznaczyć ważne słowo — Iza zobaczy je podświetlone z Twoją notatką.
          </p>
        </div>

        {lyrics.map((line, i) => (
          <LyricLineEditor
            key={i} line={line} index={i}
            onChange={(u) => updateLine(i, u)}
            onRemove={() => removeLine(i)}
          />
        ))}

        <button onClick={addLine} type="button" style={{
          marginTop: "0.4rem", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "0.5rem", width: "100%",
          background: "transparent", border: "1px dashed rgba(240,160,184,0.13)",
          borderRadius: "0.75rem", padding: "0.65rem",
          color: "rgba(240,160,184,0.35)", fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem", cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.65)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.13)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.35)"; }}
        >
          <Plus size={13} /> Dodaj wers
        </button>

        {lyrics.filter(l => l.text.trim()).length > 0 && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", color: "rgba(240,160,184,0.2)", textAlign: "right", marginTop: "0.5rem" }}>
            {lyrics.filter(l => l.text.trim()).length} wersów · {lyrics.reduce((acc, l) => acc + (l.highlighted?.length ?? 0), 0)} oznaczeń
          </p>
        )}
      </motion.section>

      {/* ── Save buttons ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{
          display: "flex", justifyContent: "flex-end", gap: "0.75rem",
          paddingTop: "1rem", borderTop: "1px solid rgba(240,160,184,0.06)",
        }}
      >
        <Link href="/admin/dashboard" style={{ textDecoration: "none" }}>
          <button type="button" style={{
            padding: "0.85rem 1.5rem", borderRadius: "0.75rem",
            border: "1px solid rgba(240,160,184,0.1)", background: "transparent",
            color: "rgba(240,160,184,0.45)", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem", cursor: "pointer",
          }}>
            Anuluj
          </button>
        </Link>
        <motion.button
          whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving} type="button"
          style={{
            padding: "0.85rem 2rem", borderRadius: "0.75rem", border: "none",
            background: "linear-gradient(135deg, #d4a853 0%, rgba(240,160,184,0.85) 100%)",
            color: "#100508", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem", fontWeight: 500, cursor: saving ? "wait" : "pointer",
            display: "flex", alignItems: "center", gap: "0.5rem",
            boxShadow: "0 4px 20px rgba(212,168,83,0.25)",
            opacity: saving ? 0.7 : 1, transition: "opacity 0.2s",
          }}
        >
          {saving
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Zapisuję...</>
            : <>♥ Zapisz zmiany</>
          }
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
        input::placeholder, textarea::placeholder { color: rgba(240,160,184,0.2); }
        select option { background: #1e0b12; color: #f7cdd8; }
      `}</style>
    </main>
  );
}

/* ── Style tokens ── */
const inputBase: React.CSSProperties = {
  width: "100%", padding: "0.8rem 1rem", borderRadius: "0.75rem",
  border: "1px solid rgba(240,160,184,0.11)", background: "rgba(16,5,8,0.7)",
  color: "#f7cdd8", fontFamily: "'DM Sans', sans-serif", fontSize: "0.9rem",
  outline: "none", transition: "border-color 0.2s",
};
const inputSm: React.CSSProperties = {
  ...inputBase, padding: "0.42rem 0.6rem", fontSize: "0.8rem", borderRadius: "0.5rem",
};
const inputXs: React.CSSProperties = {
  ...inputBase, padding: "0.32rem 0.5rem", fontSize: "0.75rem", borderRadius: "0.45rem",
};