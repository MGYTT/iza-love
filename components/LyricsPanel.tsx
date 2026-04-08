"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Sparkles } from "lucide-react";
import type { LyricLine, HighlightedWord } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   HIGHLIGHTED WORD — inline tooltip
───────────────────────────────────────────────────── */
const COLORS: Record<HighlightedWord["color"], { text: string; glow: string; bg: string; border: string }> = {
  gold: {
    text:   "#d4a853",
    glow:   "rgba(212,168,83,0.5)",
    bg:     "rgba(212,168,83,0.12)",
    border: "rgba(212,168,83,0.5)",
  },
  pink: {
    text:   "#f0a0b8",
    glow:   "rgba(240,160,184,0.5)",
    bg:     "rgba(240,160,184,0.1)",
    border: "rgba(240,160,184,0.5)",
  },
  rose: {
    text:   "#f7cdd8",
    glow:   "rgba(247,205,216,0.4)",
    bg:     "rgba(247,205,216,0.08)",
    border: "rgba(247,205,216,0.4)",
  },
};

function HighlightedWord({
  word,
  hl,
  lineTime,
}: {
  word: string;
  hl: HighlightedWord;
  lineTime: number;
}) {
  const [open, setOpen] = useState(false);
  const c = COLORS[hl.color] ?? COLORS.gold;

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // don't seek when clicking highlight
          setOpen((o) => !o);
        }}
        style={{
          background: open ? c.bg : "transparent",
          color: c.text,
          textShadow: `0 0 14px ${c.glow}`,
          borderBottom: `1px solid ${c.border}`,
          border: "none",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: c.border,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "inherit",
          fontStyle: "inherit",
          fontWeight: 600,
          lineHeight: "inherit",
          padding: "0 1px",
          borderRadius: "2px",
          transition: "background 0.2s, text-shadow 0.2s",
          display: "inline",
        }}
      >
        {word}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              width: "220px",
              background: "rgba(22,8,14,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${c.border}28`,
              borderRadius: "0.9rem",
              padding: "0.85rem 1rem",
              boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 24px ${c.glow}40`,
              pointerEvents: "none",
            }}
          >
            {/* Arrow */}
            <div style={{
              position: "absolute",
              bottom: "-5px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "9px", height: "9px",
              background: "rgba(22,8,14,0.97)",
              borderRight: `1px solid ${c.border}28`,
              borderBottom: `1px solid ${c.border}28`,
            }} />

            {/* Note icon */}
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              marginBottom: "0.4rem",
            }}>
              <Sparkles size={11} style={{ color: c.text, flexShrink: 0 }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: `${c.text}90`,
              }}>
                Osobista notatka
              </span>
            </div>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.98rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "#f7cdd8",
              lineHeight: 1.55,
            }}>
              &ldquo;{hl.note}&rdquo;
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ─────────────────────────────────────────────────────
   RENDER LYRIC LINE — plain text or with highlights
───────────────────────────────────────────────────── */
function LyricLineText({ line }: { line: LyricLine }) {
  if (!line.highlighted?.length) {
    return <>{line.text}</>;
  }

  // Build parts: split text around highlighted words
  const parts: React.ReactNode[] = [];
  let remaining = line.text;
  let key = 0;

  for (const hl of line.highlighted) {
    if (!hl.word) continue;
    const idx = remaining.toLowerCase().indexOf(hl.word.toLowerCase());
    if (idx === -1) continue;

    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    }
    const exactWord = remaining.slice(idx, idx + hl.word.length);
    parts.push(
      <HighlightedWord
        key={key++}
        word={exactWord}
        hl={hl}
        lineTime={line.time}
      />
    );
    remaining = remaining.slice(idx + hl.word.length);
  }

  if (remaining) {
    parts.push(<span key={key++}>{remaining}</span>);
  }

  return <>{parts}</>;
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
  const activeIndex = lyrics.reduce<number>(
    (acc, line, i) => (currentTime >= line.time ? i : acc),
    -1
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLButtonElement>(null);

  // Count highlighted words across all lyrics
  const totalHighlights = lyrics.reduce(
    (acc, l) => acc + (l.highlighted?.length ?? 0), 0
  );

  // Smooth scroll active lyric into view
  useEffect(() => {
    if (!activeRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const el        = activeRef.current;
    const elTop     = el.offsetTop;
    const elH       = el.offsetHeight;
    const cH        = container.clientHeight;
    const scrollTo  = elTop - cH / 2 + elH / 2;

    container.scrollTo({ top: scrollTo, behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div
      className="glass"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.1rem 1.4rem 0.85rem",
        borderBottom: "1px solid rgba(240,160,184,0.07)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <Music2 size={13} style={{ color: "rgba(212,168,83,0.7)" }} />
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

        {/* Highlight badge */}
        {totalHighlights > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            background: "rgba(212,168,83,0.1)",
            border: "1px solid rgba(212,168,83,0.2)",
            borderRadius: "999px",
            padding: "2px 8px",
          }}>
            <Sparkles size={10} style={{ color: "#d4a853" }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.65rem",
              color: "rgba(212,168,83,0.8)",
            }}>
              {totalHighlights} {totalHighlights === 1 ? "ważne słowo" : "ważne słowa"}
            </span>
          </div>
        )}
      </div>

      {/* ── Hint ── */}
      {totalHighlights > 0 && (
        <div style={{
          padding: "0.5rem 1.4rem",
          borderBottom: "1px solid rgba(240,160,184,0.05)",
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.67rem",
            color: "rgba(240,160,184,0.25)",
            fontStyle: "italic",
          }}>
            Kliknij podświetlone słowo aby zobaczyć osobistą notatkę ✦
          </p>
        </div>
      )}

      {/* ── Lyrics scroll area ── */}
      <div
        ref={containerRef}
        style={{
          overflowY: "auto",
          maxHeight: "340px",
          padding: "1rem 1.4rem 1.4rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.15rem",
          // Custom scrollbar via CSS class
        }}
      >
        {lyrics.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "2.5rem 1rem",
          }}>
            <Music2
              size={28}
              style={{ color: "rgba(240,160,184,0.12)", margin: "0 auto 0.75rem" }}
            />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "rgba(240,160,184,0.2)",
              fontSize: "1rem",
            }}>
              Tekst niebawem...
            </p>
          </div>
        ) : (
          lyrics.map((line, i) => {
            const isActive   = i === activeIndex;
            const isPast     = i < activeIndex;
            const isFuture   = i > activeIndex;


            return (
              <motion.button
                key={i}
                ref={isActive ? activeRef : undefined}
                onClick={() => onSeek(line.time)}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.28 : isFuture ? 0.45 : 0.45,
                  x:       isActive ? 4 : 0,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: isActive
                    ? "rgba(212,168,83,0.05)"
                    : "transparent",
                  border: "none",
                  borderLeft: isActive
                    ? "2px solid rgba(212,168,83,0.5)"
                    : "2px solid transparent",
                  borderRadius: "0 0.4rem 0.4rem 0",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  padding: isActive ? "0.35rem 0.75rem" : "0.3rem 0.75rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.18rem",
                  fontWeight: isActive ? 500 : 300,
                  lineHeight: 1.45,
                  color: isActive
                    ? "#d4a853"
                    : "#f7cdd8",
                  textShadow: isActive
                    ? "0 0 20px rgba(212,168,83,0.35)"
                    : "none",
                  transition: "background 0.3s, border-color 0.3s, color 0.3s, text-shadow 0.3s, padding 0.3s",
                  position: "relative",
                }}
              >
                {/* Timestamp on hover */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.6rem",
                    color: "rgba(212,168,83,0.3)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    pointerEvents: "none",
                  }}
                  className="lyric-timestamp"
                >
                  {Math.floor(line.time / 60)}:{String(line.time % 60).padStart(2, "0")}
                </span>

                <LyricLineText line={line} />
              </motion.button>
            );
          })
        )}
      </div>

      {/* ── Progress bar at bottom ── */}
      {lyrics.length > 0 && activeIndex >= 0 && (
        <div style={{
          height: "2px",
          background: "rgba(240,160,184,0.07)",
          flexShrink: 0,
        }}>
          <motion.div
            style={{
              height: "100%",
              background: "linear-gradient(to right, #d4a853, rgba(240,160,184,0.6))",
              borderRadius: "1px",
            }}
            animate={{
              width: `${((activeIndex + 1) / lyrics.length) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Hover timestamp reveal */}
      <style>{`
        .glass button:hover .lyric-timestamp {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}