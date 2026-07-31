import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/quick");

const Code = ({ children }: { children: string }) => (
  <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-black p-5 text-sm leading-7 text-white"><code>{children}</code></pre>
);

export default function QuickPage() {
  return <main className="min-h-screen bg-background"><Nav />
    <section className="px-5 pb-24 pt-36 sm:pt-44"><div className="mx-auto max-w-5xl">
      <p className="section-label">GRID Genesis Pilot</p>
      <h1 className="section-title mt-5 max-w-4xl">Mine GRID. Verify the chain. Support the network.</h1>
      <p className="section-body mt-6 max-w-3xl">The fastest path is <code className="font-mono text-foreground">grid mine</code>: it is a P2P block replica plus a proof-of-resource miner. It does not host web services or game servers.</p>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <article className="panel p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-wider text-muted">1 · Install and identify</p>
          <Code>{`curl -fsSL https://grid-compute.com/downloads/install.sh | bash
grid init --name my-node --class S
grid auth keyphrase`}</Code>
          <p className="mt-4 text-sm leading-relaxed text-muted">Keep the recovery phrase offline. Your node identity and encrypted P2P key stay on your device.</p>
        </article>
        <article className="panel p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-wider text-muted">2 · Mine + verify</p>
          <Code>{`grid mine`}</Code>
          <p className="mt-4 text-sm leading-relaxed text-muted">Connects to Genesis, synchronizes and verifies signed blocks, then polls for capped proof-of-resource work. It never starts a host container.</p>
        </article>
        <article className="panel p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-wider text-muted">3 · Optional devnet reward wallet</p>
          <Code>{`grid solana create
grid solana status`}</Code>
          <p className="mt-4 text-sm leading-relaxed text-muted">This creates a local Solana devnet reward wallet. Pilot rewards require verified work; uptime alone does not mint GRID.</p>
        </article>
        <article className="panel p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-wider text-muted">Support without mining</p>
          <Code>{`grid peer --with-bench`}</Code>
          <p className="mt-4 text-sm leading-relaxed text-muted">Run an encrypted P2P replica that syncs and verifies the chain, with no proof-of-resource work and no reward expectation.</p>
        </article>
      </div>

      <section className="mt-14 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 sm:p-8"><p className="font-mono text-xs uppercase tracking-wider text-emerald-300">Help the mesh</p>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">For inbound peers, forward TCP <code className="font-mono text-foreground">9900</code> to your machine. Outbound-only mining still works, but an open port makes the mesh more resilient. The public globe is optional and publishes only coarse location—not your IP, port, wallet, or coordinator URL.</p>
      </section>

      <section className="mt-14"><p className="section-label">What comes next</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">P2P container hosting, in stages.</h2>
        <ol className="mt-6 grid gap-4 text-sm leading-relaxed text-muted md:grid-cols-3"><li className="panel p-5"><span className="text-foreground">01 · Runtime</span><br />Engine installs containerd, nerdctl, and the encrypted-volume backend.</li><li className="panel p-5"><span className="text-foreground">02 · Protected storage</span><br />Each service gets a unique vault-wrapped volume key; containers never receive vault access.</li><li className="panel p-5"><span className="text-foreground">03 · Approved services</span><br />First template: Git-backed Caddy, exposed through a GRID tunnel rather than a direct host port.</li></ol>
        <p className="mt-6 text-sm text-muted">This is still a Genesis-led pilot—not decentralized mainnet consensus. <Link href="/explorer" className="text-emerald-300 hover:text-emerald-200">Inspect the network →</Link></p>
      </section>
    </div></section><Footer />
  </main>;
}
