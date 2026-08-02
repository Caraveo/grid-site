const RELEASE =
  "https://github.com/Caraveo/grid-wallets/releases/download/v0.2.25";

export type PhoenixDownloadChoice = {
  label: "Get Phoenix" | "Get Phoenix Wallet";
  platform: string;
  href: string;
  mobile: boolean;
  note?: string;
};

export type PhoenixBrowserSignals = {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  architecture?: string;
  webglRenderer?: string;
};

type NavigatorUAData = {
  getHighEntropyValues?: (
    hints: string[],
  ) => Promise<{ architecture?: string; bitness?: string }>;
};

export const phoenixFallback: PhoenixDownloadChoice = {
  label: "Get Phoenix Wallet",
  platform: "Choose your platform",
  href: "https://grid-compute.com/phoenix",
  mobile: false,
};

function architectureFrom(value: string | undefined): "arm64" | "x86_64" | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  if (/^(arm|arm64|aarch64)$/.test(normalized)) return "arm64";
  if (/^(x86|x86_64|x64|amd64|i[3-6]86)$/.test(normalized)) return "x86_64";
  return undefined;
}

function macArchitecture(signals: PhoenixBrowserSignals): "arm64" | "x86_64" | undefined {
  const hinted = architectureFrom(signals.architecture);
  if (hinted) return hinted;

  const renderer = signals.webglRenderer?.toLowerCase() ?? "";
  if (
    /apple (m[1-9]|silicon)/.test(renderer) ||
    /angle metal renderer:\s*apple m[1-9]/.test(renderer)
  ) {
    return "arm64";
  }
  if (renderer.includes("intel")) return "x86_64";

  // Some Chromium variants expose architecture directly in the full UA.
  const uaArchitecture = architectureFrom(
    signals.userAgent.match(/\b(arm64|aarch64|x86_64|amd64)\b/i)?.[1],
  );
  return uaArchitecture;
}

export function choosePhoenixDownload(
  rawSignals: PhoenixBrowserSignals,
): PhoenixDownloadChoice {
  const signals = {
    ...rawSignals,
    userAgent: rawSignals.userAgent.toLowerCase(),
    platform: rawSignals.platform.toLowerCase(),
  };

  const ipadDesktopMode =
    signals.platform === "macintel" && signals.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(signals.userAgent) || ipadDesktopMode) {
    return {
      ...phoenixFallback,
      platform: "iOS · coming soon",
      mobile: true,
    };
  }
  if (/android/.test(signals.userAgent)) {
    return {
      ...phoenixFallback,
      platform: "Android · coming soon",
      mobile: true,
    };
  }
  if (/windows/.test(signals.userAgent) || signals.platform.startsWith("win")) {
    return {
      label: "Get Phoenix",
      platform: "Windows 10/11 · x86_64",
      href: `${RELEASE}/Phoenix-Windows-x86_64-setup.exe`,
      mobile: false,
    };
  }
  if (
    /macintosh|mac os x/.test(signals.userAgent) ||
    signals.platform.startsWith("mac")
  ) {
    const architecture = macArchitecture(rawSignals);
    if (architecture === "arm64") {
      return {
        label: "Get Phoenix",
        platform: "macOS 13+ · Apple silicon",
        href: `${RELEASE}/Phoenix-macOS-arm64.zip`,
        mobile: false,
      };
    }
    if (architecture === "x86_64") {
      return {
        label: "Get Phoenix",
        platform: "macOS 13+ · Intel",
        href: `${RELEASE}/Phoenix-macOS-x86_64.zip`,
        mobile: false,
      };
    }
    return {
      ...phoenixFallback,
      platform: "macOS · choose Intel or Apple silicon",
      note:
        "This browser hides your Mac architecture, so choose the matching build on the wallet page.",
    };
  }
  if (/linux|x11/.test(signals.userAgent) || signals.platform.includes("linux")) {
    if (architectureFrom(rawSignals.architecture) === "arm64") {
      return {
        ...phoenixFallback,
        platform: "Linux ARM64 · build unavailable",
        note: "The current Linux release supports x86_64. More builds are coming.",
      };
    }
    return {
      label: "Get Phoenix",
      platform: "Linux · x86_64 AppImage",
      href: `${RELEASE}/Phoenix-Linux-x86_64.AppImage`,
      mobile: false,
    };
  }
  return phoenixFallback;
}

function readWebglRenderer(): string | undefined {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl || !("getExtension" in gl) || !("getParameter" in gl)) return undefined;

    const debug = gl.getExtension("WEBGL_debug_renderer_info") as
      | { UNMASKED_RENDERER_WEBGL: number }
      | null;
    const value = debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

export async function detectPhoenixDownload(): Promise<PhoenixDownloadChoice> {
  const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
  let architecture: string | undefined;

  try {
    const values = await nav.userAgentData?.getHighEntropyValues?.([
      "architecture",
      "bitness",
    ]);
    architecture = values?.architecture;
  } catch {
    // Privacy-focused browsers may reject high-entropy client hints.
  }

  return choosePhoenixDownload({
    userAgent: nav.userAgent,
    platform: nav.platform,
    maxTouchPoints: nav.maxTouchPoints ?? 0,
    architecture,
    webglRenderer: readWebglRenderer(),
  });
}
