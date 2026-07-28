import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Proof of Resource",
  description:
    "GRID Proof-of-Resource scoring, verification, reward allocation, emission controls, and current pilot limits.",
};

export default function PorDocsPage() {
  return (
    <>
      <H1>Proof of Resource</H1>
      <Lead>
        Proof of Resource (PoR) recognizes useful, verified computational
        contribution. Hardware claims alone do not earn rewards: a node must
        complete authorized work and produce a result the settlement path accepts.
      </Lead>

      <Note>
        PoR currently governs contribution scoring and settlement allocation. It
        is not yet the mechanism that elects a permissionless block producer;
        Genesis produces pilot blocks and peers verify them.
      </Note>

      <H2 id="pipeline">Verification pipeline</H2>
      <Table
        headers={["Stage", "Input", "Accepted output"]}
        rows={[
          ["1. Contribute", "Node resource telemetry", "Available participant"],
          ["2. Execute", "Coordinator-authorized job", "Result commitment"],
          ["3. Verify", "Intent, output, timing, receipt", "Verified settlement"],
          ["4. Score", "Compute, uptime, efficiency, fidelity", "Effective PoR score"],
          ["5. Settle", "Scores and reward pool", "Replayable block allocation"],
        ]}
      />

      <H2 id="score">Implemented score</H2>
      <CodeBlock
        lang="text"
        code={`R = 0.55C + 0.15U + 0.10E + 0.20F
S = R × ρ

C  compute contribution, normalized 0…1
U  uptime / availability, normalized 0…1
E  efficiency, normalized 0…1
F  result fidelity, normalized 0…1
ρ  reputation multiplier, clamped to 0.5…1.5`}
      />
      <P>
        The current Phase 1 job-counter adapter is intentionally simple. Completed
        and failed jobs drive compute and fidelity; availability contributes uptime;
        efficiency begins from a neutral baseline. Those measurement adapters can
        mature without changing the signed allocation contract.
      </P>

      <H2 id="allocation">Allocation protections</H2>
      <Table
        headers={["Control", "Current rule", "Purpose"]}
        rows={[
          ["Proportional pool", "90% of an emission event", "Rewards effective PoR score"],
          ["Small-node inclusion", "10% reserved for class S", "Keeps home nodes first-class"],
          ["Cluster ceiling", "5% base; max(5%, 1/N)", "Limits coordinated concentration"],
          ["Reputation clamp", "0.5× to 1.5×", "History matters without replacing current work"],
          ["Duplicate protection", "One mint per accepted job ID", "Prevents replayed rewards"],
        ]}
      />
      <P>
        Cluster rewards use water-fill allocation. In a small network the effective
        ceiling expands to <code className="font-mono">1/N</code> so the pool can
        still be distributed; as independent clusters grow, the 5% base ceiling
        becomes effective.
      </P>

      <H2 id="pilot-policy">Current pilot policy</H2>
      <Ul>
        <li>
          Coordinator reward event:{" "}
          <strong className="text-foreground">100 GRID per verified pilot job</strong>.
        </li>
        <li>
          Compute emission ceiling:{" "}
          <strong className="text-foreground">25,000 GRID per hour</strong>.
        </li>
        <li>
          Accepted receipts are batched into signed GRID blocks and become visible
          in Explorer.
        </li>
        <li>
          Solana reward delivery remains a{" "}
          <strong className="text-foreground">devnet pilot</strong>; devnet assets
          have no market value.
        </li>
      </Ul>

      <Note>
        Pilot rewards are test network accounting, not guaranteed income or a
        promise of market value. Rates, eligibility, and measurement adapters can
        change before a production economic launch.
      </Note>

      <H2 id="inspect">Inspect the evidence</H2>
      <CodeBlock
        lang="bash"
        code={`grid stats

curl -fsS https://grid-compute.com/api/explorer \\
  | jq '.chain.blocks[] | {height, hash, previousHash, stateRoot, settlements, transactions}'`}
      />
      <P>
        For a visual explanation, see{" "}
        <a
          className="text-foreground underline-offset-2 hover:underline"
          href="https://grid-compute.com/por"
        >
          the Proof-of-Resource consensus page
        </a>
        .
      </P>
    </>
  );
}
