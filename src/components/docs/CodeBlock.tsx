"use client";

import { useState } from "react";

export function CodeBlock({
  code,
  lang = "bash",
  title,
}: {
  code: string;
  lang?: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = code.replace(/^\n+|\n+$/g, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-border bg-black/60 dark:bg-black/40">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-dim">
          {title ?? lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-0.5 font-mono text-[11px] text-muted transition hover:bg-surface-hover hover:text-foreground"
        >
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12.5px] leading-relaxed text-foreground/90">
        <code className={`language-${lang}`}>{text}</code>
      </pre>
    </div>
  );
}
