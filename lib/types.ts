export interface HighlightedWord {
  word: string;
  note: string;
  color: "gold" | "pink" | "rose";
}

export interface LyricLine {
  time: number;
  text: string;
  highlighted?: HighlightedWord[];
}

export interface Comment {
  id: string;
  text: string;
  imageUrl?: string;
  timestamp?: string;
}

export interface Song {
  slug: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  itunesId: number;
  previewUrl: string | null;   // 30s .m4a z iTunes
  audioUrl?: string;
  date: string;
  memoryDate: string;
  shortDescription: string;
  whyOurSong: string;
  comments: Comment[];
  lyrics: LyricLine[];
  city?: string;
  itunesUrl?: string;          // link do Apple Music
}

/* iTunes Search API response */
export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;       // 100x100 — zamienimy na 600x600
  previewUrl: string | null;
  trackViewUrl: string;
  releaseDate: string;
  primaryGenreName: string;
}