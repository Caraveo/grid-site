import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * docs.grid-compute.com serves the /docs tree at the host root.
 * Example: https://docs.grid-compute.com/registry → /docs/registry
 *
 * Static assets, API, and Next internals stay unprefixed.
 */
export function middleware(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const isDocsHost =
    host === "docs.grid-compute.com" ||
    host.startsWith("docs.grid-compute.com:") ||
    host === "docs.localhost" ||
    host.startsWith("docs.localhost:");

  if (!isDocsHost) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Pass through framework / public assets / API
  if (
    pathname.startsWith("/docs") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/og") ||
    pathname.startsWith("/file") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/docs" : `/docs${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
