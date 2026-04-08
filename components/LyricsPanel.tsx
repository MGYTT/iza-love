"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Music2, Sparkles, Heart, X } from "lucide-react";
import type { LyricLine, HighlightedWord } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────── */
const COLORS: Record<HighlightedWord["color"], {
  text: string; glow: string; bg: string; border: string; pulse: string;
}> = {
  gold: {
    text:   "#d4a853",
    glow:   "rgba(212,168,83,0.55)",
    bg:     "rgba(212,168,83,0.13)",
    border: "rgba(212,168,83,0.55)",
    pulse:  "rgba(212,168,83,0.2)",
  },
  pink: {
    text:   "#f0a0b8",
    glow:   "rgba(240,160,184,0.55)",
    bg:     "rgba(240,160,184,0.11)",
    border: "rgba(240,160,184,0.55)",
    pulse:  "rgba(240,160,184,0.2)",
  },
  rose: {
    text:   "#f7cdd8",
    glow:   "rgba(247,205,216,0.45)",
    bg:     "rgba(247,205,216,0.09)",
    border: "rgba(247,205,216,0.45)",
    pulse:  "rgba(247,205,216,0.15)",
  },
};

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function pluralNote(n: number): string {
  if (n === 1) return "notatka";
  if (n < 5)  return "notatki";
  return "notatek";
}

/* ─────────────────────────────────────────────────────
   FLOATING HEART
───────────────────────────────────────────────────── */
function FloatingHeart({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }}
      animate={{ opacity: 0, y: -30, x: (Math.random() - 0.5) * 22, scale: 1.2 }}
      transition={{ duration: 0.95, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "-4px",
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 70,
        color,
        fontSize: "10px",
        userSelect: "none",
      }}
    >
      ♥
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   NOTE MODAL — centrum ekranu
───────────────────────────────────────────────────── */
function NoteModal({
  hl,
  word,
  onClose,
}: {
  hl: HighlightedWord;
  word: string;
  onClose: () => void;
}) {
  const c = COLORS[hl.color] ?? COLORS.gold;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(6,1,4,0.82)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          cursor: "pointer",
        }}
      />

      {/* Modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Notatka do słowa: ${word}`}
        initial={{ opacity: 0, scale: 0.86, y: 28 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.86, y: 28 }}
        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 91,
          width: "min(440px, calc(100vw - 2.5rem))",
          background: "rgba(12,3,8,0.99)",
          backdropFilter: "blur(36px)",
          WebkitBackdropFilter: "blur(36px)",
          border: `1px solid ${c.border}38`,
          borderRadius: "1.5rem",
          padding: "2rem 2rem 1.8rem",
          boxShadow: `
            0 32px 80px rgba(0,0,0,0.85),
            0 0 0 1px rgba(255,255,255,0.03),
            0 0 80px ${c.glow}20
          `,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow blob */}
        <div style={{
          position: "absolute",
          top: "-60px", left: "50%",
          transform: "translateX(-50%)",
          width: "240px", height: "140px",
          background: `radial-gradient(ellipse, ${c.glow}18, transparent 70%)`,
          pointerEvents: "none",
          borderRadius: "50%",
          zIndex: 0,
        }} />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Zamknij"
          style={{
            position: "absolute",
            top: "1rem", right: "1rem",
            background: "rgba(240,160,184,0.06)",
            border: "1px solid rgba(240,160,184,0.1)",
            borderRadius: "50%",
            width: "30px", height: "30px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "rgba(240,160,184,0.38)",
            transition: "all 0.2s",
            zIndex: 2,
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "rgba(240,160,184,0.13)";
            b.style.color = "rgba(240,160,184,0.85)";
            b.style.borderColor = "rgba(240,160,184,0.25)";
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "rgba(240,160,184,0.06)";
            b.style.color = "rgba(240,160,184,0.38)";
            b.style.borderColor = "rgba(240,160,184,0.1)";
          }}
        >
          <X size={13} />
        </button>

        {/* Content wrapper */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Label row */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            marginBottom: "1.1rem",
          }}>
            <Sparkles size={11} style={{ color: c.text, flexShrink: 0 }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: `${c.text}88`,
            }}>
              Osobista notatka
            </span>
          </div>

          {/* Highlighted word chip */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: c.bg,
            border: `1px solid ${c.border}45`,
            borderRadius: "0.6rem",
            padding: "0.3rem 0.85rem",
            marginBottom: "1.2rem",
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              fontWeight: 600,
              fontStyle: "italic",
              color: c.text,
              textShadow: `0 0 20px ${c.glow}`,
            }}>
              „{word}"
            </span>
          </div>

          {/* Divider */}
          <div style={{
            height: "1px",
            background: `linear-gradient(to right, transparent, ${c.border}35, transparent)`,
            marginBottom: "1.2rem",
          }} />

          {/* Note text */}
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.22rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "#f7cdd8",
            lineHeight: 1.72,
            margin: 0,
          }}>
            &ldquo;{hl.note}&rdquo;
          </p>

          {/* Footer signature */}
          <div style={{
            marginTop: "1.4rem",
            paddingTop: "1rem",
            borderTop: `1px solid rgba(240,160,184,0.06)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "5px",
          }}>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <Heart size={10} fill={`${c.text}50`} style={{ color: `${c.text}50` }} />
            </motion.div>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.82rem",
              fontStyle: "italic",
              color: `${c.text}45`,
            }}>
              od Ciebie, dla Izy
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────
   HIGHLIGHTED WORD CHIP
───────────────────────────────────────────────────── */
function HighlightedWordChip({ word, hl }: { word: string; hl: HighlightedWord }) {
  const [open, setOpen]     = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const c = COLORS[hl.color] ?? COLORS.gold;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) {
      const id = Date.now();
      setHearts(h => [...h, id]);
      setTimeout(() => setHearts(h => h.filter(x => x !== id)), 1000);
    }
    setOpen(o => !o);
  }, [open]);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <AnimatePresence>
        {hearts.map(id => <FloatingHeart key={id} color={c.text} />)}
      </AnimatePresence>

      <button
        onClick={handleClick}
        aria-expanded={open}
        aria-label={`Notatka do słowa: ${word}`}
        style={{
          background: open ? c.bg : "transparent",
          color: c.text,
          textShadow: `0 0 16px ${c.glow}`,
          border: "none",
          borderBottom: `1px solid ${open ? c.border : c.border + "65"}`,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontStyle: "inherit",
          fontWeight: 600,
          lineHeight: "inherit",
          padding: "0 2px",
          borderRadius: "2px",
          transition: "all 0.2s ease",
          display: "inline",
        }}
        onMouseEnter={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = c.bg;
          b.style.textShadow = `0 0 22px ${c.glow}, 0 0 44px ${c.pulse}`;
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = open ? c.bg : "transparent";
          b.style.textShadow = `0 0 16px ${c.glow}`;
        }}
      >
        {word}
      </button>

      <AnimatePresence>
        {open && (
          <NoteModal
            key="modal"
            hl={hl}
            word={word}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   LYRIC LINE TEXT
───────────────────────────────────────────────────── */
function LyricLineText({ line }: { line: LyricLine }) {
  if (!line.highlighted?.length) return <>{line.text}</>;

  const sorted = [...line.highlighted]
    .filter(hl => hl.word)
    .map(hl => ({
      hl,
      idx: line.text.toLowerCase().indexOf(hl.word.toLowerCase()),
    }))
    .filter(x => x.idx !== -1)
    .sort((a, b) => a.idx - b.idx);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  for (const { hl, idx } of sorted) {
    if (idx < cursor) continue;
    if (idx > cursor) {
      parts.push(<span key={key++}>{line.text.slice(cursor, idx)}</span>);
    }
    const exactWord = line.text.slice(idx, idx + hl.word.length);
    parts.push(<HighlightedWordChip key={key++} word={exactWord} hl={hl} />);
    cursor = idx + hl.word.length;
  }

  if (cursor < line.text.length) {
    parts.push(<span key={key++}>{line.text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

/* ─────────────────────────────────────────────────────
   ACTIVE BEAM
───────────────────────────────────────────────────── */
function ActiveBeam() {
  return (
    <motion.div
      layoutId="lyric-active-beam"
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "0 0.45rem 0.45rem 0",
        background: "linear-gradient(to right, rgba(212,168,83,0.08), transparent 80%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────── */
function EmptyLyrics() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ textAlign: "center", padding: "3rem 1rem" }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        style={{ marginBottom: "0.85rem" }}
      >
        <Music2 size={30} style={{ color: "rgba(240,160,184,0.2)", margin: "0 auto" }} />
      </motion.div>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        color: "rgba(240,160,184,0.22)",
        fontSize: "1.05rem",
      }}>
        Tekst niebawem...
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────── */
interface Props {
  lyrics: LyricLine[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export default function LyricsPanel({ lyrics, currentTime, onSeek }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLButtonElement>(null);

  const activeIndex = lyrics.reduce<number>(
    (acc, line, i) => (currentTime >= line.time ? i : acc),
    -1
  );

  const totalHighlights = lyrics.reduce(
    (acc, l) => acc + (l.highlighted?.length ?? 0), 0
  );

  /* Spring progress bar */
  const rawProgress = lyrics.length > 0 && activeIndex >= 0
    ? (activeIndex + 1) / lyrics.length
    : 0;
  const motionProgress = useMotionValue(rawProgress);
  const springProgress = useSpring(motionProgress, { stiffness: 60, damping: 20 });

  useEffect(() => {
    motionProgress.set(rawProgress);
  }, [rawProgress, motionProgress]);

  /* Auto-scroll aktywnego wersu */
  useEffect(() => {
    if (!activeRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const el        = activeRef.current;
    const scrollTo  = el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, scrollTo), behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div
      className="glass"
      style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
    >
      {/* ══ HEADER ══ */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.1rem 1.4rem 0.85rem",
        borderBottom: "1px solid rgba(240,160,184,0.07)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <motion.div
            animate={activeIndex >= 0
              ? { scale: [1, 1.22, 1], opacity: [0.7, 1, 0.7] }
              : { scale: 1, opacity: 0.5 }}
            transition={{ repeat: activeIndex >= 0 ? Infinity : 0, duration: 2, ease: "easeInOut" }}
          >
            <Music2 size={13} style={{ color: "rgba(212,168,83,0.8)" }} />
          </motion.div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(240,160,184,0.4)",
          }}>
            Tekst piosenki
          </span>
        </div>

        <AnimatePresence>
          {totalHighlights > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                background: "rgba(212,168,83,0.1)",
                border: "1px solid rgba(212,168,83,0.22)",
                borderRadius: "999px",
                padding: "2px 9px",
              }}
            >
              <Sparkles size={9} style={{ color: "#d4a853" }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.63rem",
                color: "rgba(212,168,83,0.85)",
              }}>
                {totalHighlights} {pluralNote(totalHighlights)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ HINT ══ */}
      <AnimatePresence>
        {totalHighlights > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", flexShrink: 0, borderBottom: "1px solid rgba(240,160,184,0.05)" }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "0.45rem 1.4rem",
            }}>
              <Heart size={9} style={{ color: "rgba(240,160,184,0.28)", flexShrink: 0 }} />
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.66rem",
                color: "rgba(240,160,184,0.28)",
                fontStyle: "italic",
                margin: 0,
              }}>
                Kliknij podświetlone słowo aby zobaczyć moją notatkę dla Ciebie
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ LYRICS SCROLL ══ */}
      <div
        ref={containerRef}
        style={{
          overflowY: "auto",
          maxHeight: "340px",
          padding: "0.85rem 0.8rem 1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.1rem",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(212,168,83,0.15) transparent",
        }}
      >
        {lyrics.length === 0 ? (
          <EmptyLyrics />
        ) : (
          lyrics.map((line, i) => {
            const isActive = i === activeIndex;
            const isPast   = i < activeIndex;

            return (
              <motion.button
                key={i}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(line.time)}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.25 : 0.42,
                  x: isActive ? 3 : 0,
                }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ opacity: 0.85, x: 2 }}
                style={{
                  position: "relative",
                  background: "transparent",
                  border: "none",
                  borderLeft: `2px solid ${isActive ? "rgba(212,168,83,0.55)" : "transparent"}`,
                  borderRadius: "0 0.45rem 0.45rem 0",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  padding: isActive
                    ? "0.38rem 2.5rem 0.38rem 0.9rem"
                    : "0.3rem 2.5rem 0.3rem 0.9rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: isActive ? "1.22rem" : "1.15rem",
                  fontWeight: isActive ? 500 : 300,
                  lineHeight: 1.5,
                  color: isActive ? "#d4a853" : "#f7cdd8",
                  textShadow: isActive ? "0 0 22px rgba(212,168,83,0.4)" : "none",
                  transition: "border-color 0.3s, color 0.3s, text-shadow 0.3s, padding 0.3s, font-size 0.3s",
                  outline: "none",
                }}
              >
                {isActive && <ActiveBeam />}

                <span style={{ position: "relative", zIndex: 1 }}>
                  <LyricLineText line={line} />
                </span>

                {/* Timestamp — Framer hover */}
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  style={{
                    position: "absolute",
                    right: "0.6rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.58rem",
                    color: "rgba(212,168,83,0.35)",
                    pointerEvents: "none",
                    zIndex: 1,
                    letterSpacing: "0.05em",
                  }}
                >
                  {formatTime(line.time)}
                </motion.span>
              </motion.button>
            );
          })
        )}
      </div>

      {/* ══ PROGRESS BAR ══ */}
      <div style={{
        height: "2px",
        background: "rgba(240,160,184,0.06)",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        <motion.div
          style={{
            height: "100%",
            scaleX: springProgress,
            transformOrigin: "left",
            background: "linear-gradient(to right, #d4a853, rgba(240,160,184,0.65))",
          }}
        />
      </div>
    </div>
  );
}