"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { Song } from "@/lib/types";

interface Props {
  song: Song;
  onTimeUpdate?: (time: number) => void;
}

export default function MusicPlayer({ song, onTimeUpdate }: Props) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const rafRef    = useRef<number>(0);
  const [playing, setPlaying]   = useState(false);
  const [current, setCurrent]   = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]     = useState(0.8);
  const [muted, setMuted]       = useState(false);

  // Fake waveform heights
  const bars = Array.from({ length: 40 }, () => 20 + Math.random() * 80);

  useEffect(() => {
    const audio = new Audio(song.audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setPlaying(false));

    return () => {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.audioUrl]);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(audio.currentTime);
    onTimeUpdate?.(audio.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      cancelAnimationFrame(rafRef.current);
    } else {
      audio.play().catch(() => {});
      rafRef.current = requestAnimationFrame(tick);
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const progress = duration ? current / duration : 0;

  return (
    <div className="glass p-6 rounded-2xl space-y-5">
      {/* Waveform */}
      <div
        className="flex items-end gap-[2px] h-16 cursor-pointer group"
        onClick={seek}
        role="slider"
        aria-label="Seek"
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
      >
        {bars.map((h, i) => {
          const ratio = i / bars.length;
          const passed = ratio < progress;
          return (
            <div
              key={i}
              className={`flex-1 rounded-full transition-colors duration-100
                          ${passed ? "bg-rose-gold" : "bg-rose-blush/20"}
                          ${playing && passed ? "wave-bar" : ""}`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      {/* Time */}
      <div className="flex justify-between text-xs font-body text-[var(--text-muted)]">
        <span>{fmt(current)}</span>
        <span>{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        <button onClick={restart} aria-label="Restart" className="text-rose-blush/50 hover:text-rose-blush transition-colors">
          <SkipBack size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          aria-label={playing ? "Pauza" : "Odtwórz"}
          className="w-14 h-14 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-rose-gold/90 to-rose-blush/80
                     text-[#1a0a0f] shadow-[0_0_24px_rgba(212,168,83,0.4)]
                     hover:shadow-[0_0_36px_rgba(212,168,83,0.6)]
                     transition-all duration-300"
        >
          {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="translate-x-0.5" />}
        </motion.button>

        <button onClick={toggleMute} aria-label={muted ? "Włącz dźwięk" : "Wycisz"} className="text-rose-blush/50 hover:text-rose-blush transition-colors">
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-3">
        <Volume2 size={13} className="text-rose-blush/40 flex-shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
            if (v > 0) setMuted(false);
          }}
          aria-label="Głośność"
          className="flex-1 h-1 appearance-none rounded-full
                     bg-rose-blush/20 accent-rose-gold cursor-pointer"
        />
      </div>
    </div>
  );
}