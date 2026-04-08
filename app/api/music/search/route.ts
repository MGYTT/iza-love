import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // wymuś Node.js runtime (nie Edge)

export async function GET(req: NextRequest) {
  const q       = req.nextUrl.searchParams.get("q")?.trim();
  const limit   = req.nextUrl.searchParams.get("limit") ?? "8";

  if (!q) {
    return NextResponse.json({ error: "Brak parametru q" }, { status: 400 });
  }

  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term",    q);
  url.searchParams.set("media",   "music");
  url.searchParams.set("entity",  "song");
  url.searchParams.set("limit",   limit);
  url.searchParams.set("country", "PL");
  url.searchParams.set("lang",    "en_us");
  url.searchParams.set("version", "2");
  url.searchParams.set("explicit","Yes");

  console.log("[iTunes] Fetching:", url.toString());

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        // iTunes wymaga User-Agent — bez niego zwraca 0 wyników lub blokuje
        "User-Agent":
          "Mozilla/5.0 (compatible; LoveApp/1.0; +https://localhost)",
        "Accept": "application/json, text/javascript, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // NIE używaj next.revalidate — iTunes nie lubi cache headers z Node fetch
      cache: "no-store",
    });

    console.log("[iTunes] Status:", res.status, res.statusText);

    if (!res.ok) {
      const text = await res.text();
      console.error("[iTunes] Error body:", text.slice(0, 300));
      return NextResponse.json(
        { error: `iTunes API ${res.status}: ${res.statusText}`, results: [] },
        { status: res.status }
      );
    }

    const raw  = await res.text(); // najpierw text, żeby zobaczyć co przyszło
    console.log("[iTunes] Raw (first 200):", raw.slice(0, 200));

    let data: { resultCount: number; results: ItunesRaw[] };
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("[iTunes] JSON parse error, raw:", raw.slice(0, 400));
      return NextResponse.json(
        { error: "Nie udało się sparsować odpowiedzi iTunes", results: [] },
        { status: 500 }
      );
    }

    console.log("[iTunes] resultCount:", data.resultCount);

    // Zamień okładki 100x100 → 600x600
    const results = (data.results ?? []).map((track) => ({
      ...track,
      artworkUrl100: (track.artworkUrl100 ?? "")
        .replace("100x100bb", "600x600bb"),
    }));

    return NextResponse.json({
      resultCount: results.length,
      results,
    });

  } catch (err) {
    console.error("[iTunes] Fetch exception:", err);
    return NextResponse.json(
      {
        error: `Błąd połączenia z iTunes: ${String(err)}`,
        results: [],
      },
      { status: 500 }
    );
  }
}

interface ItunesRaw {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string | null;
  trackViewUrl: string;
  releaseDate: string;
  primaryGenreName: string;
}