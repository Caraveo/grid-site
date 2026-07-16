"use client";

import { useEffect, useState } from "react";

const DIGITS = 8;
const FINAL = "00000001";
const ZERO = "00000000";
const GLYPHS = "00112233445566778899ABCDEF";
type Stage = "scramble" | "zeros" | "roll" | "done";

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
}

export function PhaseLabel() {
  const [stage, setStage] = useState<Stage>("scramble");
  const [chars, setChars] = useState(() =>
    Array.from({ length: DIGITS }, () => randomGlyph()).join(""),
  );
  const [rollY, setRollY] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    let ticks = 0;
    const SCRAMBLE_TICKS = 110;
    const INTERVAL = 95;

    const scrambleIv = window.setInterval(() => {
      if (cancelled) return;
      ticks += 1;
      const progress = Math.min(1, ticks / SCRAMBLE_TICKS);
      const towardZero = 0.12 + progress * 0.75;

      setChars((prev) =>
        Array.from({ length: DIGITS }, (_, i) => {
          if (Math.random() > 0.22 && prev[i]) {
            if (progress > 0.55 && Math.random() < towardZero) return "0";
            return prev[i]!;
          }
          if (progress > 0.45 && Math.random() < towardZero) return "0";
          return randomGlyph();
        }).join(""),
      );

      if (ticks >= SCRAMBLE_TICKS) {
        window.clearInterval(scrambleIv);
        if (cancelled) return;
        setStage("zeros");
        setChars(ZERO);
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            setStage("roll");
            requestAnimationFrame(() => {
              if (cancelled) return;
              setRollY(1);
            });
            timers.push(
              window.setTimeout(() => {
                if (cancelled) return;
                setChars(FINAL);
                setStage("done");
                setRollY(1);
              }, 1400),
            );
          }, 1200),
        );
      }
    }, INTERVAL);

    return () => {
      cancelled = true;
      window.clearInterval(scrambleIv);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const head = chars.slice(0, DIGITS - 1);

  return (
    <p
      className="section-label animate-fade-up inline-flex items-center justify-center gap-[0.35em] tabular-nums"
      aria-label="Phase 00000001"
    >
      <span>Phase</span>
      <span className="inline-flex font-mono tracking-[0.28em]">
        {stage === "scramble" ? (
          <span className="text-white/45 transition-colors duration-700">
            {chars}
          </span>
        ) : stage === "done" ? (
          <span>{FINAL}</span>
        ) : (
          <>
            <span className={stage === "zeros" ? "text-white/70" : undefined}>
              {head}
            </span>
            <span
              className="relative inline-block h-[1.15em] w-[0.72em] overflow-hidden align-baseline"
              style={{ verticalAlign: "-0.05em" }}
            >
              <span
                className="absolute left-0 top-0 flex flex-col items-center will-change-transform"
                style={{
                  transform: rollY ? "translateY(-50%)" : "translateY(0%)",
                  transition:
                    stage === "roll"
                      ? "transform 1.35s cubic-bezier(0.22, 0.82, 0.2, 1)"
                      : "none",
                }}
              >
                <span className="flex h-[1.15em] items-center justify-center leading-none">
                  0
                </span>
                <span className="flex h-[1.15em] items-center justify-center leading-none">
                  1
                </span>
              </span>
            </span>
          </>
        )}
      </span>
    </p>
  );
}
