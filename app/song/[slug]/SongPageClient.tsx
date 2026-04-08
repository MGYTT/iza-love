"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Music2, Heart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import LyricsPanel from "@/components/LyricsPanel";
import type { Song } from "@/lib/types";

/* ── Audio Player ── */
function AudioPlayer({ song }: { song: Song }) {
  const [playing,     setPlaying]     = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const src = song.previewUrl ?? song.audioUrl ?? null;

  useEffect(() => {
    return () => {
      const el = document.getElementById("iza-audio") as HTMLAudioElement | null;
      el?.pause();
    };
  }, []);

  if (!src) {
    return (
      <div style={{ background: "rgba(22,8,14,0.7)", border: "1px solid rgba(240,160,184,0.08)", borderRadius: "1rem", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Music2 size={16} style={{ color: "rgba(240,160,184,0.25)", flexShrink: 0 }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", color: "rgba(240,160,184,0.25)", fontStyle: "italic" }}>
          Brak podglądu audio dla tej piosenki
        </span>
        {song.itunesUrl && (
          <a href={song.itunesUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(240,160,184,0.4)", textDecoration: "none" }}>
            <ExternalLink size={11} /> Apple Music
          </a>
        )}
      </div>
    );
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{ background: "rgba(22,8,14,0.75)", border: "1px solid rgba(240,160,184,0.1)", borderRadius: "1rem", padding: "1.25rem 1.5rem" }}>
      <audio
        id="iza-audio" src={src}
        onTimeUpdate={e => { const el = e.currentTarget; setCurrentTime(el.currentTime); setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0); }}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        style={{ display: "none" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.85rem" }}>
        <button
          onClick={() => { const el = document.getElementById("iza-audio") as HTMLAudioElement | null; if (!el) return; playing ? el.pause() : el.play(); }}
          style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer", flexShrink: 0, background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.85))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(212,168,83,0.3)", color: "#100508" }}
        >
          {playing
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#f7cdd8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(240,160,184,0.4)" }}>{song.artist}{song.previewUrl ? " · Preview 30s" : ""}</p>
        </div>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(240,160,184,0.3)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>
      <div onClick={e => { const el = document.getElementById("iza-audio") as HTMLAudioElement | null; if (!el) return; const rect = e.currentTarget.getBoundingClientRect(); el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration; }} style={{ height: "3px", borderRadius: "999px", background: "rgba(240,160,184,0.1)", cursor: "pointer", overflow: "hidden" }}>
        <motion.div style={{ height: "100%", borderRadius: "999px", background: "linear-gradient(to right, #d4a853, rgba(240,160,184,0.8))", pointerEvents: "none" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1, ease: "linear" }} />
      </div>
    </div>
  );
}

/* ── Main Client Component ── */
export default function SongPageClient({ song }: { song: Song }) {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const el = document.getElementById("iza-audio") as HTMLAudioElement | null;
    if (!el) return;
    const handler = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, []);

  return (
    <main style={{ minHeight: "100dvh", paddingBottom: "6rem" }}>
      {/* Background blur */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}>
        {song.coverUrl && (
          <Image src={song.coverUrl} alt="" fill className="object-cover" style={{ opacity: 0.04, filter: "blur(60px) saturate(1.5)", transform: "scale(1.1)" }} sizes="100vw" unoptimized />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,3,6,0.7) 0%, transparent 40%, rgba(10,3,6,0.8) 100%)" }} />
      </div>

      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Back */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(240,160,184,0.35)" }}>
            <ArrowLeft size={13} /> Oś czasu
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {song.coverUrl && (
            <div style={{ position: "relative", width: "140px", height: "140px", borderRadius: "1rem", overflow: "hidden", flexShrink: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="140px" unoptimized />
            </div>
          )}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(212,168,83,0.6)", marginBottom: "0.5rem" }}>{song.memoryDate}</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 300, lineHeight: 1, color: "#f7cdd8", marginBottom: "0.4rem", letterSpacing: "-0.01em" }}>{song.title}</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "rgba(240,160,184,0.5)", marginBottom: "1rem" }}>{song.artist}{song.album ? ` · ${song.album}` : ""}</p>
            {song.shortDescription && (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300, color: "rgba(247,205,216,0.55)", lineHeight: 1.55, maxWidth: "420px" }}>
                &ldquo;{song.shortDescription}&rdquo;
              </p>
            )}
          </div>
        </motion.div>

        {/* Player */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: "1.5rem" }}>
          <AudioPlayer song={song} />
        </motion.div>

        {/* Lyrics */}
        {song.lyrics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: "2rem" }}>
            <LyricsPanel
              lyrics={song.lyrics}
              currentTime={currentTime}
              onSeek={t => { const el = document.getElementById("iza-audio") as HTMLAudioElement | null; if (el) { el.currentTime = t; el.play(); } }}
            />
          </motion.div>
        )}

        {/* Why our song */}
        {song.whyOurSong && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ background: "rgba(22,8,14,0.7)", border: "1px solid rgba(212,168,83,0.12)", borderRadius: "1rem", padding: "1.75rem 2rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", top: 0, right: 0, width: "200px", height: "200px", pointerEvents: "none", background: "radial-gradient(circle, rgba(212,168,83,0.05), transparent 70%)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
              <Heart size={13} fill="rgba(240,100,140,0.5)" color="rgba(240,100,140,0.5)" />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(212,168,83,0.5)" }}>Dlaczego ta piosenka jest nasza</span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontStyle: "italic", fontWeight: 300, color: "rgba(247,205,216,0.75)", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {song.whyOurSong}
            </p>
          </motion.div>
        )}

        {/* Apple Music */}
        {song.itunesUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: "center", paddingTop: "0.5rem" }}>
            <a href={song.itunesUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "rgba(240,160,184,0.25)", textDecoration: "none" }}>
              <ExternalLink size={11} /> Otwórz w Apple Music
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}