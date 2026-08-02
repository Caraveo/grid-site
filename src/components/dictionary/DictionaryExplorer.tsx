"use client";

import { useMemo, useState } from "react";
import type { DictionaryTerm } from "@/app/dictionary/page";

const categories = ["All", "Basics", "Markets", "Network", "Security", "GRID"] as const;
type CategoryFilter = (typeof categories)[number];

const categoryStyle: Record<DictionaryTerm["category"], string> = {
  Basics: "border-violet-400/25 bg-violet-400/[0.07] text-violet-300",
  Markets: "border-amber-400/25 bg-amber-400/[0.07] text-amber-300",
  Network: "border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300",
  Security: "border-rose-400/25 bg-rose-400/[0.07] text-rose-300",
  GRID: "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300",
};

export function DictionaryExplorer({ terms }: { terms: DictionaryTerm[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filteredTerms = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return terms
      .filter((term) => category === "All" || term.category === category)
      .filter((term) => {
        if (!needle) return true;
        return [term.term, term.aka, term.category, term.definition, term.example]
          .filter(Boolean)
          .some((value) => value!.toLocaleLowerCase().includes(needle));
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [category, query, terms]);

  const alphabet = Array.from(
    new Set(filteredTerms.map(({ term }) => term[0]!.toUpperCase())),
  );
  const termLookup = useMemo(() => {
    const lookup = new Map<string, DictionaryTerm>();
    for (const term of terms) {
      lookup.set(term.term.toLocaleLowerCase(), term);
      if (term.aka) {
        lookup.set(term.aka.toLocaleLowerCase(), term);
        for (const alias of term.aka.split(" · ")) {
          lookup.set(alias.toLocaleLowerCase(), term);
        }
      }
    }
    return lookup;
  }, [terms]);

  const termId = (term: string) =>
    `term-${term
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;

  const openRelated = (target: DictionaryTerm) => {
    setQuery("");
    setCategory("All");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const id = termId(target.term);
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        window.history.replaceState(null, "", `#${id}`);
      });
    });
  };

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 px-5 backdrop-blur-xl lg:top-20">
        <div className="mx-auto grid max-w-7xl gap-3 py-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search dictionary</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-dim"
            >
              /
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search terms, definitions, or examples"
              className="h-10 w-full border border-border bg-surface pl-9 pr-24 text-sm text-foreground outline-none transition placeholder:text-dim focus:border-foreground"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
              {filteredTerms.length} found
            </span>
          </label>

          <div
            role="group"
            aria-label="Filter dictionary by category"
            className="flex gap-1 overflow-x-auto"
          >
            {categories.map((option) => {
              const active = category === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(option)}
                  className={`h-9 shrink-0 border px-3 font-mono text-[0.6rem] tracking-[0.1em] uppercase transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {alphabet.length > 0 && (
          <nav
            aria-label="Filtered dictionary letters"
            className="mx-auto flex max-w-7xl gap-1 overflow-x-auto border-t border-border py-2"
          >
            {alphabet.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="grid size-7 shrink-0 place-items-center font-mono text-[0.62rem] text-muted transition hover:bg-surface-hover hover:text-foreground"
              >
                {letter}
              </a>
            ))}
          </nav>
        )}
      </div>

      <section className="px-5 py-14 sm:py-20" aria-live="polite">
        <div className="mx-auto max-w-7xl">
          {alphabet.map((letter) => {
            const letterTerms = filteredTerms.filter(({ term }) =>
              term.toUpperCase().startsWith(letter),
            );
            return (
              <section
                key={letter}
                id={`letter-${letter}`}
                className="grid scroll-mt-48 border-t border-border py-8 first:border-0 first:pt-0 md:grid-cols-[90px_1fr]"
              >
                <h2 className="pb-5 font-mono text-3xl font-semibold text-dim md:pb-0">
                  {letter}
                </h2>
                <dl className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
                  {letterTerms.map((entry) => (
                    <div
                      key={entry.term}
                      id={termId(entry.term)}
                      className="scroll-mt-48 bg-background p-5 sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <dt className="text-xl font-semibold tracking-tight">
                          {entry.term}
                        </dt>
                        <span
                          className={`border px-2 py-1 font-mono text-[0.58rem] tracking-[0.13em] uppercase ${categoryStyle[entry.category]}`}
                        >
                          {entry.category}
                        </span>
                      </div>
                      {entry.aka && (
                        <p className="mt-1.5 font-mono text-[0.67rem] tracking-[0.06em] text-dim">
                          {entry.aka}
                        </p>
                      )}
                      <dd className="mt-4 text-sm leading-relaxed text-muted">
                        {entry.definition}
                      </dd>
                      <p className="mt-4 border-l border-border pl-3 text-xs leading-relaxed text-dim">
                        <span className="mr-2 font-mono text-[0.6rem] tracking-[0.12em] uppercase">
                          Example
                        </span>
                        {entry.example}
                      </p>
                      {entry.related && entry.related.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-3">
                          <span className="font-mono text-[0.58rem] tracking-[0.12em] text-dim uppercase">
                            Related
                          </span>
                          {entry.related.map((reference) => {
                            const target = termLookup.get(reference.toLocaleLowerCase());
                            return target ? (
                              <a
                                key={reference}
                                href={`#${termId(target.term)}`}
                                onClick={(event) => {
                                  event.preventDefault();
                                  openRelated(target);
                                }}
                                className="font-mono text-[0.66rem] text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                              >
                                {reference}
                              </a>
                            ) : (
                              <span key={reference} className="font-mono text-[0.66rem] text-muted">
                                {reference}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}

          {filteredTerms.length === 0 && (
            <div className="border border-border px-6 py-16 text-center">
              <p className="font-mono text-xs tracking-[0.15em] text-dim uppercase">
                No matching terms
              </p>
              <p className="mt-3 text-sm text-muted">
                Try a broader search or choose a different category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                }}
                className="mt-6 border border-border px-4 py-2 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition hover:border-foreground"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
