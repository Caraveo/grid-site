/**
 * Public registry.grid directory.
 *
 * Rule: you only appear if you completed Cash App registration and were
 * approved (status=active) as a node and/or compute.
 */

import { getPublicComputes, type PublicCompute } from "./compute-store";
import { getPublicMesh } from "./mesh-store";
import {
  listActiveRegistrations,
  type NameRegistration,
  type RegKind,
} from "./registration-store";
import type { PublicNode } from "./network";

export type RegistryEntry = {
  name: string;
  label: string;
  class: string;
  region: string;
  /** Registered roles */
  kinds: RegKind[];
  /** Live signals */
  nodeOnline: boolean;
  computeOnline: boolean;
  freeSlots: number;
  replicas: number;
  computeStatus: string | null;
  image: string | null;
  registeredAt: string;
};

function peerMatchesReg(peer: PublicNode, reg: NameRegistration): boolean {
  const label = (peer.label ?? "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const id = (peer.id ?? "").toLowerCase();
  const name = reg.name.toLowerCase();
  if (label === name) return true;
  if (id === reg.nodeId.toLowerCase()) return true;
  if (id.includes(name)) return true;
  return false;
}

export async function buildRegistryDirectory(): Promise<{
  rule: string;
  entries: RegistryEntry[];
  nodes: PublicNode[];
  computes: PublicCompute[];
  stats: {
    registered: number;
    nodes: number;
    computes: number;
    onlineNodes: number;
    availableComputes: number;
  };
}> {
  const [active, mesh, liveComputes] = await Promise.all([
    listActiveRegistrations(),
    getPublicMesh(),
    getPublicComputes({ registeredOnly: true, availableOnly: false }),
  ]);

  const peers = [...(mesh.nodes ?? []), ...(mesh.peers ?? [])].filter(
    (n, i, arr) => arr.findIndex((x) => x.id === n.id) === i,
  );

  // Only peers whose label/id maps to an active *node* registration
  const nodeRegs = active.filter((r) => r.kinds.includes("node"));
  const registeredPeers = peers.filter((p) =>
    nodeRegs.some((r) => peerMatchesReg(p, r)),
  );

  const computes = liveComputes.computes.filter((c) =>
    active.some((r) => r.kinds.includes("compute") && r.name === c.name),
  );

  const entries: RegistryEntry[] = active.map((reg) => {
    const nodeOnline =
      reg.kinds.includes("node") &&
      peers.some(
        (p) =>
          peerMatchesReg(p, reg) &&
          (p.status === "online" || p.status === "syncing"),
      );
    const live = computes.filter((c) => c.name === reg.name);
    const freeSlots = live.reduce((s, c) => s + (c.freeSlots ?? 0), 0);
    const replicas = live.reduce((s, c) => s + (c.replicas ?? 0), 0);
    const available = live.find((c) => c.status === "available");
    const any = live[0];

    return {
      name: reg.name,
      label: reg.label,
      class: reg.class,
      region: reg.region,
      kinds: reg.kinds,
      nodeOnline,
      computeOnline: live.some(
        (c) => c.status === "available" || c.status === "busy",
      ),
      freeSlots,
      replicas,
      computeStatus: available?.status ?? any?.status ?? null,
      image: any?.image ?? null,
      registeredAt: reg.createdAt,
    };
  });

  return {
    rule: "registry.grid requires paid activation: Cash App $5 → $Caraveo (exact note) → confirm → admin approve. Prevents abuse · funds review employment. Donations accepted at $Caraveo.",
    entries,
    nodes: registeredPeers,
    computes,
    stats: {
      registered: active.length,
      nodes: nodeRegs.length,
      computes: active.filter((r) => r.kinds.includes("compute")).length,
      onlineNodes: entries.filter((e) => e.nodeOnline).length,
      availableComputes: entries.filter(
        (e) => e.computeStatus === "available",
      ).length,
    },
  };
}
