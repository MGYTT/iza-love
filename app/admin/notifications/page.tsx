"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellOff, Send, Clock, Heart, ArrowLeft,
  Sparkles, Check, Moon, Sun, Music, Star, Calendar, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/* ── Szablony pogrupowane ── */
const TEMPLATE_GROUPS = [
  {
    group: "Poranek",
    icon: Sun,
    color: "rgba(212,168,83,0.8)",
    items: [
      { emoji: "🌅", label: "Dzień dobry",    title: "Dzień dobry, Izo ♥",          body: "Mam nadzieję że śnił Ci się piękny sen. Myślę o Tobie od rana 🌙" },
      { emoji: "☕", label: "Kawa dla Ciebie", title: "Czas na kawę ♥",              body: "Wyobraź sobie że siedzę obok Ciebie i piję kawę razem z Tobą ☕" },
    ],
  },
  {
    group: "Wieczór",
    icon: Moon,
    color: "rgba(160,140,220,0.8)",
    items: [
      { emoji: "🌙", label: "Dobranoc",        title: "Dobranoc, kochanie 🌙",       body: "Słodkich snów. Kocham Cię najbardziej na świecie ♥" },
      { emoji: "⭐", label: "Myśl wieczorna",  title: "Przed snem... ♥",             body: "Ostatnia myśl dnia? Ty. Zawsze Ty 🥹" },
    ],
  },
  {
    group: "Miłość",
    icon: Heart,
    color: "rgba(240,100,140,0.8)",
    items: [
      { emoji: "💭", label: "Myślę o Tobie",   title: "Właśnie o Tobie myślę ♥",    body: "I nie mogę przestać... bo jesteś najpiękniejszą osobą w moim życiu" },
      { emoji: "🌸", label: "Komplement",       title: "Wiesz co? ♥",               body: "Jesteś absolutnie najpiękniejszą osobą na świecie 🌸" },
      { emoji: "🥂", label: "Rocznica",         title: "Pamiętasz ten dzień? ♥",    body: "Dziś mija kolejny miesiąc razem. Każda chwila z Tobą jest cudowna" },
    ],
  },
  {
    group: "Muzyka",
    icon: Music,
    color: "rgba(100,200,200,0.8)",
    items: [
      { emoji: "🎵", label: "Nowa piosenka",   title: "Mam coś dla Ciebie ♥",      body: "Wstawiłem nową piosenkę do naszej historii. Posłuchaj i wróć do tamtej chwili 🎵" },
      { emoji: "🎶", label: "Posłuchaj",        title: "Ta piosenka = Ty ♥",        body: "Słucham jej i myślę tylko o Tobie. Sprawdź naszą oś czasu 🎶" },
    ],
  },
];

const ALL_TEMPLATES = TEMPLATE_GROUPS.flatMap(g => g.items);

function urlBase64ToUint8Array(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(12,4,8,0.9)",
  border: "1px solid rgba(240,160,184,0.1)",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "0.85rem",
  color: "#f7cdd8",
  outline: "none",
  transition: "border-color 0.25s, box-shadow 0.25s",
};

export default function NotificationsPage() {
  const [title,        setTitle]        = useState("");
  const [body,         setBody]         = useState("");
  const [url,          setUrl]          = useState("/");
  const [mode,         setMode]         = useState<"now" | "schedule">("now");
  const [dateVal,      setDateVal]      = useState("");
  const [timeVal,      setTimeVal]      = useState("");
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [activeGroup,  setActiveGroup]  = useState(0);
  const [sentCount,    setSentCount]    = useState<number | null>(null);

  const previewTitle = title.trim() || "Tytuł powiadomienia ♥";
  const previewBody  = body.trim()  || "Treść wiadomości pojawi się tutaj...";
  const titleLen     = title.length;
  const bodyLen      = body.length;

  const applyTemplate = (t: typeof ALL_TEMPLATES[0]) => {
    setTitle(t.title);
    setBody(t.body);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Wpisz tytuł i treść powiadomienia");
      return;
    }
    let scheduledFor: string | undefined;
    if (mode === "schedule") {
      if (!dateVal || !timeVal) { toast.error("Wybierz datę i godzinę"); return; }
      scheduledFor = new Date(`${dateVal}T${timeVal}:00`).toISOString();
    }
    setSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}`,
        },
        body: JSON.stringify({ title, body, url, scheduledFor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      setSentCount(data.sent ?? null);
      if (scheduledFor) {
        toast.success(`Zaplanowano na ${dateVal} o ${timeVal} ♥`);
      } else {
        toast.success(`Wysłano ♥`);
      }
      setTimeout(() => {
        setSent(false); setSentCount(null);
        setTitle(""); setBody(""); setUrl("/");
        setDateVal(""); setTimeVal(""); setMode("now");
      }, 3000);
    } catch (e) {
      toast.error("Błąd wysyłki");
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <main style={{ minHeight: "100dvh", maxWidth: "780px", margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

      {/* Ambient */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1,
        background: `
          radial-gradient(ellipse 60% 30% at 50% 0%, rgba(212,168,83,0.07), transparent),
          radial-gradient(ellipse 40% 40% at 80% 60%, rgba(240,100,140,0.04), transparent)
        `,
      }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "2.5rem" }}
      >
        <Link href="/admin/dashboard" style={{
          textDecoration: "none", display: "inline-flex", alignItems: "center",
          gap: "6px", color: "rgba(240,160,184,0.3)", fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.7rem", marginBottom: "1.5rem",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.7)"}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,160,184,0.3)"}
        >
          <ArrowLeft size={11} /> Panel admina
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px", flexShrink: 0,
            background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(240,160,184,0.1))",
            border: "1px solid rgba(212,168,83,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={18} style={{ color: "rgba(212,168,83,0.85)" }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.7rem, 4vw, 2.2rem)",
              fontWeight: 300, color: "#f7cdd8", lineHeight: 1.1,
            }}>
              Powiadomienia dla Izy
            </h1>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.7rem", color: "rgba(240,160,184,0.3)", marginTop: "3px",
            }}>
              Wyślij czułą wiadomość teraz lub zaplanuj ją na idealny moment
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Układ dwukolumnowy ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr) 280px",
        gap: "2rem",
        alignItems: "start",
      }}>

        {/* ════ LEWA — formularz ════ */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >

          {/* ── Szablony ── */}
          <section style={{ marginBottom: "1.75rem" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "rgba(240,160,184,0.3)", marginBottom: "0.75rem",
            }}>
              Szybkie szablony
            </p>

            {/* Tabs grup */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              {TEMPLATE_GROUPS.map((g, i) => {
                const Icon = g.icon;
                const active = activeGroup === i;
                return (
                  <button
                    key={g.group}
                    onClick={() => setActiveGroup(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "0.3rem 0.8rem",
                      background: active ? "rgba(212,168,83,0.1)" : "transparent",
                      border: `1px solid ${active ? "rgba(212,168,83,0.3)" : "rgba(240,160,184,0.08)"}`,
                      borderRadius: "999px",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
                      color: active ? g.color : "rgba(240,160,184,0.3)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <Icon size={10} />
                    {g.group}
                  </button>
                );
              })}
            </div>

            {/* Karty szablonów */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroup}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
              >
                {TEMPLATE_GROUPS[activeGroup].items.map(t => (
                  <button
                    key={t.label}
                    onClick={() => applyTemplate(t)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "0.75rem",
                      padding: "0.65rem 0.9rem",
                      background: "rgba(14,5,10,0.7)",
                      border: "1px solid rgba(240,160,184,0.08)",
                      borderRadius: "0.75rem",
                      cursor: "pointer", transition: "all 0.2s",
                      textAlign: "left", width: "100%",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,83,0.22)";
                      (e.currentTarget as HTMLButtonElement).style.background   = "rgba(212,168,83,0.05)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.background   = "rgba(14,5,10,0.7)";
                    }}
                  >
                    <span style={{ fontSize: "1rem", lineHeight: 1.4 }}>{t.emoji}</span>
                    <div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem",
                        fontWeight: 500, color: "rgba(247,205,216,0.75)", marginBottom: "2px",
                      }}>
                        {t.title}
                      </div>
                      <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem",
                        color: "rgba(240,160,184,0.35)", lineHeight: 1.4,
                      }}>
                        {t.body.length > 55 ? t.body.slice(0, 55) + "…" : t.body}
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* ── Tytuł ── */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
              <label style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.64rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(240,160,184,0.35)",
              }}>Tytuł</label>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
                color: titleLen > 50 ? "rgba(240,120,120,0.6)" : "rgba(240,160,184,0.2)",
              }}>
                {titleLen}/60
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ height: "2px", background: "rgba(240,160,184,0.06)", borderRadius: "999px", marginBottom: "0.5rem", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                width: `${Math.min((titleLen / 60) * 100, 100)}%`,
                background: titleLen > 50
                  ? "rgba(240,100,100,0.6)"
                  : "linear-gradient(to right, rgba(212,168,83,0.5), rgba(240,160,184,0.5))",
                transition: "width 0.2s, background 0.2s",
              }} />
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Dzień dobry, Izo ♥"
              maxLength={60}
              style={inputBase}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(212,168,83,0.4)";
                (e.target as HTMLInputElement).style.boxShadow   = "0 0 0 3px rgba(212,168,83,0.06)";
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(240,160,184,0.1)";
                (e.target as HTMLInputElement).style.boxShadow   = "none";
              }}
            />
          </div>

          {/* ── Treść ── */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.45rem" }}>
              <label style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.64rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(240,160,184,0.35)",
              }}>Treść</label>
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
                color: bodyLen > 170 ? "rgba(240,120,120,0.6)" : "rgba(240,160,184,0.2)",
              }}>
                {bodyLen}/200
              </span>
            </div>
            <div style={{ height: "2px", background: "rgba(240,160,184,0.06)", borderRadius: "999px", marginBottom: "0.5rem", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: "999px",
                width: `${Math.min((bodyLen / 200) * 100, 100)}%`,
                background: bodyLen > 170
                  ? "rgba(240,100,100,0.6)"
                  : "linear-gradient(to right, rgba(212,168,83,0.5), rgba(240,160,184,0.5))",
                transition: "width 0.2s, background 0.2s",
              }} />
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Wpisz romantyczną wiadomość dla Izy..."
              rows={4}
              maxLength={200}
              style={{ ...inputBase, resize: "vertical", lineHeight: 1.65 }}
              onFocus={e => {
                (e.target as HTMLTextAreaElement).style.borderColor = "rgba(212,168,83,0.4)";
                (e.target as HTMLTextAreaElement).style.boxShadow   = "0 0 0 3px rgba(212,168,83,0.06)";
              }}
              onBlur={e => {
                (e.target as HTMLTextAreaElement).style.borderColor = "rgba(240,160,184,0.1)";
                (e.target as HTMLTextAreaElement).style.boxShadow   = "none";
              }}
            />
          </div>

          {/* ── URL ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: "0.64rem",
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(240,160,184,0.35)", marginBottom: "0.45rem",
            }}>
              Link po kliknięciu
            </label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="/"
              style={inputBase}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(212,168,83,0.4)";
                (e.target as HTMLInputElement).style.boxShadow   = "0 0 0 3px rgba(212,168,83,0.06)";
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(240,160,184,0.1)";
                (e.target as HTMLInputElement).style.boxShadow   = "none";
              }}
            />
          </div>

          {/* ── Tryb wysyłki ── */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["now", "schedule"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "7px", padding: "0.65rem",
                    background: mode === m
                      ? "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(240,160,184,0.08))"
                      : "rgba(12,4,8,0.6)",
                    border: `1px solid ${mode === m ? "rgba(212,168,83,0.35)" : "rgba(240,160,184,0.08)"}`,
                    borderRadius: "0.75rem",
                    cursor: "pointer", transition: "all 0.25s",
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
                    fontWeight: mode === m ? 500 : 400,
                    color: mode === m ? "rgba(212,168,83,0.95)" : "rgba(240,160,184,0.35)",
                  }}
                >
                  {m === "now" ? <Send size={13} /> : <Clock size={13} />}
                  {m === "now" ? "Wyślij teraz" : "Zaplanuj"}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {mode === "schedule" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{
                    background: "rgba(212,168,83,0.04)",
                    border: "1px solid rgba(212,168,83,0.1)",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}>
                    <div>
                      <label style={{
                        display: "block", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.62rem", color: "rgba(212,168,83,0.45)", marginBottom: "0.4rem",
                      }}>Data</label>
                      <input
                        type="date"
                        value={dateVal}
                        onChange={e => setDateVal(e.target.value)}
                        style={{ ...inputBase, colorScheme: "dark", fontSize: "0.82rem" }}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: "block", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.62rem", color: "rgba(212,168,83,0.45)", marginBottom: "0.4rem",
                      }}>Godzina</label>
                      <input
                        type="time"
                        value={timeVal}
                        onChange={e => setTimeVal(e.target.value)}
                        style={{ ...inputBase, colorScheme: "dark", fontSize: "0.82rem" }}
                      />
                    </div>
                    {dateVal && timeVal && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          gridColumn: "1 / -1",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.68rem",
                          color: "rgba(212,168,83,0.6)",
                          margin: 0,
                        }}
                      >
                        ✦ Powiadomienie dotrze do Izy {dateVal} o {timeVal} ♥
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Przycisk wysyłki ── */}
          <motion.button
            whileHover={!sending && !sent ? { scale: 1.015, y: -1 } : {}}
            whileTap={!sending && !sent ? { scale: 0.975 } : {}}
            onClick={handleSend}
            disabled={sending || sent}
            style={{
              width: "100%", padding: "1rem",
              background: sent
                ? "rgba(80,200,120,0.12)"
                : sending
                  ? "rgba(212,168,83,0.15)"
                  : "linear-gradient(135deg, #d4a853 0%, #e8b87a 50%, #f0a0b8 100%)",
              backgroundSize: "200% 200%",
              border: sent
                ? "1px solid rgba(80,200,120,0.3)"
                : sending
                  ? "1px solid rgba(212,168,83,0.25)"
                  : "none",
              borderRadius: "0.9rem",
              cursor: sending || sent ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem", fontWeight: 600,
              color: sent ? "rgba(80,200,120,0.9)" : sending ? "rgba(212,168,83,0.8)" : "#100508",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "9px",
              boxShadow: sent || sending ? "none" : "0 6px 28px rgba(212,168,83,0.28), 0 2px 8px rgba(0,0,0,0.4)",
              transition: "all 0.35s",
            }}
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.span key="sent"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Check size={16} />
                  {sentCount !== null ? `Wysłano do ${sentCount} urządzenia ♥` : "Wysłano! ♥"}
                </motion.span>
              ) : sending ? (
                <motion.span key="sending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  >
                    <Sparkles size={15} />
                  </motion.div>
                  Wysyłam z miłością...
                </motion.span>
              ) : (
                <motion.span key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {mode === "now"
                    ? <><Heart size={15} fill="#100508" style={{ color: "#100508" }} /> Wyślij do Izy ♥</>
                    : <><Clock size={15} /> Zaplanuj powiadomienie</>}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* ════ PRAWA — podgląd ════ */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ position: "sticky", top: "2rem" }}
        >
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "rgba(240,160,184,0.3)", marginBottom: "1rem",
          }}>
            Podgląd na iPhonie Izy
          </p>

          {/* Obudowa iPhone */}
          <div style={{
            background: "linear-gradient(145deg, #2a2a2e, #1a1a1e)",
            borderRadius: "2.5rem",
            padding: "12px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.06)",
            maxWidth: "240px",
          }}>
            {/* Ekran */}
            <div style={{
              background: "#000",
              borderRadius: "2rem",
              overflow: "hidden",
              aspectRatio: "9/19",
              position: "relative",
            }}>

              {/* Wallpaper */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 30% 20%, rgba(212,168,83,0.25), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(240,100,140,0.2), transparent 60%), #0d0810",
              }} />

              {/* Dynamic Island */}
              <div style={{
                position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
                width: "80px", height: "22px",
                background: "#000",
                borderRadius: "999px",
                zIndex: 10,
              }} />

              {/* Czas i status */}
              <div style={{
                position: "absolute", top: "18px", left: "20px", right: "20px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                zIndex: 5,
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
                  {timeStr}
                </span>
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "2px", alignItems: "flex-end" }}>
                    {[3, 5, 7, 9].map((h, i) => (
                      <div key={i} style={{ width: "2px", height: `${h}px`, background: i < 3 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)", borderRadius: "1px" }} />
                    ))}
                  </div>
                  <div style={{ width: "14px", height: "7px", border: "1px solid rgba(255,255,255,0.7)", borderRadius: "2px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "1px", top: "1px", bottom: "1px", right: "3px", background: "rgba(255,255,255,0.85)", borderRadius: "1px" }} />
                    <div style={{ position: "absolute", right: "-3px", top: "2px", width: "2px", height: "3px", background: "rgba(255,255,255,0.5)", borderRadius: "1px" }} />
                  </div>
                </div>
              </div>

              {/* Powiadomienie — główny element */}
              <motion.div
                key={previewTitle + previewBody}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: "absolute",
                  top: "60px", left: "8px", right: "8px",
                  background: "rgba(28,28,30,0.92)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderRadius: "1rem",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  zIndex: 20,
                }}
              >
                {/* Nagłówek powiadomienia */}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "6px", marginBottom: "6px",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "5px",
                    background: "linear-gradient(135deg, #d4a853, #f0a0b8)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Heart size={9} fill="white" style={{ color: "white" }} />
                  </div>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem",
                    fontWeight: 600, color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    flex: 1,
                  }}>
                    Nasza Historia
                  </span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: "0.55rem",
                    color: "rgba(255,255,255,0.3)",
                  }}>
                    teraz
                  </span>
                </div>

                {/* Treść */}
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem",
                  fontWeight: 600, color: "rgba(255,255,255,0.92)",
                  margin: "0 0 2px", lineHeight: 1.3,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
                }}>
                  {previewTitle}
                </p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: "0.63rem",
                  color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4,
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>
                  {previewBody}
                </p>
              </motion.div>

              {/* Home indicator */}
              <div style={{
                position: "absolute", bottom: "6px", left: "50%",
                transform: "translateX(-50%)",
                width: "60px", height: "3px",
                background: "rgba(255,255,255,0.3)",
                borderRadius: "999px",
              }} />
            </div>
          </div>

          {/* Tip */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem",
            color: "rgba(240,160,184,0.2)", marginTop: "1rem", lineHeight: 1.6,
            maxWidth: "220px",
          }}>
            ✦ Podgląd aktualizuje się na żywo gdy piszesz
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          main > div:last-child {
            grid-template-columns: 1fr !important;
          }
          main > div:last-child > div:last-child {
            position: static !important;
          }
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(0.4) sepia(1) saturate(0.5) hue-rotate(320deg);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}