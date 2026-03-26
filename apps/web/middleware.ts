import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "etp_session";

async function readSessionToken(token: string) {
  const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET ?? "replace-me");

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const appRoutes = ["/dashboard", "/profile", "/applications", "/auditions", "/notifications", "/projects", "/casting", "/billing", "/admin"];
  const requiresAuth = appRoutes.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const session = await readSessionToken(token);
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "platform_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
