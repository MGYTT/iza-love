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
        padding: "2rem 1.5rem 6rem",
        position: "relative",
      }}
    >
      {/* Central vertical line */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: 0,
        bottom: 0,
        width: "1px",
        transform: "translateX(-50%)",
        display: "none",
      }}
        className="md:block"
      >
        {/* Static faint line */}
        <div className="timeline-line" style={{ position: "absolute", inset: 0 }} />
        {/* Animated fill */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            scaleY: lineScaleY,
            transformOrigin: "top",
            background: "linear-gradient(to bottom, rgba(212,168,83,0.6), rgba(240,160,184,0.4))",
          }}
        />
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {songs.map((song, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div
              key={song.slug}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              {/* Left slot */}
              <div style={{ display: isLeft ? "block" : "block" }}>
                {isLeft ? (
                  <SongCard song={song} index={i} />
                ) : (
                  /* Spacer with date on right side */
                  <div style={{
                    textAlign: "right",
                    padding: "0 1rem",
                  }}>
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

              {/* Center dot */}
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #d4a853, rgba(212,168,83,0.4))",
                boxShadow: "0 0 12px rgba(212,168,83,0.5), 0 0 24px rgba(212,168,83,0.2)",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
              }}>
                {/* Pulse ring */}
                <div style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  border: "1px solid rgba(212,168,83,0.2)",
                  animation: "pulseSoft 3s ease-in-out infinite",
                }} />
              </div>

              {/* Right slot */}
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
          );
        })}
      </div>
    </section>
  );
}