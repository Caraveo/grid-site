import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ARK_WEB_ORIGIN = "https://grid-compute.com";
const ARK_UPSTREAM_ORIGIN = "https://genesis.grid-compute.com";
const ARK_MAX_BODY_BYTES = 16 * 1024;

function arkCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": ARK_WEB_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}

function isARKReadPath(pathname: string): boolean {
  return (
    pathname === "/health" ||
    pathname === "/v1/chain" ||
    /^\/v1\/wallet\/grid01[ac-hj-np-z02-9]{20,120}(?:\/nonce)?$/.test(pathname)
  );
}

async function proxyARKRequest(request: NextRequest): Promise<Response> {
  const { pathname, search } = request.nextUrl;
  const origin = request.headers.get("origin");

  if (origin && origin !== ARK_WEB_ORIGIN) {
    return Response.json(
      { ok: false, error: "origin not allowed" },
      { status: 403, headers: arkCorsHeaders() },
    );
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: arkCorsHeaders() });
  }

  const isRead = request.method === "GET" && isARKReadPath(pathname);
  const isWrite =
    request.method === "POST" && pathname === "/v1/transactions";
  if (!isRead && !isWrite) {
    return Response.json(
      { ok: false, error: "route not found" },
      { status: 404, headers: arkCorsHeaders() },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > ARK_MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "request body too large" },
      { status: 413, headers: arkCorsHeaders() },
    );
  }

  let body: ArrayBuffer | undefined;
  if (isWrite) {
    body = await request.arrayBuffer();
    if (body.byteLength > ARK_MAX_BODY_BYTES) {
      return Response.json(
        { ok: false, error: "request body too large" },
        { status: 413, headers: arkCorsHeaders() },
      );
    }
  }

  const upstream = await fetch(`${ARK_UPSTREAM_ORIGIN}${pathname}${search}`, {
    method: request.method,
    headers: isWrite ? { "Content-Type": "application/json" } : undefined,
    body,
    redirect: "manual",
    cache: "no-store",
  });
  const headers = new Headers(arkCorsHeaders());
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/json",
  );
  return new Response(upstream.body, { status: upstream.status, headers });
}

/**
 * docs.grid-compute.com serves the /docs tree at the host root.
 * Example: https://docs.grid-compute.com/registry → /docs/registry
 *
 * Static assets, API, and Next internals stay unprefixed.
 */
export async function middleware(request: NextRequest) {
  // Cloudflare/OpenNext may set `host` to the Worker origin while preserving the
  // public custom domain in `x-forwarded-host`.
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  ).toLowerCase();
  const isARKHost =
    host === "ark.grid-compute.com" ||
    host.startsWith("ark.grid-compute.com:") ||
    host === "ark.localhost" ||
    host.startsWith("ark.localhost:");
  const isMailHost =
    host === "mail.grid-compute.com" ||
    host.startsWith("mail.grid-compute.com:") ||
    host === "mail.localhost" ||
    host.startsWith("mail.localhost:");
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
  const isTransactHost =
    host === "transact.grid-compute.com" ||
    host.startsWith("transact.grid-compute.com:") ||
    host === "transact.localhost" ||
    host.startsWith("transact.localhost:");
  const isMeshHost =
    host === "mesh.grid-compute.com" ||
    host.startsWith("mesh.grid-compute.com:") ||
    host === "mesh.localhost" ||
    host.startsWith("mesh.localhost:");
  const isSeekHost =
    host === "seek.grid-compute.com" ||
    host.startsWith("seek.grid-compute.com:") ||
    host === "seek.localhost" ||
    host.startsWith("seek.localhost:");

  const { pathname } = request.nextUrl;

  if (isMeshHost) {
    return NextResponse.redirect(new URL("/mesh", ARK_WEB_ORIGIN), 308);
  }

  if (isSeekHost) {
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/downloads") ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    if (pathname === "/search") {
      url.pathname = "/seek";
    } else if (pathname === "/") {
      url.pathname = "/seek";
    } else {
      url.pathname = pathname;
    }
    return NextResponse.rewrite(url);
  }

  if (isARKHost) {
    return proxyARKRequest(request);
  }

  if (isMailHost) {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/mail";
    return NextResponse.rewrite(url);
  }

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

  if (isTransactHost) {
    if (
      pathname.startsWith("/transact") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/downloads") ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/transact" : `/transact${pathname}`;
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
