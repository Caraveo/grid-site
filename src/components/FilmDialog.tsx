"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./ThemeToggle";

type Theme = "dark" | "light";

function currentTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

export function FilmDialog() {
  const darkVideo = useRef<HTMLVideoElement>(null);
  const lightVideo = useRef<HTMLVideoElement>(null);
  const themeRef = useRef<Theme>("dark");
  const playingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);

  function videoFor(theme: Theme) {
    return theme === "light" ? lightVideo.current : darkVideo.current;
  }

  useEffect(() => {
    themeRef.current = currentTheme();
    const observer = new MutationObserver(() => {
      const nextTheme = currentTheme();
      if (nextTheme === themeRef.current) return;

      const outgoing = videoFor(themeRef.current);
      const incoming = videoFor(nextTheme);
      const time = outgoing?.currentTime ?? incoming?.currentTime ?? 0;
      outgoing?.pause();
      if (incoming) {
        incoming.currentTime = time;
        incoming.muted = false;
        if (playingRef.current) void incoming.play();
      }
      themeRef.current = nextTheme;
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeFilm();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function openFilm() {
    themeRef.current = currentTheme();
    setOpen(true);
  }

  function closeFilm() {
    darkVideo.current?.pause();
    lightVideo.current?.pause();
    playingRef.current = false;
    setPlaying(false);
    setOpen(false);
  }

  async function togglePlayback() {
    const video = videoFor(themeRef.current);
    if (!video) return;
    if (playingRef.current) {
      video.pause();
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    video.muted = false;
    video.volume = 1;
    try {
      await video.play();
      playingRef.current = true;
      setPlaying(true);
    } catch {
      playingRef.current = false;
      setPlaying(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openFilm}
        className="watch-film-cta min-w-[200px]"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">▶</span>
        Watch
      </button>

      {open &&
        createPortal(
        <div
          className="film-dialog fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="GRID film"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close GRID film"
            onClick={closeFilm}
          />
          <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-foreground/20" />
          <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-foreground/20" />

          <div className="film-dialog-frame relative z-10 aspect-video w-full max-w-[min(92vw,1440px)] overflow-hidden border border-foreground/30 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <video
              ref={darkVideo}
              className="film-video-dark absolute inset-0 h-full w-full object-contain"
              src="/video/grid-dark.m4v"
              loop
              playsInline
              preload="metadata"
            />
            <video
              ref={lightVideo}
              className="film-video-light absolute inset-0 h-full w-full object-contain"
              src="/video/grid-light.m4v"
              loop
              playsInline
              preload="metadata"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(0,0,0,0.22)_100%)]" />
            <button
              type="button"
              onClick={togglePlayback}
              className="film-play-control absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 border border-white/70 bg-black/80 px-6 py-3 font-mono text-[0.68rem] font-semibold tracking-[0.22em] text-white uppercase backdrop-blur-md transition hover:bg-white hover:text-black sm:bottom-8"
              aria-label={playing ? "Pause GRID film" : "Play GRID film"}
            >
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <div className="absolute right-5 top-5 z-20 flex items-center gap-2 sm:right-8 sm:top-8">
            <ThemeToggle className="border-foreground/35 bg-background/80 backdrop-blur-md" />
            <button
              type="button"
              onClick={closeFilm}
              className="film-close-control flex h-11 w-11 items-center justify-center border border-foreground/35 bg-background/80 font-mono text-lg text-foreground backdrop-blur-md transition hover:bg-foreground hover:text-background"
              aria-label="Close GRID film"
            >
              ×
            </button>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
