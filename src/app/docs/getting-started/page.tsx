import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Ul } from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/getting-started");

export default function GettingStartedPage() {
  return (
    <>
      <H1>Getting started</H1>
      <Lead>
        Install the signed GRID 0.2.27 CLI, create local operator protection,
        initialize a node, join the canonical Genesis peer, and start the mining
        track against the public coordinator.
      </Lead>

      <Note>
        This is a pilot. Solana rewards use devnet, GRID balances are experimental,
        and participation does not guarantee income or market value.
      </Note>

      <H2 id="install">1. Install and verify</H2>
      <CodeBlock
        lang="bash"
        code={`curl -fsSL https://grid-compute.com/downloads/install.sh | bash

grid --version
# grid 0.2.27`}
      />

      <H2 id="identity">2. Protect keys and initialize</H2>
      <CodeBlock
        lang="bash"
        code={`# Choose one operator-key protection method
grid auth keyphrase
# Alternatives: grid auth passkey | grid auth password | grid auth combo

grid init --name garage --class S
grid status
grid resources
grid bench --duration 3`}
      />

      <H2 id="peer">3. Join P2P</H2>
      <CodeBlock
        lang="bash"
        code={`# Keep this terminal running.
# The canonical Genesis peer is included automatically.
grid peer --name garage --with-bench`}
      />
      <P>
        The peer connects to <code className="font-mono">genesis.grid-compute.com:9900</code>,
        validates signed Genesis truth, exchanges peer gossip, and verifies
        replicated chain blocks. Use <code className="font-mono">--connect</code>{" "}
        only to add another known peer.
      </P>

      <H2 id="mine">4. Configure devnet rewards and mine</H2>
      <CodeBlock
        lang="bash"
        code={`# Optional: create once. Existing keys are never overwritten.
grid solana create
grid solana status

# In a second terminal
grid mine

# Inspect coordinator totals and reward status
grid stats`}
      />
      <P>
        <code className="font-mono">grid mine</code> polls the public coordinator,
        executes mine-track work, submits a result commitment, and receives credit
        only after verification. The coordinator retries when no work is available
        or an upstream is temporarily unreachable.
      </P>

      <H2 id="realm-stack">5. Optional: claim and run a realm stack</H2>
      <Ul>
        <li>Claim a local realm identity with <code className="font-mono">grid claim garage</code>.</li>
        <li>Activate the public registry name if it should be listed.</li>
        <li>Run <code className="font-mono">grid ember garage --start</code> for host + mine + compute + registry.</li>
      </Ul>

      <P>
        Dive deeper:{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/cli">
          complete CLI reference
        </Link>{" "}
        or{" "}
        <Link className="text-foreground underline-offset-2 hover:underline" href="/docs/por">
          Proof of Resource
        </Link>
        .
      </P>
    </>
  );
}
