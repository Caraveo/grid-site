import { metadataFor } from "@/lib/seo";
import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = metadataFor("/engine");

export default function EnginePage() {
  return <><div className="noise" aria-hidden /><Nav siteOrigin="https://grid-compute.com" />
    <main className="relative min-h-screen overflow-hidden px-5 pt-28 pb-20"><div className="pointer-events-none absolute inset-0 grid-bg opacity-70" />
      <section className="relative mx-auto max-w-5xl"><p className="section-label">engine.grid-compute.com</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-7xl">Protected workloads,<br />not host access.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">GRID Engine is the control plane for approved container images, encrypted job envelopes, and isolated execution on voluntary GRID capacity.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[['Official catalog','Docker Official Images enter through a reviewed, digest-pinned catalog.'],['Private promotion','Approved artifacts are mirrored to the private GRID registry before production use.'],['Runtime policy','Read-only filesystem, no host mounts, dropped capabilities, resource limits, and short-lived job workspaces.']].map(([title, body]) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"><h2 className="text-lg font-medium">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{body}</p></article>)}
        </div>
        <pre className="mt-10 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-emerald-200">grid engine doctor{`\n`}grid engine init node.yaml --name my-node{`\n`}grid start node.yaml</pre>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">The public site is the control-plane entry point. The private OCI registry is not public yet; it will require authenticated registry infrastructure and image scanning before production promotion.</p>
      </section>
    </main><Footer siteOrigin="https://grid-compute.com" /></>;
}
