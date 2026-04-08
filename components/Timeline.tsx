"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SongCard from "./SongCard";
import { Song } from "@/lib/types";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export default function Timeline({ songs }: { songs: Song[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
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
      {/* Linia pionowa — tylko desktop */}
      {!isMobile && (
        <div style={{
          position: "absolute", left: "50%", top: 0, bottom: 0,
          width: "1px", transform: "translateX(-50%)", pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.15) 10%, rgba(212,168,83,0.15) 90%, transparent)",
          }} />
          <motion.div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "100%",
            scaleY: lineScaleY, transformOrigin: "top",
            background: "linear-gradient(to bottom, rgba(212,168,83,0.6), rgba(240,160,184,0.4))",
          }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {songs.map((song, i) => {
          const isLeft = i % 2 === 0;

          /* ══ MOBILE ══ */
          if (isMobile) {
            return (
              <div key={song.slug} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                {/* Linia + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: "1.4rem" }}>
                  {i > 0 && <div style={{ width: "1px", height: "0.75rem", background: "rgba(212,168,83,0.2)", marginBottom: "3px" }} />}
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "radial-gradient(circle, #d4a853, rgba(212,168,83,0.4))", boxShadow: "0 0 10px rgba(212,168,83,0.5)", flexShrink: 0, position: "relative" }}>
                    <div style={{ position: "absolute", inset: "-3px", borderRadius: "50%", border: "1px solid rgba(212,168,83,0.2)", animation: "pulseSoft 3s ease-in-out infinite" }} />
                  </div>
                  <div style={{ width: "1px", flex: 1, minHeight: "2rem", background: "rgba(212,168,83,0.1)", marginTop: "3px" }} />
                </div>

                {/* Karta pełna szerokość */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: "0.5rem" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.75rem", fontStyle: "italic", color: "rgba(212,168,83,0.5)", marginBottom: "0.4rem" }}>
                    {song.memoryDate}
                  </div>
                  <SongCard song={song} index={i} />
                </div>
              </div>
            );
          }

          /* ══ DESKTOP ══ */
          return (
            <div
              key={song.slug}
              style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "1.5rem" }}
            >
              {/* Lewa kolumna */}
              <div>
                {isLeft ? (
                  <SongCard song={song} index={i} />
                ) : (
                  <div style={{ textAlign: "right", padding: "0 1rem" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontStyle: "italic", color: "rgba(212,168,83,0.4)" }}>
                      {song.memoryDate}
                    </span>
                  </div>
                )}
              </div>

              {/* Dot */}
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "radial-gradient(circle, #d4a853, rgba(212,168,83,0.4))", boxShadow: "0 0 12px rgba(212,168,83,0.5), 0 0 24px rgba(212,168,83,0.2)", flexShrink: 0, position: "relative", zIndex: 1 }}>
                <div style={{ position: "absolute", inset: "-4px", borderRadius: "50%", border: "1px solid rgba(212,168,83,0.2)", animation: "pulseSoft 3s ease-in-out infinite" }} />
              </div>

              {/* Prawa kolumna */}
              <div>
                {!isLeft ? (
                  <SongCard song={song} index={i} />
                ) : (
                  <div style={{ padding: "0 1rem" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", fontStyle: "italic", color: "rgba(212,168,83,0.4)" }}>
                      {song.memoryDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.3; transform: scale(1);    }
          50%       { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </section>
  );
}