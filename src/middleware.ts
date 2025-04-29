import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import logger from "./lib/logger";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("staff-auth-session-cookie");
  const ip = (request.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0].trim();
  logger.info(`Request: ${request.method} ${request.url} ${ip}`);

  if (!authCookie) {
    const headers = new Headers(request.headers);
    headers.set("x-current-path", request.nextUrl.pathname);
    return NextResponse.next({ headers });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/((?!api|_next/static|_next/image|.*\\..*|favicon.ico|authentication|public).*)",
  ],
};
