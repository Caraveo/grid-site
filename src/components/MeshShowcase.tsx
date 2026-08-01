"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SCREENS = [
  {
    src: "/images/mesh-showcase/mesh-grid.png",
    alt: "GRID displayed in the Mesh desktop browser",
    label: "GRID",
    address: "grid-compute.com",
  },
  {
    src: "/images/mesh-showcase/mesh-google.png",
    alt: "Google displayed in the Mesh desktop browser",
    label: "Search",
    address: "google.com",
  },
  {
    src: "/images/mesh-showcase/mesh-chatgpt.png",
    alt: "ChatGPT displayed in the Mesh desktop browser",
    label: "AI",
    address: "chatgpt.com",
  },
] as const;

const ROTATION_MS = 4500;

export function MeshShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (paused || reducedMotion) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % SCREENS.length);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="mx-auto mt-14 max-w-6xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Mesh browser screenshots"
    >
      <div className="relative aspect-[2296/1772] overflow-hidden border border-white/15 bg-white/[0.025] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        {SCREENS.map((screen, index) => (
          <Image
            key={screen.src}
            src={screen.src}
            alt={screen.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1280px) 90vw, 1152px"
            className={`object-cover transition-opacity duration-700 ease-out ${
              active === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-5 left-5 font-mono text-[0.6rem] tracking-[0.18em] text-white/65 uppercase sm:bottom-7 sm:left-7 sm:text-[0.7rem]">
          {SCREENS[active].address}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2" role="group" aria-label="Choose a screenshot">
        {SCREENS.map((screen, index) => (
          <button
            key={screen.src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show ${screen.label} screenshot`}
            aria-pressed={active === index}
            className={`h-1.5 transition-all duration-300 ${
              active === index
                ? "w-10 bg-white"
                : "w-5 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
