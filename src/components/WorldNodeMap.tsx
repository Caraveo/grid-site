"use client";

import { useEffect, useRef } from "react";
import {
  geoDistance,
  geoGraticule10,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import landTopology from "world-atlas/land-110m.json";
import type { PublicNode } from "@/lib/network";

type Props = {
  genesis: PublicNode;
  nodes: PublicNode[];
  burstIds: string[];
  selectedNodeId?: string | null;
  onSelectNode?: (id: string) => void;
  onBurstDone?: (id: string) => void;
};

type Burst = {
  id: string;
  born: number;
};

const topology = landTopology as unknown as Topology<{
  land: GeometryObject;
}>;
const LAND = feature(topology, topology.objects.land);
const GRATICULE = geoGraticule10();
const SPHERE = { type: "Sphere" } as const;
const LIVE_STATUSES = new Set<PublicNode["status"]>(["online", "syncing"]);

function hasCoordinates(
  node: PublicNode,
): node is PublicNode & { lat: number; lng: number } {
  return Number.isFinite(node.lat) && Number.isFinite(node.lng);
}

function visibleFrom(
  node: PublicNode & { lat: number; lng: number },
  rotation: [number, number],
) {
  const center: [number, number] = [-rotation[0], -rotation[1]];
  return geoDistance([node.lng, node.lat], center) < Math.PI / 2;
}

function drawGeo(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  object: Parameters<ReturnType<typeof geoPath>>[0],
) {
  ctx.beginPath();
  geoPath(projection, ctx)(object);
}

export function WorldNodeMap({
  genesis,
  nodes,
  burstIds,
  selectedNodeId,
  onSelectNode,
  onBurstDone,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef(nodes);
  const genesisRef = useRef(genesis);
  const burstsRef = useRef<Burst[]>([]);
  const onBurstDoneRef = useRef(onBurstDone);
  const onSelectNodeRef = useRef(onSelectNode);
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId ?? null);
  const focusSelectionRef = useRef(false);

  useEffect(() => {
    nodesRef.current = nodes;
    genesisRef.current = genesis;
    onBurstDoneRef.current = onBurstDone;
    onSelectNodeRef.current = onSelectNode;
  }, [genesis, nodes, onBurstDone, onSelectNode]);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId ?? null;
    focusSelectionRef.current = Boolean(selectedNodeId);
  }, [selectedNodeId]);

  useEffect(() => {
    const now = performance.now();
    for (const id of burstIds) {
      if (burstsRef.current.some((burst) => burst.id === id)) continue;
      burstsRef.current.push({ id, born: now });
    }
  }, [burstIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !wrap || !ctx) return;

    const projection = geoOrthographic()
      .clipAngle(90)
      .precision(0.3)
      .rotate([104, -24, 0]);

    let frameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let dragging = false;
    let resumeRotationAt = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerMoved = false;
    let rotation: [number, number] = [104, -24];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = Math.max(350, Math.min(500, width * 0.72));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection
        .translate([width / 2, height / 2 - 4])
        .scale(Math.min(width, height) * 0.4);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      pointerMoved = false;
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      if (
        Math.abs(event.clientX - pointerStartX) > 3 ||
        Math.abs(event.clientY - pointerStartY) > 3
      ) {
        pointerMoved = true;
      }
      rotation = [
        rotation[0] + (event.clientX - pointerX) * 0.34,
        Math.max(
          -70,
          Math.min(70, rotation[1] - (event.clientY - pointerY) * 0.28),
        ),
      ];
      pointerX = event.clientX;
      pointerY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      resumeRotationAt = performance.now() + 2_000;
      if (pointerMoved || !onSelectNodeRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const candidates = [genesisRef.current, ...nodesRef.current].filter(
        (node): node is PublicNode & { lat: number; lng: number } =>
          LIVE_STATUSES.has(node.status) &&
          hasCoordinates(node) &&
          visibleFrom(node, rotation),
      );
      const hit = candidates.find((node) => {
        const point = projection([node.lng, node.lat]);
        return point && Math.hypot(point[0] - clickX, point[1] - clickY) <= 18;
      });
      if (hit) onSelectNodeRef.current(hit.id);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    const draw = (now: number) => {
      if (!dragging && !reduceMotion && now >= resumeRotationAt) {
        rotation = [rotation[0] + 0.055, rotation[1]];
      }
      projection.rotate([rotation[0], rotation[1], 0]);
      ctx.clearRect(0, 0, width, height);

      const light = document.documentElement.classList.contains("light");
      const centerX = width / 2;
      const centerY = height / 2 - 4;
      const radius = Math.min(width, height) * 0.4;

      const background = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.48,
      );
      background.addColorStop(
        0,
        light ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.045)",
      );
      background.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.shadowColor = light
        ? "rgba(0,0,0,0.16)"
        : "rgba(123,220,255,0.24)";
      ctx.shadowBlur = 28;
      drawGeo(ctx, projection, SPHERE);
      const ocean = ctx.createRadialGradient(
        centerX - radius * 0.28,
        centerY - radius * 0.32,
        radius * 0.08,
        centerX,
        centerY,
        radius,
      );
      ocean.addColorStop(0, light ? "#f9fbfc" : "#14242d");
      ocean.addColorStop(0.65, light ? "#dce6e9" : "#071116");
      ocean.addColorStop(1, light ? "#bcc9cd" : "#020607");
      ctx.fillStyle = ocean;
      ctx.fill();
      ctx.restore();

      drawGeo(ctx, projection, GRATICULE);
      ctx.strokeStyle = light
        ? "rgba(0,0,0,0.10)"
        : "rgba(198,231,240,0.11)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      drawGeo(ctx, projection, LAND);
      ctx.fillStyle = light ? "#aebbb5" : "#20352f";
      ctx.fill();
      ctx.strokeStyle = light
        ? "rgba(38,62,50,0.55)"
        : "rgba(157,218,190,0.58)";
      ctx.lineWidth = 0.85;
      ctx.stroke();

      drawGeo(ctx, projection, SPHERE);
      ctx.strokeStyle = light
        ? "rgba(0,0,0,0.34)"
        : "rgba(178,231,242,0.62)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      const allNodes = [genesisRef.current, ...nodesRef.current];
      const seen = new Set<string>();
      const liveNodes = allNodes.filter((node) => {
        if (seen.has(node.id)) return false;
        seen.add(node.id);
        return LIVE_STATUSES.has(node.status) && hasCoordinates(node);
      }) as Array<PublicNode & { lat: number; lng: number }>;

      const selectedNode = selectedNodeIdRef.current
        ? liveNodes.find((node) => node.id === selectedNodeIdRef.current)
        : undefined;
      if (focusSelectionRef.current && selectedNode) {
        // Bring a selected list item to the front of the globe immediately.
        rotation = [-selectedNode.lng, -selectedNode.lat];
        focusSelectionRef.current = false;
      }

      for (const node of liveNodes) {
        if (!visibleFrom(node, rotation)) continue;
        const point = projection([node.lng, node.lat]);
        if (!point) continue;
        const [x, y] = point;
        const genesisNode =
          node.role === "genesis" || node.id === genesisRef.current.id;
        const pulse = 0.5 + Math.sin(now * 0.003 + node.lat) * 0.5;
        const radius = genesisNode ? 5.5 : 4;

        ctx.beginPath();
        ctx.arc(x, y, radius * (2.1 + pulse * 0.65), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${0.08 + pulse * 0.08})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = genesisNode ? "#ffffff" : "#34d399";
        ctx.shadowColor = genesisNode ? "#ffffff" : "#34d399";
        ctx.shadowBlur = genesisNode ? 16 : 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (selectedNode?.id === node.id) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = light ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.9)";
          ctx.lineWidth = 1.25;
          ctx.stroke();

          const label = node.label.toUpperCase();
          ctx.font = "600 9px ui-monospace, SFMono-Regular, Menlo, monospace";
          const labelWidth = ctx.measureText(label).width + 14;
          const labelY = y - radius - 14;
          ctx.fillStyle = light ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.78)";
          ctx.fillRect(x - labelWidth / 2, labelY - 10, labelWidth, 17);
          ctx.textAlign = "center";
          ctx.fillStyle = light ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.92)";
          ctx.fillText(label, x, labelY + 2);
        }
      }

      const activeBursts: Burst[] = [];
      for (const burst of burstsRef.current) {
        const age = now - burst.born;
        if (age >= 2_800) {
          onBurstDoneRef.current?.(burst.id);
          continue;
        }
        const node = liveNodes.find((candidate) => candidate.id === burst.id);
        if (!node || !visibleFrom(node, rotation)) {
          activeBursts.push(burst);
          continue;
        }
        const point = projection([node.lng, node.lat]);
        if (!point) continue;
        activeBursts.push(burst);
        const progress = age / 2_800;
        ctx.beginPath();
        ctx.arc(
          point[0],
          point[1],
          10 + 55 * (1 - Math.pow(1 - progress, 3)),
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.7 * (1 - progress)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      burstsRef.current = activeBursts;

      if (!liveNodes.length) {
        ctx.textAlign = "center";
        ctx.font = "500 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = light
          ? "rgba(0,0,0,0.42)"
          : "rgba(255,255,255,0.42)";
        ctx.fillText(
          "Awaiting live node coordinates…",
          centerX,
          centerY + radius + 32,
        );
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="panel relative min-h-[350px] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(61,154,179,.08),transparent_70%)] sm:min-h-[470px]"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Rotating Earth showing only live GRID nodes at privacy-rounded locations"
        className="block w-full cursor-grab touch-none active:cursor-grabbing"
      />
      <div className="globe-status-badge pointer-events-none absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[0.62rem] tracking-[0.16em] uppercase backdrop-blur">
        Live nodes only · Real Earth
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 pb-3 pt-12 font-mono text-[0.55rem] leading-relaxed tracking-[0.08em] text-white/42">
        <span>
          Privacy-rounded geography · IP addresses are never displayed
        </span>
        <span className="shrink-0 uppercase">Drag to rotate</span>
      </div>
    </div>
  );
}
