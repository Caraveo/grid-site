"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "#mission", label: "Mission" },
  { href: "#network", label: "Network" },
  { href: "#nodes", label: "Nodes" },
  { href: "#miners", label: "Miners" },
  { href: "#wallets", label: "Wallets" },
  { href: "#security", label: "Security" },
  { href: "#timeline", label: "Phases" },
  { href: "#download", label: "Download" },
];


export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-10">
        <a href="/" className="group flex items-center gap-2.5 text-white">
          <Logo className="h-7 w-7" />
          <span className="text-sm font-semibold tracking-[0.35em]">GRID</span>
        </a>

        <ul className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={`/${l.href}`}
                className="text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase transition hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="/registry"
            className="inline-flex border border-white/50 bg-white px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] text-black uppercase transition hover:bg-transparent hover:text-white"
          >
            Registry
          </a>
          <a
            href="/#download"
            className="hidden border border-white/50 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition hover:border-white hover:bg-white hover:text-black sm:inline-flex"
          >
            Get GRID
          </a>
          <button
            type="button"
            aria-label="Menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-px w-5 bg-white transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-white transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-5 bg-white transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col px-5 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm tracking-[0.18em] text-white/80 uppercase"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="/registry"
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                Registry
              </a>
            </li>
            <li className="pt-2">
              <a
                href="/#download"
                onClick={() => setOpen(false)}
                className="btn-ghost w-full"
              >
                Get GRID
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
