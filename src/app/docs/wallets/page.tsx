import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Phoenix — GRID Wallet",
  description:
    "Use Phoenix and the GRID CLI to manage GRID addresses and Solana devnet reward wallets safely.",
};

export default function WalletsDocsPage() {
  return (
    <>
      <H1>Phoenix — GRID Wallet</H1>
      <Lead>
        Phoenix is the native desktop wallet for the GRID pilot. It manages GRID
        addresses and a separate Solana reward address, defaults to the public
        Genesis network, and can be switched to local or custom nodes in settings.
      </Lead>

      <Note>
        GRID and Solana addresses are different systems. A{" "}
        <code className="font-mono">grid0…</code> address receives native GRID
        chain activity. A base58 Solana address receives the current devnet token
        reward pilot.
      </Note>

      <H2 id="downloads">Official desktop wallet v0.2.24 builds</H2>
      <Table
        headers={["Platform", "Format", "Release"]}
        rows={[
          ["macOS Apple silicon", "ARK or Phoenix · native package", "v0.2.24"],
          ["macOS Intel", "ARK universal or Phoenix · native package", "v0.2.24"],
          ["Windows x86_64", "ARK or Phoenix · EXE/MSI", "v0.2.24"],
          ["Linux x86_64", "ARK or Phoenix · AppImage/Debian", "v0.2.24"],
          ["iOS / Android", "Not released", "Coming soon"],
        ]}
      />
      <P>
        Download from{" "}
        <a
          className="text-foreground underline-offset-2 hover:underline"
          href="https://grid-compute.com/phoenix"
        >
          grid-compute.com/phoenix
        </a>
        . If the site cannot identify the operating system, it links to the
        platform chooser. Verify installers against the release SHA256SUMS file.
      </P>

      <H2 id="grid-wallet">Native GRID wallet CLI</H2>
      <CodeBlock
        lang="bash"
        code={`grid wallet init
grid wallet status
grid wallet address
grid wallet receive
grid wallet claim
grid wallet history --limit 20

# Create a signed transfer file
grid wallet send grid0DESTINATION 25 --memo "example"`}
      />
      <P>
        Wallet key material is local; balances and accepted transactions belong to
        the chain. Receive views expose the complete address and a QR code in the
        desktop interface.
      </P>

      <H2 id="solana">Solana devnet reward wallet</H2>
      <CodeBlock
        lang="bash"
        code={`# Create a new local keypair once
grid solana create

# Show address, balance, and devnet Explorer link
grid solana status

# Or configure an existing public address without importing its private key
grid solana import YOUR_SOLANA_ADDRESS`}
      />
      <P>
        A locally created reward key is stored at{" "}
        <code className="font-mono">~/.grid/keys/solana-reward.json</code>. The CLI
        refuses to overwrite an existing file. That refusal protects the current
        key; use <code className="font-mono">grid solana status</code> rather than
        trying to create it again.
      </P>

      <H2 id="protection">Protect and recover keys</H2>
      <Ul>
        <li>Record the recovery phrase offline when the wallet creates it.</li>
        <li>Never paste a phrase, password, or private key into the website.</li>
        <li>Back up wallet files before changing machines or reinstalling.</li>
        <li>Use the wallet&apos;s password/passkey protection on shared computers.</li>
        <li>Verify the complete destination address before sending.</li>
        <li>Test custom or local node settings with non-valuable pilot balances first.</li>
      </Ul>

      <H2 id="network">Network settings</H2>
      <Table
        headers={["Mode", "Use"]}
        rows={[
          ["Genesis", "Default public GRID pilot network"],
          ["Local", "A node on the same machine for development"],
          ["Custom", "An operator-supplied endpoint with its own trust boundary"],
        ]}
      />

      <Note>
        Solana devnet tokens and GRID pilot balances are test assets with no
        guaranteed economic value. No exchange listing or mainnet custody claim is
        implied by the wallet.
      </Note>
    </>
  );
}
