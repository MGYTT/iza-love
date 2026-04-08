import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const city    = req.headers.get("x-user-city")    || "Kraków";
  const country = req.headers.get("x-user-country") || "PL";

  // Mapowanie miasta → zdjęcie zachodu słońca
  const cityBackgrounds: Record<string, string> = {
    "Kraków":   "/backgrounds/krakow-sunset.jpg",
    "Warsaw":   "/backgrounds/warsaw-sunset.jpg",
    "Warszawa": "/backgrounds/warsaw-sunset.jpg",
    "Gdańsk":   "/backgrounds/gdansk-sunset.jpg",
    "Wrocław":  "/backgrounds/wroclaw-sunset.jpg",
    "Poznań":   "/backgrounds/poznan-sunset.jpg",
  };

  const bg = cityBackgrounds[city] ?? "/backgrounds/default-sunset.jpg";

  return NextResponse.json({ city, country, background: bg });
}