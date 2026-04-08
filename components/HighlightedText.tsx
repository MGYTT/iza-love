"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import type { LyricLine, HighlightedWord } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   KOLORY podświetleń
───────────────────────────────────────────────────── */
const COLORS: Record<
  HighlightedWord["color"],
  { text: string; glow: string; bg: string; border: string; panelBg: string }
> = {
  gold: {
    text:    "#d4a853",
    glow:    "rgba(212,168,83,0.55)",
    bg:      "rgba(212,168,83,0.14)",
    border:  "rgba(212,168,83,0.55)",
    panelBg: "rgba(212,168,83,0.07)",
  },
  pink: {
    text:    "#f0a0b8",
    glow:    "rgba(240,160,184,0.55)",
    bg:      "rgba(240,160,184,0.12)",
    border:  "rgba(240,160,184,0.55)",
    panelBg: "rgba(240,160,184,0.07)",
  },
  rose: {
    text:    "#f7cdd8",
    glow:    "rgba(247,205,216,0.45)",
    bg:      "rgba(247,205,216,0.1)",
    border:  "rgba(247,205,216,0.45)",
    panelBg: "rgba(247,205,216,0.05)",
  },
};

/* ─────────────────────────────────────────────────────
   INLINE NOTE PANEL — otwiera się pod wersem
   (nie używa absolute positioning → nigdy nie ucieka)
───────────────────────────────────────────────────── */
function NotePanel({
  hl,
  onClose,
}: {
  hl: HighlightedWord;
  onClose: () => void;
}) {
  const c = COLORS[hl.color] ?? COLORS.gold;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: "auto", marginTop: "0.65rem" }}
      exit={{   opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div
        style={{
          background: c.panelBg,
          border:     `1px solid ${c.border}30`,
          borderLeft: `2px solid ${c.border}`,
          borderRadius: "0 0.65rem 0.65rem 0",
          padding: "0.85rem 1rem 0.85rem 1rem",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.55rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={11} style={{ color: c.text, flexShrink: 0 }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: `${c.text}90`,
            }}>
              Notatka do słowa
            </span>
            {/* Highlighted word chip */}
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.82rem",
              fontStyle: "italic",
              color: c.text,
              background: c.bg,
              border: `1px solid ${c.border}40`,
              borderRadius: "999px",
              padding: "0 8px",
              lineHeight: "1.6",
            }}>
              {hl.word}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            type="button"
            aria-label="Zamknij notatkę"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: `${c.text}50`,
              padding: "2px",
              display: "flex", alignItems: "center",
              transition: "color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={e =>
              (e.currentTarget as HTMLButtonElement).style.color = c.text
            }
            onMouseLeave={e =>
              (e.currentTarget as HTMLButtonElement).style.color = `${c.text}50`
            }
          >
            <X size={13} />
          </button>
        </div>

        {/* Note text */}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.08rem",
          fontStyle: "italic",
          fontWeight: 300,
          color: "#f7cdd8",
          lineHeight: 1.65,
          textShadow: `0 0 20px ${c.glow}30`,
        }}>
          &ldquo;{hl.note}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   HIGHLIGHTED WORD — klikalne słowo w linii tekstu
───────────────────────────────────────────────────── */
function HighlightChip({
  word,
  hl,
  isActive,
  onClick,
}: {
  word:     string;
  hl:       HighlightedWord;
  isActive: boolean;
  onClick:  () => void;
}) {
  const c = COLORS[hl.color] ?? COLORS.gold;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      type="button"
      title={isActive ? "Zamknij notatkę" : `Notatka: kliknij aby przeczytać`}
      style={{
        display:     "inline",
        background:  isActive ? c.bg : "transparent",
        color:       c.text,
        textShadow:  isActive ? `0 0 16px ${c.glow}` : `0 0 10px ${c.glow}60`,
        border:      "none",
        borderBottom: `1.5px solid ${c.border}${isActive ? "cc" : "80"}`,
        cursor:       "pointer",
        fontFamily:   "inherit",
        fontSize:     "inherit",
        fontStyle:    "inherit",
        fontWeight:   isActive ? 600 : 500,
        lineHeight:   "inherit",
        padding:      "0 1px",
        borderRadius: "2px",
        transition:   "background 0.2s, text-shadow 0.2s, font-weight 0.1s, border-color 0.2s",
        // Pulsujący dot indicator gdy notatka istnieje
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = c.bg;
          (e.currentTarget as HTMLButtonElement).style.textShadow = `0 0 16px ${c.glow}`;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.textShadow = `0 0 10px ${c.glow}60`;
        }
      }}
    >
      {word}
      {/* Tiny dot wskaźnik notatki */}
      {!isActive && (
        <span
          aria-hidden
          style={{
            position:    "absolute",
            top:         "-3px",
            right:       "-3px",
            width:       "5px",
            height:      "5px",
            borderRadius: "50%",
            background:  c.text,
            boxShadow:   `0 0 6px ${c.glow}`,
            opacity:     0.8,
          }}
        />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────
   LYRIC LINE — cały wers z podświetleniami + panelami
───────────────────────────────────────────────────── */
interface LyricLineProps {
  line:       LyricLine;
  isActive:   boolean;
  onSeek:     () => void;
}

export function HighlightedLyricLine({ line, isActive, onSeek }: LyricLineProps) {
  // Który highlight jest aktualnie otwarty (indeks lub null)
  const [openHL, setOpenHL] = useState<number | null>(null);

  const toggleHL = (i: number) =>
    setOpenHL(prev => (prev === i ? null : i));

  /* Zbuduj części tekstu: plain text i podświetlone słowa */
  const parts = buildParts(line.text, line.highlighted ?? []);

  return (
    <div style={{ width: "100%" }}>
      {/* Tekst wersu */}
      <button
        onClick={onSeek}
        type="button"
        style={{
          background:   "none",
          border:       "none",
          cursor:       "pointer",
          textAlign:    "left",
          width:        "100%",
          fontFamily:   "'Cormorant Garamond', serif",
          fontSize:     "1.18rem",
          fontWeight:   isActive ? 500 : 300,
          lineHeight:   1.5,
          color:        isActive ? "#d4a853" : "#f7cdd8",
          textShadow:   isActive ? "0 0 20px rgba(212,168,83,0.35)" : "none",
          transition:   "color 0.3s, text-shadow 0.3s",
          padding:      0,
          display:      "block",
        }}
      >
        {parts.map((part, i) => {
          if (part.type === "text") {
            return <span key={i}>{part.value}</span>;
          }
          /* highlighted word */
          const hlIndex = part.hlIndex!;
          const hl      = (line.highlighted ?? [])[hlIndex];
          if (!hl) return <span key={i}>{part.value}</span>;

          return (
            <HighlightChip
              key={i}
              word={part.value}
              hl={hl}
              isActive={openHL === hlIndex}
              onClick={() => toggleHL(hlIndex)}
            />
          );
        })}
      </button>

      {/* Note panels — po jednym na każde podświetlone słowo */}
      <AnimatePresence initial={false}>
        {(line.highlighted ?? []).map((hl, i) =>
          openHL === i ? (
            <NotePanel
              key={i}
              hl={hl}
              onClose={() => setOpenHL(null)}
            />
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPER — podziel tekst na plain i highlighted parts
───────────────────────────────────────────────────── */
type Part =
  | { type: "text";    value: string; hlIndex?: undefined }
  | { type: "highlight"; value: string; hlIndex: number };

function buildParts(text: string, highlights: HighlightedWord[]): Part[] {
  if (!highlights.length) return [{ type: "text", value: text }];

  // Zbierz wszystkie trafienia (pozycja + długość + indeks hl)
  type Hit = { start: number; end: number; hlIndex: number };
  const hits: Hit[] = [];

  highlights.forEach((hl, hlIndex) => {
    if (!hl.word) return;
    const searchFrom = 0;
    const lower    = text.toLowerCase();
    const wordLow  = hl.word.toLowerCase();
    const idx      = lower.indexOf(wordLow, searchFrom);
    if (idx !== -1) {
      hits.push({ start: idx, end: idx + hl.word.length, hlIndex });
    }
  });

  // Posortuj po pozycji
  hits.sort((a, b) => a.start - b.start);

  // Zbuduj części
  const parts: Part[] = [];
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start > cursor) {
      parts.push({ type: "text", value: text.slice(cursor, hit.start) });
    }
    parts.push({
      type:    "highlight",
      value:   text.slice(hit.start, hit.end),
      hlIndex: hit.hlIndex,
    });
    cursor = hit.end;
  }

  if (cursor < text.length) {
    parts.push({ type: "text", value: text.slice(cursor) });
  }

  return parts;
}