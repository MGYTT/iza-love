"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus, Trash2, ExternalLink, Music2,
  LogOut, Sparkles, RefreshCw, Edit3,
  BarChart2, Clock, Heart,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getAllSongs, deleteSong } from "@/lib/songs-db";
import type { Song } from "@/lib/types";

/* ─────────────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────────────── */
const base: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  padding: "0.5rem 0.9rem", borderRadius: "0.65rem",
  fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
  cursor: "pointer", transition: "all 0.2s ease",
  border: "none", whiteSpace: "nowrap",
};
const primaryBtn: React.CSSProperties = {
  ...base,
  background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.9))",
  color: "#100508", fontWeight: 600,
  boxShadow: "0 2px 16px rgba(212,168,83,0.25)",
};
const ghostBtn: React.CSSProperties = {
  ...base,
  background: "rgba(30,10,18,0.6)",
  border: "1px solid rgba(240,160,184,0.12)",
  color: "rgba(240,160,184,0.5)",
};
const smallGhost: React.CSSProperties = {
  ...ghostBtn, padding: "0.35rem 0.6rem", fontSize: "0.7rem",
};
const dangerGhost: React.CSSProperties = {
  ...smallGhost, color: "rgba(240,90,90,0.4)",
  border: "1px solid rgba(240,90,90,0.1)",
};

/* ─────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────── */
function StatCard({
  label, value, icon, delay = 0,
}: {
  label: string; value: React.ReactNode;
  icon: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: "1 1 120px",
        background: "rgba(18,6,12,0.7)",
        border: "1px solid rgba(240,160,184,0.09)",
        borderRadius: "1rem",
        padding: "1.1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ color: "rgba(212,168,83,0.55)", display: "flex" }}>{icon}</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.8rem", fontWeight: 400,
        color: "#d4a853", lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.62rem", letterSpacing: "0.14em",
        textTransform: "uppercase", color: "rgba(240,160,184,0.3)",
      }}>
        {label}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   SKELETON ROW
───────────────────────────────────────────────────── */
function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div style={{
      height: "76px", borderRadius: "1rem",
      background: "rgba(240,160,184,0.03)",
      border: "1px solid rgba(240,160,184,0.06)",
      animationDelay: `${delay}s`,
      animation: "skeletonPulse 1.8s ease-in-out infinite",
    }} />
  );
}

/* ─────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        textAlign: "center", padding: "5rem 2rem",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "1.25rem",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          width: "58px", height: "58px", borderRadius: "50%",
          background: "rgba(240,160,184,0.05)",
          border: "1px solid rgba(240,160,184,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Music2 size={22} style={{ color: "rgba(240,160,184,0.2)" }} />
      </motion.div>
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic", fontSize: "1.25rem",
        color: "rgba(240,160,184,0.25)",
      }}>
        Brak piosenek — dodaj pierwszą ♥
      </p>
      <Link href="/admin/add" style={{ textDecoration: "none" }}>
        <button
          style={{ ...primaryBtn, padding: "0.7rem 1.5rem", fontSize: "0.85rem" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            (e.currentTarget as HTMLButtonElement).style.transform = "none";
          }}
        >
          <Plus size={15} /> Dodaj pierwszą piosenkę
        </button>
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   SONG ROW
───────────────────────────────────────────────────── */
function SongRow({
  song, index, onRemove,
}: {
  song: Song; index: number; onRemove: (slug: string, title: string) => void;
}) {
  const highlights = song.lyrics.reduce(
    (acc, l) => acc + (l.highlighted?.length ?? 0), 0
  );
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ delay: index * 0.045, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(28,10,18,0.85)" : "rgba(18,6,12,0.7)",
        border: `1px solid ${hovered ? "rgba(240,160,184,0.18)" : "rgba(240,160,184,0.08)"}`,
        borderRadius: "1rem",
        padding: "0.85rem 1.1rem",
        display: "flex", alignItems: "center", gap: "1rem",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Cover */}
      <div style={{
        width: "52px", height: "52px", borderRadius: "0.6rem",
        overflow: "hidden", flexShrink: 0, position: "relative",
        background: "rgba(212,168,83,0.07)",
        border: "1px solid rgba(212,168,83,0.12)",
      }}>
        {song.coverUrl ? (
          <Image
            src={song.coverUrl} alt={song.title}
            fill sizes="52px" unoptimized
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Music2 size={18} style={{ color: "rgba(212,168,83,0.3)" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.08rem", color: "#f7cdd8",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: "3px",
        }}>
          {song.title}
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.72rem", color: "rgba(240,160,184,0.36)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          {song.artist}
          {song.memoryDate && (
            <>
              <span style={{ opacity: 0.4 }}>·</span>
              <Clock size={9} style={{ opacity: 0.5, flexShrink: 0 }} />
              {song.memoryDate}
            </>
          )}
        </p>
      </div>

      {/* Badges */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.45rem",
        flexShrink: 0,
      }}>
        {/* Lyrics count */}
        <div style={{
          display: "flex", alignItems: "center", gap: "3px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.65rem", color: "rgba(240,160,184,0.22)",
        }}>
          <Music2 size={10} />
          {song.lyrics.length}
        </div>

        {/* Highlights badge */}
        {highlights > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: "3px",
            background: "rgba(212,168,83,0.08)",
            border: "1px solid rgba(212,168,83,0.2)",
            borderRadius: "999px", padding: "2px 7px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.62rem", color: "rgba(212,168,83,0.75)",
          }}>
            <Sparkles size={9} />{highlights}
          </div>
        )}

        {/* Audio badge */}
        {song.previewUrl && (
          <div style={{
            background: "rgba(100,220,130,0.06)",
            border: "1px solid rgba(100,220,130,0.14)",
            borderRadius: "999px", padding: "2px 7px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.62rem", color: "rgba(100,220,130,0.55)",
          }}>
            ▶ audio
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
        <Link href={`/admin/edit/${song.slug}`} style={{ textDecoration: "none" }}>
          <button
            style={smallGhost}
            title="Edytuj"
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.28)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.5)";
            }}
          >
            <Edit3 size={11} />
            <span style={{ fontSize: "0.68rem" }}>Edytuj</span>
          </button>
        </Link>

        <Link href={`/song/${song.slug}`} target="_blank" rel="noopener" style={{ textDecoration: "none" }}>
          <button
            style={smallGhost}
            title="Podgląd"
            aria-label="Podgląd piosenki"
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.28)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.5)";
            }}
          >
            <ExternalLink size={11} />
          </button>
        </Link>

        <button
          onClick={() => onRemove(song.slug, song.title)}
          style={dangerGhost}
          title="Usuń" aria-label="Usuń piosenkę"
          onMouseEnter={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = "rgba(240,90,90,0.9)";
            b.style.borderColor = "rgba(240,90,90,0.3)";
            b.style.background = "rgba(240,90,90,0.08)";
          }}
          onMouseLeave={e => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = "rgba(240,90,90,0.4)";
            b.style.borderColor = "rgba(240,90,90,0.1)";
            b.style.background = ghostBtn.background as string;
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const [authed,  setAuthed]  = useState(false);
  const [songs,   setSongs]   = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const fetchSongs = useCallback(async (showSpinner = false) => {
    setLoading(true);
    if (showSpinner) setSpinning(true);
    try {
      const data = await getAllSongs();
      setSongs(data);
    } catch (e) {
      toast.error("Błąd ładowania piosenek");
      console.error(e);
    } finally {
      setLoading(false);
      if (showSpinner) setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
      return;
    }
    setAuthed(true);
    fetchSongs();
  }, [router, fetchSongs]);

  const handleRemove = async (slug: string, title: string) => {
    if (!confirm(`Usunąć „${title}"?`)) return;
    setSongs(prev => prev.filter(s => s.slug !== slug));
    try {
      await deleteSong(slug);
      toast.success(`Usunięto: ${title}`);
    } catch {
      toast.error("Błąd usuwania — przywracam listę");
      fetchSongs();
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin-auth");
    router.push("/admin");
  };

  if (!authed) return null;

  const sorted = [...songs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const totalHighlights = songs.reduce(
    (acc, s) => acc + s.lyrics.reduce((a, l) => a + (l.highlighted?.length ?? 0), 0), 0
  );
  const withAudio = songs.filter(s => s.previewUrl).length;

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem 7rem" }}>

      {/* Ambient bg */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1,
        background: "radial-gradient(ellipse 60% 25% at 50% 0%, rgba(212,168,83,0.06), transparent)",
      }} />

      {/* ══ HEADER ══ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "2rem", gap: "1rem", flexWrap: "wrap",
        }}
      >
        {/* Title */}
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: "0.6rem",
            marginBottom: "0.35rem",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(212,168,83,0.1)",
              border: "1px solid rgba(212,168,83,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Heart size={12} fill="rgba(212,168,83,0.7)" style={{ color: "rgba(212,168,83,0.7)" }} />
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
              fontWeight: 300, color: "#f7cdd8", lineHeight: 1,
            }}>
              Panel Twórcy
            </h1>
          </div>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(240,160,184,0.3)",
            paddingLeft: "2.4rem",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{
              display: "inline-block", width: "6px", height: "6px",
              borderRadius: "50%", background: "rgba(100,220,130,0.6)",
              boxShadow: "0 0 6px rgba(100,220,130,0.4)",
              flexShrink: 0,
            }} />
            Supabase połączony
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => fetchSongs(true)}
            style={ghostBtn}
            title="Odśwież"
            aria-label="Odśwież listę"
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.28)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.5)";
            }}
          >
            <RefreshCw
              size={13}
              style={{ transition: "transform 0.6s", transform: spinning ? "rotate(360deg)" : "none" }}
            />
          </button>
<Link href="/admin/notifications" style={{ textDecoration: "none" }}>
  <button style={ghostBtn}>
    <Bell size={13} /> Powiadomienia
  </button>
</Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button
              style={ghostBtn}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.28)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.85)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.5)";
              }}
            >
              <ExternalLink size={13} /> Podgląd
            </button>
          </Link>

          <Link href="/admin/add" style={{ textDecoration: "none" }}>
            <button
              style={primaryBtn}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 22px rgba(212,168,83,0.35)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(212,168,83,0.25)";
              }}
            >
              <Plus size={14} /> Dodaj piosenkę
            </button>
          </Link>

          <button
            onClick={handleLogout}
            style={ghostBtn}
            aria-label="Wyloguj" title="Wyloguj"
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,90,90,0.3)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,90,90,0.7)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.5)";
            }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </motion.div>

      {/* ══ STATS ROW ══ */}
      <AnimatePresence>
        {!loading && songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex", gap: "0.75rem",
              marginBottom: "2rem", flexWrap: "wrap",
            }}
          >
            <StatCard
              label="Piosenek"
              value={songs.length}
              icon={<Music2 size={14} />}
              delay={0}
            />
            <StatCard
              label="Oznaczeń"
              value={totalHighlights}
              icon={<Sparkles size={14} />}
              delay={0.06}
            />
            <StatCard
              label="Z audio"
              value={withAudio}
              icon={<BarChart2 size={14} />}
              delay={0.12}
            />
            <StatCard
              label="Rozdziałów"
              value={songs.reduce((a, s) => a + s.lyrics.length, 0)}
              icon={<Music2 size={14} />}
              delay={0.18}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ SECTION LABEL ══ */}
      {!loading && songs.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: "flex", alignItems: "center",
            gap: "0.75rem", marginBottom: "0.85rem",
          }}
        >
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.62rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(240,160,184,0.25)",
          }}>
            Chronologicznie
          </span>
          <div style={{
            flex: 1, height: "1px",
            background: "rgba(240,160,184,0.06)",
          }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.62rem", color: "rgba(240,160,184,0.2)",
          }}>
            {songs.length} {songs.length === 1 ? "piosenka" : songs.length < 5 ? "piosenki" : "piosenek"}
          </span>
        </motion.div>
      )}

      {/* ══ SONG LIST ══ */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {[0, 1, 2, 3].map(n => <SkeletonRow key={n} delay={n * 0.12} />)}
          </motion.div>
        ) : songs.length === 0 ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key="list"
            style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}
          >
            {sorted.map((song, i) => (
              <SongRow
                key={song.slug}
                song={song}
                index={i}
                onRemove={handleRemove}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9;  }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}