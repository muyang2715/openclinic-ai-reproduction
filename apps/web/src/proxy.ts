import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 renamed `middleware.ts` -> `proxy.ts`. Gate the dashboard routes:
// optimistically redirect to /sign-in when there's no Better Auth session
// cookie (full validation still happens server-side via auth.api.getSession).
// The landing page `/` and `/sign-in` stay public.
export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/doctors/:path*",
    "/appointments/:path*",
    "/analytics/:path*",
    "/calls/:path*",
    "/knowledge-base/:path*",
    "/settings/:path*",
  ],
};
