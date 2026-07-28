import { CodeBlock } from "@/components/docs/CodeBlock";
import { H1, H2, Lead, Note, P, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "GRID CLI",
  description: "Install and use the GRID CLI with the public registry.",
};

export default function CliDocsPage() {
  return (
    <>
      <H1>GRID CLI</H1>
      <Lead>
        The CLI is the primary operator surface: run nodes, mine useful work,
        host computes, and talk to the public registry at grid-compute.com.
      </Lead>

      <H2 id="install">Install</H2>
      <CodeBlock
        lang="bash"
        code={`# Official signed installer
curl -fsSL https://grid-compute.com/downloads/install.sh | bash

grid --version
grid --help`}
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
        After your name is <code className="font-mono">active</code> on the
        registry, start the full local stack:
      </P>
      <CodeBlock
        lang="bash"
        code={`grid ember fire --start

# Tracks typically include:
#   host   — useful work
#   mine   — PoR security earn
#   compute — named capacity (e.g. fire)
#   registry — announce + globe ping`}
      />

      <H2 id="env">Environment</H2>
      <CodeBlock
        lang="bash"
        title="~/.grid/env"
        code={`GRID_SITE_URL=https://grid-compute.com
GRID_WEBHOOK_SECRET=…          # mesh + compute announce
GRID_GLOBE_LAT=37.7            # optional opt-in globe
GRID_GLOBE_LNG=-122.4
GRID_GLOBE_REGION=NA-W`}
      />

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

      <H2 id="common">Common commands</H2>
      <Ul>
        <li>
          <code className="font-mono">grid status</code> — local node health
        </li>
        <li>
          <code className="font-mono">grid registry</code> — public directory
        </li>
        <li>
          <code className="font-mono">grid ember &lt;name&gt; --start</code> — full realm stack
        </li>
        <li>
          <code className="font-mono">grid auth login</code> — operator identity (local vault)
        </li>
      </Ul>

      <Note>
        Binaries and releases also appear on{" "}
        <a
          className="text-foreground underline-offset-2 hover:underline"
          href="https://grid-compute.com"
        >
          grid-compute.com
        </a>{" "}
        download sections. Prefer checksums from official release channels.
      </Note>
    </>
  );
}
