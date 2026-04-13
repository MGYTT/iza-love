"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/* ── GSAP types (CDN-loaded) ── */
interface GSAPScrollTriggerVars {
  trigger: Element | null;
  start: string;
  end?: string;
  scrub?: number | boolean;
  toggleActions?: string;
}

interface GSAPVars {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  scaleX?: number;
  transformOrigin?: string;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number;
  repeat?: number;
  yoyo?: boolean;
  scrollTrigger?: GSAPScrollTriggerVars;
}

interface GSAPStatic {
  registerPlugin: (...args: unknown[]) => void;
  from: (targets: string | Element | NodeList | null, vars: GSAPVars) => void;
  to: (targets: string | Element | NodeList | null, vars: GSAPVars) => void;
}

interface ScrollTriggerInstance {
  kill: () => void;
}

interface ScrollTriggerStatic {
  getAll: () => ScrollTriggerInstance[];
}

declare global {
  interface Window {
    gsap: GSAPStatic;
    ScrollTrigger: ScrollTriggerStatic;
  }
}

/* ── Data ── */
interface Reason {
  number: string;
  text: string;
  emoji: string;
  isFinal?: boolean;
}

const REASONS: Reason[] = [
  { number: "01", text: "Ma piękny uśmiech", emoji: "😊" },
  { number: "02", text: "Ma poczucie humoru", emoji: "😂" },
  { number: "03", text: "Jest piękna", emoji: "✨" },
  { number: "04", text: "Ma piękne ciało", emoji: "🌹" },
  { number: "05", text: "Ma śliczne niebieskie oczy", emoji: "👁️" },
  { number: "06", text: "Ma piękne włosy", emoji: "💫" },
  { number: "07", text: "Robi sobie prześliczne paznokcie", emoji: "💅" },
  { number: "08", text: "Idealnie całuje", emoji: "💋" },
  { number: "09", text: "Martwi się o mnie", emoji: "🫶" },
  { number: "10", text: "Gotuje mega dobre rzeczy", emoji: "🍳" },
  { number: "11", text: "Jest troskliwa", emoji: "🤍" },
  { number: "12", text: "Całkowicie mnie akceptuje", emoji: "🫂" },
  { number: "13", text: "Przytula się tak, że świat przestaje istnieć", emoji: "🌍" },
  { number: "14", text: "Zawsze pocieszy", emoji: "🕊️" },
  { number: "15", text: "Nigdy nie porzuci", emoji: "♾️" },
  { number: "16", text: "Robi wszystko by mnie uszczęśliwić", emoji: "🌟" },
  { number: "17", text: "Jest moją największą podporą", emoji: "🏛️" },
  { number: "18", text: "Zawsze wie jak mnie rozbawić, kiedy jest mi smutno", emoji: "🌈" },
  { number: "19", text: "Z nią nawet zwykły wieczór to najlepsza randka", emoji: "🕯️" },
  { number: "20", text: "Świetnie masuje", emoji: "💆" },
  { number: "21", text: "Mega dobrze robi malinki", emoji: "😈" },
  {
    number: "22",
    text: "Po prostu… jest moją Izą. I to wystarczy, żebym kochał ją całym sobą.",
    emoji: "❤️",
    isFinal: true,
  },
];

/* ── Helpers ── */
function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });
}

/* ── Component ── */
export default function ReasonsClient() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;

    const initGSAP = async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");

      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);

      /* ── Hero entrance ── */
      gsap.from(".reasons-hero-line", {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.3,
      });

      gsap.from(".reasons-scroll-hint", {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 1.4,
        ease: "power2.out",
      });

      /* ── Reason cards ── */
      const cards = document.querySelectorAll<HTMLElement>(".reason-card");

      cards.forEach((card, i) => {
        const isFinal = card.classList.contains("reason-final");
        const fromLeft = i % 2 === 0;

        const numEl = card.querySelector<HTMLElement>(".reason-num");
        if (numEl) {
          gsap.from(numEl, {
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            x: fromLeft ? -30 : 30,
            duration: 0.6,
            ease: "power3.out",
          });
        }

        const textEl = card.querySelector<HTMLElement>(".reason-text");
        if (textEl) {
          gsap.from(textEl, {
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            x: fromLeft ? -50 : 50,
            duration: 0.8,
            delay: 0.1,
            ease: "power3.out",
          });
        }

        const emojiEl = card.querySelector<HTMLElement>(".reason-emoji");
        if (emojiEl) {
          gsap.from(emojiEl, {
            scrollTrigger: {
              trigger: card,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
            opacity: 0,
            scale: 0.3,
            rotation: -20,
            duration: 0.7,
            delay: 0.2,
            ease: "back.out(2)",
          });
        }

        if (isFinal) {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              toggleActions: "play none none none",
            },
            opacity: 0,
            scale: 0.85,
            y: 40,
            duration: 1.2,
            ease: "power4.out",
          });

          gsap.to(".final-heart", {
            scrollTrigger: {
              trigger: card,
              start: "top 60%",
            },
            scale: 1.15,
            duration: 0.7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1,
          });
        }

        const line = card.querySelector<HTMLElement>(".reason-line");
        if (line) {
          gsap.from(line, {
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
            scaleX: 0,
            transformOrigin: fromLeft ? "left" : "right",
            duration: 0.9,
            ease: "power3.inOut",
          });
        }
      });

      /* ── Parallax glows ── */
      gsap.to(".glow-top", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
        y: -200,
        ease: "none",
      });

      gsap.to(".glow-bottom", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
        y: 200,
        ease: "none",
      });
    };

    initGSAP().catch(console.error);

    return () => {
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((t) => t.kill());
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      background: "#0a0408",
      minHeight: "100dvh",
      overflowX: "hidden",
      position: "relative",
    }}>

      {/* ── Fixed ambient glows ── */}
      <div aria-hidden className="glow-top" style={{
        position: "fixed", top: "-10%", left: "50%",
        transform: "translateX(-50%)",
        width: "700px", height: "500px",
        background: "radial-gradient(ellipse, rgba(212,168,83,0.08) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div aria-hidden className="glow-bottom" style={{
        position: "fixed", bottom: "10%", left: "30%",
        width: "500px", height: "400px",
        background: "radial-gradient(ellipse, rgba(240,100,140,0.06) 0%, transparent 65%)",
        filter: "blur(60px)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Back button ── */}
      <button
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
          e.currentTarget.style.color = "rgba(212,168,83,0.9)";
          e.currentTarget.style.borderColor = "rgba(212,168,83,0.35)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgba(212,168,83,0.5)";
          e.currentTarget.style.borderColor = "rgba(212,168,83,0.15)";
        }}
      >
        <ArrowLeft size={11} /> Wróć
      </button>

      {/* ════════════════════════════
          HERO
      ════════════════════════════ */}
      <section style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "6rem 2rem",
        position: "relative",
        zIndex: 1,
      }}>

        <div style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "1px", height: "100px",
          background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.4))",
        }} />

        <div className="reasons-hero-line" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "3rem",
          padding: "0.35rem 1.1rem",
          border: "1px solid rgba(212,168,83,0.15)",
          borderRadius: "999px",
          background: "rgba(212,168,83,0.04)",
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(212,168,83,0.6)",
          }}>
            ✦ dla Izy · z całego serca ✦
          </span>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h1 className="reasons-hero-line" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 9vw, 7.5rem)",
            fontWeight: 300,
            lineHeight: 0.9,
            color: "#f7cdd8",
            letterSpacing: "-0.02em",
            marginBottom: "0.15em",
          }}>
            Dlaczego
          </h1>
          <h1 className="reasons-hero-line" style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.8rem, 9vw, 7.5rem)",
            fontWeight: 300,
            lineHeight: 0.9,
            fontStyle: "italic",
            background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 50%, #d4a853 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 5s linear infinite",
            letterSpacing: "-0.02em",
          }}>
            Cię kocham
          </h1>
        </div>

        <p className="reasons-hero-line" style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(1rem, 2vw, 1.25rem)",
          fontStyle: "italic",
          color: "rgba(240,160,184,0.45)",
          maxWidth: "380px",
          lineHeight: 1.8,
          marginBottom: "5rem",
        }}>
          22 powody, które mogłyby zapełnić całe niebo.
          <br />
          Ale wybrałem te, które znam na pamięć.
        </p>

        <div className="reasons-scroll-hint" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.58rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "rgba(240,160,184,0.25)",
          }}>
            Przewiń
          </span>
          <div style={{
            display: "flex", flexDirection: "column", gap: "3px",
            animation: "floatDown 2s ease-in-out infinite",
          }}>
            {[0, 1].map(i => (
              <div key={i} style={{ display: "flex", gap: "3px" }}>
                <div style={{
                  width: "8px", height: "1px",
                  background: `rgba(212,168,83,${i === 0 ? 0.4 : 0.2})`,
                  transform: "rotate(35deg) translateX(2px)",
                }} />
                <div style={{
                  width: "8px", height: "1px",
                  background: `rgba(212,168,83,${i === 0 ? 0.4 : 0.2})`,
                  transform: "rotate(-35deg)",
                }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "1px", height: "100px",
          background: "linear-gradient(to bottom, rgba(212,168,83,0.4), transparent)",
        }} />
      </section>

      {/* ════════════════════════════
          REASONS LIST
      ════════════════════════════ */}
      <section style={{
        maxWidth: "780px",
        margin: "0 auto",
        padding: "4rem 2rem 8rem",
        position: "relative",
        zIndex: 1,
      }}>
        {REASONS.map((reason, i) => {
          const fromLeft = i % 2 === 0;

          if (reason.isFinal) {
            return (
              <div
                key={reason.number}
                className="reason-card reason-final"
                style={{
                  marginTop: "8rem",
                  padding: "4rem 3rem",
                  background: "linear-gradient(135deg, rgba(212,168,83,0.06), rgba(240,100,140,0.04))",
                  border: "1px solid rgba(212,168,83,0.2)",
                  borderRadius: "2rem",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 0 60px rgba(212,168,83,0.05), 0 20px 60px rgba(0,0,0,0.4)",
                }}
              >
                <div aria-hidden style={{
                  position: "absolute", top: "-30%", left: "50%",
                  transform: "translateX(-50%)",
                  width: "300px", height: "300px",
                  background: "radial-gradient(circle, rgba(212,168,83,0.08), transparent 70%)",
                  pointerEvents: "none",
                }} />

                <div className="final-heart" style={{
                  fontSize: "3rem",
                  marginBottom: "1.5rem",
                  display: "block",
                  transformOrigin: "center",
                }}>
                  ❤️
                </div>

                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "#f7cdd8",
                  lineHeight: 1.7,
                  letterSpacing: "0.01em",
                  position: "relative", zIndex: 1,
                }}>
                  {reason.text}
                </p>

                <div style={{
                  marginTop: "2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}>
                  <div style={{ width: "40px", height: "1px", background: "linear-gradient(to right, transparent, rgba(212,168,83,0.4))" }} />
                  <span style={{ fontSize: "0.55rem", color: "rgba(212,168,83,0.4)", letterSpacing: "0.2em" }}>✦ Twój Maksiu ✦</span>
                  <div style={{ width: "40px", height: "1px", background: "linear-gradient(to left, transparent, rgba(212,168,83,0.4))" }} />
                </div>
              </div>
            );
          }

          return (
            <div
              key={reason.number}
              className="reason-card"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "2rem",
                marginBottom: "4.5rem",
                flexDirection: fromLeft ? "row" : "row-reverse",
                textAlign: fromLeft ? "left" : "right",
              }}
            >
              <div className="reason-num" style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(3.5rem, 7vw, 5.5rem)",
                fontWeight: 300,
                lineHeight: 1,
                color: "rgba(212,168,83,0.12)",
                letterSpacing: "-0.04em",
                flexShrink: 0,
                width: "90px",
                textAlign: "center",
                userSelect: "none",
              }}>
                {reason.number}
              </div>

              <div style={{ flex: 1, paddingTop: "0.5rem" }}>
                <div className="reason-line" style={{
                  height: "1px",
                  background: fromLeft
                    ? "linear-gradient(to right, rgba(212,168,83,0.25), transparent)"
                    : "linear-gradient(to left, rgba(212,168,83,0.25), transparent)",
                  marginBottom: "1rem",
                }} />

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexDirection: fromLeft ? "row" : "row-reverse",
                }}>
                  <span className="reason-emoji" style={{
                    fontSize: "1.5rem",
                    display: "block",
                    flexShrink: 0,
                  }}>
                    {reason.emoji}
                  </span>

                  <p className="reason-text" style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: "clamp(1.2rem, 2.8vw, 1.7rem)",
                    fontWeight: 300,
                    color: i < 3
                      ? "#f7cdd8"
                      : `rgba(247,205,216,${Math.max(0.55, 0.95 - i * 0.015)})`,
                    lineHeight: 1.5,
                    letterSpacing: "0.01em",
                  }}>
                    {reason.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&display=swap');

        @keyframes shimmer {
          to { background-position: 200% center; }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(8px); opacity: 1; }
        }

        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(212,168,83,0.2);
          border-radius: 999px;
        }

        @media (max-width: 600px) {
          .reason-card {
            flex-direction: column !important;
            text-align: left !important;
            gap: 0.5rem !important;
          }
          .reason-num {
            font-size: 2.5rem !important;
            width: auto !important;
          }
        }
      `}</style>
    </div>
  );
}