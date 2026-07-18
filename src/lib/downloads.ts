/**
 * Official download URLs — hosted on grid-compute.com (no third-party mirrors).
 * Paths map to files under public/downloads/.
 *
 * Mesh = the grid:// desktop browser (multi-platform).
 * GRID CLI = node binary (separate from Mesh).
 */

export type MeshPlatformId =
  | "mac-intel"
  | "mac-arm"
  | "linux"
  | "windows";

export type MeshDownload = {
  id: MeshPlatformId;
  name: string;
  arch: string;
  /** Short badge under the title */
  badge: string;
  /** Primary download (preferred installer) */
  primary: {
    label: string;
    href: string;
    filename: string;
  } | null;
  /** Optional secondary package */
  secondary?: {
    label: string;
    href: string;
    filename: string;
  } | null;
  /** Human note under the card */
  note: string;
  /** Whether a real binary is served today */
  available: boolean;
};

const MESH_VERSION = "0.1.0";

/**
 * Mesh browser builds.
 * mac-intel: native. mac-arm: same package via Rosetta until native ship.
 * linux / windows: paths reserved for release pipelines.
 */
export const MESH_DOWNLOADS: MeshDownload[] = [
  {
    id: "mac-intel",
    name: "Mac",
    arch: "Intel",
    badge: "Available",
    primary: {
      label: "Download .dmg",
      href: "/downloads/mesh/mac-intel/MESH.dmg",
      filename: "MESH-mac-intel.dmg",
    },
    secondary: {
      label: ".app.zip",
      href: "/downloads/mesh/mac-intel/MESH.app.zip",
      filename: "MESH-mac-intel.app.zip",
    },
    note: "Open the disk image and drag Mesh to Applications.",
    available: true,
  },
  {
    id: "mac-arm",
    name: "Mac",
    arch: "M-Series",
    badge: "Available",
    primary: {
      label: "Download .dmg",
      href: "/downloads/mesh/mac-arm/MESH.dmg",
      filename: "MESH-mac-arm.dmg",
    },
    secondary: {
      label: ".app.zip",
      href: "/downloads/mesh/mac-arm/MESH.app.zip",
      filename: "MESH-mac-arm.app.zip",
    },
    note: "Apple silicon. Installs like any Mac app.",
    available: true,
  },
  {
    id: "linux",
    name: "Linux",
    arch: "Browser",
    badge: "Available",
    primary: {
      label: "Download AppImage",
      href: "/downloads/mesh/linux/MESH.AppImage",
      filename: "MESH-linux.AppImage",
    },
    secondary: {
      label: ".deb",
      href: "/downloads/mesh/linux/mesh_amd64.deb",
      filename: "mesh_amd64.deb",
    },
    note: "AppImage (chmod +x && ./MESH.AppImage) or .deb. x86_64.",
    available: true,
  },
  {
    id: "windows",
    name: "Windows",
    arch: "11+",
    badge: "Available",
    primary: {
      label: "Download Mesh",
      href: "/downloads/mesh/windows/MESH-Setup.zip",
      filename: "MESH-Setup.zip",
    },
    secondary: {
      label: "Portable.zip",
      href: "/downloads/mesh/windows/MESH-Setup.zip",
      filename: "MESH-Setup.zip",
    },
    note: "Windows 11+. Unzip and run Mesh.bat.",
    available: true,
  },
];

export const DOWNLOADS = {
  mesh: {
    version: MESH_VERSION,
    /** @deprecated prefer MESH_DOWNLOADS */
    dmg: "/downloads/mesh/mac-intel/MESH.dmg",
    appZip: "/downloads/mesh/mac-intel/MESH.app.zip",
    platform: "Multi-platform",
    platforms: MESH_DOWNLOADS,
  },
  cli: {
    darwinX64: "/downloads/cli/grid-darwin-x86_64",
    installSh: "/downloads/install.sh",
    version: "0.1.0",
  },
} as const;

/** One-liner shown in the UI (installs CLI from this site). */
export const CLI_INSTALL_CURL =
  "curl -fsSL https://grid-compute.com/downloads/install.sh | bash";

export const CLI_INSTALL_FORCE =
  "curl -fsSL https://grid-compute.com/downloads/install.sh | bash -s -- --force";

export function getMeshDownload(id: MeshPlatformId): MeshDownload | undefined {
  return MESH_DOWNLOADS.find((p) => p.id === id);
}

/**
 * Best-effort OS / arch detection for Mesh downloads.
 * Runs in the browser only (uses navigator).
 */
export function detectMeshPlatformSync(): MeshPlatformId | null {
  if (typeof navigator === "undefined") return null;

  const ua = navigator.userAgent || "";
  const plat = navigator.platform || "";
  const uaData = (
    navigator as Navigator & {
      userAgentData?: { platform?: string; mobile?: boolean };
    }
  ).userAgentData;

  const platformHint = (uaData?.platform || plat || ua).toLowerCase();

  // iOS / iPad — no desktop Mesh yet; don't force a bad pick
  if (/iphone|ipad|ipod/i.test(ua) || (plat === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return null;
  }

  // Android
  if (/android/i.test(ua)) return null;

  // Windows
  if (
    /win/i.test(platformHint) ||
    /windows/i.test(ua) ||
    plat.startsWith("Win")
  ) {
    return "windows";
  }

  // Linux (exclude Android handled above)
  if (
    /linux/i.test(platformHint) ||
    /linux/i.test(ua) ||
    /cros/i.test(ua) // ChromeOS → Linux package is closest
  ) {
    return "linux";
  }

  // macOS — default M-Series (2020+ majority); refined async if needed
  if (/mac/i.test(platformHint) || /mac os/i.test(ua) || plat.startsWith("Mac")) {
    // Sync signals for Intel vs Apple silicon
    if (/intel/i.test(ua) && !/arm|aarch64/i.test(ua)) {
      // UA alone is unreliable (M-series still reports MacIntel). Prefer WebGL below async.
      // Leave as null arm preference — sync path uses GPU if available.
    }
    const gpu = syncGpuRenderer();
    if (gpu) {
      if (/apple\s*m\d|apple gpu|apple silicon/i.test(gpu)) return "mac-arm";
      if (/intel|amd|radeon|nvidia/i.test(gpu)) return "mac-intel";
    }
    // Default Mac → M-Series (best for modern machines)
    return "mac-arm";
  }

  return null;
}

function syncGpuRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return null;
    return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "");
  } catch {
    return null;
  }
}

/**
 * Async refine using User-Agent Client Hints (Chrome / Edge / Chromium).
 * Falls back to {@link detectMeshPlatformSync}.
 */
export async function detectMeshPlatform(): Promise<MeshPlatformId | null> {
  const sync = detectMeshPlatformSync();

  try {
    const uaData = (
      navigator as Navigator & {
        userAgentData?: {
          platform?: string;
          getHighEntropyValues?: (hints: string[]) => Promise<{
            architecture?: string;
            platform?: string;
          }>;
        };
      }
    ).userAgentData;

    if (uaData?.getHighEntropyValues) {
      const { architecture, platform } = await uaData.getHighEntropyValues([
        "architecture",
        "platform",
      ]);
      const p = (platform || "").toLowerCase();
      const arch = (architecture || "").toLowerCase();

      if (p.includes("windows") || p === "windows") return "windows";
      if (p.includes("linux") || p === "linux") return "linux";
      if (p.includes("mac") || p === "macos") {
        if (arch === "arm" || arch === "arm64" || arch.includes("aarch")) {
          return "mac-arm";
        }
        if (arch === "x86" || arch === "x86_64" || arch.includes("x64")) {
          return "mac-intel";
        }
        return sync === "mac-intel" || sync === "mac-arm" ? sync : "mac-arm";
      }
    }
  } catch {
    /* ignore */
  }

  return sync;
}

export function meshPlatformLabel(id: MeshPlatformId): string {
  switch (id) {
    case "mac-intel":
      return "Mac · Intel";
    case "mac-arm":
      return "Mac · M-Series";
    case "linux":
      return "Linux";
    case "windows":
      return "Windows 11+";
  }
}
