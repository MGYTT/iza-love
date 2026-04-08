// BEZ "use client"
import { notFound } from "next/navigation";
import { getSongBySlug } from "@/lib/songs-db";
import SongPageClient from "./SongPageClient";

export const revalidate = 0;

export default async function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const song = await getSongBySlug(slug);

  if (!song) notFound();

  return <SongPageClient song={song} />;
}