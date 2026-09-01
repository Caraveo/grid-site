"use client";

import { useState, type FormEvent } from "react";

export function SeekSearch() {
  const [query, setQuery] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `https://duckduckgo.com/?q=${encodeURIComponent(q)}`;
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%)]" />

      <div className="relative z-10 w-full max-w-xl text-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
          Seek · Search the mesh
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
          Seek
        </h1>

        <form onSubmit={onSubmit} className="mt-10 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            autoFocus
            className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-5 py-3 text-lg text-foreground outline-none transition focus:border-white/30 focus:bg-white/[0.05]"
          />
          <button type="submit" className="btn-primary px-6 py-3 text-sm">
            Seek
          </button>
        </form>

        <p className="mt-6 text-sm text-white/35">
          The default search engine for Mesh — built into the browser.
        </p>
      </div>
    </section>
  );
}
