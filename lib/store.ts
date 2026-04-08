"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Song } from "./types";

interface SongStore {
  songs: Song[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  addSong: (song: Song) => void;
  removeSong: (slug: string) => void;
  updateSong: (slug: string, data: Partial<Song>) => void;
  getSong: (slug: string) => Song | undefined;
}

const DEMO_SONGS: Song[] = [
  {
    slug: "perfect-ed-sheeran",
    title: "Perfect",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6b/b8/9e/6bb89e8e-3c35-12d1-3b9e-6b8e8e8e8e8e/cover.jpg/600x600bb.jpg",
    itunesId: 1440866497,
    previewUrl: null,
    date: "2023-06-01",
    memoryDate: "1 czerwca 2023",
    shortDescription:
      "Pierwszy wieczór kiedy pomyślałem, że to właśnie Ty.",
    whyOurSong:
      "Pamiętasz ten wieczór? Siedzieliśmy nad Wisłą i ta piosenka grała w tle...",
    comments: [],
    lyrics: [
      {
        time: 0,
        text: "I found a love for me",
        highlighted: [
          {
            word: "love",
            note: "To słowo znaczy dla mnie wszystko od kiedy Cię znam",
            color: "gold",
          },
        ],
      },
      { time: 5, text: "Darling, just dive right in and follow my lead" },
      {
        time: 9,
        text: "Well, I found a girl, beautiful and sweet",
        highlighted: [
          {
            word: "beautiful",
            note: "Tak właśnie Cię widzę każdego dnia",
            color: "pink",
          },
        ],
      },
      {
        time: 14,
        text: "Oh, I never knew you were the someone waiting for me",
      },
    ],
    city: "Kraków",
  },
];

export const useSongStore = create<SongStore>()(
  persist(
    (set, get) => ({
      songs: DEMO_SONGS,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addSong: (song) =>
        set((state) => ({
          songs: [
            ...state.songs.filter((s) => s.slug !== song.slug),
            song,
          ],
        })),

      removeSong: (slug) =>
        set((state) => ({
          songs: state.songs.filter((s) => s.slug !== slug),
        })),

      updateSong: (slug, data) =>
        set((state) => ({
          songs: state.songs.map((s) =>
            s.slug === slug ? { ...s, ...data } : s
          ),
        })),

      getSong: (slug) => get().songs.find((s) => s.slug === slug),
    }),
    {
      name: "iza-love-songs",
      storage: createJSONStorage(() => localStorage),

      // Kluczowe: pomiń automatyczną hydratację przy SSR
      skipHydration: true,

      // Po załadowaniu z localStorage ustaw flagę
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);