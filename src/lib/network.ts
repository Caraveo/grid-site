/** Public mesh types — never include IPs, hostnames, ports, or private keys. */

export type NodeClass = "S" | "M" | "L";
export type NodeStatus = "online" | "syncing" | "idle" | "offline";
export type NodeRole = "genesis" | "peer";

export interface PublicNode {
  id: string;
  label: string;
  class: NodeClass;
  /** Coarse geography label only (e.g. NA-W, EU). Never city/IP. */
  region: string;
  status: NodeStatus;
  role: NodeRole;
  joinedAt?: string;
  lastSeen?: string;
  /**
   * Coarse coordinates for globe pings only.
   * Cloudflare may derive them from the heartbeat connection, after which they
   * are quantized server-side (~0.5°). The originating IP is never stored.
   */
  lat?: number;
  lng?: number;
}

export interface MeshRegistry {
  phase: string;
  updatedAt: string;
  note?: string;
  genesis: PublicNode;
  peers: PublicNode[];
}

/** Live globe payload from GET /api/mesh */
export interface GlobeMesh {
  phase: string;
  updatedAt: string;
  genesis: PublicNode;
  nodes: PublicNode[];
  /** Recent join events for cinematic pings */
  recentPings: Array<{
    id: string;
    label: string;
    lat: number;
    lng: number;
    at: string;
    isNew: boolean;
  }>;
  stats: {
    total: number;
    online: number;
    peers: number;
  };
}

export const EMPTY_MESH: MeshRegistry = {
  phase: "0",
  updatedAt: new Date(0).toISOString(),
  genesis: {
    id: "genesis",
    label: "GENESIS",
    class: "L",
    region: "Origin",
    status: "online",
    role: "genesis",
  },
  peers: [],
};

export function allNodes(mesh: MeshRegistry): PublicNode[] {
  return [mesh.genesis, ...mesh.peers];
}

export function countByStatus(mesh: MeshRegistry) {
  const nodes = allNodes(mesh);
  return {
    total: nodes.length,
    online: nodes.filter((n) => n.status === "online").length,
    syncing: nodes.filter((n) => n.status === "syncing").length,
    peers: mesh.peers.length,
  };
}

/** Short public fingerprint — never a network address. */
export function shortId(id: string): string {
  if (id === "genesis") return "GENESIS";
  const clean = id.replace(/^node[_-]?/i, "");
  return clean.slice(0, 8).toUpperCase();
}

export function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

/** Quantize to ~0.5° so globe dots aren't street-precise. */
export function quantizeCoord(n: number, step = 0.5): number {
  return Math.round(n / step) * step;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
