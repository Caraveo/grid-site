/**
 * Build-time Open Graph PNGs (1200×630) via next/og ImageResponse.
 * Output: public/og/*.png
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import { createElement as h } from "react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/downloads/og");

const pages = [
  {
    file: "card-00.png",
    label: "GRID",
    title: "Useful mining.\nPlanetary compute.",
    description:
      "Run a node. Do real work. Earn GRID. The planetary supercomputer built from machines everywhere.",
  },
  {
    file: "card-01.png",
    label: "EMBER",
    title: "Ember — full stack\nfor one realm",
    description:
      "host + mine + compute + registry. One grid:// name. Fully yours.",
  },
  {
    file: "card-02.png",
    label: "REGISTRY",
    title: "Registry — public\nnames that stay real",
    description:
      "Activate on registry.grid. Cash App $5 → $Caraveo. Donations accepted.",
  },
  {
    file: "card-03.png",
    label: "EXPLAIN",
    title: "GRID & Mesh\nin plain English",
    description:
      "What the network is, how Mesh opens grid://, and how Bitcoin secures value.",
  },
  {
    file: "card-04.png",
    label: "ADMIN",
    title: "GRID Admin",
    description: "Registry administration.",
  },
];

function ogElement({ title, description, label }) {
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
          "radial-gradient(circle, rgba(255,106,26,0.18) 0%, transparent 70%)",
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
            color: "rgba(255,106,26,0.95)",
            fontWeight: 600,
          },
        },
        "Planetary compute",
      ),
    ),
  );
}

async function main() {
  await mkdir(OUT, { recursive: true });
  for (const page of pages) {
    const res = new ImageResponse(ogElement(page), {
      width: 1200,
      height: 630,
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const dest = join(OUT, page.file);
    await writeFile(dest, buf);
    console.log("wrote", dest, buf.length, "bytes");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
