import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, isAdminRole } from "@/lib/auth/session";

const COUNTRY_COOKIE = "ak_country";

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api|images|uploads).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ── Best-effort visitor country detection (edge-safe, no DB access here) ──
  if (!request.cookies.get(COUNTRY_COOKIE)) {
    const detected =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-country-code");
    if (detected && detected !== "XX" && /^[A-Za-z]{2}$/.test(detected)) {
      response.cookies.set(COUNTRY_COOKIE, detected.toUpperCase(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 180,
      });
    }
  }

  // ── Route protection (JWT-only checks; role details re-verified server-side) ──
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session || !isAdminRole(session.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (
    pathname.startsWith("/account") &&
    !["/account/login", "/account/register", "/account/forgot-password"].some((p) =>
      pathname.startsWith(p)
    )
  ) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/account/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
