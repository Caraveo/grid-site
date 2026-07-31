"use client";

import { PhaseLabel } from "./PhaseLabel";
import { ScrambleText } from "./ScrambleText";
import { FilmDialog } from "./FilmDialog";
import { useLocale } from "@/lib/i18n/LocaleContext";

const HERO = {
  en: {
    lead: "Run a node. Do real work. Earn",
    sub: "The planetary supercomputer is not a building — it is the mesh we build together.",
    download: "Download Mesh",
    explain: "Explain",
    registry: "Registry",
    tag: "Super Compute Fabric",
    scroll: "Scroll",
  },
  es: {
    lead: "Ejecuta un nodo. Haz trabajo real. Gana",
    sub: "La supercomputadora planetaria no es un edificio — es la malla que construimos juntos.",
    download: "Descargar Mesh",
    explain: "Explicar",
    registry: "Registro",
    tag: "Super Compute Fabric",
    scroll: "Desplazar",
  },
  de: {
    lead: "Node betreiben. Echte Arbeit. Verdiene",
    sub: "Der planetare Supercomputer ist kein Gebäude — es ist das Mesh, das wir gemeinsam bauen.",
    download: "Mesh laden",
    explain: "Erklären",
    registry: "Registry",
    tag: "Super Compute Fabric",
    scroll: "Scrollen",
  },
  fr: {
    lead: "Lancez un nœud. Travail réel. Gagnez",
    sub: "Le superordinateur planétaire n’est pas un bâtiment — c’est le mesh que nous construisons ensemble.",
    download: "Télécharger Mesh",
    explain: "Expliquer",
    registry: "Registre",
    tag: "Super Compute Fabric",
    scroll: "Défiler",
  },
} as const;

function heroCopy(locale: string) {
  if (locale.startsWith("es")) return HERO.es;
  if (locale === "de") return HERO.de;
  if (locale === "fr") return HERO.fr;
  return HERO.en;
}

export function Hero() {
  const { locale } = useLocale();
  const h = heroCopy(locale);

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5"
    >
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 grid-bg" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 horizon" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <PhaseLabel />

        <h1 className="mt-6 animate-fade-up delay-1 text-[clamp(3.5rem,12vw,8.5rem)] font-thin leading-[0.9] tracking-[0.32em]">
          GRID
        </h1>

        <p className="mt-6 max-w-xl animate-fade-up delay-2 text-lg text-white/70 sm:text-xl sm:leading-relaxed">
          {h.lead}{" "}
          <ScrambleText text="GRID" className="text-white" />.
          <br className="hidden sm:block" />
          <span className="text-white/45"> {h.sub}</span>
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 animate-fade-up delay-3 sm:flex-row">
          <a href="#mesh-downloads" className="btn-primary min-w-[200px]">
            {h.download}
          </a>
          <a href="/explain" className="btn-ghost min-w-[200px]">
            {h.explain}
          </a>
          <a href="/registry" className="btn-ghost min-w-[200px]">
            {h.registry}
          </a>
          <FilmDialog />
        </div>

        <p className="mt-10 animate-fade-up delay-4 font-mono text-[0.65rem] tracking-[0.22em] text-white/35 uppercase">
          {h.tag}
        </p>
      </div>

      <a
        href="#mesh"
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-white/40 transition hover:text-white/70"
        aria-label={h.scroll}
      >
        <span className="text-[0.6rem] tracking-[0.25em] uppercase">
          {h.scroll}
        </span>
        <span className="scroll-line h-10 w-px origin-top bg-white/60" />
      </a>
    </section>
  );
}
