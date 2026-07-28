"use client";

import { useEffect, useState } from "react";

const RELEASE =
  "https://github.com/Caraveo/grid-wallet-releases/releases/download/wallet-v0.1.1";

type Download = {
  label: "Get Ember" | "Get Wallet";
  platform: string;
  href: string;
  mobile: boolean;
};

const fallback: Download = {
  label: "Get Wallet",
  platform: "Choose your platform",
  href: "https://grid-compute.com/wallet",
  mobile: false,
};

function detectDownload(): Download {
  const ua = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return { ...fallback, platform: "iOS · coming soon", mobile: true };
  }
  if (/android/.test(ua)) {
    return { ...fallback, platform: "Android · coming soon", mobile: true };
  }
  if (/windows/.test(ua) || platform.startsWith("win")) {
    return {
      label: "Get Ember",
      platform: "Windows 10/11 · x86_64",
      href: `${RELEASE}/GRID-Wallet-Windows-x86_64-setup.exe`,
      mobile: false,
    };
  }
  if (/macintosh|mac os x/.test(ua) || platform.startsWith("mac")) {
    return {
      label: "Get Ember",
      platform: "macOS 13+ · Apple silicon",
      href: `${RELEASE}/GRID-Wallet-macOS-aarch64.zip`,
      mobile: false,
    };
  }
  if (/linux|x11/.test(ua) || platform.includes("linux")) {
    return {
      label: "Get Ember",
      platform: "Linux · x86_64 AppImage",
      href: `${RELEASE}/GRID-Wallet-Linux-x86_64.AppImage`,
      mobile: false,
    };
  }
  return fallback;
}

export function EmberDownload() {
  const [download, setDownload] = useState<Download>(fallback);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) setDownload(detectDownload());
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
      <p className="mt-4 font-mono text-[0.68rem] tracking-wider text-muted uppercase">
        {download.platform}
      </p>
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
