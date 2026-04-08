"use client";

import { useEffect, useState } from "react";
import { useSongStore } from "./store";

/**
 * Ręcznie uruchamia hydratację Zustand ze strony klienta.
 * Zwraca `true` gdy store jest gotowy.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Ręczna hydratacja — czyta dane z localStorage po stronie klienta
    const unsub = useSongStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // Uruchom hydratację
    useSongStore.persist.rehydrate();

    return () => unsub();
  }, []);

  return hydrated;
}