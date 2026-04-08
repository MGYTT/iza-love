"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Music2, Heart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useSongStore } from "@/lib/store";
import LyricsPanel from "@/components/LyricsPanel";
import type { Song } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   AUDIO PLAYER
───────────────────────────────────────────────────── */
function AudioPlayer({ song }: { song: Song }) {
  const [playing,   setPlaying]   = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [duration,  setDuration]  = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useState<HTMLAudioElement | null>(null);

  const src = song.previewUrl ?? song.audioUrl ?? null;

  useEffect(() => {
    return () => {
      audioRef[0]?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!src) {
    return (
      <div style={{
        background: "rgba(22,8,14,0.7)",
        border: "1px solid rgba(240,160,184,0.08)",
        borderRadius: "1rem",
        padding: "1.25rem 1.5rem",
        display: "flex", alignItems: "center", gap: "0.75rem",
      }}>
        <Music2 size={16} style={{ color: "rgba(240,160,184,0.25)", flexShrink: 0 }} />
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.8rem", color: "rgba(240,160,184,0.25)",
          fontStyle: "italic",
        }}>
          Brak podglądu audio dla tej piosenki
        </span>
        {song.itunesUrl && (
          <a
            href={song.itunesUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "auto",
              display: "flex", alignItems: "center", gap: "4px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.72rem", color: "rgba(240,160,184,0.4)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            <ExternalLink size={11} /> Apple Music
          </a>
        )}
      </div>
    );
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const el = e.currentTarget;
    setCurrentTime(el.currentTime);
    setProgress(el.duration ? (el.currentTime / el.duration) * 100 : 0);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleSeekBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const el  = document.getElementById("iza-audio") as HTMLAudioElement | null;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    el.currentTime = pct * el.duration;
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div style={{
      background: "rgba(22,8,14,0.75)",
      border: "1px solid rgba(240,160,184,0.1)",
      borderRadius: "1rem",
      padding: "1.25rem 1.5rem",
    }}>
      <audio
        id="iza-audio"
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        style={{ display: "none" }}
      />

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.85rem" }}>
        {/* Play/Pause */}
        <button
          onClick={() => {
            const el = document.getElementById("iza-audio") as HTMLAudioElement | null;
            if (!el) return;
            playing ? el.pause() : el.play();
          }}
          style={{
            width: "44px", height: "44px", borderRadius: "50%",
            border: "none", cursor: "pointer", flexShrink: 0,
            background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.85))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(212,168,83,0.3)",
            transition: "transform 0.15s, box-shadow 0.15s",
            color: "#100508",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(212,168,83,0.45)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(212,168,83,0.3)";
          }}
        >
          {playing ? (
            /* Pause icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5"  y="3" width="4" height="18" rx="1"/>
              <rect x="15" y="3" width="4" height="18" rx="1"/>
            </svg>
          ) : (
            /* Play icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          )}
        </button>

        {/* Track info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1rem", color: "#f7cdd8",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {song.title}
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem", color: "rgba(240,160,184,0.4)",
          }}>
            {song.artist}
            {song.previewUrl ? " · Preview 30s" : ""}
          </p>
        </div>

        {/* Time */}
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.7rem", color: "rgba(240,160,184,0.3)",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}>
          {fmt(currentTime)} / {fmt(duration)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        onClick={handleSeekBar}
        style={{
          height: "3px", borderRadius: "999px",
          background: "rgba(240,160,184,0.1)",
          cursor: "pointer", overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%", borderRadius: "999px",
            background: "linear-gradient(to right, #d4a853, rgba(240,160,184,0.8))",
            pointerEvents: "none",
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
export default function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next.js 15 — params jest Promise
  const { slug } = use(params);

  const [song,  setSong]  = useState<Song | null | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);

  /* Hydratacja store → szukaj piosenki */
  useEffect(() => {
    const find = () => {
      const found = useSongStore.getState().getSong(slug);
      setSong(found ?? null);
      setReady(true);
    };

    if (useSongStore.getState()._hasHydrated) {
      find();
    } else {
      const unsub = useSongStore.persist.onFinishHydration(find);
      useSongStore.persist.rehydrate();
      return () => unsub();
    }
  }, [slug]);

  /* Sync currentTime z audio element */
  useEffect(() => {
    const el = document.getElementById("iza-audio") as HTMLAudioElement | null;
    if (!el) return;
    const handler = () => setCurrentTime(el.currentTime);
    el.addEventListener("timeupdate", handler);
    return () => el.removeEventListener("timeupdate", handler);
  }, [song]);

  /* ── Loading ── */
  if (!ready) {
    return (
      <main style={{
        minHeight: "100dvh",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <motion.div
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem", color: "rgba(247,205,216,0.4)",
          }}
        >
          ♥
        </motion.div>
      </main>
    );
  }

  /* ── Not found ── */
  if (!song) {
    return (
      <main style={{
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "1.5rem", padding: "2rem",
      }}>
        <Music2 size={36} style={{ color: "rgba(240,160,184,0.15)" }} />
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem", fontWeight: 300, color: "rgba(247,205,216,0.5)",
          }}>
            Nie znaleziono piosenki
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem", color: "rgba(240,160,184,0.25)",
            marginTop: "0.5rem",
          }}>
            slug: <code style={{ opacity: 0.5 }}>{slug}</code>
          </p>
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "0.75rem 1.5rem", borderRadius: "0.75rem",
            border: "1px solid rgba(240,160,184,0.15)",
            background: "transparent",
            color: "rgba(240,160,184,0.5)",
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem",
            cursor: "pointer",
          }}>
            ← Wróć do osi czasu
          </button>
        </Link>
      </main>
    );
  }

  /* ── Song page ── */
  return (
    <main style={{ minHeight: "100dvh", paddingBottom: "6rem" }}>

      {/* Background — cover blur */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none",
        overflow: "hidden",
      }}>
        {song.coverUrl && (
          <Image
            src={song.coverUrl}
            alt=""
            fill
            className="object-cover"
            style={{ opacity: 0.04, filter: "blur(60px) saturate(1.5)", transform: "scale(1.1)" }}
            sizes="100vw"
            unoptimized
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,3,6,0.7) 0%, transparent 40%, rgba(10,3,6,0.8) 100%)",
        }} />
      </div>

      {/* Content wrapper */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 1.5rem" }}>

        {/* ── Back nav ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.78rem", color: "rgba(240,160,184,0.35)",
              transition: "color 0.2s",
            }}
            onMouseEnter={e =>
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.7)"
            }
            onMouseLeave={e =>
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.35)"
            }
          >
            <ArrowLeft size={13} /> Oś czasu
          </Link>
        </motion.div>

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex", gap: "1.75rem", alignItems: "flex-start",
            marginBottom: "2.5rem", flexWrap: "wrap",
          }}
        >
          {/* Cover */}
          {song.coverUrl && (
            <div style={{
              position: "relative", width: "140px", height: "140px",
              borderRadius: "1rem", overflow: "hidden", flexShrink: 0,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}>
              <Image
                src={song.coverUrl}
                alt={song.title}
                fill
                className="object-cover"
                sizes="140px"
                unoptimized
              />
            </div>
          )}

          {/* Title block */}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "rgba(212,168,83,0.6)",
              marginBottom: "0.5rem",
            }}>
              {song.memoryDate}
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 300, lineHeight: 1,
              color: "#f7cdd8", marginBottom: "0.4rem",
              letterSpacing: "-0.01em",
            }}>
              {song.title}
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", color: "rgba(240,160,184,0.5)",
              marginBottom: "1rem",
            }}>
              {song.artist}
              {song.album ? ` · ${song.album}` : ""}
            </p>

            {/* Short description */}
            {song.shortDescription && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.05rem", fontStyle: "italic", fontWeight: 300,
                color: "rgba(247,205,216,0.55)",
                lineHeight: 1.55, maxWidth: "420px",
              }}>
                &ldquo;{song.shortDescription}&rdquo;
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Player ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: "1.5rem" }}
        >
          <AudioPlayer song={song} />
        </motion.div>

        {/* ── Lyrics ── */}
        {song.lyrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ marginBottom: "2rem" }}
          >
            <LyricsPanel
              lyrics={song.lyrics}
              currentTime={currentTime}
              onSeek={(t) => {
                const el = document.getElementById("iza-audio") as HTMLAudioElement | null;
                if (el) { el.currentTime = t; el.play(); }
              }}
            />
          </motion.div>
        )}

        {/* ── Why our song ── */}
        {song.whyOurSong && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "rgba(22,8,14,0.7)",
              border: "1px solid rgba(212,168,83,0.12)",
              borderRadius: "1rem",
              padding: "1.75rem 2rem",
              marginBottom: "2rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle glow */}
            <div aria-hidden style={{
              position: "absolute", top: 0, right: 0,
              width: "200px", height: "200px", pointerEvents: "none",
              background: "radial-gradient(circle, rgba(212,168,83,0.05), transparent 70%)",
            }} />

            {/* Header */}
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              marginBottom: "1.25rem",
            }}>
              <Heart size={13} fill="rgba(240,100,140,0.5)" color="rgba(240,100,140,0.5)" />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem", letterSpacing: "0.15em",
                textTransform: "uppercase", color: "rgba(212,168,83,0.5)",
              }}>
                Dlaczego ta piosenka jest nasza
              </span>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem", fontStyle: "italic", fontWeight: 300,
              color: "rgba(247,205,216,0.75)", lineHeight: 1.8,
              whiteSpace: "pre-line",
            }}>
              {song.whyOurSong}
            </p>
          </motion.div>
        )}

        {/* ── Apple Music link ── */}
        {song.itunesUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: "center", paddingTop: "0.5rem" }}
          >
            <a
              href={song.itunesUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.75rem", color: "rgba(240,160,184,0.25)",
                textDecoration: "none", transition: "color 0.2s",
              }}
              onMouseEnter={e =>
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.55)"
              }
              onMouseLeave={e =>
                (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.25)"
              }
            >
              <ExternalLink size={11} /> Otwórz w Apple Music
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}