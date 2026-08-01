import type { Metadata } from "next";
import { metadataFor } from "@/lib/seo";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  H1,
  H2,
  Lead,
  Note,
  P,
  Table,
  Ul,
} from "@/components/docs/DocsChrome";

export const metadata: Metadata = metadataFor("/docs/earn");

export default function EarnDocsPage() {
  return (
    <>
      <H1>Mining, rewards & use cases</H1>
      <Lead>
        GRID mining means completing coordinator-authorized work and passing
        verification. A running process or an advertised GPU is not enough: the
        result must become an accepted receipt before the reward can enter a signed
        settlement block.
      </Lead>

      <Note>
        The current rewards are pilot accounting. Solana delivery uses devnet.
        Nothing here guarantees income, market value, liquidity, or an exchange
        listing.
      </Note>

      <H2 id="tracks">Operator tracks</H2>
      <Table
        headers={["Track", "Command", "What is verified"]}
        rows={[
          [
            "Mine (PoR)",
            "grid mine",
            "Mine-track intent, execution result, and commitment",
          ],
          [
            "Host",
            "grid host",
            "Authorized useful container job and output",
          ],
          [
            "Node",
            "grid node",
            "Host and mine tracks in one process",
          ],
          [
            "Phoenix",
            "grid ember NAME --start",
            "Host, mine, named compute, and registry presence",
          ],
        ]}
      />

      <H2 id="flow">Verified reward flow</H2>
      <CodeBlock
        lang="text"
        code={`claim job
  → execute authorized payload
  → submit result commitment
  → coordinator verification
  → settlement receipt
  → deterministic PoR allocation
  → Genesis-signed block
  → peer verification
  → wallet / devnet reward status`}
      />

      <H2 id="policy">Current pilot policy</H2>
      <Table
        headers={["Control", "Current value", "Meaning"]}
        rows={[
          [
            "Verified job event",
            "100 GRID",
            "Issued only after accepted pilot work",
          ],
          [
            "Hourly compute cap",
            "25,000 GRID",
            "Hard pilot emission ceiling",
          ],
          [
            "Proportional pool",
            "90%",
            "Allocated by effective PoR score",
          ],
          [
            "Class-S inclusion pool",
            "10%",
            "Reserved for qualifying small nodes",
          ],
          [
            "Base cluster ceiling",
            "5%",
            "Limits concentration as independent clusters grow",
          ],
        ]}
      />

      <H2 id="start">Start mining</H2>
      <CodeBlock
        lang="bash"
        code={`grid auth keyphrase
grid init --name garage --class S

# Optional devnet reward address
grid solana create

# Run continuously
grid mine

# Inspect public totals
grid stats`}
      />
      <P>
        Mining can be idle when no eligible work is queued. A temporary coordinator
        failure causes retries; it does not create a reward. Use Explorer to confirm
        that accepted receipts have reached a signed block.
      </P>

      <H2 id="builder">Builder use cases</H2>
      <Table
        headers={["Idea", "Public surface", "Pilot boundary"]}
        rows={[
          ["Capacity dashboard", "Registry + computes APIs", "Discovery only; no public host endpoint"],
          ["Network monitor", "Explorer + mesh APIs", "Health and coarse presence"],
          ["Useful job launcher", "Coordinator protocol", "Authorized pilot job types"],
          ["Mesh experience", "grid:// realm + registry", "Requires claimed and active realm"],
          ["Wallet dashboard", "Phoenix / CLI", "Pilot chain and Solana devnet"],
        ]}
      />

      <H2 id="what-not">What not to build</H2>
      <Ul>
        <li>Scrapers that try to recover IPs from the globe (coords are coarse by design)</li>
        <li>Clients that demand private keys to “verify” a name</li>
        <li>Interfaces that label devnet balances as cash or guaranteed earnings</li>
        <li>Services that re-publish webhook secrets to browsers</li>
        <li>Fake registries that impersonate grid-compute.com without TLS identity</li>
      </Ul>
    </>
  );
}
