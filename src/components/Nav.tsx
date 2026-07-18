"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type NavItem = {
  label: string;
  href?: string;
  children?: { href: string; label: string; hint?: string }[];
};

/**
 * Organized mega-structure with submenus.
 * Hash links stay on the home page; real routes use full paths.
 */
const menu: NavItem[] = [
  {
    label: "Learn",
    children: [
      {
        href: "/explain",
        label: "Explain",
        hint: "Simple overview · diagrams",
      },
      {
        href: "https://docs.grid-compute.com",
        label: "Docs",
        hint: "Public API · registry · earn",
      },
      {
        href: "/ember",
        label: "Ember",
        hint: "host + mine + compute + registry",
      },
      { href: "/#mission", label: "Mission", hint: "Why GRID exists" },
      { href: "/#network", label: "Network", hint: "Planetary fabric" },
      { href: "/#security", label: "Security", hint: "Bitcoin TSL" },
      { href: "/#timeline", label: "Phases", hint: "Roadmap" },
    ],
  },
  {
    label: "Network",
    children: [
      { href: "/#mesh-downloads", label: "Mesh", hint: "Mac · Linux · Windows" },
      { href: "/#mesh", label: "About Mesh", hint: "grid:// browser" },
      { href: "/#nodes", label: "Nodes", hint: "Machines on the fabric" },
      { href: "/#miners", label: "Miners", hint: "Useful work & earn" },
      {
        href: "/registry",
        label: "Registry",
        hint: "Paid names · $5 $Caraveo",
      },
      {
        href: "/ember",
        label: "Ember",
        hint: "Full realm stack",
      },
    ],
  },
  {
    label: "Get started",
    children: [
      { href: "/registry", label: "Register", hint: "Activate a public name" },
      { href: "/ember", label: "Run an ember", hint: "fire.grid checklist" },
      {
        href: "/#mesh-downloads",
        label: "Mesh app",
        hint: "Mac · Linux · Windows 11+",
      },
      { href: "/#download", label: "GRID CLI", hint: "Download node binary" },
      { href: "/#wallets", label: "Wallets", hint: "GRID → Bitcoin" },
      { href: "/explain", label: "How it works", hint: "Start here" },
    ],
  },
];

function DesktopDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  if (!item.children?.length) {
    return (
      <li>
        <a
          href={item.href ?? "#"}
          className="text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase transition hover:text-white"
        >
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1.5 text-[0.7rem] font-medium tracking-[0.2em] text-white/70 uppercase transition hover:text-white"
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`opacity-50 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-50 pt-3 -translate-x-1/2">
          <div className="min-w-[240px] border border-white/12 bg-black/95 py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            {item.children.map((c) => (
              <a
                key={c.href + c.label}
                href={c.href}
                className="block px-4 py-2.5 transition hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
              >
                <span className="block text-[0.72rem] font-medium tracking-[0.16em] text-white/90 uppercase">
                  {c.label}
                </span>
                {c.hint && (
                  <span className="mt-0.5 block text-[0.7rem] text-white/35">
                    {c.hint}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

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

        <ul className="hidden items-center gap-8 lg:gap-10 md:flex">
          {menu.map((item) => (
            <DesktopDropdown key={item.label} item={item} />
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/ember"
            className="hidden border border-white/25 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition hover:border-white/60 hover:text-white sm:inline-flex"
          >
            Ember
          </a>
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
        <div className="max-h-[min(80vh,640px)] overflow-y-auto border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col px-5 py-4">
            {menu.map((item) => (
              <li key={item.label} className="border-t border-white/8">
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3 text-left text-sm tracking-[0.18em] text-white/80 uppercase"
                  onClick={() =>
                    setMobileSection((s) =>
                      s === item.label ? null : item.label,
                    )
                  }
                  aria-expanded={mobileSection === item.label}
                >
                  {item.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 10 10"
                    fill="none"
                    className={`opacity-40 transition ${
                      mobileSection === item.label ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {mobileSection === item.label && item.children && (
                  <ul className="mb-2 border-l border-white/10 pl-4">
                    {item.children.map((c) => (
                      <li key={c.href + c.label}>
                        <a
                          href={c.href}
                          onClick={() => setOpen(false)}
                          className="block py-2.5"
                        >
                          <span className="block text-[0.8rem] tracking-[0.14em] text-white/85 uppercase">
                            {c.label}
                          </span>
                          {c.hint && (
                            <span className="mt-0.5 block text-xs text-white/35">
                              {c.hint}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li className="border-t border-white/10 pt-4 flex items-center justify-between gap-3 py-2">
              <span className="text-sm tracking-[0.14em] text-white/50 uppercase">
                Theme
              </span>
              <ThemeToggle />
            </li>
            <li className="pt-2">
              <a
                href="/ember"
                onClick={() => setOpen(false)}
                className="btn-ghost w-full"
              >
                Ember
              </a>
            </li>
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
