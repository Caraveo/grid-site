"use client";

import { useEffect, useRef } from "react";
import type { PublicNode } from "@/lib/network";

type Props = {
  genesis: PublicNode;
  nodes: PublicNode[];
  /** ids that should fire a special join burst */
  burstIds: string[];
  onBurstDone?: (id: string) => void;
};

type Star = { x: number; y: number; z: number; b: number };
type Burst = {
  id: string;
  lat: number;
  lng: number;
  born: number;
  life: number;
};

// Lightweight land dots (approximate continents) — feel over accuracy
const LAND: Array<[number, number]> = (() => {
  const pts: Array<[number, number]> = [];
  const blobs: Array<[number, number, number, number, number]> = [
    // lat, lng, latSpread, lngSpread, count
    [45, -100, 18, 35, 90], // NA
    [20, -100, 12, 20, 40], // Mexico/CA
    [-15, -60, 20, 18, 55], // SA
    [50, 15, 15, 30, 80], // Europe
    [10, 20, 25, 25, 70], // Africa
    [55, 70, 18, 50, 90], // Asia N
    [25, 90, 15, 40, 70], // Asia S
    [-25, 135, 12, 25, 45], // AU
  ];
  for (const [lat, lng, ls, gs, n] of blobs) {
    for (let i = 0; i < n; i++) {
      pts.push([
        lat + (Math.random() - 0.5) * 2 * ls,
        lng + (Math.random() - 0.5) * 2 * gs,
      ]);
    }
  }
  return pts;
})();

function latLngToVec(lat: number, lng: number) {
  const φ = (lat * Math.PI) / 180;
  const λ = (lng * Math.PI) / 180;
  const cosφ = Math.cos(φ);
  return {
    x: cosφ * Math.cos(λ),
    y: Math.sin(φ),
    z: cosφ * Math.sin(λ),
  };
}

export function NodeGlobe({ genesis, nodes, burstIds, onBurstDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef(0.35);
  const burstsRef = useRef<Burst[]>([]);
  const starsRef = useRef<Star[]>([]);
  const nodesRef = useRef(nodes);
  const genesisRef = useRef(genesis);
  const onBurstDoneRef = useRef(onBurstDone);

  nodesRef.current = nodes;
  genesisRef.current = genesis;
  onBurstDoneRef.current = onBurstDone;

  // Queue bursts when new ids arrive
  useEffect(() => {
    const now = performance.now();
    for (const id of burstIds) {
      const n = nodesRef.current.find((x) => x.id === id);
      if (!n || n.lat == null || n.lng == null) continue;
      if (burstsRef.current.some((b) => b.id === id && now - b.born < 800)) {
        continue;
      }
      burstsRef.current.push({
        id,
        lat: n.lat,
        lng: n.lng,
        born: now,
        life: 2800,
      });
    }
  }, [burstIds]);

  useEffect(() => {
    // background stars
    starsRef.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      b: 0.2 + Math.random() * 0.8,
    }));

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let drag = false;
    let lastX = 0;
    let auto = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = Math.max(320, Math.min(520, wrap.clientWidth * 0.62));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const onDown = (e: PointerEvent) => {
      drag = true;
      auto = false;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      rotRef.current += dx * 0.005;
    };
    const onUp = () => {
      drag = false;
      setTimeout(() => {
        auto = true;
      }, 2500);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    const project = (
      x: number,
      y: number,
      z: number,
      rot: number,
      cx: number,
      cy: number,
      R: number,
    ) => {
      // rotate around Y
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const xr = x * cos + z * sin;
      const zr = -x * sin + z * cos;
      // tilt
      const tilt = 0.35;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const yr = y * cosT - zr * sinT;
      const zr2 = y * sinT + zr * cosT;
      return {
        sx: cx + xr * R,
        sy: cy - yr * R,
        depth: zr2,
        visible: zr2 > -0.05,
      };
    };

    const frame = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2 + 6;
      const R = Math.min(w, h) * 0.38;

      if (auto) rotRef.current += 0.0016;
      const rot = rotRef.current;

      ctx.clearRect(0, 0, w, h);

      // soft vignette
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.6);
      g.addColorStop(0, "rgba(255,255,255,0.04)");
      g.addColorStop(0.55, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of starsRef.current) {
        const px = (s.x * 0.5 + 0.5) * w;
        const py = (s.y * 0.5 + 0.5) * h;
        ctx.globalAlpha = s.b * (0.35 + 0.25 * Math.sin(t * 0.001 + s.z * 10));
        ctx.fillStyle = "#fff";
        ctx.fillRect(px, py, 1.2, 1.2);
      }
      ctx.globalAlpha = 1;

      // atmosphere ring
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // globe fill
      const globe = ctx.createRadialGradient(
        cx - R * 0.3,
        cy - R * 0.35,
        R * 0.1,
        cx,
        cy,
        R,
      );
      globe.addColorStop(0, "rgba(28,28,32,0.95)");
      globe.addColorStop(1, "rgba(0,0,0,0.98)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = globe;
      ctx.fill();

      // land stipple
      for (const [lat, lng] of LAND) {
        const v = latLngToVec(lat, lng);
        const p = project(v.x, v.y, v.z, rot, cx, cy, R);
        if (!p.visible) continue;
        const a = 0.12 + 0.35 * ((p.depth + 1) / 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(p.sx, p.sy, 1.4, 1.4);
      }

      // graticule
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lng = -180; lng <= 180; lng += 6) {
          const v = latLngToVec(lat, lng);
          const p = project(v.x, v.y, v.z, rot, cx, cy, R);
          if (!p.visible) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.sx, p.sy);
            started = true;
          } else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }

      const list = nodesRef.current.filter(
        (n) => n.lat != null && n.lng != null && Number.isFinite(n.lat) && Number.isFinite(n.lng),
      );
      const gen = genesisRef.current;
      const genVec =
        gen.lat != null && gen.lng != null
          ? latLngToVec(gen.lat, gen.lng)
          : latLngToVec(37.5, -122);

      // arcs genesis → peers
      for (const n of list) {
        if (n.role === "genesis") continue;
        const a = genVec;
        const b = latLngToVec(n.lat!, n.lng!);
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= 28; i++) {
          const t0 = i / 28;
          // slerp-ish with loft
          const x = a.x * (1 - t0) + b.x * t0;
          const y = a.y * (1 - t0) + b.y * t0;
          const z = a.z * (1 - t0) + b.z * t0;
          const len = Math.hypot(x, y, z) || 1;
          const loft = 1 + Math.sin(t0 * Math.PI) * 0.18;
          const p = project(
            (x / len) * loft,
            (y / len) * loft,
            (z / len) * loft,
            rot,
            cx,
            cy,
            R,
          );
          if (!p.visible) {
            pen = false;
            continue;
          }
          if (!pen) {
            ctx.moveTo(p.sx, p.sy);
            pen = true;
          } else ctx.lineTo(p.sx, p.sy);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // traveling packet
        const tt = (t * 0.00035 + (n.id.charCodeAt(0) % 7) * 0.1) % 1;
        const x = a.x * (1 - tt) + b.x * tt;
        const y = a.y * (1 - tt) + b.y * tt;
        const z = a.z * (1 - tt) + b.z * tt;
        const len = Math.hypot(x, y, z) || 1;
        const loft = 1 + Math.sin(tt * Math.PI) * 0.18;
        const pk = project(
          (x / len) * loft,
          (y / len) * loft,
          (z / len) * loft,
          rot,
          cx,
          cy,
          R,
        );
        if (pk.visible) {
          ctx.beginPath();
          ctx.arc(pk.sx, pk.sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fill();
        }
      }

      // node dots + soft breath
      const sorted = [...list].sort((a, b) => {
        const va = latLngToVec(a.lat!, a.lng!);
        const vb = latLngToVec(b.lat!, b.lng!);
        return (
          project(va.x, va.y, va.z, rot, cx, cy, R).depth -
          project(vb.x, vb.y, vb.z, rot, cx, cy, R).depth
        );
      });

      for (const n of sorted) {
        const v = latLngToVec(n.lat!, n.lng!);
        const p = project(v.x, v.y, v.z, rot, cx, cy, R);
        if (!p.visible) continue;
        const isGen = n.role === "genesis" || n.id === "genesis";
        const breath = 0.5 + 0.5 * Math.sin(t * 0.003 + n.lat!);
        const r = isGen ? 5.5 : 3.2;

        // halo
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * (2.2 + breath * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = isGen
          ? `rgba(255,255,255,${0.08 + breath * 0.05})`
          : `rgba(255,255,255,${0.04 + breath * 0.03})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = isGen ? "#fff" : "rgba(255,255,255,0.9)";
        ctx.shadowColor = "rgba(255,255,255,0.8)";
        ctx.shadowBlur = isGen ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isGen) {
          ctx.save();
          ctx.translate(p.sx, p.sy);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = "#000";
          ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
          ctx.restore();
        }
      }

      // JOIN BURSTS — the "I'm a node!" moment
      const nextBursts: Burst[] = [];
      for (const b of burstsRef.current) {
        const age = t - b.born;
        if (age > b.life) {
          onBurstDoneRef.current?.(b.id);
          continue;
        }
        nextBursts.push(b);
        const v = latLngToVec(b.lat, b.lng);
        const p = project(v.x, v.y, v.z, rot, cx, cy, R);
        if (!p.visible) continue;
        const k = age / b.life;
        const ease = 1 - Math.pow(1 - k, 3);

        // expanding rings
        for (let ring = 0; ring < 3; ring++) {
          const rk = Math.min(1, Math.max(0, k * 1.35 - ring * 0.12));
          const rad = 8 + ease * (48 + ring * 18);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - rk) * 0.55})`;
          ctx.lineWidth = 1.5 - ring * 0.3;
          ctx.stroke();
        }

        // flash core
        const flash = Math.max(0, 1 - k * 2.2);
        if (flash > 0) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 4 + flash * 10, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${flash * 0.9})`;
          ctx.fill();
        }

        // label float
        if (k < 0.75) {
          const n = nodesRef.current.find((x) => x.id === b.id);
          const label = n?.label ?? "NODE";
          ctx.font =
            "600 10px ui-sans-serif, system-ui, -apple-system, sans-serif";
          ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 0.9})`;
          ctx.textAlign = "center";
          ctx.fillText(label.toUpperCase(), p.sx, p.sy - 18 - ease * 12);
          ctx.font =
            "500 8px ui-monospace, SFMono-Regular, Menlo, monospace";
          ctx.fillStyle = `rgba(255,255,255,${(1 - k) * 0.55})`;
          ctx.fillText("I'M A NODE", p.sx, p.sy - 6 - ease * 12);
        }
      }
      burstsRef.current = nextBursts;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden border border-white/10 bg-black"
    >
      <canvas
        ref={canvasRef}
        className="block w-full cursor-grab active:cursor-grabbing"
        aria-label="GRID live node globe"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-3 pt-10 text-[0.6rem] tracking-[0.16em] text-white/40 uppercase">
        <span>Drag to wander</span>
        <span>Presence only</span>
      </div>
    </div>
  );
}
