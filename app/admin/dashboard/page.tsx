"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, ExternalLink, Music2, LogOut, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { getAllSongs, deleteSong } from "@/lib/songs-db";
import type { Song } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [authed,  setAuthed]  = useState(false);
  const [songs,   setSongs]   = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch z Supabase ── */
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllSongs();
      setSongs(data);
    } catch (e) {
      toast.error("Błąd ładowania piosenek");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Auth guard ── */
  useEffect(() => {
    if (sessionStorage.getItem("admin-auth") !== "true") {
      router.replace("/admin");
      return;
    }
    setAuthed(true);
    fetchSongs();
  }, [router, fetchSongs]);

  /* ── Loading screen ── */
  if (!authed) return null;

  /* ── Remove handler ── */
  const handleRemove = async (slug: string, title: string) => {
    if (!confirm(`Usunąć „${title}"?`)) return;
    // Optimistic UI — usuń lokalnie natychmiast
    setSongs(prev => prev.filter(s => s.slug !== slug));
    try {
      await deleteSong(slug);
      toast.success(`Usunięto: ${title}`);
    } catch {
      toast.error("Błąd usuwania — odświeżam listę");
      fetchSongs(); // rollback
    }
  };

  const totalHighlights = songs.reduce(
    (acc, s) => acc + s.lyrics.reduce((a, l) => a + (l.highlighted?.length ?? 0), 0),
    0
  );

  return (
    <main style={{ maxWidth: "920px", margin: "0 auto", padding: "2.5rem 1.5rem 7rem" }}>

      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1,
        background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(212,168,83,0.06), transparent)",
      }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem", flexWrap: "wrap" }}
      >
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.7rem, 4vw, 2.2rem)", fontWeight: 300, color: "#f7cdd8", lineHeight: 1.1 }}>
            Panel Twórcy
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "rgba(240,160,184,0.35)", marginTop: "5px" }}>
            {loading ? "Ładuję…" : (
              <>
                {songs.length}{" "}
                {songs.length === 1 ? "piosenka" : songs.length < 5 ? "piosenki" : "piosenek"}
                {" "}· {totalHighlights} oznaczeń
                {" "}·{" "}
                <span style={{ color: "rgba(100,220,130,0.5)", fontSize: "0.68rem" }}>
                  ● Supabase
                </span>
              </>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button onClick={fetchSongs} style={ghostBtn} title="Odśwież" aria-label="Odśwież listę">
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={ghostBtn}><ExternalLink size={13} /> Podgląd</button>
          </Link>
          <Link href="/admin/add" style={{ textDecoration: "none" }}>
            <button style={primaryBtn}><Plus size={13} /> Dodaj piosenkę</button>
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem("admin-auth"); router.push("/admin"); }}
            style={ghostBtn} aria-label="Wyloguj" title="Wyloguj"
          >
            <LogOut size={13} />
          </button>
        </div>
      </motion.div>

      {/* ── Songs list ── */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          /* Skeleton */
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            {[1, 2, 3].map(n => (
              <div key={n} style={{ height: "74px", borderRadius: "1rem", background: "rgba(240,160,184,0.04)", border: "1px solid rgba(240,160,184,0.06)", animation: `shimmerBg 1.8s ease-in-out ${n * 0.15}s infinite` }} />
            ))}
          </motion.div>
        ) : songs.length === 0 ? (
          <motion.div
            key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "5rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}
          >
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(240,160,184,0.05)", border: "1px solid rgba(240,160,184,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Music2 size={20} style={{ color: "rgba(240,160,184,0.2)" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.2rem", color: "rgba(240,160,184,0.25)" }}>
              Brak piosenek. Dodaj pierwszą! ♥
            </p>
            <Link href="/admin/add" style={{ textDecoration: "none" }}>
              <button style={{ ...primaryBtn, padding: "0.7rem 1.4rem", fontSize: "0.85rem" }}>
                <Plus size={14} /> Dodaj pierwszą piosenkę
              </button>
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {songs.map((song, i) => {
              const highlights = song.lyrics.reduce((acc, l) => acc + (l.highlighted?.length ?? 0), 0);
              return (
                <motion.div
                  key={song.slug} layout
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, scale: 0.97 }}
                  transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: "rgba(22,8,14,0.7)", border: "1px solid rgba(240,160,184,0.09)", borderRadius: "1rem", padding: "0.9rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.18)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(240,160,184,0.09)"}
                >
                  {/* Cover */}
                  <div style={{ width: "52px", height: "52px", borderRadius: "0.55rem", overflow: "hidden", flexShrink: 0, position: "relative", background: "rgba(212,168,83,0.08)" }}>
                    {song.coverUrl ? (
                      <Image src={song.coverUrl} alt={song.title} fill className="object-cover" sizes="52px" unoptimized />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Music2 size={18} style={{ color: "rgba(212,168,83,0.3)" }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#f7cdd8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {song.title}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.73rem", color: "rgba(240,160,184,0.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {song.artist}{song.memoryDate ? ` · ${song.memoryDate}` : ""}
                    </p>
                  </div>

                  {/* Badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "3px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.67rem", color: "rgba(240,160,184,0.22)" }}>
                      <Music2 size={11} />{song.lyrics.length}
                    </div>
                    {highlights > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.18)", borderRadius: "999px", padding: "1px 6px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", color: "rgba(212,168,83,0.7)" }}>
                        <Sparkles size={9} />{highlights}
                      </div>
                    )}
                    {song.previewUrl && (
                      <div style={{ background: "rgba(100,220,130,0.07)", border: "1px solid rgba(100,220,130,0.12)", borderRadius: "999px", padding: "1px 6px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", color: "rgba(100,220,130,0.5)" }}>
                        ▶ 30s
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    <Link href={`/admin/edit/${song.slug}`} style={{ textDecoration: "none" }}>
                      <button style={smallGhostBtn} title="Edytuj">Edytuj</button>
                    </Link>
                    <Link href={`/song/${song.slug}`} target="_blank" style={{ textDecoration: "none" }}>
                      <button style={smallGhostBtn} title="Podgląd" aria-label="Podgląd"><ExternalLink size={11} /></button>
                    </Link>
                    <button
                      onClick={() => handleRemove(song.slug, song.title)}
                      style={{ ...smallGhostBtn, color: "rgba(240,100,100,0.4)" }}
                      title="Usuń" aria-label="Usuń piosenkę"
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.75)"}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,100,100,0.4)"}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmerBg{0%,100%{opacity:.5}50%{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

/* ── Styles ── */
const base: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", borderRadius: "0.6rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s", border: "none", whiteSpace: "nowrap" };
const primaryBtn: React.CSSProperties = { ...base, background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.85))", color: "#100508", fontWeight: 500 };
const ghostBtn: React.CSSProperties = { ...base, background: "rgba(42,16,25,0.6)", border: "1px solid rgba(240,160,184,0.13)", color: "rgba(240,160,184,0.55)" };
const smallGhostBtn: React.CSSProperties = { ...ghostBtn, padding: "0.35rem 0.55rem", fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.3rem" };