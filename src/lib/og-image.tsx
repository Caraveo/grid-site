import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type OgProps = {
  title: string;
  description?: string;
  label?: string;
};

/**
 * Shared Open Graph / Twitter card art (1200×630).
 * Uses next/og ImageResponse — no external assets required.
 */
export function createOgImage({ title, description, label = "GRID" }: OgProps) {
  return new ImageResponse(
    (
      <div
        style={{
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
        }}
      >
        {/* Grid backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.14,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Soft glow */}
        <div
          style={{
            position: "absolute",
            width: 720,
            height: 420,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            top: -80,
            right: -60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 320,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(255,106,26,0.18) 0%, transparent 70%)",
            bottom: -100,
            left: -40,
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Mark */}
            <div
              style={{
                width: 48,
                height: 48,
                border: "1.5px solid rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              G
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.35em",
              }}
            >
              GRID
            </div>
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {label}
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: title.length > 48 ? 52 : 64,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.58)",
                maxWidth: 860,
              }}
            >
              {description.length > 160
                ? `${description.slice(0, 157)}…`
                : description}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            grid-compute.com
          </div>
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,106,26,0.95)",
              fontWeight: 600,
            }}
          >
            Planetary compute
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
    },
  );
}
