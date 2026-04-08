// hooks/useHydration.ts
// Poprzednio czekał na hydratację Zustand localStorage.
// Teraz dane są w Supabase (SSR) — zawsze "hydrated" po stronie klienta.

import { useState, useEffect } from "react";

export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Po zamontowaniu komponentu jesteśmy już po stronie klienta
    setHydrated(true);
  }, []);

  return hydrated;
}