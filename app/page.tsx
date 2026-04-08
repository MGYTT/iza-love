// BEZ "use client" — to Server Component
import { Suspense } from "react";
import { Heart, ChevronDown } from "lucide-react";
import Timeline from "@/components/Timeline";
import { getAllSongs } from "@/lib/songs-db";

export const revalidate = 0; // zawsze świeże dane

export default async function HomePage() {
  const songs = await getAllSongs();
  const sorted = [...songs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <main style={{ minHeight: "100dvh" }}>

      {/* ════ HERO ════ */}
      <section style={{
        position: "relative", minHeight: "100svh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "5rem 1.5rem 6rem", overflow: "hidden",
      }}>
        {/* Background glows */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "700px", height: "400px", background: "radial-gradient(ellipse, rgba(212,168,83,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(240,100,140,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "20%", left: "-5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", top: "40%", right: "-5%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(240,160,184,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
        </div>

        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "80px", background: "linear-gradient(to bottom, transparent, rgba(212,168,83,0.5))" }} />

        <div style={{ position: "relative", zIndex: 1, animation: "fadeSlideUp 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
          {/* Eyebrow */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "2rem" }}>
            <div style={{ height: "1px", width: "40px", background: "rgba(212,168,83,0.4)" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(212,168,83,0.8)" }}>
              Tylko dla Ciebie · Izo
            </span>
            <div style={{ height: "1px", width: "40px", background: "rgba(212,168,83,0.4)" }} />
          </div>

          {/* Heading */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(3.5rem, 10vw, 8rem)", fontWeight: 300, lineHeight: 0.92, color: "#f7cdd8", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
            Nasza
          </h1>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(3.5rem, 10vw, 8rem)", fontWeight: 300, lineHeight: 0.92, fontStyle: "italic", background: "linear-gradient(135deg, #d4a853, #f0a0b8, #d4a853)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "2.5rem", animation: "shimmer 4s linear infinite", letterSpacing: "-0.02em" }}>
            Historia
          </h1>

          {/* Subtitle */}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.9rem, 2vw, 1.05rem)", color: "rgba(240,160,184,0.55)", maxWidth: "420px", margin: "0 auto 3rem", lineHeight: 1.7, fontWeight: 300 }}>
            Każda piosenka to rozdział naszej miłości.<br />
            Przewiń w dół i posłuchaj jak to się zaczęło.
          </p>

          {/* Stats row — dane z Supabase, gotowe od razu (SSR) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", marginBottom: "3.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#d4a853", lineHeight: 1 }}>
                {songs.length}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", marginTop: "4px" }}>
                Piosenek
              </div>
            </div>
            <div style={{ width: "1px", height: "36px", background: "rgba(240,160,184,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#d4a853", lineHeight: 1 }}>∞</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", marginTop: "4px" }}>Miłości</div>
            </div>
            <div style={{ width: "1px", height: "36px", background: "rgba(240,160,184,0.15)" }} />
            <div style={{ textAlign: "center" }}>
              <Heart size={20} fill="rgba(240,100,140,0.8)" color="rgba(240,100,140,0.8)" style={{ margin: "0 auto" }} />
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(240,160,184,0.35)", marginTop: "4px" }}>Zawsze</div>
            </div>
          </div>

          {/* Scroll CTA */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "rgba(240,160,184,0.3)", animation: "float 3s ease-in-out infinite" }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Odkrywaj</span>
            <ChevronDown size={16} />
          </div>
        </div>

        <div aria-hidden style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "1px", height: "80px", background: "linear-gradient(to bottom, rgba(212,168,83,0.5), transparent)" }} />
      </section>

      {/* ════ DIVIDER ════ */}
      <div style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(247,205,216,0.6)", letterSpacing: "0.02em" }}>
          Nasza oś czasu
        </p>
        <div style={{ width: "60px", height: "1px", margin: "1rem auto 0", background: "linear-gradient(to right, transparent, rgba(212,168,83,0.5), transparent)" }} />
      </div>

      {/* ════ TIMELINE ════ */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "5rem 1rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.2rem", color: "rgba(240,160,184,0.2)" }}>
          Historia dopiero się zaczyna... ♥
        </div>
      ) : (
        <Suspense fallback={
          <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ height: "120px", borderRadius: "1rem", background: "rgba(240,160,184,0.04)", border: "1px solid rgba(240,160,184,0.06)", animation: `shimmerBg 1.8s ease-in-out ${n * 0.15}s infinite` }} />
            ))}
          </div>
        }>
          <Timeline songs={sorted} />
        </Suspense>
      )}

      {/* ════ FOOTER ════ */}
      <footer style={{ textAlign: "center", padding: "5rem 1rem", borderTop: "1px solid rgba(240,160,184,0.06)" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontStyle: "italic", fontWeight: 300, color: "rgba(240,160,184,0.2)", letterSpacing: "0.05em" }}>
          Zrobione z całego serca — tylko dla Ciebie, Izo ♥
        </div>
      </footer>

      <style>{`
        @keyframes shimmerBg { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { to{background-position:200% center} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
      `}</style>
    </main>
  );
}