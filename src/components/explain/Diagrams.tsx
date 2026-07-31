/** Visual diagrams for the Explain page — pure SVG, no deps. */

export function MeshPlanetDiagram() {
  const nodes = [
    { x: 80, y: 70 },
    { x: 160, y: 50 },
    { x: 240, y: 75 },
    { x: 100, y: 140 },
    { x: 180, y: 155 },
    { x: 250, y: 130 },
    { x: 140, y: 100 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 6],
    [2, 5],
    [3, 4],
    [4, 5],
    [6, 4],
    [3, 6],
    [1, 4],
  ];

  return (
    <svg
      viewBox="0 0 320 200"
      className="h-auto w-full text-foreground"
      role="img"
      aria-label="Many machines linked as one mesh"
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="100" r="90" fill="url(#glow)" />
      <circle
        cx="160"
        cy="100"
        r="72"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeDasharray="3 6"
      />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a]!.x}
          y1={nodes[a]!.y}
          x2={nodes[b]!.x}
          y2={nodes[b]!.y}
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="7" fill="currentColor" fillOpacity="0.1" />
          <circle cx={n.x} cy={n.y} r="3.5" fill="currentColor" />
        </g>
      ))}
      <text
        x="160"
        y="188"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.45"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="0.15em"
      >
        GARAGES · RACKS · DATACENTERS · ONE FABRIC
      </text>
    </svg>
  );
}

export function LayersDiagram() {
  const layers = [
    {
      y: 24,
      title: "WORK",
      sub: "Jobs · host · mine · PoR",
      className: "fill-foreground/[0.04] stroke-foreground/20",
    },
    {
      y: 78,
      title: "GRID",
      sub: "Meters compute · earn · utility",
      className: "fill-foreground/[0.07] stroke-foreground/20",
    },
    {
      y: 132,
      title: "BITCOIN",
      sub: "Transact Security Layer · final value",
      className: "fill-foreground/[0.1] stroke-foreground/20",
    },
  ];

  return (
    <svg
      viewBox="0 0 360 190"
      className="h-auto w-full text-foreground"
      role="img"
      aria-label="Three layers: work, GRID token, Bitcoin security"
    >
      {layers.map((l, i) => (
        <g key={l.title}>
          <rect
            x="24"
            y={l.y}
            width="312"
            height="44"
            rx="4"
            className={l.className}
            strokeWidth="1"
          />
          <text
            x="44"
            y={l.y + 20}
            fill="currentColor"
            fontSize="13"
            fontWeight="600"
            letterSpacing="0.2em"
            fontFamily="system-ui, sans-serif"
          >
            {l.title}
          </text>
          <text
            x="44"
            y={l.y + 36}
            fill="currentColor"
            fillOpacity="0.55"
            fontSize="11"
            fontFamily="ui-monospace, monospace"
          >
            {l.sub}
          </text>
          {i < layers.length - 1 && (
            <path
              d={`M180 ${l.y + 44} L180 ${l.y + 54}`}
              stroke="currentColor"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              markerEnd="url(#arr)"
            />
          )}
        </g>
      ))}
      <defs>
        <marker
          id="arr"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" fillOpacity="0.4" />
        </marker>
      </defs>
    </svg>
  );
}

export function FlowDiagram() {
  const steps = [
    { n: "1", t: "Launch", d: "Name a compute" },
    { n: "2", t: "Host / Mine", d: "Do real work" },
    { n: "3", t: "Verify", d: "PoR checks it" },
    { n: "4", t: "Earn", d: "Get GRID" },
    { n: "5", t: "Exit", d: "→ Bitcoin" },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-[640px] items-stretch justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div className="panel flex min-h-[100px] flex-1 flex-col items-center justify-center px-3 py-4 text-center">
              <span className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35">
                {s.n}
              </span>
              <span className="mt-2 text-sm font-semibold tracking-wide uppercase">
                {s.t}
              </span>
              <span className="mt-1 text-xs text-white/45">{s.d}</span>
            </div>
            {i < steps.length - 1 && (
              <svg
                width="20"
                height="12"
                viewBox="0 0 20 12"
                className="shrink-0 text-white/30"
                aria-hidden
              >
                <path
                  d="M0 6h16M12 1l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AddressDiagram() {
  return (
    <div className="panel overflow-hidden">
      <div className="grid sm:grid-cols-3">
        <div className="border-b border-white/10 p-6 sm:border-r sm:border-b-0">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35 uppercase">
            Realm
          </p>
          <p className="mt-4 font-mono text-2xl text-white">x</p>
          <p className="mt-2 text-xs text-white/40">or garage · home · …</p>
        </div>
        <div className="flex items-center justify-center border-b border-white/10 p-6 sm:border-r sm:border-b-0">
          <div className="text-center">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35 uppercase">
              MESH normalizes
            </p>
            <p className="mt-4 text-3xl text-white/50">→</p>
            <p className="mt-2 text-xs text-white/40">default scheme grid://</p>
          </div>
        </div>
        <div className="p-6">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-white/35 uppercase">
            Address
          </p>
          <p className="mt-4 font-mono text-lg text-white sm:text-xl">
            grid://x.grid
          </p>
          <p className="mt-2 text-xs text-white/40">
            that realm on the mesh
          </p>
        </div>
      </div>
    </div>
  );
}

export function RolesDiagram() {
  const roles = [
    {
      title: "Node",
      body: "Your machine on the fabric. You choose when it runs.",
      icon: (
        <rect
          x="8"
          y="10"
          width="24"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
    {
      title: "Realm",
      body: "A mesh address — what the web calls a domain. garage → grid://garage.grid.",
      icon: (
        <path
          d="M10 28 L20 8 L30 28 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
    {
      title: "Compute",
      body: "Capacity you host on a realm — the work unit behind the name.",
      icon: (
        <rect
          x="10"
          y="12"
          width="20"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
    {
      title: "Host",
      body: "Pull useful container jobs. Isolated. Higher earn path.",
      icon: (
        <circle
          cx="20"
          cy="20"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
    {
      title: "Mine",
      body: "Proof-of-Resource security work. Slower earn, keeps the mesh honest.",
      icon: (
        <path
          d="M10 20h20M20 10v20"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ),
    },
    {
      title: "MESH",
      body: "The browser. Type a realm. Open grid:// addresses on the mesh.",
      icon: (
        <>
          <rect
            x="6"
            y="8"
            width="28"
            height="22"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path d="M6 14h28" stroke="currentColor" strokeWidth="1.5" />
        </>
      ),
    },
    {
      title: "Realm stack",
      body: "The full stack for one realm: host + mine + compute + paid registry.",
      icon: (
        <path
          d="M20 6c4 6 8 10 8 16a8 8 0 1 1-16 0c0-6 4-10 8-16z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
    {
      title: "Registry",
      body: "Public list of peers & realms — paid activation ($5 → $Caraveo). Never raw IPs.",
      icon: (
        <path
          d="M12 10h16v20H12z M16 14h8 M16 20h8 M16 26h5"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {roles.map((r) => (
        <div key={r.title} className="panel p-6">
          <div className="flex h-10 w-10 items-center justify-center text-white/70">
            <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
              {r.icon}
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold tracking-[0.15em] uppercase">
            {r.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">{r.body}</p>
        </div>
      ))}
    </div>
  );
}

export function GridVsMeshDiagram() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="panel relative overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <p className="relative font-mono text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">
          The network
        </p>
        <h3 className="relative mt-3 text-3xl font-thin tracking-[0.2em]">
          GRID
        </h3>
        <ul className="relative mt-6 space-y-3 text-sm text-white/55">
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Planetary compute fabric
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Useful mining · real jobs
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Earn GRID · Bitcoin TSL
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            CLI: <span className="font-mono text-white/80">grid host</span> /{" "}
            <span className="font-mono text-white/80">grid mine</span>
          </li>
        </ul>
      </div>
      <div className="panel relative overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-0 hero-glow opacity-50" />
        <p className="relative font-mono text-[0.65rem] tracking-[0.25em] text-white/40 uppercase">
          The browser
        </p>
        <h3 className="relative mt-3 text-3xl font-thin tracking-[0.2em]">
          MESH
        </h3>
        <ul className="relative mt-6 space-y-3 text-sm text-white/55">
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Opens <span className="font-mono text-white/80">grid://</span> sites
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Type a realm — no https by default
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            <span className="font-mono text-white/80">x → grid://x.grid</span>
          </li>
          <li className="flex gap-3">
            <span className="text-white/30">▸</span>
            Human front door to the mesh
          </li>
        </ul>
      </div>
    </div>
  );
}
