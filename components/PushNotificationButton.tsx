"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function urlBase64ToUint8Array(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default function PushNotificationButton() {
  const [status,    setStatus]    = useState<"idle"|"granted"|"denied"|"loading">("idle");
  const [supported, setSupported] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => {
    /* Cały dostęp do browser API wyłącznie w useEffect */
    setMounted(true);

    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    setSupported(isSupported);

    if (isSupported) {
      if (Notification.permission === "granted") setStatus("granted");
      if (Notification.permission === "denied")  setStatus("denied");
    }
  }, []);

  const subscribe = async () => {
    if (typeof window === "undefined") return;
    setStatus("loading");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      await fetch("/api/push/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(sub),
      });

      setStatus("granted");
    } catch {
      setStatus("idle");
    }
  };

  /* Nie renderuj nic podczas SSR ani gdy brak wsparcia */
  if (!mounted || !supported) return null;

  return (
    <AnimatePresence mode="wait">
      {status === "granted" ? (
        <motion.div
          key="on"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "0.45rem 1rem",
            background: "rgba(212,168,83,0.08)",
            border: "1px solid rgba(212,168,83,0.2)",
            borderRadius: "999px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(212,168,83,0.8)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Heart size={11} fill="rgba(212,168,83,0.7)" style={{ color: "rgba(212,168,83,0.7)" }} />
          </motion.div>
          Powiadomienia włączone
        </motion.div>
      ) : status === "denied" ? (
        <motion.div
          key="denied"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "0.45rem 1rem",
            background: "rgba(240,90,90,0.06)",
            border: "1px solid rgba(240,90,90,0.15)",
            borderRadius: "999px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.72rem",
            color: "rgba(240,90,90,0.6)",
          }}
        >
          <BellOff size={11} />
          Zablokowane w ustawieniach
        </motion.div>
      ) : (
        <motion.button
          key="cta"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={subscribe}
          disabled={status === "loading"}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "0.55rem 1.25rem",
            background: "linear-gradient(135deg, rgba(212,168,83,0.15), rgba(240,160,184,0.1))",
            border: "1px solid rgba(212,168,83,0.25)",
            borderRadius: "999px",
            cursor: status === "loading" ? "wait" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.78rem",
            color: "rgba(240,160,184,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          {status === "loading" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Bell size={13} />
            </motion.div>
          ) : (
            <Bell size={13} />
          )}
          {status === "loading" ? "Włączam..." : "Włącz romantyczne powiadomienia ♥"}
        </motion.button>
      )}
    </AnimatePresence>
  );
}