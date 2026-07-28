"use client";

import { useEffect } from "react";
import type { PublicNode } from "@/lib/network";

type Props = {
  genesis: PublicNode;
  nodes: PublicNode[];
  burstIds: string[];
  onBurstDone?: (id: string) => void;
};

function WorldMapBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
    >
      <g className="stroke-white/10" fill="none" strokeWidth="1">
        {[125, 250, 375, 500, 625, 750, 875].map((x) => (
          <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="500" />
        ))}
        {[100, 200, 300, 400].map((y) => (
          <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} />
        ))}
      </g>
      <g
        className="fill-white/[0.055] stroke-white/20"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M62 109 105 67 183 49 248 67 278 105 247 127 216 121 199 149 166 166 151 206 118 207 95 177 70 166 45 137Z" />
        <path d="M224 195 258 218 279 266 267 315 241 377 215 426 193 388 181 333 162 277 180 227Z" />
        <path d="M447 91 489 67 547 76 572 103 548 125 507 119 489 142 453 133 425 113Z" />
        <path d="M463 146 516 148 555 181 570 236 551 303 515 370 474 335 454 278 432 214Z" />
        <path d="M553 108 625 73 707 68 774 86 843 109 892 149 855 176 799 168 758 198 701 181 661 210 611 190 568 154Z" />
        <path d="M702 189 738 202 764 239 746 270 710 257 681 221Z" />
        <path d="M815 310 864 292 922 316 944 356 916 388 855 381 806 350Z" />
        <path d="M505 430 568 421 631 433 603 454 532 457Z" />
      </g>
    </svg>
  );
}

export function WorldNodeMap({ genesis, nodes, burstIds, onBurstDone }: Props) {
  useEffect(() => {
    if (!burstIds.length || !onBurstDone) return;
    const timers = burstIds.map((id) =>
      window.setTimeout(() => onBurstDone(id), 2_800),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [burstIds, onBurstDone]);

  const plotted = nodes.filter(
    (node) => Number.isFinite(node.lat) && Number.isFinite(node.lng),
  );

  return (
    <div className="panel relative h-[340px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,.06),transparent_72%)] sm:h-[470px]">
      <WorldMapBackdrop />
      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/70 px-3 py-1 font-mono text-[0.58rem] tracking-[0.16em] text-white/50 uppercase backdrop-blur">
        Live coarse geography
      </div>
      {plotted.map((node) => {
        const left = ((Number(node.lng) + 180) / 360) * 100;
        const top = ((90 - Number(node.lat)) / 180) * 100;
        const online = node.status === "online";
        const bursting = burstIds.includes(node.id);
        return (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`${node.label} · ${node.region} · ${node.status}`}
          >
            <span
              className={`block size-3 rounded-full border-2 border-black shadow-lg ${
                online ? "bg-emerald-400" : "bg-white/20"
              }`}
            />
            {(node.id === genesis.id || bursting) && online ? (
              <span className="absolute inset-0 -m-2 animate-ping rounded-full border border-emerald-400/60" />
            ) : null}
            <span className="absolute left-4 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded border border-white/10 bg-black/80 px-2 py-1 font-mono text-[0.56rem] text-white/55 backdrop-blur sm:block">
              {node.label} · {node.region}
            </span>
          </div>
        );
      })}
      {!plotted.length ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-white/35">
          Awaiting live node coordinates…
        </p>
      ) : null}
      <p className="absolute bottom-3 left-4 right-4 font-mono text-[0.58rem] leading-relaxed text-white/30">
        Cloudflare-derived coordinates are rounded before display · public node IDs only · IP addresses are never stored
      </p>
    </div>
  );
}
