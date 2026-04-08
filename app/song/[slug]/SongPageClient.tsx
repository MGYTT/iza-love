"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Heart, Play, Pause,
  SkipBack, Volume2, VolumeX, MessageCircle,
  Music2, Feather,
} from "lucide-react";
import { toast } from "sonner";
import type { Song, LyricLine } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, "0");
  return `${m}:${sec}`;
}

/* ─────────────────────────────────────────────────────
   WAVEFORM PLAYER
───────────────────────────────────────────────────── */
function MusicPlayer({
  song,
  onTimeUpdate,
}: {
  song: Song;
  onTimeUpdate: (t: number) => void;
}) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const rafRef     = useRef<number>(0);
  const trackRef   = useRef<HTMLDivElement>(null);

  const [playing,  setPlaying]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume,   setVolume]   = useState(0.8);
  const [muted,    setMuted]    = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  // Static waveform heights (consistent across renders)
  const bars = useRef(
    Array.from({ length: 52 }, () => 18 + Math.random() * 82)
  ).current;

  useEffect(() => {
    const audio = new Audio(song.audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      setLoaded(true);
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      cancelAnimationFrame(rafRef.current);
    });

    return () => {
      audio.pause();
      audio.src = "";
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.audioUrl]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(audio.currentTime);
    onTimeUpdate(audio.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      audio.play().catch(() => {});
      rafRef.current = requestAnimationFrame(tick);
    }
    setPlaying((p) => !p);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
    onTimeUpdate(audio.currentTime);
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrent(0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted((m) => !m);
  };

  const progress = duration ? current / duration : 0;

  return (
    <div
      className="glass"
      style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Waveform */}
      <div
        ref={trackRef}
        onClick={seek}
        role="slider"
        aria-label="Seekbar"
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "2px",
          height: "64px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {bars.map((h, i) => {
          const ratio  = i / bars.length;
          const passed = ratio < progress;
          return (
            <div
              key={i}
              className={playing && passed ? "wave-bar" : ""}
              style={{
                flex: 1,
                height: `${h}%`,
                borderRadius: "2px",
                transformOrigin: "bottom",
                background: passed
                  ? `linear-gradient(to top, #d4a853, rgba(240,160,184,0.8))`
                  : "rgba(240,160,184,0.12)",
                transition: "background 0.15s ease",
              }}
            />
          );
        })}
      </div>

      {/* Time */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.72rem",
        color: "rgba(240,160,184,0.4)",
        marginTop: "-0.5rem",
      }}>
        <span>{fmt(current)}</span>
        <span>{loaded ? fmt(duration) : "–:––"}</span>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
      }}>
        <button
          onClick={restart}
          aria-label="Od początku"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(240,160,184,0.35)",
            transition: "color 0.2s",
            padding: "0.5rem",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.8)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.35)"}
        >
          <SkipBack size={18} />
        </button>

        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          aria-label={playing ? "Pauza" : "Odtwórz"}
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #d4a853 0%, rgba(240,160,184,0.9) 100%)",
            color: "#100508",
            boxShadow: "0 0 24px rgba(212,168,83,0.4), 0 0 48px rgba(212,168,83,0.15)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 32px rgba(212,168,83,0.6), 0 0 64px rgba(212,168,83,0.25)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 24px rgba(212,168,83,0.4), 0 0 48px rgba(212,168,83,0.15)";
          }}
        >
          {playing
            ? <Pause  size={22} fill="#100508" />
            : <Play   size={22} fill="#100508" style={{ transform: "translateX(1px)" }} />
          }
        </motion.button>

        <button
          onClick={toggleMute}
          aria-label={muted ? "Włącz" : "Wycisz"}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(240,160,184,0.35)",
            transition: "color 0.2s",
            padding: "0.5rem",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.8)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.35)"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Volume2 size={12} style={{ color: "rgba(240,160,184,0.3)", flexShrink: 0 }} />
        <input
          type="range"
          min={0} max={1} step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
            if (v > 0) setMuted(false);
          }}
          aria-label="Głośność"
          style={{
            flex: 1, height: "3px", cursor: "pointer",
            accentColor: "#d4a853",
            appearance: "none",
            background: `linear-gradient(to right, #d4a853 ${(muted ? 0 : volume) * 100}%, rgba(240,160,184,0.15) 0%)`,
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   LYRICS PANEL
───────────────────────────────────────────────────── */
function LyricsPanel({
  lyrics,
  currentTime,
  onSeek,
}: {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (t: number) => void;
}) {
  const activeIdx = lyrics.reduce(
    (acc, line, i) => (currentTime >= line.time ? i : acc),
    -1
  );
  const activeRef    = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  return (
    <div
      className="glass"
      style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0" }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        marginBottom: "1.25rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid rgba(240,160,184,0.08)",
      }}>
        <Music2 size={14} style={{ color: "rgba(212,168,83,0.6)" }} />
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(240,160,184,0.4)",
        }}>
          Tekst — kliknij wers żeby przewinąć
        </span>
      </div>

      {/* Lines */}
      <div
        ref={containerRef}
        style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        {lyrics.length === 0 ? (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "rgba(240,160,184,0.25)",
            textAlign: "center",
            padding: "2rem 0",
          }}>
            Tekst niebawem...
          </p>
        ) : lyrics.map((line, i) => (
          <motion.button
            key={i}
            ref={i === activeIdx ? activeRef : undefined}
            onClick={() => onSeek(line.time)}
            initial={false}
            animate={{
              opacity: i === activeIdx ? 1 : 0.35,
              x:       i === activeIdx ? 6 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              padding: "0.25rem 0",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.25rem",
              fontWeight: 400,
              lineHeight: 1.3,
              color: i === activeIdx ? "#d4a853" : "#f7cdd8",
              textShadow: i === activeIdx ? "0 0 20px rgba(212,168,83,0.4)" : "none",
              transition: "color 0.3s ease, text-shadow 0.3s ease",
            }}
          >
            {line.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE CLIENT
───────────────────────────────────────────────────── */
export default function SongPageClient({ song }: { song: Song }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [liked,       setLiked]       = useState(false);

  const handleTimeUpdate = useCallback((t: number) => setCurrentTime(t), []);
  const handleSeek = useCallback((t: number) => {
    // Seek delegated via custom event to MusicPlayer
    window.dispatchEvent(new CustomEvent("song:seek", { detail: t }));
  }, []);

  const handleLike = () => {
    setLiked(true);
    toast("Dodano do naszej playlisty ♥", { icon: "💕" });
  };

  return (
    <main style={{ minHeight: "100dvh", maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>

      {/* ── Back ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: "2.5rem" }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            color: "rgba(240,160,184,0.4)",
            transition: "color 0.2s",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.85)"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.4)"}
        >
          <ArrowLeft size={14} />
          Powrót do naszej historii
        </Link>
      </motion.div>

      {/* ── Hero banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          height: "280px",
          borderRadius: "1.5rem",
          overflow: "hidden",
          marginBottom: "2.5rem",
        }}
      >
        {song.coverUrl && (
          <Image
            src={song.coverUrl}
            alt={song.title}
            fill
            priority
            className="object-cover"
            style={{ filter: "saturate(0.7) brightness(0.5)" }}
            sizes="1100px"
          />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(16,5,8,0.95) 0%, rgba(16,5,8,0.5) 50%, rgba(16,5,8,0.2) 100%)",
        }} />
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: "-20%", left: "10%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(212,168,83,0.15), transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }} />

        {/* Text overlay */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "2rem",
          right: "40%",
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(212,168,83,0.7)",
            marginBottom: "0.5rem",
          }}>
            {song.memoryDate}
          </p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 300,
            color: "#f7cdd8",
            lineHeight: 1.05,
            marginBottom: "0.4rem",
          }}>
            {song.title}
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(240,160,184,0.55)",
          }}>
            {song.artist}
          </p>
        </div>
      </motion.div>

      {/* ── Two-column layout ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
        alignItems: "start",
      }}>

        {/* ── LEFT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <MusicPlayer song={song} onTimeUpdate={handleTimeUpdate} />

          {/* Like button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            disabled={liked}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "1rem",
              border: liked
                ? "1px solid rgba(212,168,83,0.35)"
                : "1px solid rgba(240,160,184,0.12)",
              background: liked
                ? "rgba(212,168,83,0.08)"
                : "rgba(42,16,25,0.4)",
              backdropFilter: "blur(12px)",
              cursor: liked ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem",
              color: liked ? "#d4a853" : "rgba(240,160,184,0.5)",
              transition: "all 0.3s ease",
              letterSpacing: "0.03em",
            }}
          >
            <Heart
              size={15}
              fill={liked ? "#d4a853" : "none"}
              color={liked ? "#d4a853" : "rgba(240,160,184,0.5)"}
            />
            {liked ? "W naszej playliście ♥" : "Dodaj do naszej playlisty"}
          </motion.button>

          {/* Short description */}
          <div
            className="glass"
            style={{ padding: "1.25rem" }}
          >
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.05rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(247,205,216,0.65)",
              lineHeight: 1.65,
            }}>
              &ldquo;{song.shortDescription}&rdquo;
            </p>
          </div>
        </motion.div>

        {/* ── RIGHT COLUMN ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <LyricsPanel
            lyrics={song.lyrics}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </motion.div>
      </div>

      {/* ── Why our song (full width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginTop: "2rem" }}
      >
        <div
          className="glass"
          style={{ padding: "2rem 2.25rem" }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(240,160,184,0.08)",
          }}>
            <Feather size={16} style={{ color: "rgba(212,168,83,0.6)" }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.35rem",
              fontWeight: 400,
              color: "#d4a853",
              letterSpacing: "0.02em",
            }}>
              Dlaczego ta piosenka jest nasza
            </h2>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.95rem",
            lineHeight: 1.85,
            color: "rgba(154,96,112,0.95)",
            whiteSpace: "pre-line",
            maxWidth: "72ch",
          }}>
            {song.whyOurSong}
          </p>
        </div>
      </motion.div>

      {/* ── Memories / Comments ── */}
      {song.comments.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: "2rem" }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}>
            <MessageCircle size={16} style={{ color: "rgba(240,160,184,0.4)" }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.35rem",
              fontWeight: 400,
              color: "rgba(247,205,216,0.7)",
            }}>
              Nasze wspomnienia
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}>
            {song.comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass"
                style={{ padding: "1.25rem" }}
              >
                {c.imageUrl && (
                  <div style={{
                    position: "relative",
                    width: "100%",
                    height: "160px",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    marginBottom: "1rem",
                  }}>
                    <Image
                      src={c.imageUrl}
                      alt="Wspomnienie"
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(16,5,8,0.5), transparent)",
                    }} />
                  </div>
                )}

                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  fontWeight: 300,
                  color: "rgba(247,205,216,0.7)",
                  lineHeight: 1.6,
                  marginBottom: c.timestamp ? "0.75rem" : 0,
                }}>
                  &ldquo;{c.text}&rdquo;
                </p>

                {c.timestamp && (
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.68rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(212,168,83,0.45)",
                  }}>
                    — {c.timestamp}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Navigation to next/prev song ── */}
      <SongNavigation currentSlug={song.slug} />
    </main>
  );
}

/* ─────────────────────────────────────────────────────
   SONG NAVIGATION (prev / next)
───────────────────────────────────────────────────── */
function SongNavigation({ currentSlug }: { currentSlug: string }) {
  const { songs } = require("@/lib/songs");
  const idx  = songs.findIndex((s: Song) => s.slug === currentSlug);
  const prev = idx > 0 ? songs[idx - 1] : null;
  const next = idx < songs.length - 1 ? songs[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        marginTop: "3rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
      }}
    >
      {/* Prev */}
      <div>
        {prev && (
          <Link href={`/song/${prev.slug}`} style={{ textDecoration: "none" }}>
            <div
              className="glass"
              style={{
                padding: "1rem 1.25rem",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.25)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.12)"}
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(240,160,184,0.3)",
                marginBottom: "0.4rem",
              }}>
                ← Poprzedni rozdział
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: "#f7cdd8",
              }}>
                {prev.title}
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Next */}
      <div>
        {next && (
          <Link href={`/song/${next.slug}`} style={{ textDecoration: "none" }}>
            <div
              className="glass"
              style={{
                padding: "1rem 1.25rem",
                cursor: "pointer",
                textAlign: "right",
                transition: "border-color 0.3s ease",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.25)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.12)"}
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(240,160,184,0.3)",
                marginBottom: "0.4rem",
              }}>
                Następny rozdział →
              </p>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: "#f7cdd8",
              }}>
                {next.title}
              </p>
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}