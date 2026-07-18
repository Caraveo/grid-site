"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES } from "@/lib/i18n/locales";
import { useLocale } from "@/lib/i18n/LocaleContext";

/** Compact flag control — top-right nav. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t, flag } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t("lang.title")}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t("lang.title")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-lg leading-none transition hover:border-[var(--fg-strong)] hover:bg-[var(--surface-hover)]"
      >
        <span aria-hidden>{flag}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("lang.title")}
          className="absolute right-0 top-full z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-white/12 bg-black/95 py-1 shadow-2xl shadow-black/50 backdrop-blur-xl"
        >
          {LOCALES.map((opt) => {
            const active = opt.id === locale;
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(opt.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {opt.flag}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-medium tracking-wide">
                    {opt.label}
                  </span>
                  <span className="font-mono truncate text-[0.6rem] tracking-wide text-white/35">
                    {opt.region}
                  </span>
                </span>
              </button>
            );
          })}
          <div className="border-t border-white/10 px-3 py-2">
            <p className="font-mono text-[0.55rem] tracking-[0.12em] text-white/30 uppercase">
              {t("lang.more")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
