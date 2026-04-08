"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Ambient audio – cichy szum/muzyka gdy nic nie gra
// Zastąp src swoim własnym plikiem ambient
const AMBIENT_SRC = "/audio/ambient.mp3";

export default function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const audio = new Audio(AMBIENT_SRC);
    audio.loop   = true;
    audio.volume = 0.06;
    audioRef.current = audio;

    // Start po pierwszej interakcji użytkownika
    const start = () => {
      audio.play().catch(() => {});
      setActive(true);
      document.removeEventListener("click", start);
    };
    document.addEventListener("click", start);

    return () => {
      audio.pause();
      document.removeEventListener("click", start);
    };
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (muted) {
      audioRef.current.volume = 0.06;
    } else {
      audioRef.current.volume = 0;
    }
    setMuted(!muted);
  };

  if (!active) return null;

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Włącz muzykę ambient" : "Wycisz muzykę ambient"}
      className="fixed bottom-5 left-5 z-50 glass p-3 rounded-full
                 text-rose-blush/60 hover:text-rose-blush
                 transition-all duration-300 hover:scale-110"
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}