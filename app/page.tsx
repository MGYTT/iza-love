// BEZ "use client" — Server Component
import { Suspense } from "react";
import { Heart, Music, Sparkles } from "lucide-react";
import Timeline from "@/components/Timeline";
import { getAllSongs } from "@/lib/songs-db";

export const revalidate = 0;

/* ── Licznik dni razem ── */
function DaysTogther({ startDate }: { startDate: string }) {
  const start = new Date(startDate).getTime();
  const now   = Date.now();
  const days  = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return <>{days.toLocaleString("pl-PL")}</>;
}

/* ── Skeleton card ── */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div style={{
      height: "130px",
      borderRadius: "1.1rem",
      background: "rgba(240,160,184,0.03)",
      border: "1px solid rgba(240,160,184,0.06)",
      animationDelay: `${delay}s`,
    }} className="skeleton-pulse" />
  );
}

export default async function HomePage() {
  const songs  = await getAllSongs();
  const sorted = [...songs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  /* Najwcześniejsza data wspomnienia jako "data początku" */
  const firstDate = sorted[0]?.date ?? "2023-01-01";

  return (
    <main style={{ minHeight: "100dvh", overflowX: "hidden" }}>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "5rem 1.5rem 7rem",
        overflow: "hidden",
      }}>

        {/* ── Background glows ── */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {/* top center gold */}
          <div style={{ position: "absolute", top: "-8%", left: "50%", transform: "translateX(-50%)", width: "800px", height: "500px", background: "radial-gradient(ellipse, rgba(212,168,83,0.11) 0%, transparent 65%)", filter: "blur(40px)" }} />
          {/* mid pink */}
          <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "500px", background: "radial-gradient(ellipse, rgba(240,100,140,0.07) 0%, transparent 65%)", filter: "blur(60px)" }} />
          {/* side accents */}
          <div style={{ position: "absolute", top: "25%", left: "-8%", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", top: "45%", right: "-8%", width: "320px", height: "320px", background: "radial-gradient(circle, rgba(240,160,184,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
          {/* subtle star particles */}
          {["15% 20%", "80% 15%", "70% 75%", "20% 80%", "90% 50%"].map((pos, i) => (
            <div key={i} style={{
              position: "absolute",
              top: pos.split(" ")[1],
              left: pos.split(" ")[0],
              width: "2px", height: "2px",
              borderRadius: "50%",
              background: "rgba(212,168,83,0.4)",
              animation: `twinkle ${2.5 + i * 0.7}s ease-in-out ${i * 0.4}s infinite`,
            }} />
          ))}
        </div>

        {/* Top line */}
        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "100px", background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.45))" }} />

        {/* ── Hero content ── */}
        <div style={{ position: "relative", zIndex: 1 }} className="hero-content">

          {/* Eyebrow */}
          <div className="hero-eyebrow" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "2.5rem",
            padding: "0.4rem 1.2rem",
            border: "1px solid rgba(212,168,83,0.18)",
            borderRadius: "999px",
            background: "rgba(212,168,83,0.05)",
          }}>
            <Sparkles size={10} style={{ color: "rgba(212,168,83,0.7)" }} />
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.68rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(212,168,83,0.8)",
            }}>
              Tylko dla Ciebie · Izo
            </span>
            <Sparkles size={10} style={{ color: "rgba(212,168,83,0.7)" }} />
          </div>

          {/* Main heading */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(4rem, 11vw, 9rem)",
              fontWeight: 300,
              lineHeight: 0.9,
              color: "#f7cdd8",
              letterSpacing: "-0.02em",
              marginBottom: "0.2rem",
            }}>
              Nasza
            </h1>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(4rem, 11vw, 9rem)",
              fontWeight: 300,
              lineHeight: 0.9,
              fontStyle: "italic",
              background: "linear-gradient(135deg, #d4a853 0%, #f0a0b8 45%, #d4a853 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 5s linear infinite",
              letterSpacing: "-0.02em",
            }}>
              Historia
            </h1>
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
            color: "rgba(240,160,184,0.5)",
            maxWidth: "400px",
            margin: "0 auto 3.5rem",
            lineHeight: 1.8,
            fontWeight: 300,
          }}>
            Każda piosenka to rozdział naszej miłości.
            <br />
            Przewiń w dół i posłuchaj jak to się zaczęło.
          </p>

          {/* ── Stats row ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            marginBottom: "4rem",
            background: "rgba(16,5,8,0.5)",
            border: "1px solid rgba(240,160,184,0.08)",
            borderRadius: "1.25rem",
            padding: "1.25rem 0",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxWidth: "420px",
            width: "100%",
          }}>

            {/* Piosenki */}
            <div style={{ flex: 1, textAlign: "center", padding: "0 1.5rem" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2.4rem",
                fontWeight: 400,
                color: "#d4a853",
                lineHeight: 1,
                marginBottom: "5px",
              }}>
                {songs.length}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,160,184,0.32)",
              }}>
                Piosenek
              </div>
            </div>

            <div style={{ width: "1px", alignSelf: "stretch", background: "rgba(240,160,184,0.1)" }} />

            {/* Dni razem */}
            <div style={{ flex: 1, textAlign: "center", padding: "0 1.5rem" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2.4rem",
                fontWeight: 400,
                color: "#d4a853",
                lineHeight: 1,
                marginBottom: "5px",
              }}>
                <DaysTogther startDate={firstDate} />
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,160,184,0.32)",
              }}>
                Dni razem
              </div>
            </div>

            <div style={{ width: "1px", alignSelf: "stretch", background: "rgba(240,160,184,0.1)" }} />

            {/* Serce */}
            <div style={{ flex: 1, textAlign: "center", padding: "0 1.5rem" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "5px",
                animation: "heartbeat 2s ease-in-out infinite",
              }}>
                <Heart
                  size={26}
                  fill="rgba(240,100,140,0.85)"
                  color="rgba(240,100,140,0.85)"
                />
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,160,184,0.32)",
              }}>
                Na zawsze
              </div>
            </div>
          </div>

          {/* ── Scroll CTA ── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(240,160,184,0.28)",
            }}>
              Odkrywaj
            </span>
            {/* Animated chevrons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", animation: "floatDown 2.4s ease-in-out infinite" }}>
              <div style={{ width: "10px", height: "1px", background: "rgba(212,168,83,0.4)", transform: "rotate(35deg) translateX(3px)" }} />
              <div style={{ width: "10px", height: "1px", background: "rgba(212,168,83,0.25)", transform: "rotate(35deg) translateX(3px)" }} />
              <div style={{ width: "10px", height: "1px", background: "rgba(212,168,83,0.4)", transform: "rotate(-35deg)" }} />
              <div style={{ width: "10px", height: "1px", background: "rgba(212,168,83,0.25)", transform: "rotate(-35deg)" }} />
            </div>
          </div>
        </div>

        {/* Bottom line */}
        <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "100px", background: "linear-gradient(to bottom, rgba(212,168,83,0.45), transparent)" }} />
      </section>

      {/* ════════════════════════════════
          SECTION HEADER — Nasza oś czasu
      ════════════════════════════════ */}
      <div style={{
        textAlign: "center",
        padding: "5rem 1rem 1.5rem",
        position: "relative",
      }}>
        {/* Ikona nad tytułem */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "rgba(212,168,83,0.08)",
          border: "1px solid rgba(212,168,83,0.18)",
          marginBottom: "1.25rem",
        }}>
          <Music size={16} style={{ color: "rgba(212,168,83,0.7)" }} />
        </div>

        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
          fontWeight: 300,
          fontStyle: "italic",
          color: "rgba(247,205,216,0.65)",
          letterSpacing: "0.02em",
          marginBottom: "1rem",
        }}>
          Nasza oś czasu
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          color: "rgba(212,168,83,0.3)",
        }}>
          <div style={{ width: "40px", height: "1px", background: "linear-gradient(to right, transparent, rgba(212,168,83,0.4))" }} />
          <span style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}>✦</span>
          <div style={{ width: "40px", height: "1px", background: "linear-gradient(to left, transparent, rgba(212,168,83,0.4))" }} />
        </div>

        {songs.length > 0 && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(240,160,184,0.28)",
            marginTop: "0.85rem",
            letterSpacing: "0.05em",
          }}>
            {songs.length} {songs.length === 1 ? "rozdział" : songs.length < 5 ? "rozdziały" : "rozdziałów"} naszej historii
          </p>
        )}
      </div>

      {/* ════════════════════════════════
          TIMELINE
      ════════════════════════════════ */}
      {sorted.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "6rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div style={{ animation: "heartbeat 2s ease-in-out infinite" }}>
            <Heart size={32} style={{ color: "rgba(240,160,184,0.15)" }} />
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "1.2rem",
            color: "rgba(240,160,184,0.2)",
          }}>
            Historia dopiero się zaczyna... ♥
          </p>
        </div>
      ) : (
        <Suspense fallback={
          <div style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}>
            {[0, 1, 2].map(n => <SkeletonCard key={n} delay={n * 0.15} />)}
          </div>
        }>
          <Timeline songs={sorted} />
        </Suspense>
      )}

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer style={{
        textAlign: "center",
        padding: "5rem 1.5rem 4rem",
        borderTop: "1px solid rgba(240,160,184,0.06)",
        position: "relative",
      }}>
        {/* Glow */}
        <div aria-hidden style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "400px", height: "1px",
          background: "linear-gradient(to right, transparent, rgba(212,168,83,0.25), transparent)",
        }} />

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div style={{ animation: "heartbeat 2.5s ease-in-out infinite" }}>
            <Heart
              size={18}
              fill="rgba(240,100,140,0.4)"
              color="rgba(240,100,140,0.4)"
            />
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(240,160,184,0.2)",
            letterSpacing: "0.04em",
          }}>
            Zrobione z całego serca — tylko dla Ciebie, Izo
          </p>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(212,168,83,0.18)",
          }}>
            ✦ zawsze ✦
          </div>
        </div>
      </footer>

      <style>{`
        /* ── Animations ── */
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1);    }
          14%       { transform: scale(1.18); }
          28%       { transform: scale(1);    }
          42%       { transform: scale(1.12); }
          56%       { transform: scale(1);    }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1);   }
          50%       { opacity: 0.7;  transform: scale(1.8); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0);   opacity: 0.6; }
          50%       { transform: translateY(7px); opacity: 1;   }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }

        /* ── Hero entrance ── */
        .hero-content {
          animation: fadeSlideUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }

        /* ── Skeleton ── */
        .skeleton-pulse {
          animation: skeleton-pulse 1.8s ease-in-out infinite;
        }

        /* ── Scrollbar global ── */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(212,168,83,0.18);
          border-radius: 999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(212,168,83,0.35);
        }
      `}</style>
    </main>
  );
}