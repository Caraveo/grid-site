/**
 * Build-time Open Graph PNGs (1200×630) via next/og ImageResponse.
 * Output: public/og/*.png
 */
import { writeFile, mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/downloads/og");

function fileForPath(path) {
  if (path === "/") return "home.png";
  return `${path
    .replace(/^\/|\/$/g, "")
    .replaceAll("/", "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()}.png`;
}

function accentForPath(path) {
  let hash = 0;
  for (const character of path) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  const accents = ["#50f01c", "#22d3ee", "#60a5fa", "#a78bfa", "#fb923c"];
  return accents[hash % accents.length];
}

async function pageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return pageFiles(path);
      return entry.name === "page.tsx" ? [path] : [];
    }),
  );
  return children.flat();
}

async function validateCoverage(pages) {
  const appDirectory = join(__dirname, "../src/app");
  const files = await pageFiles(appDirectory);
  const registered = new Set(pages.map((page) => page.path));
  const seen = new Set();

  for (const file of files) {
    const relative = file
      .slice(appDirectory.length)
      .replace(/\/page\.tsx$/, "")
      .replaceAll("\\", "/");
    const route = relative || "/";
    seen.add(route);
    if (!registered.has(route)) {
      throw new Error(`Missing SEO registry entry for ${route}`);
    }
    const source = await readFile(file, "utf8");
    if (!source.includes(`metadataFor(${JSON.stringify(route)})`)) {
      throw new Error(`Page ${route} is not wired to its route metadata`);
    }
  }

  const stale = [...registered].filter((route) => !seen.has(route));
  if (stale.length) {
    throw new Error(`SEO registry contains routes without pages: ${stale.join(", ")}`);
  }

  console.log(`validated SEO coverage for ${files.length} document routes`);
}

function ogElement({ title, description, label, path }) {
  const accent = accentForPath(path);
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#000000",
        color: "#ffffff",
        padding: "64px 72px",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      },
    },
    h("div", {
      style: {
        position: "absolute",
        inset: 0,
        opacity: 0.14,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        width: 720,
        height: 420,
        borderRadius: 999,
        background:
          "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
        top: -80,
        right: -60,
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        width: 480,
        height: 320,
        borderRadius: 999,
        background:
          `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
        bottom: -100,
        left: -40,
      },
    }),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 16 } },
        h(
          "div",
          {
            style: {
              width: 48,
              height: 48,
              border: "1.5px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.08em",
            },
          },
          "G",
        ),
        h(
          "div",
          {
            style: {
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.35em",
            },
          },
          "GRID",
        ),
      ),
      h(
        "div",
        {
          style: {
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
          },
        },
        label,
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 24,
          position: "relative",
          maxWidth: 980,
        },
      },
      h(
        "div",
        {
          style: {
            fontSize: title.length > 48 ? 52 : 64,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            whiteSpace: "pre-line",
          },
        },
        title,
      ),
      description
        ? h(
            "div",
            {
              style: {
                fontSize: 26,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.58)",
                maxWidth: 860,
              },
            },
            description.length > 160
              ? `${description.slice(0, 157)}…`
              : description,
          )
        : null,
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        },
      },
      h(
        "div",
        {
          style: {
            fontSize: 18,
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          },
        },
        "grid-compute.com",
      ),
      h(
        "div",
        {
          style: {
            fontSize: 16,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: accent,
            fontWeight: 600,
          },
        },
        path === "/" ? "Planetary compute" : path,
      ),
    ),
  );
}

async function main() {
  const registryPath = join(__dirname, "../src/lib/seo-pages.json");
  const pages = JSON.parse(await readFile(registryPath, "utf8"));
  await validateCoverage(pages);
  await mkdir(OUT, { recursive: true });
  for (const page of pages) {
    const res = new ImageResponse(ogElement(page), {
      width: 1200,
      height: 630,
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = join(OUT, fileForPath(page.path));
    await writeFile(dest, buf);
    console.log("wrote", dest, buf.length, "bytes");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
