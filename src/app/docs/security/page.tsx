import { H1, H2, Lead, Note, P, Table, Ul } from "@/components/docs/DocsChrome";

export const metadata = {
  title: "Data & safety",
  description:
    "What the GRID public API exposes and what it will never return.",
};

export default function SecurityDocsPage() {
  return (
    <>
      <H1>Data & safety</H1>
      <Lead>
        The public API is a deliberate subset of network truth. Anything that
        could harm operators, users, or the integrity of the security layer is
        kept off this surface.
      </Lead>

      <H2 id="public">Always public (safe)</H2>
      <Ul>
        <li>Activated names and their kinds (node / compute)</li>
        <li>Capacity ads: free slots, status, image labels, class, region</li>
        <li>Coarse globe coordinates (opt-in)</li>
        <li>Public identity badges and cert payloads meant for verification</li>
        <li>Registry CA <em>public</em> key</li>
        <li>Cash App cashtag used for activation fees</li>
      </Ul>

      <H2 id="never">Never public</H2>
      <Table
        headers={["Data", "Why"]}
        rows={[
          ["IPv4/IPv6, ports, hostnames", "Enables scanning, DDoS, and doxxing"],
          ["Cloudflare tunnel / reverse-proxy URLs", "Bypasses operator intent"],
          ["Operator private keys / vault DEKs", "Full account takeover"],
          ["CA private seed", "Forge network certificates"],
          ["Webhook secrets", "Spam mesh + fake capacity"],
          ["Raw MAC / forensic dumps", "Compliance-sensitive; not a public signal"],
          ["Bitcoin wallet mnemonics or WIF", "Theft of funds"],
          ["Unreviewed registration PII", "Abuse and spam targeting"],
        ]}
      />

      <H2 id="client">Client responsibilities</H2>
      <Ul>
        <li>Pin HTTPS to grid-compute.com (or document mirrors carefully)</li>
        <li>Treat registry JSON as untrusted input — validate types/ranges</li>
        <li>Do not log webhook secrets</li>
        <li>Show humans <code className="font-mono">grid://name.grid</code>, not internal locators</li>
        <li>Rate-limit your own pollers; the network is shared</li>
      </Ul>

      <H2 id="integrity">Integrity tips</H2>
      <P>
        When a realm presents a permanent cert, verify the signature against{" "}
        <code className="font-mono">GET /api/registry/entity?ca=1</code>. If
        verification fails, ignore the badge. Revoked or inactive statuses must
        clear any elevated trust UI.
      </P>

      <Note>
        If you believe you found a data leak in a public endpoint (IP, key
        material, etc.), stop using the field and report responsibly via the
        project GitHub security contacts. Do not weaponize it.
      </Note>
    </>
  );
}
