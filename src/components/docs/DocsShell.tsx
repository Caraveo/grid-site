"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DOCS_NAV } from "@/lib/docs-nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {DOCS_NAV.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/docs" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`block rounded-lg px-2.5 py-2 transition ${
                      active
                        ? "bg-surface-hover text-foreground"
                        : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    {item.hint ? (
                      <span className="mt-0.5 block text-[11px] text-dim">
                        {item.hint}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DocsShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-nav-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 text-xs text-muted lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle docs menu"
            >
              Menu
            </button>
            <Link href="/docs" className="flex items-center gap-2">
              <Logo className="h-6 w-6" />
              <span className="font-semibold tracking-tight">GRID Docs</span>
            </Link>
            <span className="hidden rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-dim sm:inline">
              Public API
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://grid-compute.com"
              className="hidden text-sm text-muted transition hover:text-foreground sm:inline"
            >
              grid-compute.com
            </a>
            <a
              href="https://grid-compute.com/registry"
              className="hidden text-sm text-muted transition hover:text-foreground md:inline"
            >
              Registry
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border px-3 py-8 lg:block">
          <NavLinks />
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-[min(20rem,88vw)] overflow-y-auto border-r border-border bg-background p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">Docs</span>
                <button
                  type="button"
                  className="text-sm text-muted"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-10 sm:px-8 lg:px-12">
          <article className="prose-docs mx-auto max-w-3xl">{children}</article>
          <footer className="mx-auto mt-16 max-w-3xl border-t border-border pt-8 text-sm text-dim">
            <p>
              Public data plane only. No operator secrets, no host endpoints, no
              private keys. Base URL:{" "}
              <a
                className="text-muted underline-offset-2 hover:text-foreground hover:underline"
                href="https://grid-compute.com"
              >
                https://grid-compute.com
              </a>
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} GRID ·{" "}
              <a
                className="underline-offset-2 hover:text-foreground hover:underline"
                href="https://github.com/Caraveo/grid"
              >
                github.com/Caraveo/grid
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
