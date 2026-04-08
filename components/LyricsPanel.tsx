"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Music2, Sparkles, Heart } from "lucide-react";
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

/* ─────────────────────────────────────────────────────
   FLOATING HEART — mini particle on note open
───────────────────────────────────────────────────── */
function FloatingHeart({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }}
      animate={{ opacity: 0, y: -28, x: (Math.random() - 0.5) * 20, scale: 1.1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "-4px",
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        zIndex: 70,
        color,
        fontSize: "10px",
      }}
    >
      ♥
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   HIGHLIGHTED WORD — tooltip z animacją
───────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────
   MODAL — centrum ekranu zamiast tooltip
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

  // Zamknij na Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(8,2,5,0.75)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          cursor: "pointer",
        }}
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.88, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.88, y: 24 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 91,
          width: "min(420px, calc(100vw - 2.5rem))",
          background: "rgba(14,4,9,0.98)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: `1px solid ${c.border}40`,
          borderRadius: "1.4rem",
          padding: "2rem 2rem 1.75rem",
          boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${c.glow}25`,
          pointerEvents: "auto",
        }}
      >
        {/* Blask w tle */}
        <div style={{
          position: "absolute",
          top: "-40px", left: "50%",
          transform: "translateX(-50%)",
          width: "200px", height: "120px",
          background: `radial-gradient(ellipse, ${c.glow}20, transparent 70%)`,
          pointerEvents: "none",
          borderRadius: "50%",
        }} />

        {/* Zamknij */}
        <button
          onClick={onClose}
          aria-label="Zamknij"
          style={{
            position: "absolute",
            top: "0.9rem", right: "0.9rem",
            background: "rgba(240,160,184,0.06)",
            border: "1px solid rgba(240,160,184,0.1)",
            borderRadius: "50%",
            width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            color: "rgba(240,160,184,0.4)",
            fontSize: "0.9rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,160,184,0.12)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.8)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,160,184,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.4)";
          }}
        >
          ×
        </button>

        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "1rem" }}>
          <Sparkles size={12} style={{ color: c.text, flexShrink: 0 }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.63rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: `${c.text}90`,
          }}>
            Osobista notatka
          </span>
        </div>

        {/* Słowo */}
        <div style={{
          display: "inline-block",
          background: c.bg,
          border: `1px solid ${c.border}50`,
          borderRadius: "0.5rem",
          padding: "0.25rem 0.75rem",
          marginBottom: "1.1rem",
        }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: c.text,
            textShadow: `0 0 18px ${c.glow}`,
            fontStyle: "italic",
          }}>
            „{word}"
          </span>
        </div>

        {/* Kreska */}
        <div style={{
          height: "1px",
          background: `linear-gradient(to right, transparent, ${c.border}40, transparent)`,
          marginBottom: "1.1rem",
        }} />

        {/* Treść notatki */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.18rem",
          fontStyle: "italic",
          fontWeight: 300,
          color: "#f7cdd8",
          lineHeight: 1.7,
          margin: 0,
        }}>
          &ldquo;{hl.note}&rdquo;
        </p>

        {/* Podpis */}
        <div style={{
          marginTop: "1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "5px",
        }}>
          <Heart size={10} style={{ color: `${c.text}60` }} />
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "0.8rem",
            fontStyle: "italic",
            color: `${c.text}50`,
          }}>
            od Ciebie
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────
   HIGHLIGHTED WORD CHIP — otwiera modal zamiast tooltip
───────────────────────────────────────────────────── */
function HighlightedWordChip({
  word,
  hl,
}: {
  word: string;
  hl: HighlightedWord;
}) {
  const [open, setOpen] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const c = COLORS[hl.color] ?? COLORS.gold;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) {
      setHearts(h => [...h, Date.now()]);
      setTimeout(() => setHearts(h => h.slice(1)), 950);
    }
    setOpen(o => !o);
  }, [open]);

  return (
    <span style={{ position: "relative", display: "inline" }}>
      {/* Floating hearts */}
      <AnimatePresence>
        {hearts.map(id => <FloatingHeart key={id} color={c.text} />)}
      </AnimatePresence>

      {/* Podświetlone słowo */}
      <button
        onClick={handleClick}
        aria-expanded={open}
        aria-label={`Notatka do słowa: ${word}`}
        style={{
          background: open ? c.bg : "transparent",
          color: c.text,
          textShadow: `0 0 16px ${c.glow}`,
          border: "none",
          borderBottom: `1px solid ${open ? c.border : c.border + "70"}`,
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
          b.style.textShadow = `0 0 22px ${c.glow}, 0 0 40px ${c.pulse}`;
        }}
        onMouseLeave={e => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = open ? c.bg : "transparent";
          b.style.textShadow = `0 0 16px ${c.glow}`;
        }}
      >
        {word}
      </button>

      {/* Modal — renderowany przez portal do body */}
      {open && (
        <NoteModal
          hl={hl}
          word={word}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   LYRIC LINE TEXT — parsowanie z highlightami
───────────────────────────────────────────────────── */
function LyricLineText({ line }: { line: LyricLine }) {
  if (!line.highlighted?.length) return <>{line.text}</>;

  // Sortuj highlights po pozycji w tekście
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
    if (idx < cursor) continue; // skip overlapping
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
   ACTIVE LINE GLOW — animowany background beam
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
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
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

  /* Aktywny wers */
  const activeIndex = lyrics.reduce<number>(
    (acc, line, i) => (currentTime >= line.time ? i : acc),
    -1
  );

  /* Smooth spring progress bar */
  const rawProgress = lyrics.length > 0 && activeIndex >= 0
    ? (activeIndex + 1) / lyrics.length
    : 0;
  const springProgress = useSpring(useMotionValue(rawProgress), {
    stiffness: 60, damping: 20,
  });

  useEffect(() => {
    springProgress.set(rawProgress);
  }, [rawProgress, springProgress]);

  /* Total highlights */
  const totalHighlights = lyrics.reduce(
    (acc, l) => acc + (l.highlighted?.length ?? 0), 0
  );

  /* Auto-scroll do aktywnego wersu */
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
              ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
              : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
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

        {/* Highlights badge */}
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
                {totalHighlights} {totalHighlights === 1 ? "notatka" : totalHighlights < 5 ? "notatki" : "notatek"}
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
            style={{
              overflow: "hidden",
              flexShrink: 0,
              borderBottom: "1px solid rgba(240,160,184,0.05)",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "0.45rem 1.4rem",
            }}>
              <Heart size={9} style={{ color: "rgba(240,160,184,0.3)", flexShrink: 0 }} />
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

      {/* ══ LYRICS SCROLL AREA ══ */}
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
                  padding: isActive ? "0.38rem 0.8rem 0.38rem 0.9rem" : "0.3rem 0.8rem 0.3rem 0.9rem",
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
                {/* Animated background beam */}
                {isActive && <ActiveBeam />}

                {/* Content */}
                <span style={{ position: "relative", zIndex: 1 }}>
                  <LyricLineText line={line} />
                </span>

                {/* Timestamp — pokazuje się przy hover */}
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
        position: "relative",
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