"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Losowe serduszka w tle ── */
const HEARTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 8 + Math.random() * 16,
  delay: Math.random() * 3,
  duration: 4 + Math.random() * 4,
  opacity: 0.06 + Math.random() * 0.12,
}));

/* ── Frazy które pojawiają się kolejno ── */
const PHRASES = [
  "Przygotowuję coś tylko dla Ciebie...",
  "Układam nasze wspomnienia...",
  "Każda nuta to kawałek serca...",
  "Już prawie gotowe, Izo ♥",
];

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress,    setProgress]    = useState(0);
  const [leaving,     setLeaving]     = useState(false);

  /* Postęp paska + zmiana fraz */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1.6;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  /* Zmiana frazy co ~900ms */
  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIndex(i => Math.min(i + 1, PHRASES.length - 1));
    }, 900);
    return () => clearInterval(t);
  }, []);

  /* Gdy pasek dojdzie do 100% — exit animation → onDone */
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        setLeaving(true);
        setTimeout(onDone, 900);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [progress, onDone]);

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(12px)",
          }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0308",
            overflow: "hidden",
          }}
        >
          {/* ── Ambient background glows ── */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: "10%", left: "50%",
                transform: "translateX(-50%)",
                width: "600px", height: "400px",
                background: "radial-gradient(ellipse, rgba(212,168,83,0.1) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
              style={{
                position: "absolute",
                bottom: "15%", left: "50%",
                transform: "translateX(-50%)",
                width: "500px", height: "350px",
                background: "radial-gradient(ellipse, rgba(240,100,140,0.08) 0%, transparent 65%)",
                filter: "blur(50px)",
              }}
            />
          </div>

          {/* ── Floating hearts ── */}
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {HEARTS.map(h => (
              <motion.div
                key={h.id}
                initial={{ y: "110vh", opacity: 0 }}
                animate={{ y: "-10vh", opacity: [0, h.opacity, h.opacity, 0] }}
                transition={{
                  duration: h.duration,
                  delay: h.delay,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                  ease: "linear",
                }}
                style={{
                  position: "absolute",
                  left: `${h.x}%`,
                  fontSize: `${h.size}px`,
                  color: h.id % 3 === 0
                    ? "#d4a853"
                    : h.id % 3 === 1
                    ? "#f0a0b8"
                    : "#f7cdd8",
                  userSelect: "none",
                }}
              >
                ♥
              </motion.div>
            ))}
          </div>

          {/* ── Main content ── */}
          <div style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}>

            {/* Central pulsing heart */}
            <div style={{ position: "relative", marginBottom: "2.75rem" }}>
              {/* Outer pulse rings */}
              {[1, 2, 3].map(ring => (
                <motion.div
                  key={ring}
                  animate={{ scale: [1, 2.2 + ring * 0.4], opacity: [0.25, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    delay: ring * 0.5,
                    ease: "easeOut",
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "1px solid rgba(212,168,83,0.4)",
                    margin: "auto",
                    width: "60px",
                    height: "60px",
                  }}
                />
              ))}

              {/* Inner glow disc */}
              <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  inset: "-20px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(212,168,83,0.2), transparent 70%)",
                  filter: "blur(8px)",
                }}
              />

              {/* Heart icon */}
              <motion.div
                animate={{
                  scale: [1, 1.18, 1, 1.12, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                  times: [0, 0.14, 0.28, 0.42, 1],
                }}
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.2rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                ♥
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ textAlign: "center", marginBottom: "0.5rem" }}
            >
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.8rem, 8vw, 5rem)",
                fontWeight: 300,
                color: "#f7cdd8",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                marginBottom: "0.15rem",
              }}>
                Nasza
              </h1>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(2.8rem, 8vw, 5rem)",
                fontWeight: 300,
                fontStyle: "italic",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 50%, #d4a853 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmerText 4s linear infinite",
              }}>
                Historia
              </h1>
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(212,168,83,0.5)",
                marginBottom: "3.5rem",
              }}
            >
              tylko dla Ciebie · Izo
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ width: "min(280px, 70vw)" }}
            >
              {/* Bar track */}
              <div style={{
                height: "2px",
                background: "rgba(240,160,184,0.08)",
                borderRadius: "999px",
                overflow: "hidden",
                marginBottom: "1.25rem",
              }}>
                <motion.div
                  style={{
                    height: "100%",
                    borderRadius: "999px",
                    background: "linear-gradient(to right, #d4a853, #f0a0b8)",
                    boxShadow: "0 0 12px rgba(212,168,83,0.5)",
                  }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>

              {/* Phrase */}
              <div style={{
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.88rem",
                      fontStyle: "italic",
                      color: "rgba(240,160,184,0.4)",
                      textAlign: "center",
                      margin: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {PHRASES[phraseIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <style>{`
            @keyframes shimmerText {
              to { background-position: 200% center; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}