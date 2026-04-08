"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

export default function LoadingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pokaż loading tylko raz na sesję
    const seen = sessionStorage.getItem("loading-seen");
    if (seen) {
      setLoading(false);
    }
  }, []);

  const handleDone = () => {
    sessionStorage.setItem("loading-seen", "true");
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <>
      {loading && <LoadingScreen onDone={handleDone} />}
      <div style={{
        opacity: loading ? 0 : 1,
        transition: "opacity 0.6s ease 0.2s",
        minHeight: "100dvh",
      }}>
        {children}
      </div>
    </>
  );
}