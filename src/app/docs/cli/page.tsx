import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "GRID CLI",
  description:
    "Install GRID 0.2.20 and operate peers, mining, useful compute, wallets, and the public registry.",
};

export default function CliDocsPage() {
  return (
    <>
      <H1>GRID CLI</H1>
      <Lead>
        GRID 0.2.20 is the primary operator surface: join the P2P fabric, mine
        verified work, host computes, inspect resources, manage wallets, and talk
        to the public registry.
      </Lead>

      <H2 id="install">Install</H2>
      <CodeBlock
        lang="bash"
        code={`# Official signed installer
curl -fsSL https://grid-compute.com/downloads/install.sh | bash

grid --version
grid --help

# Current expected release:
# grid 0.2.20`}
      />

      <H2 id="init">Initialize operator state</H2>
      <CodeBlock
        lang="bash"
        code={`# Choose one key-protection method
grid auth keyphrase
# or: grid auth passkey | password | combo

grid init --name garage --class S
grid status`}
      />
      <P>
        State defaults to <code className="font-mono">~/.grid</code>. Override it
        with <code className="font-mono">--config-dir</code> or{" "}
        <code className="font-mono">GRID_CONFIG_DIR</code> when running isolated
        test nodes.
      </P>

      <H2 id="peer">Join P2P</H2>
      <CodeBlock
        lang="bash"
        code={`# Canonical Genesis is included automatically
grid peer --name garage --with-bench

# Optional explicit peer
grid peer --name garage --connect peer.example:9900`}
      />

      <H2 id="mine">Mine and host</H2>
      <CodeBlock
        lang="bash"
        code={`# Mine-track Proof-of-Resource work
grid mine

# Host-track useful container work
grid host

# Run encrypted P2P + host + mine together
grid node
# alias:
grid start

# Coordinator and reward totals
grid stats`}
      />
      <P>
        These commands default to{" "}
        <code className="font-mono">https://coordinator.grid-compute.com</code>.
        A node is credited only after the coordinator verifies its result and
        creates a settlement receipt.
      </P>

      <Note>
        <code className="font-mono">grid node</code> is the all-in-one command:
        encrypted P2P replication + host + mine. Use{" "}
        <code className="font-mono">grid peer</code> instead when you want to
        verify and replicate the blockchain without mining.
      </Note>

      <H2 id="resources">Resources and benchmark</H2>
      <CodeBlock
        lang="bash"
        code={`grid resources
grid bench --duration 3
grid bench --duration 3 --json
grid status`}
      />

      <H2 id="wallets">Wallet commands</H2>
      <CodeBlock
        lang="bash"
        code={`# Native GRID chain wallet
grid wallet init
grid wallet status
grid wallet receive
grid wallet claim
grid wallet history --limit 20

# Solana devnet reward wallet
grid solana create
grid solana status
grid solana import YOUR_EXISTING_ADDRESS`}
      />

      <H2 id="registry">Talk to the registry</H2>
      <CodeBlock
        lang="bash"
        code={`# Pull public directory (uses https://grid-compute.com by default)
grid registry

# Override if needed
GRID_SITE_URL=https://grid-compute.com grid registry`}
      />

      <H2 id="ember">Run an ember</H2>
      <P>
        After claiming a realm and activating its public registry name, start the
        full realm stack:
      </P>
      <CodeBlock
        lang="bash"
        code={`grid ember fire --start

# Tracks typically include:
#   host   — useful work
#   mine   — verified PoR work
#   compute — named capacity (e.g. fire)
#   registry — announce + globe ping`}
      />

      <H2 id="env">Environment</H2>
      <CodeBlock
        lang="bash"
        title="~/.grid/env"
        code={`GRID_COORDINATOR=https://coordinator.grid-compute.com
GRID_REGISTRY_URL=https://grid-compute.com
GRID_GENESIS=https://genesis.grid-compute.com
GRID_SITE_URL=https://grid-compute.com
GRID_GLOBE_LAT=37.7            # optional opt-in globe
GRID_GLOBE_LNG=-122.4
GRID_GLOBE_REGION=NA-W`}
      />
      <P>
        Public globe heartbeats do not use a shared secret. The CLI creates a
        dedicated Ed25519 key under <code className="font-mono">~/.grid/keys</code>{" "}
        and signs each pulse automatically.
      </P>

      <H2 id="mainnet">Check the production gate</H2>
      <CodeBlock
        lang="bash"
        code={`grid mainnet
grid mainnet --json
grid mainnet --migrate-storage`}
      />
      <P>
        This is intentionally fail-closed. A valid replicated chain is not enough:
        decentralized mainnet requires enforced quorum certificates, at least four
        independent validators, treasury consensus state, append-only indexed block
        storage with tested backups, and an external audit.
      </P>

      <H2 id="config">Node config sketch</H2>
      <CodeBlock
        lang="toml"
        title="~/.grid/config.toml"
        code={`[node]
name = "MacNode"
node_id = "node_macmini"
class = "S"
region = "NA-W"
globe_lat = 37.7
globe_lng = -122.4
globe_region = "NA-W"`}
      />

      <H2 id="common">Command map</H2>
      <Ul>
        <li>
          <code className="font-mono">grid status</code> — local node health
        </li>
        <li>
          <code className="font-mono">grid mainnet</code> — decentralized launch gate
        </li>
        <li>
          <code className="font-mono">grid registry</code> — public directory
        </li>
        <li>
          <code className="font-mono">grid peer</code> — P2P replication and peer gossip
        </li>
        <li>
          <code className="font-mono">grid mine</code> — mine-track verified work
        </li>
        <li>
          <code className="font-mono">grid stats</code> — coordinator and reward totals
        </li>
        <li>
          <code className="font-mono">grid ember &lt;name&gt; --start</code> — full realm stack
        </li>
        <li>
          <code className="font-mono">grid auth login</code> — operator identity (local vault)
        </li>
      </Ul>

      <Note>
        Official binaries also appear on{" "}
        <a
          className="text-foreground underline-offset-2 hover:underline"
          href="https://grid-compute.com"
        >
          grid-compute.com
        </a>{" "}
        download sections. Verify the signed manifest and SHA-256 checksum before
        running a download.
      </Note>
    </>
  );
}
