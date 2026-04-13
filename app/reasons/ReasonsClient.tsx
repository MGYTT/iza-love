"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */

type GSAPTarget = string | Element | Element[] | NodeListOf<Element> | null | undefined;

interface ScrollTriggerConfig {
  trigger?: Element | string | null | undefined;
  start?: string;
  end?: string;
  scrub?: number | boolean;
  pin?: boolean | string;
  pinSpacing?: boolean;
  toggleActions?: string;
  anticipatePin?: number;
  onEnter?: () => void;
  onLeave?: () => void;
}

interface TweenVars {
  opacity?: number;
  x?: number | string;
  y?: number | string;
  z?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  rotationX?: number;
  rotationY?: number;
  skewX?: number;
  skewY?: number;
  xPercent?: number;
  yPercent?: number;
  clipPath?: string;
  filter?: string;
  transformOrigin?: string;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number | { each: number; ease?: string; from?: string };
  repeat?: number;
  yoyo?: boolean;
  overwrite?: boolean | string;
  scrollTrigger?: ScrollTriggerConfig;
  onComplete?: () => void;
}

interface GSAPTimeline {
  from(targets: GSAPTarget, vars: TweenVars, position?: string | number): GSAPTimeline;
  to(targets: GSAPTarget, vars: TweenVars, position?: string | number): GSAPTimeline;
  fromTo(targets: GSAPTarget, fromVars: TweenVars, toVars: TweenVars, position?: string | number): GSAPTimeline;
  set(targets: GSAPTarget, vars: TweenVars, position?: string | number): GSAPTimeline;
}

interface GSAPContext {
  revert(): void;
}

interface GSAP {
  registerPlugin(...args: unknown[]): void;
  from(targets: GSAPTarget, vars: TweenVars): void;
  to(targets: GSAPTarget, vars: TweenVars): void;
  fromTo(targets: GSAPTarget, fromVars: TweenVars, toVars: TweenVars): void;
  set(targets: GSAPTarget, vars: TweenVars): void;
  timeline(vars?: { scrollTrigger?: ScrollTriggerConfig; defaults?: TweenVars }): GSAPTimeline;
  context(func: () => void, scope?: Element | null): GSAPContext;
}

interface STInstance {
  kill(reset?: boolean): void;
}

interface ST {
  getAll(): STInstance[];
  refresh(): void;
}

interface SplitResult {
  chars: Element[];
  words: Element[];
  lines: Element[];
  revert(): void;
}

interface SplitTextPlugin {
  create(target: string | Element, vars?: { type?: string }): SplitResult;
}

declare global {
  interface Window {
    gsap: GSAP;
    ScrollTrigger: ST;
    SplitText: SplitTextPlugin;
  }
}

/* ══════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════ */

interface Reason {
  number: string;
  text: string;
  emoji: string;
  isFinal?: true;
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

const REGULAR_REASONS = REASONS.filter((r): r is Reason & { isFinal: undefined } => !r.isFinal);
const FINAL_REASON = REASONS.find((r) => r.isFinal)!;

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${15 + (i * 5.8) % 65}%`,
  top: `${25 + (i * 6.3) % 45}%`,
  size: 3 + (i % 4) * 2,
  color: i % 2 === 0
    ? `rgba(212,168,83,${0.28 + (i % 4) * 0.08})`
    : `rgba(240,120,160,${0.22 + (i % 3) * 0.1})`,
}));

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */

function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Script load failed: ${src}`));
    document.head.appendChild(el);
  });
}

/* ══════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════ */

export default function ReasonsClient() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<GSAPContext | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const boot = async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/SplitText.min.js");

      const { gsap, ScrollTrigger, SplitText } = window;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const scope = rootRef.current;
      if (!scope) return;

      ctxRef.current = gsap.context(() => {

        /* ── 1. PROGRESS BAR ── */
        gsap.to(".r-progress", {
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
        });

        /* ── 2. PARALLAX GLOWS ── */
        (
          [
            [".r-glow-a", -320, 70, 2.2],
            [".r-glow-b", 260, -50, 3.0],
            [".r-glow-c", -160, 0, 1.6],
          ] as const
        ).forEach(([sel, y, x, spd]) => {
          gsap.to(sel, {
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: spd },
            y,
            x,
            ease: "none",
          });
        });

        /* ── 3. HERO — pinned scrub char reveal ── */
        const heroTitle = scope.querySelector<HTMLElement>(".r-hero-title");
        if (heroTitle) {
          const split = SplitText.create(heroTitle, { type: "chars" });
          gsap.set(split.chars, { opacity: 0.07, filter: "blur(10px)" });
          gsap.timeline({
            scrollTrigger: {
              trigger: scope.querySelector<HTMLElement>(".r-hero-section") ?? undefined,
              pin: true,
              start: "top top",
              end: "+=1400",
              scrub: 1.4,
              anticipatePin: 1,
            },
          }).to(split.chars, {
            opacity: 1,
            filter: "blur(0px)",
            stagger: { each: 0.05, ease: "power2.inOut" },
            ease: "none",
            duration: 1,
          });
        }

        gsap.from(".r-hero-eyebrow", {
          clipPath: "inset(0 100% 0 0)",
          opacity: 0,
          duration: 1.6,
          ease: "power4.inOut",
          delay: 0.15,
        });

        gsap.from(".r-hero-subtitle", {
          opacity: 0,
          filter: "blur(14px)",
          y: 32,
          duration: 1.3,
          ease: "power3.out",
          delay: 0.45,
        });

        gsap.from(".r-scroll-hint", {
          opacity: 0,
          y: 18,
          duration: 1,
          ease: "power2.out",
          delay: 1.1,
        });

        /* ── 4. COUNTER ── */
        gsap.from(".r-counter", {
          scrollTrigger: {
            trigger: ".r-counter",
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
          opacity: 0,
          scale: 0.55,
          filter: "blur(8px)",
          duration: 1.1,
          ease: "back.out(2)",
        });

        /* ── 5. REASON CARDS ── */
        const cards = scope.querySelectorAll<HTMLElement>(".r-card");
        cards.forEach((card, i) => {
          const fromLeft = i % 2 === 0;
          const trig: ScrollTriggerConfig = {
            trigger: card,
            start: "top 83%",
            toggleActions: "play none none reverse",
          };

          /* Number 3D flip */
          const numEl = card.querySelector<HTMLElement>(".r-num");
          if (numEl) {
            gsap.fromTo(
              numEl,
              { opacity: 0, rotationY: fromLeft ? -80 : 80, z: -80, transformOrigin: fromLeft ? "left center" : "right center" },
              { ...trig, opacity: 1, rotationY: 0, z: 0, duration: 0.85, ease: "power3.out" }
            );
          }

          /* Line scaleX */
          const lineEl = card.querySelector<HTMLElement>(".r-line");
          if (lineEl) {
            gsap.fromTo(
              lineEl,
              { scaleX: 0, transformOrigin: fromLeft ? "left" : "right" },
              { scrollTrigger: { ...trig, start: "top 81%" }, scaleX: 1, duration: 0.75, ease: "power3.inOut", delay: 0.05 }
            );
          }

          /* Emoji bounce */
          const emojiEl = card.querySelector<HTMLElement>(".r-emoji");
          if (emojiEl) {
            gsap.fromTo(
              emojiEl,
              { opacity: 0, scale: 0, rotation: fromLeft ? -28 : 28, y: 18 },
              { scrollTrigger: { ...trig, start: "top 80%" }, opacity: 1, scale: 1, rotation: 0, y: 0, duration: 0.65, ease: "back.out(2.8)", delay: 0.1 }
            );
          }

          /* Text word-by-word */
          const textEl = card.querySelector<HTMLElement>(".r-text");
          if (textEl) {
            const splitWords = SplitText.create(textEl, { type: "words" });
            gsap.fromTo(
              splitWords.words,
              { opacity: 0, y: 22, filter: "blur(5px)" },
              { scrollTrigger: { ...trig, start: "top 79%" }, opacity: 1, y: 0, filter: "blur(0px)", stagger: { each: 0.055, ease: "power2.out" }, duration: 0.55, ease: "power2.out", delay: 0.14 }
            );
          }

          /* Hover scale */
          card.addEventListener("mouseenter", () => {
            gsap.to(card, { scale: 1.012, duration: 0.4, ease: "power2.out" });
          });
          card.addEventListener("mouseleave", () => {
            gsap.to(card, { scale: 1, duration: 0.5, ease: "power2.inOut" });
          });
        });

        /* ── 6. FINAL SECTION — pinned epic reveal ── */
        const finalSection = scope.querySelector<HTMLElement>(".r-final-section");
        const finalCard = scope.querySelector<HTMLElement>(".r-final-card");

        if (finalSection && finalCard) {
          gsap.timeline({
            scrollTrigger: {
              trigger: finalSection,
              pin: true,
              start: "top top",
              end: "+=1000",
              scrub: 1.1,
              anticipatePin: 1,
            },
          })
            .fromTo(
              finalCard,
              { opacity: 0, scale: 0.72, filter: "blur(22px)", y: 70 },
              { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 1, ease: "power3.out" }
            )
            .fromTo(".r-final-eyebrow", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
            .fromTo(
              ".r-final-sig",
              { opacity: 0, scale: 0.82, filter: "blur(6px)" },
              { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.65, ease: "back.out(1.4)" },
              "-=0.15"
            );

          /* Char-by-char final text */
          const finalTextEl = finalCard.querySelector<HTMLElement>(".r-final-text");
          if (finalTextEl) {
            const splitFinal = SplitText.create(finalTextEl, { type: "chars" });
            gsap.fromTo(
              splitFinal.chars,
              { opacity: 0, scale: 0.4, filter: "blur(8px)" },
              {
                scrollTrigger: { trigger: finalCard, start: "top 65%", toggleActions: "play none none none" },
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                stagger: { each: 0.028, ease: "power2.out" },
                duration: 0.45,
                ease: "power2.out",
              }
            );
          }

          /* Heartbeat */
          gsap.to(".r-final-heart", {
            scrollTrigger: { trigger: finalCard, start: "top 68%" },
            scale: 1.2,
            duration: 0.72,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });

          /* Particles burst */
          gsap.fromTo(
            ".r-particle",
            { opacity: 0, scale: 0, y: 0 },
            {
              scrollTrigger: { trigger: finalCard, start: "top 60%", toggleActions: "play none none none" },
              opacity: 1,
              scale: 1,
              y: -55,
              stagger: { each: 0.07, from: "random" },
              duration: 1.1,
              ease: "power3.out",
            }
          );
        }

      }, scope);
    };

    boot().catch(console.error);

    return () => { ctxRef.current?.revert(); };
  }, []);

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div ref={rootRef} style={{ background: "#07030a", minHeight: "100dvh", overflowX: "hidden", position: "relative" }}>

      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "2px", zIndex: 100, background: "rgba(212,168,83,0.07)" }}>
        <div
          className="r-progress"
          style={{
            height: "100%",
            background: "linear-gradient(to right, #d4a853, #f0a0b8, #d4a853)",
            backgroundSize: "200% auto",
            animation: "r-shimmer 3s linear infinite",
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* Ambient glows */}
      {[
        { cls: "r-glow-a", top: "0%",  left: "35%", w: 800, h: 600, color: "rgba(212,168,83,0.07)" },
        { cls: "r-glow-b", top: "45%", left: "5%",  w: 600, h: 500, color: "rgba(240,100,140,0.055)" },
        { cls: "r-glow-c", top: "70%", right: "5%", w: 500, h: 500, color: "rgba(160,90,220,0.04)" },
      ].map(({ cls, top, left, right, w, h, color }) => (
        <div
          key={cls}
          aria-hidden
          className={cls}
          style={{
            position: "fixed", top, left, right,
            width: w, height: h,
            background: `radial-gradient(ellipse, ${color} 0%, transparent 65%)`,
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        />
      ))}

      {/* Back button */}
      <button
        onClick={() => router.back()}
        style={{
          position: "fixed", top: "1.4rem", left: "1.4rem",
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(212,168,83,0.05)",
          border: "1px solid rgba(212,168,83,0.12)",
          borderRadius: "999px",
          padding: "0.38rem 0.85rem",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.67rem",
          color: "rgba(212,168,83,0.45)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          zIndex: 50,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "rgba(212,168,83,0.9)";
          e.currentTarget.style.borderColor = "rgba(212,168,83,0.3)";
          e.currentTarget.style.background = "rgba(212,168,83,0.08)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgba(212,168,83,0.45)";
          e.currentTarget.style.borderColor = "rgba(212,168,83,0.12)";
          e.currentTarget.style.background = "rgba(212,168,83,0.05)";
        }}
      >
        <ArrowLeft size={11} /> Wróć
      </button>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className="r-hero-section"
        style={{
          minHeight: "100svh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "6rem 2rem",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "110px", background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.32))" }} />

        <div className="r-hero-eyebrow" style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          marginBottom: "3rem", padding: "0.35rem 1.2rem",
          border: "1px solid rgba(212,168,83,0.14)", borderRadius: "999px",
          background: "rgba(212,168,83,0.04)",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(212,168,83,0.6)" }}>
            ✦ dla Izy · z całego serca ✦
          </span>
        </div>

        <div style={{ marginBottom: "2.5rem", perspective: "1000px" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.6rem, 8.5vw, 7rem)", fontWeight: 300, lineHeight: 0.88, color: "#f7cdd8", letterSpacing: "-0.03em", marginBottom: "0.08em" }}>
            Dlaczego
          </h1>
          <h1
            className="r-hero-title"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.6rem, 8.5vw, 7rem)",
              fontWeight: 300, lineHeight: 0.88, fontStyle: "italic",
              background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 50%, #d4a853 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "r-shimmer 5s linear infinite",
              letterSpacing: "-0.03em",
              display: "inline-block",
            }}
          >
            Cię kocham
          </h1>
        </div>

        <p className="r-hero-subtitle" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(0.9rem, 2vw, 1.18rem)", fontStyle: "italic", color: "rgba(240,160,184,0.38)", maxWidth: "330px", lineHeight: 1.95, marginBottom: "5rem" }}>
          22 powody, które mogłyby zapełnić całe niebo.
          <br />Ale wybrałem te, które znam na pamięć.
        </p>

        <div className="r-scroll-hint" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.54rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(240,160,184,0.2)" }}>Przewiń</span>
          <div style={{ animation: "r-float 2.2s ease-in-out infinite" }}>
            {[0, 1].map(i => (
              <div key={i} style={{ display: "flex", gap: "3px", marginBottom: "2px" }}>
                <div style={{ width: "7px", height: "1px", background: `rgba(212,168,83,${i === 0 ? 0.32 : 0.16})`, transform: "rotate(35deg) translateX(2px)" }} />
                <div style={{ width: "7px", height: "1px", background: `rgba(212,168,83,${i === 0 ? 0.32 : 0.16})`, transform: "rotate(-35deg)" }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "110px", background: "linear-gradient(to bottom, rgba(212,168,83,0.32), transparent)" }} />
      </section>

      {/* ═══════════════ COUNTER ═══════════════ */}
      <div style={{ textAlign: "center", padding: "6rem 1rem 3rem", position: "relative", zIndex: 1 }}>
        <div className="r-counter" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(5rem, 14vw, 9.5rem)", fontWeight: 300, lineHeight: 1, background: "linear-gradient(135deg, rgba(212,168,83,0.14), rgba(212,168,83,0.05))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.05em" }}>22</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.58rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(240,160,184,0.22)" }}>powodów</span>
        </div>
      </div>

      {/* ═══════════════ CARDS ═══════════════ */}
      <section style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 2rem 6rem", position: "relative", zIndex: 1 }}>
        {REGULAR_REASONS.map((reason, i) => {
          const fromLeft = i % 2 === 0;
          return (
            <div
              key={reason.number}
              className="r-card"
              style={{
                display: "flex", alignItems: "flex-start",
                gap: "2.5rem", marginBottom: "5rem",
                flexDirection: fromLeft ? "row" : "row-reverse",
                textAlign: fromLeft ? "left" : "right",
                willChange: "transform", transform: "translateZ(0)",
              }}
            >
              <div className="r-num" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)", fontWeight: 300, lineHeight: 1, color: "rgba(212,168,83,0.09)", letterSpacing: "-0.05em", flexShrink: 0, width: "78px", textAlign: "center", userSelect: "none", perspective: "400px" }}>
                {reason.number}
              </div>
              <div style={{ flex: 1, paddingTop: "0.55rem" }}>
                <div className="r-line" style={{ height: "1px", background: fromLeft ? "linear-gradient(to right, rgba(212,168,83,0.28), transparent)" : "linear-gradient(to left, rgba(212,168,83,0.28), transparent)", marginBottom: "1rem" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", flexDirection: fromLeft ? "row" : "row-reverse" }}>
                  <span className="r-emoji" style={{ fontSize: "1.55rem", flexShrink: 0, display: "block" }}>{reason.emoji}</span>
                  <p className="r-text" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.1rem, 2.5vw, 1.55rem)", fontWeight: 300, color: "#f0c8d4", lineHeight: 1.6, letterSpacing: "0.01em" }}>
                    {reason.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ═══════════════ FINAL ═══════════════ */}
      <section
        className="r-final-section"
        style={{
          minHeight: "100svh",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "4rem 2rem",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Particles */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {PARTICLES.map(p => (
            <div key={p.id} className="r-particle" style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%", background: p.color, opacity: 0 }} />
          ))}
        </div>

        {/* Final card */}
        <div
          className="r-final-card"
          style={{
            maxWidth: "580px", width: "100%",
            padding: "4.5rem 3.5rem",
            background: "linear-gradient(135deg, rgba(212,168,83,0.07) 0%, rgba(240,100,140,0.04) 55%, rgba(160,90,220,0.03) 100%)",
            border: "1px solid rgba(212,168,83,0.17)",
            borderRadius: "2.5rem",
            textAlign: "center",
            position: "relative", overflow: "hidden",
            boxShadow: "0 0 80px rgba(212,168,83,0.06), 0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,168,83,0.1)",
          }}
        >
          <div aria-hidden style={{ position: "absolute", top: "-25%", left: "50%", transform: "translateX(-50%)", width: "360px", height: "360px", background: "radial-gradient(circle, rgba(212,168,83,0.08), transparent 70%)", pointerEvents: "none" }} />

          <div className="r-final-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "2rem", padding: "0.3rem 0.9rem", border: "1px solid rgba(212,168,83,0.12)", borderRadius: "999px" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.54rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(212,168,83,0.42)" }}>✦ i najważniejsze ✦</span>
          </div>

          <div className="r-final-heart" style={{ fontSize: "3.5rem", marginBottom: "2rem", display: "block", transformOrigin: "center" }}>
            ❤️
          </div>

          <p className="r-final-text" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.25rem, 2.8vw, 1.85rem)", fontWeight: 300, fontStyle: "italic", color: "#f7cdd8", lineHeight: 1.8, letterSpacing: "0.01em", position: "relative", zIndex: 1, marginBottom: "2.5rem" }}>
            {FINAL_REASON.text}
          </p>

          <div className="r-final-sig" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "1.2rem" }}>
              <div style={{ width: "34px", height: "1px", background: "linear-gradient(to right, transparent, rgba(212,168,83,0.32))" }} />
              <span style={{ fontSize: "0.5rem", color: "rgba(212,168,83,0.28)", letterSpacing: "0.2em" }}>✦</span>
              <div style={{ width: "34px", height: "1px", background: "linear-gradient(to left, transparent, rgba(212,168,83,0.32))" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "0.76rem", fontStyle: "italic", color: "rgba(212,168,83,0.38)", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Z całego serca,
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.55rem, 4vw, 2.1rem)", fontWeight: 400, fontStyle: "italic", background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 60%, #d4a853 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "r-shimmer 5s linear infinite", lineHeight: 1.1 }}>
              Twój Maksiu najlepszy
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ STYLES ═══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&display=swap');

        @keyframes r-shimmer { to { background-position: 200% center; } }
        @keyframes r-float {
          0%, 100% { transform: translateY(0);   opacity: 0.5; }
          50%       { transform: translateY(9px); opacity: 1;   }
        }

        html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }

        .r-card { cursor: default; }

        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.16); border-radius: 999px; }

        @media (max-width: 580px) {
          .r-card { flex-direction: column !important; text-align: left !important; gap: 0.6rem !important; }
          .r-num  { font-size: 2rem !important; width: auto !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}