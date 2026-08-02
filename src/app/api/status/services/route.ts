export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceState = "live" | "affected" | "building" | "down" | "unavailable";

type ServiceDefinition = {
  id: string;
  name: string;
  description: string;
  category: "Network" | "Public" | "Apps" | "Markets";
  href?: string;
  checkUrl?: string;
  fixedState?: Extract<ServiceState, "building" | "unavailable">;
  fixedDetail?: string;
  interpreter?: "genesis" | "coordinator" | "gex-trading" | "gex-withdrawals";
};

type ServiceResult = Omit<
  ServiceDefinition,
  "checkUrl" | "fixedState" | "fixedDetail" | "interpreter"
> & {
  state: ServiceState;
  detail: string;
  latencyMs: number | null;
  endpoint: string | null;
  checkedAt: string;
};

const services: ServiceDefinition[] = [
  {
    id: "genesis",
    name: "Genesis",
    description: "Canonical signed-chain and policy authority.",
    category: "Network",
    href: "https://genesis.grid-compute.com/health",
    checkUrl: "https://genesis.grid-compute.com/health",
    interpreter: "genesis",
  },
  {
    id: "coordinator",
    name: "Coordinator",
    description: "Proof-of-Resource work and pilot settlement.",
    category: "Network",
    href: "https://coordinator.grid-compute.com/v1/status",
    checkUrl: "https://coordinator.grid-compute.com/v1/status",
    interpreter: "coordinator",
  },
  {
    id: "registry",
    name: "Public Registry",
    description: "Names, entities, peers, and compute records.",
    category: "Network",
    href: "https://grid-compute.com/registry",
    checkUrl: "https://grid-compute.com/api/registry",
  },
  {
    id: "mesh-api",
    name: "Node Mesh",
    description: "Privacy-rounded public peer telemetry.",
    category: "Network",
    href: "https://grid-compute.com/mesh",
    checkUrl: "https://grid-compute.com/api/mesh",
  },
  {
    id: "explorer-api",
    name: "Explorer API",
    description: "Aggregated chain, coordinator, and mesh data.",
    category: "Network",
    href: "https://explorer.grid-compute.com",
    checkUrl: "https://grid-compute.com/api/explorer",
  },
  {
    id: "website",
    name: "GRID Website",
    description: "Primary public product and network surface.",
    category: "Public",
    href: "https://grid-compute.com",
    checkUrl: "https://grid-compute.com/",
  },
  {
    id: "explorer",
    name: "Explorer",
    description: "Public network and signed-chain explorer.",
    category: "Public",
    href: "https://explorer.grid-compute.com",
    checkUrl: "https://explorer.grid-compute.com/",
  },
  {
    id: "docs",
    name: "Documentation",
    description: "Operator, API, wallet, and protocol guides.",
    category: "Public",
    href: "https://docs.grid-compute.com",
    checkUrl: "https://docs.grid-compute.com/",
  },
  {
    id: "shop",
    name: "GRID Shop",
    description: "Public GRID merchandise storefront.",
    category: "Public",
    href: "https://grid-compute.com/shop",
    checkUrl: "https://grid-compute.com/shop",
  },
  {
    id: "school",
    name: "GRID School",
    description: "Guided lessons and knowledge checks.",
    category: "Public",
    href: "https://grid-compute.com/school",
    checkUrl: "https://grid-compute.com/school",
  },
  {
    id: "login",
    name: "Contributor Sign-In",
    description: "Contributor identity and secure access.",
    category: "Public",
    href: "https://grid-compute.com/login",
    checkUrl: "https://grid-compute.com/login",
  },
  {
    id: "mail",
    name: "GRID Mail",
    description: "Contributor mailbox entry point.",
    category: "Public",
    href: "https://mail.grid-compute.com",
    checkUrl: "https://mail.grid-compute.com/",
  },
  {
    id: "downloads",
    name: "Release Downloads",
    description: "Cross-platform CLI installer distribution.",
    category: "Public",
    href: "https://grid-compute.com/quick",
    checkUrl: "https://grid-compute.com/downloads/install.sh",
  },
  {
    id: "mesh-app",
    name: "MESH",
    description: "GRID browser downloads and product surface.",
    category: "Apps",
    href: "https://grid-compute.com/mesh",
    checkUrl: "https://grid-compute.com/mesh",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    description: "Native GRID wallet downloads and information.",
    category: "Apps",
    href: "https://grid-compute.com/phoenix",
    checkUrl: "https://grid-compute.com/phoenix",
  },
  {
    id: "engine",
    name: "GRID Engine",
    description: "Private workload-hosting product surface.",
    category: "Apps",
    href: "https://engine.grid-compute.com",
    checkUrl: "https://engine.grid-compute.com/",
  },
  {
    id: "ark",
    name: "ARK",
    description: "ARK wallet service domain.",
    category: "Apps",
    href: "https://ark.grid-compute.com",
    checkUrl: "https://ark.grid-compute.com/",
  },
  {
    id: "gex-terminal",
    name: "GEX Terminal",
    description: "GRID Exchange public trading interface.",
    category: "Markets",
    href: "https://exchange.grid-compute.com",
    checkUrl: "https://exchange.grid-compute.com/",
  },
  {
    id: "gex-trading",
    name: "GEX Trading",
    description: "Exchange order submission and matching.",
    category: "Markets",
    href: "https://exchange.grid-compute.com",
    checkUrl: "https://exchange.grid-compute.com/api/status",
    interpreter: "gex-trading",
  },
  {
    id: "gex-withdrawals",
    name: "GEX Withdrawals",
    description: "Controlled exchange asset withdrawals.",
    category: "Markets",
    href: "https://exchange.grid-compute.com",
    checkUrl: "https://exchange.grid-compute.com/api/status",
    interpreter: "gex-withdrawals",
  },
  {
    id: "solana-rewards",
    name: "Solana Rewards",
    description: "Devnet-only GRID reward settlement pilot.",
    category: "Markets",
    fixedState: "building",
    fixedDetail: "Devnet pilot; not a mainnet value service.",
  },
  {
    id: "swipe",
    name: "Swipe",
    description: "Exchange → GRID Exchange → exchange clearing.",
    category: "Markets",
    fixedState: "building",
    fixedDetail: "Protocol and clearing implementation in design.",
  },
  {
    id: "mainnet-settlement",
    name: "Mainnet Settlement",
    description: "Audited real-value issuance and settlement.",
    category: "Markets",
    fixedState: "unavailable",
    fixedDetail: "No public production service is available.",
  },
];

function endpointLabel(url?: string) {
  if (!url) return null;
  const parsed = new URL(url);
  return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
}

function liveState(latencyMs: number): Pick<ServiceResult, "state" | "detail"> {
  if (latencyMs >= 1_500) {
    return { state: "affected", detail: "Reachable, but response time is elevated." };
  }
  return { state: "live", detail: "Public check completed successfully." };
}

async function checkService(service: ServiceDefinition): Promise<ServiceResult> {
  const checkedAt = new Date().toISOString();

  if (service.fixedState) {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      href: service.href,
      state: service.fixedState,
      detail: service.fixedDetail ?? "No automated public check is available.",
      latencyMs: null,
      endpoint: null,
      checkedAt,
    };
  }

  const started = Date.now();
  try {
    const response = await fetch(service.checkUrl!, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(4_000),
      headers: {
        accept: service.interpreter ? "application/json" : "*/*",
        "user-agent": "GRID-Service-Status/1.0",
      },
    });
    const latencyMs = Date.now() - started;

    if (!response.ok) {
      await response.body?.cancel();
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        href: service.href,
        state: response.status === 429 ? "affected" : "down",
        detail:
          response.status === 429
            ? "Reachable, but currently rate limited."
            : `Public check returned HTTP ${response.status}.`,
        latencyMs,
        endpoint: endpointLabel(service.checkUrl),
        checkedAt,
      };
    }

    if (service.interpreter) {
      const payload = (await response.json()) as Record<string, unknown>;
      if (service.interpreter === "genesis" && payload.ok === false) {
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          href: service.href,
          state: "affected",
          detail: "Genesis responded but reported an unhealthy state.",
          latencyMs,
          endpoint: endpointLabel(service.checkUrl),
          checkedAt,
        };
      }
      if (service.interpreter === "coordinator" && payload.paused === true) {
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          href: service.href,
          state: "affected",
          detail: "Coordinator is reachable but settlement is paused.",
          latencyMs,
          endpoint: endpointLabel(service.checkUrl),
          checkedAt,
        };
      }
      if (service.interpreter === "gex-trading" && payload.live !== true) {
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          href: service.href,
          state: "building",
          detail: "Terminal is reachable; live order submission remains locked.",
          latencyMs,
          endpoint: endpointLabel(service.checkUrl),
          checkedAt,
        };
      }
      if (
        service.interpreter === "gex-withdrawals" &&
        payload.withdrawalsEnabled !== true
      ) {
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          category: service.category,
          href: service.href,
          state: "building",
          detail: "Exchange is reachable; withdrawals remain locked.",
          latencyMs,
          endpoint: endpointLabel(service.checkUrl),
          checkedAt,
        };
      }
    } else {
      await response.body?.cancel();
    }

    const result = liveState(latencyMs);
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      href: service.href,
      ...result,
      latencyMs,
      endpoint: endpointLabel(service.checkUrl),
      checkedAt,
    };
  } catch {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      href: service.href,
      state: "down",
      detail: "Public check timed out or could not connect.",
      latencyMs: Date.now() - started,
      endpoint: endpointLabel(service.checkUrl),
      checkedAt,
    };
  }
}

export async function GET() {
  const results = await Promise.all(services.map(checkService));
  const counts = results.reduce<Record<ServiceState, number>>(
    (summary, service) => {
      summary[service.state] += 1;
      return summary;
    },
    { live: 0, affected: 0, building: 0, down: 0, unavailable: 0 },
  );

  return Response.json(
    {
      checkedAt: new Date().toISOString(),
      counts,
      services: results,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=30",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
