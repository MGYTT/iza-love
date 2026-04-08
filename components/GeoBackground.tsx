"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function GeoBackground() {
  const [bg, setBg] = useState<string>("/backgrounds/default-sunset.jpg");
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then((data) => {
        setBg(data.background);
        setCity(data.city);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Sunset photo */}
      <Image
        src={bg}
        alt={`${city} o zachodzie słońca`}
        fill
        priority
        className="object-cover opacity-20 transition-opacity duration-1000"
        style={{ filter: "saturate(1.4) blur(2px)" }}
      />

      {/* Deep rose gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0f]/80 via-[#2d1018]/60 to-[#1a0a0f]/90" />

      {/* Radial glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_60%,rgba(212,168,83,0.08),transparent)]" />
    </div>
  );
}