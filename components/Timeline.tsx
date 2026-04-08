"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SongCard from "./SongCard";
import { Song } from "@/lib/types";

export default function Timeline({ songs }: { songs: Song[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 20%"] });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem 1rem 6rem",
        position: "relative",
      }}
    >
      {/* ── Linia pionowa — tylko desktop ── */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: "1px",
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}>
        {/* Statyczna linia tła */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.15) 10%, rgba(212,168,83,0.15) 90%, transparent)",
        }} />
        {/* Animowana linia postępu */}
        <motion.div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          scaleY: lineScaleY,
          transformOrigin: "top",
          background: "linear-gradient(to bottom, rgba(212,168,83,0.6), rgba(240,160,184,0.4))",
          height: "100%",
        }} />
      </div>

      {/* ── Karty ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {songs.map((song, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={song.slug}>

              {/* ════════════════════════════
                  MOBILE — pojedyncza kolumna
              ════════════════════════════ */}
              <div className="timeline-mobile">
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                }}>
                  {/* Linia + dot po lewej */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                    paddingTop: "1.5rem",
                  }}>
                    {/* Górna kreska */}
                    {i > 0 && (
                      <div style={{
                        width: "1px",
                        height: "1rem",
                        background: "rgba(212,168,83,0.2)",
                        marginBottom: "4px",
                      }} />
                    )}
                    {/* Dot */}
                    <div style={{
                      width: "10px", height: "10px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #d4a853, rgba(212,168,83,0.4))",
                      boxShadow: "0 0 10px rgba(212,168,83,0.5)",
                      flexShrink: 0,
                      position: "relative",
                    }}>
                      <div style={{
                        position: "absolute", inset: "-3px",
                        borderRadius: "50%",
                        border: "1px solid rgba(212,168,83,0.2)",
                        animation: "pulseSoft 3s ease-in-out infinite",
                      }} />
                    </div>
                    {/* Dolna kreska */}
                    <div style={{
                      width: "1px",
                      flex: 1,
                      minHeight: "2rem",
                      background: "rgba(212,168,83,0.1)",
                      marginTop: "4px",
                    }} />
                  </div>

                  {/* Karta — pełna szerokość */}
                  <div style={{ flex: 1, minWidth: 0, paddingBottom: "0.5rem" }}>
                    {/* Data nad kartą */}
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.75rem",
                      fontStyle: "italic",
                      color: "rgba(212,168,83,0.5)",
                      marginBottom: "0.4rem",
                      paddingLeft: "0.1rem",
                    }}>
                      {song.memoryDate}
                    </div>
                    <SongCard song={song} index={i} />
                  </div>
                </div>
              </div>

              {/* ════════════════════════════
                  DESKTOP — naprzemienne kolumny
              ════════════════════════════ */}
              <div
                className="timeline-desktop"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                {/* Lewa kolumna */}
                <div>
                  {isLeft ? (
                    <SongCard song={song} index={i} />
                  ) : (
                    <div style={{ textAlign: "right", padding: "0 1rem" }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                        color: "rgba(212,168,83,0.4)",
                      }}>
                        {song.memoryDate}
                      </span>
                    </div>
                  )}
                </div>

                {/* Środkowy dot */}
                <div style={{
                  width: "12px", height: "12px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #d4a853, rgba(212,168,83,0.4))",
                  boxShadow: "0 0 12px rgba(212,168,83,0.5), 0 0 24px rgba(212,168,83,0.2)",
                  flexShrink: 0,
                  position: "relative",
                  zIndex: 1,
                }}>
                  <div style={{
                    position: "absolute", inset: "-4px",
                    borderRadius: "50%",
                    border: "1px solid rgba(212,168,83,0.2)",
                    animation: "pulseSoft 3s ease-in-out infinite",
                  }} />
                </div>

                {/* Prawa kolumna */}
                <div>
                  {!isLeft ? (
                    <SongCard song={song} index={i} />
                  ) : (
                    <div style={{ padding: "0 1rem" }}>
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                        color: "rgba(212,168,83,0.4)",
                      }}>
                        {song.memoryDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      <style>{`
        /* Mobile: pokaż wersję mobilną, ukryj desktop */
        .timeline-mobile  { display: block; }
        .timeline-desktop { display: none;  }

        /* Desktop (≥768px): odwróć */
        @media (min-width: 768px) {
          .timeline-mobile  { display: none;  }
          .timeline-desktop { display: grid;  }
        }

        @keyframes pulseSoft {
          0%, 100% { opacity: 0.3; transform: scale(1);    }
          50%       { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </section>
  );
}