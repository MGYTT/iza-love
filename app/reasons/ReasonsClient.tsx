"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   GSAP TYPES
══════════════════════════════════════════════════════════ */

type GSAPTarget = string | Element | Element[] | NodeListOf<Element> | null | undefined;

interface STConfig {
  trigger?: Element | string | null | undefined;
  start?: string;
  end?: string;
  scrub?: number | boolean;
  pin?: boolean;
  pinSpacing?: boolean;
  toggleActions?: string;
  anticipatePin?: number;
  invalidateOnRefresh?: boolean;
  fastScrollEnd?: boolean;
  preventOverlaps?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
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
  xPercent?: number;
  yPercent?: number;
  clipPath?: string;
  filter?: string;
  transformOrigin?: string;
  transformPerspective?: number;
  force3D?: boolean;
  duration?: number;
  delay?: number;
  ease?: string;
  stagger?: number | { each: number; ease?: string; from?: string };
  repeat?: number;
  yoyo?: boolean;
  overwrite?: boolean | string;
  scrollTrigger?: STConfig;
  onComplete?: () => void;
  clearProps?: string;
}

interface GSAPTimeline {
  from(t: GSAPTarget, v: TweenVars, p?: string | number): GSAPTimeline;
  to(t: GSAPTarget, v: TweenVars, p?: string | number): GSAPTimeline;
  fromTo(t: GSAPTarget, fv: TweenVars, tv: TweenVars, p?: string | number): GSAPTimeline;
  set(t: GSAPTarget, v: TweenVars, p?: string | number): GSAPTimeline;
  add(callback: () => void, position?: string | number): GSAPTimeline;
}

interface GSAPMatchMediaContext {
  add(conditions: string | Record<string, unknown>, func: () => (() => void) | void): void;
  revert(): void;
}

interface GSAPCtx {
  revert(): void;
}

interface GSAP {
  registerPlugin(...a: unknown[]): void;
  from(t: GSAPTarget, v: TweenVars): void;
  to(t: GSAPTarget, v: TweenVars): void;
  fromTo(t: GSAPTarget, fv: TweenVars, tv: TweenVars): void;
  set(t: GSAPTarget, v: TweenVars): void;
  timeline(v?: { scrollTrigger?: STConfig; defaults?: TweenVars; paused?: boolean }): GSAPTimeline;
  context(fn: () => void, scope?: Element | null): GSAPCtx;
  matchMedia(): GSAPMatchMediaContext;
  utils: { toArray<T = Element>(s: string | NodeList): T[] };
  ticker: { fps(n: number): void };
}

interface STPlugin {
  getAll(): { kill(r?: boolean): void }[];
  refresh(): void;
  normalizeScroll?(v: boolean): void;
}

interface SplitResult {
  chars: Element[];
  words: Element[];
  lines: Element[];
  revert(): void;
}

interface SplitPlugin {
  create(t: string | Element, v?: { type?: string; linesClass?: string }): SplitResult;
}

declare global {
  interface Window {
    gsap: GSAP;
    ScrollTrigger: STPlugin;
    SplitText: SplitPlugin;
  }
}

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */

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

const REGULAR = REASONS.filter((r): r is Reason & { isFinal: undefined } => !r.isFinal);
const FINAL = REASONS.find((r) => r.isFinal)!;

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${12 + ((i * 5.3) % 68)}%`,
  top: `${20 + ((i * 6.7) % 55)}%`,
  size: 3 + (i % 4) * 2.5,
  color:
    i % 3 === 0
      ? `rgba(212,168,83,${0.35 + (i % 4) * 0.07})`
      : i % 3 === 1
        ? `rgba(240,120,160,${0.28 + (i % 3) * 0.09})`
        : `rgba(190,140,255,${0.2 + (i % 3) * 0.07})`,
}));

/* ── Glow config — explicit type avoids union inference ── */
interface GlowConfig {
  cls: string;
  top: string;
  left?: string;
  right?: string;
  w: number;
  h: number;
  c: string;
}

const GLOWS: GlowConfig[] = [
  { cls: "r-glow-a", top: "-5%", left: "30%", w: 750, h: 600, c: "rgba(212,168,83,0.065)" },
  { cls: "r-glow-b", top: "40%", left: "0%",  w: 600, h: 500, c: "rgba(240,100,140,0.05)"  },
  { cls: "r-glow-c", top: "72%", right: "0%", w: 500, h: 500, c: "rgba(160,90,220,0.04)"   },
];

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed: ${src}`));
    document.head.appendChild(el);
  });
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */

export default function ReasonsClient() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<GSAPCtx | null>(null);
  const mmRef = useRef<GSAPMatchMediaContext | null>(null);
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

      if (isIOS()) gsap.ticker.fps(60);

      const scope = rootRef.current;
      if (!scope) return;

      scope.querySelectorAll<HTMLElement>(
        ".r-card, .r-final-card, .r-num, .r-emoji, .r-text, .r-line, .r-glow-a, .r-glow-b, .r-glow-c"
      ).forEach(el => {
        el.style.transform = "translateZ(0)";
        el.style.backfaceVisibility = "hidden";
      });

      const mm = gsap.matchMedia();
      mmRef.current = mm;

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         DESKTOP ≥ 768px
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      mm.add("(min-width: 768px)", () => {
        ctxRef.current = gsap.context(() => {

          gsap.to(".r-progress", {
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: 0.3, invalidateOnRefresh: true },
            scaleX: 1, ease: "none", transformOrigin: "left center", force3D: true,
          });

          ([ [".r-glow-a", -300, 60, 2.0], [".r-glow-b", 220, -40, 2.8], [".r-glow-c", -140, 0, 1.5] ] as const).forEach(([sel, y, x, spd]) => {
            gsap.to(sel, {
              scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: spd, invalidateOnRefresh: true },
              y, x, ease: "none", force3D: true,
            });
          });

          const heroTitle = scope.querySelector<HTMLElement>(".r-hero-title");
          if (heroTitle) {
            const split = SplitText.create(heroTitle, { type: "chars" });
            gsap.set(split.chars, { opacity: 0.06 });
            gsap.timeline({
              scrollTrigger: {
                trigger: scope.querySelector<HTMLElement>(".r-hero-section") ?? undefined,
                pin: true, pinSpacing: true,
                start: "top top", end: "+=1200",
                scrub: 1.2, anticipatePin: 1,
                invalidateOnRefresh: true, fastScrollEnd: true,
              },
            })
              .to(split.chars, { opacity: 1, stagger: { each: 0.045, ease: "power2.inOut" }, ease: "none", duration: 1 })
              .from(".r-hero-subtitle", { opacity: 0, y: 30, duration: 0.6 }, "-=0.3")
              .from(".r-scroll-hint", { opacity: 0, y: 14, duration: 0.4 }, "-=0.1");
          }

          gsap.from(".r-hero-eyebrow", {
            clipPath: "inset(0 100% 0 0)", opacity: 0,
            duration: 1.5, ease: "power4.inOut", delay: 0.2, force3D: true,
          });

          gsap.fromTo(".r-counter",
            { opacity: 0, scale: 0.5, y: 40 },
            { scrollTrigger: { trigger: ".r-counter", start: "top 88%", toggleActions: "play none none reverse", invalidateOnRefresh: true }, opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "back.out(1.8)", force3D: true }
          );

          scope.querySelectorAll<HTMLElement>(".r-card").forEach((card, i) => {
            const fromLeft = i % 2 === 0;
            const st: STConfig = { trigger: card, start: "top 85%", toggleActions: "play none none reverse", invalidateOnRefresh: true };

            const numEl  = card.querySelector<HTMLElement>(".r-num");
            const lineEl = card.querySelector<HTMLElement>(".r-line");
            const emEl   = card.querySelector<HTMLElement>(".r-emoji");
            const txtEl  = card.querySelector<HTMLElement>(".r-text");

            if (numEl)  gsap.fromTo(numEl,  { opacity: 0, rotationY: fromLeft ? -90 : 90, transformPerspective: 500, transformOrigin: fromLeft ? "left center" : "right center" }, { scrollTrigger: st, opacity: 1, rotationY: 0, duration: 0.9, ease: "power3.out", force3D: true });
            if (lineEl) gsap.fromTo(lineEl, { scaleX: 0, transformOrigin: fromLeft ? "left" : "right" }, { scrollTrigger: { ...st, start: "top 83%" }, scaleX: 1, duration: 0.7, ease: "power3.inOut", force3D: true, delay: 0.05 });
            if (emEl)   gsap.fromTo(emEl,   { opacity: 0, scale: 0, rotation: fromLeft ? -25 : 25, y: 20 }, { scrollTrigger: { ...st, start: "top 82%" }, opacity: 1, scale: 1, rotation: 0, y: 0, duration: 0.65, ease: "back.out(3)", delay: 0.1, force3D: true });
            if (txtEl)  {
              const sw = SplitText.create(txtEl, { type: "words" });
              gsap.fromTo(sw.words, { opacity: 0, y: 18 }, { scrollTrigger: { ...st, start: "top 81%" }, opacity: 1, y: 0, stagger: { each: 0.05, ease: "power2.out" }, duration: 0.5, ease: "power2.out", delay: 0.12, force3D: true });
            }

            card.addEventListener("mouseenter", () => gsap.to(card, { scale: 1.013, duration: 0.4, ease: "power2.out", force3D: true }));
            card.addEventListener("mouseleave", () => gsap.to(card, { scale: 1, duration: 0.5, ease: "power2.inOut", force3D: true }));
          });

          const finalSection = scope.querySelector<HTMLElement>(".r-final-section");
          const finalCard    = scope.querySelector<HTMLElement>(".r-final-card");

          if (finalSection && finalCard) {
            gsap.timeline({
              scrollTrigger: { trigger: finalSection, pin: true, pinSpacing: true, start: "top top", end: "+=1000", scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, fastScrollEnd: true },
            })
              .fromTo(finalCard, { opacity: 0, scale: 0.75, y: 80 }, { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out", force3D: true })
              .fromTo(".r-final-eyebrow", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, force3D: true }, "-=0.3")
              .fromTo(".r-final-sig", { opacity: 0, scale: 0.84, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.5)", force3D: true }, "-=0.2");

            const finalTextEl = finalCard.querySelector<HTMLElement>(".r-final-text");
            if (finalTextEl) {
              const sf = SplitText.create(finalTextEl, { type: "chars" });
              gsap.fromTo(sf.chars,
                { opacity: 0, y: 12, rotationX: -40 },
                { scrollTrigger: { trigger: finalCard, start: "top 65%", toggleActions: "play none none none", invalidateOnRefresh: true }, opacity: 1, y: 0, rotationX: 0, stagger: { each: 0.025, ease: "power2.out" }, duration: 0.4, ease: "power2.out", force3D: true }
              );
            }

            gsap.to(".r-final-heart", { scrollTrigger: { trigger: finalCard, start: "top 68%", invalidateOnRefresh: true }, scale: 1.22, duration: 0.68, repeat: -1, yoyo: true, ease: "sine.inOut", force3D: true });
            gsap.fromTo(".r-particle", { opacity: 0, scale: 0, y: 0 }, { scrollTrigger: { trigger: finalCard, start: "top 60%", toggleActions: "play none none none", invalidateOnRefresh: true }, opacity: 1, scale: 1, y: -65, stagger: { each: 0.065, from: "random" }, duration: 1.2, ease: "power3.out", force3D: true });
          }

        }, scope);
      });

      /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         MOBILE < 768px — iOS-safe
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
      mm.add("(max-width: 767px)", () => {
        ctxRef.current = gsap.context(() => {

          gsap.to(".r-progress", {
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom bottom", scrub: 0.1, invalidateOnRefresh: true },
            scaleX: 1, ease: "none", transformOrigin: "left center", force3D: true,
          });

          gsap.from(".r-hero-eyebrow", { opacity: 0, y: 20, duration: 1,   ease: "power3.out", delay: 0.15, force3D: true });
          gsap.from(".r-hero-title",   { opacity: 0, y: 30, duration: 1.1, ease: "power3.out", delay: 0.3,  force3D: true });
          gsap.from(".r-hero-subtitle",{ opacity: 0, y: 20, duration: 1,   ease: "power3.out", delay: 0.55, force3D: true });
          gsap.from(".r-scroll-hint",  { opacity: 0,        duration: 0.8,                     delay: 1     });

          gsap.fromTo(".r-counter",
            { opacity: 0, y: 35 },
            { scrollTrigger: { trigger: ".r-counter", start: "top 90%", toggleActions: "play none none none", invalidateOnRefresh: true }, opacity: 1, y: 0, duration: 0.9, ease: "power3.out", force3D: true }
          );

          scope.querySelectorAll<HTMLElement>(".r-card").forEach((card) => {
            const st: STConfig = { trigger: card, start: "top 92%", toggleActions: "play none none none", invalidateOnRefresh: true };
            const numEl  = card.querySelector<HTMLElement>(".r-num");
            const lineEl = card.querySelector<HTMLElement>(".r-line");
            const emEl   = card.querySelector<HTMLElement>(".r-emoji");
            const txtEl  = card.querySelector<HTMLElement>(".r-text");

            gsap.fromTo(card, { opacity: 0, y: 40 }, { scrollTrigger: st, opacity: 1, y: 0, duration: 0.75, ease: "power3.out", force3D: true });
            if (numEl)  gsap.fromTo(numEl,  { opacity: 0, x: -20 }, { scrollTrigger: { ...st, start: "top 90%" }, opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.1, force3D: true });
            if (lineEl) gsap.fromTo(lineEl, { scaleX: 0, transformOrigin: "left" }, { scrollTrigger: { ...st, start: "top 90%" }, scaleX: 1, duration: 0.6, ease: "power2.inOut", delay: 0.15, force3D: true });
            if (emEl)   gsap.fromTo(emEl,   { opacity: 0, scale: 0.4 }, { scrollTrigger: { ...st, start: "top 88%" }, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)", delay: 0.2, force3D: true });
            if (txtEl)  gsap.fromTo(txtEl,  { opacity: 0, y: 10 }, { scrollTrigger: { ...st, start: "top 88%" }, opacity: 1, y: 0, duration: 0.55, ease: "power2.out", delay: 0.25, force3D: true });
          });

          const finalCard = scope.querySelector<HTMLElement>(".r-final-card");
          if (finalCard) {
            gsap.fromTo(finalCard, { opacity: 0, scale: 0.88, y: 50 }, { scrollTrigger: { trigger: finalCard, start: "top 88%", toggleActions: "play none none none", invalidateOnRefresh: true }, opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power3.out", force3D: true });
            gsap.fromTo(".r-final-eyebrow", { opacity: 0, y: 16 }, { scrollTrigger: { trigger: finalCard, start: "top 85%", toggleActions: "play none none none" }, opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.2, force3D: true });
            gsap.fromTo(".r-final-text",    { opacity: 0, y: 20 }, { scrollTrigger: { trigger: finalCard, start: "top 83%", toggleActions: "play none none none" }, opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.35, force3D: true });
            gsap.fromTo(".r-final-sig",     { opacity: 0, y: 16 }, { scrollTrigger: { trigger: finalCard, start: "top 80%", toggleActions: "play none none none" }, opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.55, force3D: true });
            gsap.to(".r-final-heart", { scrollTrigger: { trigger: finalCard, start: "top 70%", invalidateOnRefresh: true }, scale: 1.18, duration: 0.72, repeat: -1, yoyo: true, ease: "sine.inOut" });
            gsap.fromTo(".r-particle", { opacity: 0, scale: 0 }, { scrollTrigger: { trigger: finalCard, start: "top 75%", toggleActions: "play none none none", invalidateOnRefresh: true }, opacity: 0.8, scale: 1, stagger: { each: 0.06, from: "random" }, duration: 0.9, ease: "power2.out", force3D: true });
          }

        }, scope);
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    boot().catch(console.error);

    return () => {
      ctxRef.current?.revert();
      mmRef.current?.revert();
    };
  }, []);

  /* ════════════════════════════════════════════════════
     JSX
  ════════════════════════════════════════════════════ */
  return (
    <div
      ref={rootRef}
      style={{ background: "#07030a", minHeight: "100dvh", overflowX: "hidden", position: "relative" as const }}
    >

      {/* Progress bar */}
      <div style={{ position: "fixed" as const, top: 0, left: 0, right: 0, height: "2px", zIndex: 100, background: "rgba(212,168,83,0.07)" }}>
        <div
          className="r-progress"
          style={{
            height: "100%",
            background: "linear-gradient(to right, #d4a853, #f0a0b8, #d4a853)",
            backgroundSize: "200% auto",
            animation: "r-shimmer 3s linear infinite",
            transform: "scaleX(0)",
            transformOrigin: "left center",
            backfaceVisibility: "hidden" as const,
          }}
        />
      </div>

      {/* Ambient glows */}
      {GLOWS.map(({ cls, top, left, right, w, h, c }) => (
        <div
          key={cls}
          aria-hidden
          className={cls}
          style={{
            position: "fixed" as const,
            top,
            ...(left  !== undefined ? { left }  : {}),
            ...(right !== undefined ? { right } : {}),
            width: w,
            height: h,
            background: `radial-gradient(ellipse, ${c} 0%, transparent 65%)`,
            filter: "blur(70px)",
            pointerEvents: "none" as const,
            zIndex: 0,
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden" as const,
          }}
        />
      ))}

      {/* Back button */}
      <button
        onClick={() => router.back()}
        aria-label="Wróć"
        style={{
          position: "fixed" as const,
          top: "env(safe-area-inset-top, 1.2rem)",
          left: "1.2rem",
          marginTop: "calc(env(safe-area-inset-top, 0px) + 0.4rem)",
          display: "flex",
          alignItems: "center" as const,
          gap: "5px",
          background: "rgba(212,168,83,0.05)",
          border: "1px solid rgba(212,168,83,0.12)",
          borderRadius: "999px",
          padding: "0.45rem 0.9rem",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.65rem",
          color: "rgba(212,168,83,0.45)",
          cursor: "pointer" as const,
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          zIndex: 50,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          minHeight: "44px",
          minWidth: "44px",
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
        <ArrowLeft size={12} /> Wróć
      </button>

      {/* ══════════════ HERO ══════════════ */}
      <section
        className="r-hero-section"
        style={{
          minHeight: "100svh",
          display: "flex", flexDirection: "column" as const,
          alignItems: "center" as const, justifyContent: "center" as const,
          textAlign: "center" as const,
          padding: "calc(env(safe-area-inset-top, 0px) + 5rem) 1.5rem 4rem",
          position: "relative" as const, zIndex: 1,
        }}
      >
        <div style={{ position: "absolute" as const, top: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "100px", background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.3))" }} />

        <div
          className="r-hero-eyebrow"
          style={{
            display: "inline-flex", alignItems: "center" as const, gap: "8px",
            marginBottom: "2.5rem", padding: "0.32rem 1.1rem",
            border: "1px solid rgba(212,168,83,0.14)", borderRadius: "999px",
            background: "rgba(212,168,83,0.04)",
            backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.5rem, 2vw, 0.58rem)", letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "rgba(212,168,83,0.6)" }}>
            ✦ dla Izy · z całego serca ✦
          </span>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.5rem, 9vw, 7rem)", fontWeight: 300, lineHeight: 0.87, color: "#f7cdd8", letterSpacing: "-0.03em", marginBottom: "0.06em" }}>
            Dlaczego
          </h1>
          <h1
            className="r-hero-title"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(2.5rem, 9vw, 7rem)",
              fontWeight: 300, lineHeight: 0.87, fontStyle: "italic" as const,
              background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 50%, #d4a853 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" as const,
              animation: "r-shimmer 5s linear infinite",
              letterSpacing: "-0.03em",
              display: "inline-block",
              backfaceVisibility: "hidden" as const,
            }}
          >
            Cię kocham
          </h1>
        </div>

        <p
          className="r-hero-subtitle"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(0.88rem, 2.5vw, 1.15rem)", fontStyle: "italic" as const, color: "rgba(240,160,184,0.38)", maxWidth: "300px", lineHeight: 1.95, marginBottom: "4rem" }}
        >
          22 powody, które mogłyby zapełnić całe niebo.
          <br />Ale wybrałem te, które znam na pamięć.
        </p>

        <div className="r-scroll-hint" style={{ display: "flex", flexDirection: "column" as const, alignItems: "center" as const, gap: "8px" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.52rem", letterSpacing: "0.28em", textTransform: "uppercase" as const, color: "rgba(240,160,184,0.2)" }}>Przewiń</span>
          <div style={{ animation: "r-float 2.4s ease-in-out infinite" }}>
            {[0, 1].map(i => (
              <div key={i} style={{ display: "flex", gap: "3px", marginBottom: "2px" }}>
                <div style={{ width: "7px", height: "1px", background: `rgba(212,168,83,${i === 0 ? 0.3 : 0.15})`, transform: "rotate(35deg) translateX(2px)" }} />
                <div style={{ width: "7px", height: "1px", background: `rgba(212,168,83,${i === 0 ? 0.3 : 0.15})`, transform: "rotate(-35deg)" }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "100px", background: "linear-gradient(to bottom, rgba(212,168,83,0.3), transparent)" }} />
      </section>

      {/* ══════════════ COUNTER ══════════════ */}
      <div style={{ textAlign: "center" as const, padding: "5rem 1rem 3rem", position: "relative" as const, zIndex: 1 }}>
        <div className="r-counter" style={{ display: "inline-flex", flexDirection: "column" as const, alignItems: "center" as const, gap: "0.35rem" }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(4.5rem, 13vw, 9rem)", fontWeight: 300, lineHeight: 1,
            background: "linear-gradient(135deg, rgba(212,168,83,0.13), rgba(212,168,83,0.04))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" as const,
            letterSpacing: "-0.05em",
          }}>22</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase" as const, color: "rgba(240,160,184,0.2)" }}>powodów</span>
        </div>
      </div>

      {/* ══════════════ CARDS ══════════════ */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem clamp(1rem, 5vw, 2rem) 5rem", position: "relative" as const, zIndex: 1 }}>
  {REGULAR.map((reason, i) => {
    const fromLeft = i % 2 === 0;

    // ── wyciągnij ternary PRZED JSX jako typed zmienne ──
    const cardDirection   = fromLeft ? "row"     : "row-reverse"   as React.CSSProperties["flexDirection"];
    const cardAlign       = fromLeft ? "left"    : "right"         as React.CSSProperties["textAlign"];
    const innerDirection  = fromLeft ? "row"     : "row-reverse"   as React.CSSProperties["flexDirection"];

    return (
      <div
        key={reason.number}
        className="r-card"
        style={{
          display: "flex",
          alignItems: "flex-start" as const,
          gap: "clamp(1rem, 4vw, 2.5rem)",
          marginBottom: "clamp(3rem, 6vw, 5rem)",
          flexDirection: cardDirection,
          textAlign: cardAlign,
          backfaceVisibility: "hidden" as const,
        }}
      >
        <div
          className="r-num"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(2.2rem, 5vw, 4.8rem)",
            fontWeight: 300, lineHeight: 1,
            color: "rgba(212,168,83,0.08)",
            letterSpacing: "-0.05em",
            flexShrink: 0,
            width: "clamp(55px, 9vw, 78px)",
            textAlign: "center" as const,
            userSelect: "none" as const,
          }}
        >
          {reason.number}
        </div>

        <div style={{ flex: 1, paddingTop: "0.5rem" }}>
          <div
            className="r-line"
            style={{
              height: "1px",
              background: fromLeft
                ? "linear-gradient(to right, rgba(212,168,83,0.26), transparent)"
                : "linear-gradient(to left, rgba(212,168,83,0.26), transparent)",
              marginBottom: "0.9rem",
            }}
          />
          <div style={{ display: "flex", alignItems: "center" as const, gap: "0.75rem", flexDirection: innerDirection }}>
            <span className="r-emoji" style={{ fontSize: "clamp(1.2rem, 4vw, 1.55rem)", flexShrink: 0, display: "block" }}>
              {reason.emoji}
            </span>
            <p
              className="r-text"
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: "clamp(1rem, 2.8vw, 1.55rem)",
                fontWeight: 300,
                color: "#eec8d4",
                lineHeight: 1.6,
                letterSpacing: "0.01em",
              }}
            >
              {reason.text}
            </p>
          </div>
        </div>
      </div>
    );
  })}
</section>

      {/* ══════════════ FINAL ══════════════ */}
      <section
        className="r-final-section"
        style={{
          minHeight: "100svh",
          display: "flex", alignItems: "center" as const, justifyContent: "center" as const,
          padding: "3rem clamp(1rem, 5vw, 2rem) calc(env(safe-area-inset-bottom, 0px) + 3rem)",
          position: "relative" as const, zIndex: 1,
        }}
      >
        <div aria-hidden style={{ position: "absolute" as const, inset: 0, pointerEvents: "none" as const, overflow: "hidden" as const }}>
          {PARTICLES.map(p => (
            <div
              key={p.id}
              className="r-particle"
              style={{
                position: "absolute" as const, left: p.left, top: p.top,
                width: p.size, height: p.size,
                borderRadius: "50%",
                background: p.color,
                opacity: 0,
                transform: "translateZ(0)",
                backfaceVisibility: "hidden" as const,
              }}
            />
          ))}
        </div>

        <div
          className="r-final-card"
          style={{
            maxWidth: "560px", width: "100%",
            padding: "clamp(2.5rem, 6vw, 4.5rem) clamp(1.5rem, 5vw, 3.5rem)",
            background: "linear-gradient(135deg, rgba(212,168,83,0.07) 0%, rgba(240,100,140,0.04) 55%, rgba(160,90,220,0.03) 100%)",
            border: "1px solid rgba(212,168,83,0.16)",
            borderRadius: "clamp(1.5rem, 4vw, 2.5rem)",
            textAlign: "center" as const,
            position: "relative" as const, overflow: "hidden" as const,
            boxShadow: "0 0 70px rgba(212,168,83,0.06), 0 25px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(212,168,83,0.1)",
            backfaceVisibility: "hidden" as const,
          }}
        >
          <div aria-hidden style={{ position: "absolute" as const, top: "-20%", left: "50%", transform: "translateX(-50%)", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(212,168,83,0.08), transparent 70%)", pointerEvents: "none" as const }} />

          <div
            className="r-final-eyebrow"
            style={{
              display: "inline-flex", alignItems: "center" as const, gap: "7px",
              marginBottom: "1.75rem", padding: "0.28rem 0.85rem",
              border: "1px solid rgba(212,168,83,0.11)", borderRadius: "999px",
              position: "relative" as const, zIndex: 1,
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.48rem, 1.8vw, 0.54rem)", letterSpacing: "0.24em", textTransform: "uppercase" as const, color: "rgba(212,168,83,0.4)" }}>✦ i najważniejsze ✦</span>
          </div>

          <div className="r-final-heart" style={{ fontSize: "clamp(2.5rem, 7vw, 3.5rem)", marginBottom: "1.75rem", display: "block", transformOrigin: "center" }}>❤️</div>

          <p
            className="r-final-text"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.1rem, 3vw, 1.8rem)",
              fontWeight: 300, fontStyle: "italic" as const,
              color: "#f7cdd8", lineHeight: 1.85,
              letterSpacing: "0.01em",
              position: "relative" as const, zIndex: 1,
              marginBottom: "2rem",
            }}
          >
            {FINAL.text}
          </p>

          <div className="r-final-sig" style={{ position: "relative" as const, zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center" as const, justifyContent: "center" as const, gap: "11px", marginBottom: "1.1rem" }}>
              <div style={{ width: "32px", height: "1px", background: "linear-gradient(to right, transparent, rgba(212,168,83,0.3))" }} />
              <span style={{ fontSize: "0.48rem", color: "rgba(212,168,83,0.26)", letterSpacing: "0.18em" }}>✦</span>
              <div style={{ width: "32px", height: "1px", background: "linear-gradient(to left, transparent, rgba(212,168,83,0.3))" }} />
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(0.7rem, 2vw, 0.76rem)", fontStyle: "italic" as const, color: "rgba(212,168,83,0.36)", letterSpacing: "0.06em", marginBottom: "0.35rem" }}>
              Z całego serca,
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(1.4rem, 5vw, 2.1rem)",
              fontWeight: 400, fontStyle: "italic" as const,
              background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 60%, #d4a853 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" as const,
              animation: "r-shimmer 5s linear infinite",
              lineHeight: 1.1,
            }}>
              Twój Maksiu najlepszy
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&display=swap');

        @keyframes r-shimmer { to { background-position: 200% center; } }
        @keyframes r-float {
          0%, 100% { transform: translateY(0);    opacity: 0.45; }
          50%       { transform: translateY(10px); opacity: 1;    }
        }

        * { -webkit-tap-highlight-color: transparent; touch-action: pan-y; }
        html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        body { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }

        @media (hover: hover) {
          ::-webkit-scrollbar { width: 2px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(212,168,83,0.16); border-radius: 999px; }
        }

        @media (max-width: 480px) {
          .r-card { flex-direction: row !important; text-align: left !important; }
        }

        .r-card:active { opacity: 0.85; }
        button:active   { opacity: 0.8; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}