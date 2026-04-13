"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";

const PARAGRAPHS = [
  {
    opening: true,
    text: "Kochanie, widzę, że znalazłaś ukrytą wiadomość dla Ciebie. ❤️",
  },
  {
    text: "Kochanie, dziękuję Ci, że jesteś najcudowniejszą dziewczyną na całym świecie. Nie wyobrażam sobie życia bez Ciebie, bo to właśnie Ty dajesz mi najwięcej radości w tym życiu. Jesteś najpiękniejsza na całym świecie.",
  },
  {
    text: "Nigdy nie myślałem, że trafię na taką mega cudowną dziewczynę, która będzie dawała mi szczęście i uśmiech na twarzy każdego dnia.",
  },
  {
    text: "Cieszę się, że jesteśmy razem już ponad 3 lata i dalej nam się to udaje. Oby tak było już do końca życia!",
  },
  {
    text: "Cieszę się, że tak bardzo starasz się w tym związku i pomimo moich różnych zachowań nadal mnie kochasz.",
  },
  {
    closing: true,
    text: "Mega Ci dziękuję, kochanie, za wszystko. JESTEŚ NAJLEPSZA I NAJCUDOWNIEJSZA! ❤️",
  },
];

/* Floating hearts config */
const HEARTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 13) % 90}%`,
  size: 8 + (i * 7) % 14,
  duration: 8 + (i * 1.3) % 10,
  delay: (i * 0.6) % 8,
  opacity: 0.06 + (i % 4) * 0.025,
}));

export default function LoveLetter() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [heartsVisible, setHeartsVisible] = useState(false);

  useEffect(() => {
    // Małe opóźnienie dla efektu dramatyczności
    const t1 = setTimeout(() => setHeartsVisible(true), 100);
    const t2 = setTimeout(() => setVisible(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <main style={{
      minHeight: "100dvh",
      background: "#0d0509",
      position: "relative",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 1.5rem 6rem",
    }}>

      {/* ── Ambient gradient ── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 40% at 50% -5%, rgba(212,168,83,0.09), transparent),
          radial-gradient(ellipse 50% 50% at 20% 60%, rgba(240,100,140,0.05), transparent),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(180,120,200,0.04), transparent)
        `,
      }} />

      {/* ── Floating hearts background ── */}
      <AnimatePresence>
        {heartsVisible && HEARTS.map(h => (
          <motion.div
            key={h.id}
            aria-hidden
            initial={{ y: "110vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, h.opacity, h.opacity, 0] }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Infinity,
              ease: "linear",
              opacity: { times: [0, 0.1, 0.9, 1], duration: h.duration },
            }}
            style={{
              position: "fixed",
              left: h.left,
              bottom: 0,
              pointerEvents: "none",
              zIndex: 0,
              fontSize: `${h.size}px`,
              color: "rgba(240,100,140,1)",
            }}
          >
            ♥
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Wróć ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => router.back()}
        style={{
          position: "fixed", top: "1.5rem", left: "1.5rem",
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(212,168,83,0.06)",
          border: "1px solid rgba(212,168,83,0.15)",
          borderRadius: "999px",
          padding: "0.4rem 0.9rem",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.68rem",
          color: "rgba(212,168,83,0.5)",
          cursor: "pointer",
          transition: "all 0.25s",
          zIndex: 50,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,168,83,0.9)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,83,0.35)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,168,83,0.5)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,83,0.15)";
        }}
      >
        <ArrowLeft size={11} /> Wróć
      </motion.button>

      {/* ── Ozdobna linia górna ── */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "1px", height: "80px", marginTop: "5rem",
          background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.5))",
          position: "relative", zIndex: 1,
        }}
      />

      {/* ── Ikona serca ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 1,
          margin: "1rem 0",
          animation: "heartbeat 2.5s ease-in-out infinite",
        }}
      >
        <Heart
          size={28}
          fill="rgba(240,100,140,0.75)"
          style={{ color: "rgba(240,100,140,0.75)", filter: "drop-shadow(0 0 12px rgba(240,100,140,0.4))" }}
        />
      </motion.div>

      {/* ── Eyebrow ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        style={{
          position: "relative", zIndex: 1,
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "2rem",
          padding: "0.35rem 1.1rem",
          border: "1px solid rgba(212,168,83,0.15)",
          borderRadius: "999px",
          background: "rgba(212,168,83,0.04)",
        }}
      >
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.6rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(212,168,83,0.6)",
        }}>
          ✦ tylko dla Ciebie · Izo ✦
        </span>
      </motion.div>

      {/* ══════════════════════════════
          KOPERTA / KARTA LISTU
      ══════════════════════════════ */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative", zIndex: 1,
              maxWidth: "620px", width: "100%",
            }}
          >
            {/* Papier listu */}
            <div style={{
              background: "linear-gradient(160deg, rgba(28,14,18,0.97), rgba(20,9,14,0.99))",
              border: "1px solid rgba(212,168,83,0.18)",
              borderRadius: "1.5rem",
              padding: "3rem 3.5rem 3.5rem",
              boxShadow: `
                0 2px 0 rgba(212,168,83,0.08),
                0 20px 60px rgba(0,0,0,0.6),
                0 4px 20px rgba(212,168,83,0.06),
                inset 0 1px 0 rgba(212,168,83,0.08)
              `,
              position: "relative",
              overflow: "hidden",
            }}>

              {/* Subtelna tekstura papieru */}
              <div aria-hidden style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 27px,
                    rgba(212,168,83,0.025) 27px,
                    rgba(212,168,83,0.025) 28px
                  )
                `,
                borderRadius: "inherit",
              }} />

              {/* Pionowa linia jak w zeszycie */}
              <div aria-hidden style={{
                position: "absolute", top: 0, bottom: 0, left: "3.5rem",
                width: "1px",
                background: "rgba(240,160,184,0.04)",
                pointerEvents: "none",
              }} />

              {/* Data */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{
                  position: "relative", zIndex: 1,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                  color: "rgba(212,168,83,0.4)",
                  textAlign: "right",
                  marginBottom: "2rem",
                  letterSpacing: "0.04em",
                }}
              >
                {new Date().toLocaleDateString("pl-PL", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </motion.p>

              {/* Akapity listu */}
              {PARAGRAPHS.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.3 + i * 0.18,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    position: "relative", zIndex: 1,
                    fontFamily: p.opening
                      ? "'Cormorant Garamond', Georgia, serif"
                      : "'Cormorant Garamond', Georgia, serif",
                    fontSize: p.opening
                      ? "clamp(1.1rem, 2.5vw, 1.3rem)"
                      : p.closing
                        ? "clamp(1rem, 2vw, 1.15rem)"
                        : "clamp(1rem, 2vw, 1.1rem)",
                    fontWeight: p.opening || p.closing ? 500 : 400,
                    fontStyle: p.opening ? "italic" : "normal",
                    color: p.opening
                      ? "#f7cdd8"
                      : p.closing
                        ? "rgba(247,205,216,0.95)"
                        : "rgba(235,190,205,0.82)",
                    lineHeight: 1.9,
                    marginBottom: i < PARAGRAPHS.length - 1 ? "1.5rem" : "2.5rem",
                    letterSpacing: "0.01em",
                    textIndent: p.opening ? "0" : "1.5rem",
                  }}
                >
                  {p.text}
                </motion.p>
              ))}

              {/* Podpis */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + PARAGRAPHS.length * 0.18 + 0.1, duration: 0.8 }}
                style={{
                  position: "relative", zIndex: 1,
                  textAlign: "right",
                }}
              >
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "rgba(212,168,83,0.45)",
                  marginBottom: "0.4rem",
                  letterSpacing: "0.04em",
                }}>
                  Z całego serca,
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 60%, #d4a853 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmer 5s linear infinite",
                  lineHeight: 1.1,
                  letterSpacing: "0.02em",
                }}>
                  Twój Maksiu najlepszy
                </p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3 + PARAGRAPHS.length * 0.18 + 0.4, duration: 0.8 }}
                  style={{
                    marginTop: "0.75rem",
                    height: "1px",
                    background: "linear-gradient(to left, rgba(212,168,83,0.3), transparent)",
                    transformOrigin: "right",
                  }}
                />
              </motion.div>

              {/* Trzy serduszka dekoracyjne */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 + PARAGRAPHS.length * 0.18 + 0.6 }}
                style={{
                  position: "relative", zIndex: 1,
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.6rem",
                  marginTop: "2rem",
                }}
              >
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1.8,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart
                      size={i === 1 ? 14 : 10}
                      fill={i === 1 ? "rgba(240,100,140,0.6)" : "rgba(212,168,83,0.4)"}
                      style={{ color: i === 1 ? "rgba(240,100,140,0.6)" : "rgba(212,168,83,0.4)" }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ozdobna linia dolna ── */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.0 }}
        style={{
          position: "relative", zIndex: 1,
          width: "1px", height: "60px", marginTop: "2.5rem",
          background: "linear-gradient(to bottom, rgba(212,168,83,0.35), transparent)",
          transformOrigin: "top",
        }}
      />

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14%       { transform: scale(1.2); }
          28%       { transform: scale(1); }
          42%       { transform: scale(1.12); }
          56%       { transform: scale(1); }
        }
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
        @media (max-width: 500px) {
          /* Mniejszy padding na mobile */
        }
      `}</style>
    </main>
  );
}