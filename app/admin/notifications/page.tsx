"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Clock, Heart, ArrowLeft, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/* ── Gotowe szablony ── */
const TEMPLATES = [
  { emoji: "🌅", label: "Dzień dobry",  title: "Dzień dobry, Izo ♥",     body: "Mam nadzieję że śnił Ci się piękny sen 🌙"         },
  { emoji: "🎵", label: "Piosenka",     title: "Mam coś dla Ciebie ♥",   body: "Wstawiłem nową piosenkę do naszej historii 🎵"      },
  { emoji: "🌙", label: "Dobranoc",     title: "Dobranoc, kochanie 🌙",   body: "Słodkich snów. Kocham Cię najbardziej na świecie ♥" },
  { emoji: "💭", label: "Myślę o Tobie", title: "Właśnie o Tobie myślę ♥", body: "I nie mogę przestać... 🥹"                         },
  { emoji: "🌸", label: "Komplement",   title: "Wiesz co? ♥",            body: "Jesteś najpiękniejszą osobą na świecie 🌸"          },
  { emoji: "📅", label: "Rocznica",     title: "Pamiętasz? ♥",           body: "Dziś mija kolejny miesiąc razem. Kocham Cię 🥂"     },
];

const base: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "0.4rem",
  padding: "0.5rem 0.9rem", borderRadius: "0.65rem",
  fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
  cursor: "pointer", transition: "all 0.2s ease",
  border: "none", whiteSpace: "nowrap",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [url,     setUrl]     = useState("/");
  const [mode,    setMode]    = useState<"now" | "schedule">("now");
  const [dateVal, setDateVal] = useState("");
  const [timeVal, setTimeVal] = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  /* Preview na żywo */
  const previewTitle = title || "Tytuł powiadomienia ♥";
  const previewBody  = body  || "Treść wiadomości pojawi się tutaj...";

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title);
    setBody(t.body);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Wpisz tytuł i treść");
      return;
    }

    let scheduledFor: string | undefined;
    if (mode === "schedule") {
      if (!dateVal || !timeVal) {
        toast.error("Wybierz datę i godzinę");
        return;
      }
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
      if (scheduledFor) {
        toast.success(`Zaplanowano na ${dateVal} o ${timeVal} ♥`);
      } else {
        toast.success(`Wysłano do ${data.sent} urządzenia ♥`);
      }

      setTimeout(() => {
        setSent(false);
        setTitle(""); setBody(""); setUrl("/");
        setDateVal(""); setTimeVal("");
        setMode("now");
      }, 2500);
    } catch (e) {
      toast.error("Błąd wysyłki");
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(18,6,12,0.8)",
    border: "1px solid rgba(240,160,184,0.12)",
    borderRadius: "0.75rem",
    padding: "0.7rem 1rem",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    color: "#f7cdd8",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

      {/* Ambient bg */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1,
        background: "radial-gradient(ellipse 50% 25% at 50% 0%, rgba(212,168,83,0.06), transparent)",
      }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: "2.5rem" }}
      >
        <Link href="/admin/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(240,160,184,0.35)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", marginBottom: "1.5rem" }}>
          <ArrowLeft size={12} /> Panel admina
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={15} style={{ color: "rgba(212,168,83,0.8)" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.9rem", fontWeight: 300, color: "#f7cdd8", lineHeight: 1 }}>
              Powiadomienia dla Izy
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(240,160,184,0.3)", marginTop: "4px" }}>
              Wyślij teraz lub zaplanuj na konkretną godzinę
            </p>
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── Lewa kolumna: formularz ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          style={{ gridColumn: "1 / -1" }}
        >

          {/* Szablony */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(240,160,184,0.3)", marginBottom: "0.75rem" }}>
              Szybkie szablony
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {TEMPLATES.map(t => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  style={{
                    ...base,
                    padding: "0.4rem 0.85rem",
                    background: "rgba(22,8,14,0.7)",
                    border: "1px solid rgba(240,160,184,0.1)",
                    color: "rgba(240,160,184,0.55)",
                    fontSize: "0.72rem",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.25)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.9)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(240,160,184,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,160,184,0.55)";
                  }}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tytuł */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", display: "block", marginBottom: "0.5rem" }}>
              Tytuł
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Dzień dobry, Izo ♥"
              maxLength={60}
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(212,168,83,0.35)"}
              onBlur={e  => (e.target as HTMLInputElement).style.borderColor = "rgba(240,160,184,0.12)"}
            />
          </div>

          {/* Treść */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", display: "block", marginBottom: "0.5rem" }}>
              Treść
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Wpisz romantyczną wiadomość..."
              rows={3}
              maxLength={200}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(212,168,83,0.35)"}
              onBlur={e  => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(240,160,184,0.12)"}
            />
            <div style={{ textAlign: "right", fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "rgba(240,160,184,0.2)", marginTop: "4px" }}>
              {body.length}/200
            </div>
          </div>

          {/* URL */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", display: "block", marginBottom: "0.5rem" }}>
              Link po kliknięciu
            </label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="/"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(212,168,83,0.35)"}
              onBlur={e  => (e.target as HTMLInputElement).style.borderColor = "rgba(240,160,184,0.12)"}
            />
          </div>

          {/* Tryb: teraz / zaplanuj */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["now", "schedule"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    ...base,
                    flex: 1, justifyContent: "center",
                    background: mode === m ? "rgba(212,168,83,0.12)" : "rgba(18,6,12,0.6)",
                    border: `1px solid ${mode === m ? "rgba(212,168,83,0.35)" : "rgba(240,160,184,0.1)"}`,
                    color: mode === m ? "rgba(212,168,83,0.9)" : "rgba(240,160,184,0.4)",
                  }}
                >
                  {m === "now"
                    ? <><Send size={12} /> Wyślij teraz</>
                    : <><Clock size={12} /> Zaplanuj</>}
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "rgba(240,160,184,0.3)", display: "block", marginBottom: "0.4rem" }}>
                        Data
                      </label>
                      <input
                        type="date"
                        value={dateVal}
                        onChange={e => setDateVal(e.target.value)}
                        style={{ ...inputStyle, colorScheme: "dark" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "rgba(240,160,184,0.3)", display: "block", marginBottom: "0.4rem" }}>
                        Godzina
                      </label>
                      <input
                        type="time"
                        value={timeVal}
                        onChange={e => setTimeVal(e.target.value)}
                        style={{ ...inputStyle, colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSend}
            disabled={sending || sent}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: sent
                ? "rgba(100,220,130,0.15)"
                : "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.9))",
              border: sent ? "1px solid rgba(100,220,130,0.3)" : "none",
              borderRadius: "0.85rem",
              cursor: sending || sent ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: sent ? "rgba(100,220,130,0.9)" : "#100508",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.3s",
              boxShadow: sent ? "none" : "0 4px 22px rgba(212,168,83,0.3)",
            }}
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.span key="sent" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Check size={16} /> Wysłano! ♥
                </motion.span>
              ) : sending ? (
                <motion.span key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                    <Sparkles size={15} />
                  </motion.div>
                  Wysyłam...
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {mode === "now" ? <Send size={15} /> : <Clock size={15} />}
                  {mode === "now" ? "Wyślij do Izy ♥" : "Zaplanuj powiadomienie"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* ── Podgląd powiadomienia ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          style={{ gridColumn: "1 / -1" }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(240,160,184,0.3)", marginBottom: "0.75rem" }}>
            Podgląd jak zobaczy Iza
          </p>

          {/* Mockup notification */}
          <div style={{
            background: "rgba(28,28,30,0.95)",
            borderRadius: "1rem",
            padding: "0.85rem 1rem",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            maxWidth: "340px",
          }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #d4a853, #f0a0b8)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={16} fill="white" style={{ color: "white" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                  {previewTitle}
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>teraz</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {previewBody}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}