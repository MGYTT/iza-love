"use client";

import { useEffect } from "react";

export default function NightModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const checkNight = () => {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;
      document.documentElement.setAttribute(
        "data-night",
        isNight ? "true" : "false"
      );
    };
    checkNight();
    const interval = setInterval(checkNight, 60_000);
    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}