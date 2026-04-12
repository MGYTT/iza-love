import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const tests: Record<string, unknown> = {};

  // Test 1: Czy w ogóle możemy wyjść na zewnątrz
  try {
    const ping = await fetch("https://itunes.apple.com/search?term=test&limit=1&media=music&entity=song", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LoveApp/1.0)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    const body = await ping.text();
    const parsed = JSON.parse(body);
    tests["itunes_basic"] = {
      status:      ping.status,
      resultCount: parsed.resultCount,
      firstTrack:  parsed.results?.[0]?.trackName ?? "brak",
    };
  } catch (e) {
    tests["itunes_basic"] = { error: String(e) };
  }

  // Test 2: Bez User-Agent
  try {
    const ping2 = await fetch("https://itunes.apple.com/search?term=test&limit=1&media=music&entity=song", {
      cache: "no-store",
    });
    const body2 = await ping2.text();
    const parsed2 = JSON.parse(body2);
    tests["itunes_no_ua"] = {
      status:      ping2.status,
      resultCount: parsed2.resultCount,
    };
  } catch (e) {
    tests["itunes_no_ua"] = { error: String(e) };
  }

  // Test 3: Twoje szukane zapytanie
  try {
    const ping3 = await fetch("https://itunes.apple.com/search?term=ed+sheeran&limit=3&media=music&entity=song&country=PL", {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LoveApp/1.0)",
        "Accept": "application/json",
      },
      cache: "no-store",
    });
    const body3 = await ping3.text();
    const parsed3 = JSON.parse(body3);
    tests["itunes_ed_sheeran_pl"] = {
      status:      ping3.status,
      resultCount: parsed3.resultCount,
      tracks:      parsed3.results?.slice(0,3).map((t: { trackName: string; artistName: string }) => `${t.trackName} – ${t.artistName}`),
    };
  } catch (e) {
    tests["itunes_ed_sheeran_pl"] = { error: String(e) };
  }

  return NextResponse.json({ timestamp: new Date().toISOString(), tests }, { status: 200 });
} 