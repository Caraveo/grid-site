"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type CSSProperties,
} from "react";

/** Calm cipher set — no loud symbols */
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";

function scrambleChar(target: string): string {
  if (target === " " || target === "\n" || target === "\u00A0") return target;
  if (/[.,!?'"—–·-]/.test(target)) return target;
  if (/[0-9]/.test(target)) {
    return String(Math.floor(Math.random() * 10));
  }
  const upper = target === target.toUpperCase() && /[A-Za-z]/.test(target);
  const pool = upper ? GLYPHS : GLYPHS.toLowerCase();
  // Bias toward letters near the target for a softer resolve
  if (/[A-Za-z]/.test(target) && Math.random() < 0.45) {
    const base = target.toUpperCase().charCodeAt(0);
    const n = ((base - 65 + Math.floor(Math.random() * 5) - 2 + 26) % 26) + 65;
    const c = String.fromCharCode(n);
    return upper ? c : c.toLowerCase();
  }
  return pool[Math.floor(Math.random() * pool.length)]!;
}

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  durationFrames?: number;
  frameMs?: number;
  replay?: boolean;
};

export function ScrambleText({
  text,
  as: Tag = "span",
  className,
  style,
  delay = 0,
  durationFrames = 80,
  frameMs = 85,
  replay = false,
}: Props) {
  const [display, setDisplay] = useState(text);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const playedRef = useRef(false);
  const runId = useRef(0);
  const displayRef = useRef(text);

  const run = useCallback(() => {
    const id = ++runId.current;
    let frame = 0;
    const locked = text
      .split("")
      .map((ch) => ch === " " || /[.,!?'"—–·-]/.test(ch));
    displayRef.current = text
      .split("")
      .map((ch) => (ch === " " || /[.,!?'"—–·-]/.test(ch) ? ch : scrambleChar(ch)))
      .join("");
    setDisplay(displayRef.current);
    setActive(true);

    const tick = () => {
      if (runId.current !== id) return;
      frame += 1;
      const progress = frame / durationFrames;
      const chars = text.split("");
      const prev = displayRef.current.split("");

      chars.forEach((_, i) => {
        if (locked[i]) return;
        const lockAt = 0.18 + (i / Math.max(chars.length, 1)) * 0.7;
        if (progress >= lockAt) locked[i] = true;
      });

      const next = chars
        .map((ch, i) => {
          if (locked[i]) return ch;
          // Soft flicker: most frames keep prior glyph
          if (Math.random() > 0.28) return prev[i] ?? scrambleChar(ch);
          return scrambleChar(ch);
        })
        .join("");

      displayRef.current = next;
      setDisplay(next);

      if (frame >= durationFrames) {
        setDisplay(text);
        displayRef.current = text;
        setActive(false);
        return;
      }
      window.setTimeout(tick, frameMs);
    };

    window.setTimeout(tick, delay);
  }, [text, delay, durationFrames, frameMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some(
          (e) => e.isIntersecting && e.intersectionRatio > 0.12,
        );
        if (hit && (!playedRef.current || replay)) {
          playedRef.current = true;
          run();
        }
      },
      { threshold: [0, 0.15, 0.35], rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [run, replay]);

  return (
    <Tag
      ref={ref as never}
      className={[
        className,
        "transition-colors duration-700",
        active ? "text-white/50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...style,
        fontVariantNumeric: "tabular-nums",
      }}
      aria-label={text}
      data-scrambling={active ? "true" : undefined}
    >
      {display}
    </Tag>
  );
}
