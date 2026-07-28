"use client";

import { useEffect, useState } from "react";
import {
  detectEmberDownload,
  emberFallback,
  type EmberDownloadChoice,
} from "@/lib/ember-download";

export function EmberDownload() {
  const [download, setDownload] =
    useState<EmberDownloadChoice>(emberFallback);

  useEffect(() => {
    let active = true;
    void detectEmberDownload().then((choice) => {
      if (active) setDownload(choice);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center">
      <a href={download.href} className="btn-primary min-w-52 justify-center text-center">
        {download.label}
      </a>
      <p
        className="mt-4 font-mono text-[0.68rem] tracking-wider text-muted uppercase"
        aria-live="polite"
      >
        {download.platform}
      </p>
      {download.note ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {download.note}
        </p>
      ) : null}
      {download.mobile ? (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The mobile wallet is coming soon. Choose a desktop build on the wallet page.
        </p>
      ) : null}
      <div className="mt-8 flex gap-3 font-mono text-[0.62rem] tracking-wider text-dim uppercase">
        <span className="rounded-full border border-border px-3 py-1.5">iOS · coming soon</span>
        <span className="rounded-full border border-border px-3 py-1.5">Android · coming soon</span>
      </div>
    </div>
  );
}
