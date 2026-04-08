import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "PL";
  const city    = request.geo?.city    || "Kraków";

  const response = NextResponse.next();
  response.headers.set("x-user-country", country);
  response.headers.set("x-user-city", city);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};