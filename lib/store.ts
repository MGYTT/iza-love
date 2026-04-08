// lib/store.ts
"use client";

import { create } from "zustand";

interface UIStore {
  adminAuthed: boolean;
  setAdminAuthed: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  adminAuthed: false,
  setAdminAuthed: (v) => set({ adminAuthed: v }),
}));

// Zachowaj też stary export dla kompatybilności podczas migracji
// — możesz go usunąć po tym jak wszystkie strony będą zaktualizowane
export const useSongStore = null as never;