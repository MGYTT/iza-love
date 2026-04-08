import { NextRequest, NextResponse } from "next/server";

/* ─────────────────────────────────────────────────────
   Vercel dostarcza te nagłówki automatycznie na produkcji.
   Na lokalnym dev-serwerze zwraca null → używamy fallbacku.
   Docs: vercel.com/docs/headers/request-headers
───────────────────────────────────────────────────── */
function getGeo(request: NextRequest): { country: string; city: string } {
  // Na Vercelu — nagłówki ustawiane przez Edge Network
  const country = request.headers.get("x-vercel-ip-country") ?? "PL";

  // Miasto jest URL-encoded (np. "Krak%C3%B3w" → "Kraków")
  const rawCity = request.headers.get("x-vercel-ip-city") ?? "Krak%C3%B3w";
  const city    = decodeURIComponent(rawCity);

  return { country, city };
}

export function middleware(request: NextRequest) {
  const { country, city } = getGeo(request);

  const response = NextResponse.next();

  // Przekaż geo do aplikacji przez nagłówki odpowiedzi
  response.headers.set("x-geo-country", country);
  response.headers.set("x-geo-city",    city);

  return response;
}

export const config = {
  // Uruchamiaj middleware tylko na stronach — pomijaj API, _next, pliki statyczne
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};