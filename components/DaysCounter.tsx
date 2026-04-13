"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DaysTogether from "./DaysTogether";

export default function DaysCounter({ startDate }: { startDate: string }) {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const [hint, setHint] = useState(false);

  const handleTap = () => {
    const next = taps + 1;
    setTaps(next);

    // Po 2 tapach — subtelny hint
    if (next === 2) {
      setHint(true);
      setTimeout(() => setHint(false), 800);
    }

    // Po 3 tapach — przejście na /love
    if (next >= 3) {
      router.push("/love");
      setTaps(0);
    }

    // Reset po 2 sekundach bez kliknięcia
    setTimeout(() => setTaps(prev => (prev === next ? 0 : prev)), 2000);
  };

  return (
    <div
      onClick={handleTap}
      style={{
        flex: 1,
        textAlign: "center",
        padding: "0 1.5rem",
        cursor: "pointer",
        userSelect: "none",
        transition: "transform 0.15s",
        transform: hint ? "scale(1.08)" : "scale(1)",
      }}
    >
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "2.4rem",
        fontWeight: 400,
        color: hint ? "#f0a0b8" : "#d4a853",
        lineHeight: 1,
        marginBottom: "5px",
        transition: "color 0.2s",
      }}>
        <DaysTogether startDate={startDate} />
      </div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.6rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: hint ? "rgba(240,160,184,0.55)" : "rgba(240,160,184,0.32)",
        transition: "color 0.2s",
      }}>
        Dni razem
      </div>
    </div>
  );
}