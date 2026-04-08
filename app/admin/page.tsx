"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Heart } from "lucide-react";

const PASSWORD = "maks12345"; // Zmień na swoje hasło!

export default function AdminLogin() {
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState(false);
  const [shake, setShake]   = useState(false);
  const router              = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === PASSWORD) {
      sessionStorage.setItem("admin-auth", "true");
      router.push("/admin/dashboard");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <main style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
    }}>
      {/* Background glow */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,168,83,0.08), transparent)",
      }} />

      <div
        className="glass"
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "2.5rem",
          textAlign: "center",
          animation: shake ? "shakeX 0.4s ease" : "scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div style={{ marginBottom: "1.75rem" }}>
          <div style={{
            width: "52px", height: "52px",
            borderRadius: "50%",
            background: "rgba(212,168,83,0.1)",
            border: "1px solid rgba(212,168,83,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <Lock size={20} style={{ color: "#d4a853" }} />
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.8rem",
            fontWeight: 300,
            color: "#f7cdd8",
            marginBottom: "0.4rem",
          }}>
            Panel Twórcy
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            color: "rgba(240,160,184,0.4)",
          }}>
            Tylko dla Ciebie — zarządzaj piosenkami dla Izy
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false); }}
            placeholder="Hasło..."
            autoFocus
            style={{
              width: "100%",
              padding: "0.85rem 1.1rem",
              borderRadius: "0.75rem",
              border: `1px solid ${error ? "rgba(240,100,100,0.4)" : "rgba(240,160,184,0.15)"}`,
              background: "rgba(16,5,8,0.6)",
              color: "#f7cdd8",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.95rem",
              outline: "none",
              transition: "border-color 0.2s",
              textAlign: "center",
              letterSpacing: "0.15em",
            }}
          />
          {error && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.75rem",
              color: "rgba(240,100,100,0.7)",
            }}>
              Złe hasło. Spróbuj ponownie.
            </p>
          )}
          <button
            type="submit"
            style={{
              padding: "0.9rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "linear-gradient(135deg, #d4a853, rgba(240,160,184,0.8))",
              color: "#100508",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "opacity 0.2s",
            }}
          >
            <Heart size={14} fill="#100508" />
            Wejdź
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}