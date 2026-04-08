"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Song } from "./types";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/* ── Mapowanie DB (snake_case) → App (camelCase) ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSong(row: any): Song {
  return {
    slug:             row.slug,
    title:            row.title,
    artist:           row.artist,
    album:            row.album            ?? "",
    coverUrl:         row.cover_url        ?? "",
    itunesId:         row.itunes_id        ?? 0,
    previewUrl:       row.preview_url      ?? null,
    audioUrl:         row.audio_url        ?? undefined,
    date:             row.date,
    memoryDate:       row.memory_date,
    shortDescription: row.short_description,
    whyOurSong:       row.why_our_song     ?? "",
    comments:         row.comments         ?? [],
    lyrics:           row.lyrics           ?? [],
    city:             row.city             ?? undefined,
    itunesUrl:        row.itunes_url       ?? undefined,
  };
}

function toRow(song: Partial<Song>) {
  return {
    ...(song.slug             !== undefined && { slug:              song.slug }),
    ...(song.title            !== undefined && { title:             song.title }),
    ...(song.artist           !== undefined && { artist:            song.artist }),
    ...(song.album            !== undefined && { album:             song.album }),
    ...(song.coverUrl         !== undefined && { cover_url:         song.coverUrl }),
    ...(song.itunesId         !== undefined && { itunes_id:         song.itunesId }),
    ...(song.previewUrl       !== undefined && { preview_url:       song.previewUrl }),
    ...(song.audioUrl         !== undefined && { audio_url:         song.audioUrl }),
    ...(song.date             !== undefined && { date:              song.date }),
    ...(song.memoryDate       !== undefined && { memory_date:       song.memoryDate }),
    ...(song.shortDescription !== undefined && { short_description: song.shortDescription }),
    ...(song.whyOurSong       !== undefined && { why_our_song:      song.whyOurSong }),
    ...(song.comments         !== undefined && { comments:          song.comments }),
    ...(song.lyrics           !== undefined && { lyrics:            song.lyrics }),
    ...(song.city             !== undefined && { city:              song.city }),
    ...(song.itunesUrl        !== undefined && { itunes_url:        song.itunesUrl }),
  };
}

/* ── READ ── */
export async function getAllSongs(): Promise<Song[]> {
  const { data, error } = await getAdmin()
    .from("songs")
    .select("*")
    .order("date", { ascending: true });

  if (error) throw new Error(`getAllSongs: ${error.message}`);
  return (data ?? []).map(toSong);
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  const { data, error } = await getAdmin()
    .from("songs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return toSong(data);
}

/* ── CREATE ── */
export async function createSong(song: Song): Promise<Song> {
  const { data, error } = await getAdmin()
    .from("songs")
    .insert(toRow(song))
    .select()
    .single();

  if (error) throw new Error(`createSong: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return toSong(data);
}

/* ── UPDATE ── */
export async function updateSongBySlug(
  slug: string,
  patch: Partial<Song>
): Promise<Song> {
  const { data, error } = await getAdmin()
    .from("songs")
    .update(toRow(patch))
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`updateSongBySlug: ${error.message}`);
  revalidatePath("/");
  revalidatePath(`/song/${slug}`);
  revalidatePath("/admin/dashboard");
  return toSong(data);
}

/* ── DELETE ── */
export async function deleteSong(slug: string): Promise<void> {
  const { error } = await getAdmin()
    .from("songs")
    .delete()
    .eq("slug", slug);

  if (error) throw new Error(`deleteSong: ${error.message}`);
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
}