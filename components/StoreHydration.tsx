"use client";

import { useEffect } from "react";
import { useSongStore } from "@/lib/store";

/**
 * Umieść ten komponent w app/layout.tsx — uruchamia hydratację
 * Zustand raz po załadowaniu strony po stronie klienta.
 */
export function StoreHydration() {
  useEffect(() => {
    useSongStore.persist.rehydrate();
  }, []);

  return null;
}