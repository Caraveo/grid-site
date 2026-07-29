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
  const isExplorerHost =
    host === "explorer.grid-compute.com" ||
    host.startsWith("explorer.grid-compute.com:") ||
    host === "explorer.localhost" ||
    host.startsWith("explorer.localhost:");
  const isDocsHost =
    host === "docs.grid-compute.com" ||
    host.startsWith("docs.grid-compute.com:") ||
    host === "docs.localhost" ||
    host.startsWith("docs.localhost:");
  const isEngineHost =
    host === "engine.grid-compute.com" ||
    host.startsWith("engine.grid-compute.com:") ||
    host === "engine.localhost" ||
    host.startsWith("engine.localhost:");

  const { pathname } = request.nextUrl;

  if (isExplorerHost) {
    if (
      pathname.startsWith("/explorer") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/downloads") ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/explorer" : `/explorer${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isEngineHost) {
    if (
      pathname.startsWith("/engine") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/downloads") ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/engine" : `/engine${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (!isDocsHost) {
    return NextResponse.next();
  }

  // Pass through framework / public assets / API
  if (
    pathname.startsWith("/docs") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/downloads") ||
    pathname.startsWith("/og") ||
    pathname.startsWith("/file") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.svg" ||
    pathname === "/favicon-32.png" ||
    pathname === "/apple-touch-icon.png" ||
    pathname === "/logo.svg" ||
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
