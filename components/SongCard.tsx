"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, Play } from "lucide-react";
import { Song } from "@/lib/types";

interface Props {
  song: Song;
  index: number;
}

export default function SongCard({ song, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link href={`/song/${song.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="glass"
          style={{
            padding: "1.25rem",
            cursor: "pointer",
            transition: "box-shadow 0.4s ease, border-color 0.4s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              "0 12px 48px rgba(240,100,140,0.15), 0 4px 16px rgba(0,0,0,0.5)";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(240,160,184,0.25)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "";
            (e.currentTarget as HTMLDivElement).style.borderColor =
              "rgba(240,160,184,0.12)";
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>

            {/* Cover with play overlay */}
            <div style={{
              position: "relative",
              width: "80px",
              height: "80px",
              flexShrink: 0,
              borderRadius: "0.75rem",
              overflow: "hidden",
            }}>
              <Image
                src={song.coverUrl}
                alt={`${song.title} okładka`}
                fill
                className="object-cover"
                sizes="80px"
              />
              {/* Play overlay on hover */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.3s",
                borderRadius: "inherit",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"}
              >
                <Play size={20} fill="white" color="white" />
              </div>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Date badge */}
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(212,168,83,0.7)",
                display: "block",
                marginBottom: "0.35rem",
              }}>
                {song.memoryDate}
              </span>

              {/* Title */}
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.35rem",
                fontWeight: 400,
                color: "#f7cdd8",
                lineHeight: 1.15,
                marginBottom: "0.25rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {song.title}
              </h3>

              {/* Artist */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem",
                color: "rgba(240,160,184,0.5)",
                marginBottom: "0.5rem",
              }}>
                {song.artist}
              </p>

              {/* Description */}
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8rem",
                color: "rgba(154,96,112,0.9)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {song.shortDescription}
              </p>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid rgba(240,160,184,0.07)",
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.7rem",
              color: "rgba(240,160,184,0.3)",
              letterSpacing: "0.08em",
            }}>
              Otwórz ten rozdział →
            </span>
            <Heart
              size={13}
              fill="rgba(240,100,140,0.4)"
              color="rgba(240,100,140,0.4)"
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}