# GRID Site

[![Cloudflare](https://img.shields.io/badge/platform-Cloudflare%20Workers-F38020.svg)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Version](https://img.shields.io/badge/version-0.3.4-blue.svg)](https://github.com/Caraveo/grid-site/releases)
[![Status](https://img.shields.io/badge/status-PREALPHA-red.svg)](https://github.com/Caraveo/grid-site)

Cinematic launch site for **[GRID](https://github.com/caraveo/grid)** — useful mining for a planetary compute network.

**Production:** [https://grid-compute.com](https://grid-compute.com) · **Community:** [Discord](https://discord.gg/nVs7NBCuqZ) · **Platform:** Cloudflare Workers (OpenNext)

SpaceX-inspired, download-first. Next.js App Router + Tailwind. Marketing pages are static-friendly; `/api/mesh/*` is dynamic for the public globe.

> Observes the GRID product/repo; **does not modify** the GRID codebase.

---

## Local development

```bash
npm install
cp .env.example .env.local          # optional mesh secret for local
npm run dev                         # Next.js dev server (Node)
```

Open [http://localhost:3000](http://localhost:3000).

`initOpenNextCloudflareForDev()` in `next.config.ts` wires local bindings (including simulated `MESH_KV`) into `next dev`.

## GRID CLI downloads

The site is the canonical release endpoint for the GRID CLI. The matching
macOS (Intel and Apple Silicon), Linux x86_64, and Windows x86_64 binaries live
under `/downloads/cli/` and are published with the site deployment.

```bash
# macOS and Linux x86_64
curl -fsSL https://grid-compute.com/downloads/install.sh | bash

# Windows PowerShell
irm https://grid-compute.com/downloads/install.ps1 | iex
```

The Windows installer installs the native CLI. Hosts run container workloads
through the supported WSL2 Linux/containerd path.

### Workers-accurate preview

```bash
cp .dev.vars.example .dev.vars      # secrets for workerd
npm run preview                     # OpenNext build + wrangler dev
```

---

## Cloudflare deploy

Domain: **grid-compute.com** (and `www`).

```bash
# 1) Log in once
npx wrangler login

# 2) Set production webhook secret (interactive prompt)
npx wrangler secret put GRID_WEBHOOK_SECRET

# 3) Build + deploy Worker + assets + auto-provision MESH_KV
npm run deploy
```

| Piece | Role |
|-------|------|
| `@opennextjs/cloudflare` | Next.js → Workers adapter |
| `wrangler.jsonc` | Worker name, routes, KV, vars |
| `MESH_KV` | Durable mesh peer store (auto-provisioned if `id` omitted) |
| `GRID_WEBHOOK_SECRET` | Server-side auth for compute announce writes |
| `MESH_AUTH` | Private service binding to the signed heartbeat Worker |
| Custom routes | `grid-compute.com` + `www.grid-compute.com` |

If custom-domain routes fail (zone not on this account yet), remove the `routes` array from `wrangler.jsonc`, deploy to `*.workers.dev`, then attach **grid-compute.com** in the Cloudflare dashboard (Workers → grid-site → Settings → Domains).

### Useful scripts

| Script | What |
|--------|------|
| `npm run dev` | Next.js local (fast iteration) |
| `npm run preview` | OpenNext build + local workerd |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run upload` | Build + upload version (no full deploy promote) |
| `npm run cf-typegen` | Regenerate `cloudflare-env.d.ts` |
| `npm run cf-build` | OpenNext build only |

### Env / secrets

| Name | Where | Notes |
|------|--------|--------|
| `GRID_WEBHOOK_SECRET` | `wrangler secret put` | **Required** in production |
| `AWS_MAIL_API_URL` | `wrangler secret put` | API Gateway endpoint for the private mail service |
| `AWS_MAIL_API_SECRET` | `wrangler secret put` | Shared 256-bit secret used only between GRID and the mail Lambda |
| `CONTRIBUTOR_ENCRYPTION_KEY` | `wrangler secret put` | Encrypts authenticator secrets at rest |
| `CONTRIBUTOR_IP_PEPPER` | `wrangler secret put` | Privacy-preserving rate-limit/audit hashing |

## Contributor identity and webmail

Contributor access is isolated from the legacy operator-secret dashboard:

- `/login` — email/password registration, verification, reset and TOTP login
- `/dashboard` — contributor mailbox, security and administrator approval queue
- `mail.grid-compute.com` — host-routed entry to `/dashboard/mail`
- `{username}@gridmail.dev` — logical SES mailbox activated on approval
- `CONTRIBUTOR_DB` — D1 identity, opaque sessions, approval state, quotas and audit log

The AWS mail backend lives in `aws/mail/` and uses SES, private S3, Lambda,
DynamoDB, and an HTTP API. Before first use, deploy that stack, publish the SES
DKIM and MX outputs in Cloudflare DNS, and request SES production access.
Then apply contributor migrations:

```bash
npx wrangler d1 migrations apply grid-contributors --remote
npx wrangler secret put AWS_MAIL_API_URL
npx wrangler secret put AWS_MAIL_API_SECRET
```

The first verified registration whose recovery email matches
`CONTRIBUTOR_BOOTSTRAP_ADMIN_EMAIL` becomes the administrator. Its mailbox is
activated from the Contributors screen after login. Every later contributor
requires administrator approval, which activates their SES-backed mailbox.
| `GRID_PHASE` | `wrangler.jsonc` vars | Default `1` |
| `GENESIS_*` | vars | Globe genesis pin |

Miners (GRID CLI):

```bash
# ~/.grid/env
# GRID_SITE_URL defaults to https://grid-compute.com
GRID_GLOBE_LAT=37.7
GRID_GLOBE_LNG=-122.4
GRID_GLOBE_REGION=NA-W

grid registry             # list public peers from this site
```

---

## Public mesh registry + globe webhook

**This site is the GRID public peer registry.**

| Endpoint | Role |
|----------|------|
| `GET /api/registry` | **Canonical** registry — peers + computes (CLI: `grid registry`) |
| `GET /api/registry/computes` | Compute capacity (`?available=1` for free slots only) |
| `POST /api/registry/computes` | Host announce / heartbeat (auth in prod) |
| `GET /api/mesh` | Globe peers UI |
| `POST /api/mesh/ping` | Ed25519-signed, location-only node pulse |
| `GET /registry` | Public node registration (Cash App → `$Caraveo`) |
| `GET /admin` | **Operator dashboard** (not linked in nav; secret auth) |

Compute-directory writes use `Authorization: Bearer $GRID_WEBHOOK_SECRET`
or `X-Grid-Secret`. Public globe pulses do not share an operator secret:
each node signs its own heartbeat using a dedicated Ed25519 key.

```bash
# The CLI creates ~/.grid/keys/mesh-heartbeat.key automatically.
grid init --name garage --class S
grid node
```

- Coords quantized ~0.5° before storage  
- Ed25519 signature, timestamp, nonce, replay rejection, and per-node rate limit
- Node ID derived from SHA-256(public key); no caller-selected identity
- Allowlist keys only; rejects IPs / HTML / nested junk
- **Store:** Cloudflare **KV** (`MESH_KV`) in production; `data/mesh-store.json` when KV is unavailable (local Node)  
- UI: real-Earth globe + **“I'M A NODE”** join pings; only live nodes plotted

---

## Structure

```
src/
  app/                 # layout, page, /api/mesh/*
  components/          # Nav, Hero, Nodes, NodeGlobe, …
  lib/
    mesh-store.ts      # KV + FS store, sanitization, auth
    network.ts         # public peer types
    sanitize.ts        # allowlist filters
wrangler.jsonc         # Cloudflare Worker config
open-next.config.ts    # OpenNext adapter
cloudflare-env.d.ts    # Env / binding types
public/_headers        # long-cache /_next/static
```

---

## Content sources (read-only)

| Source | Used for |
|--------|----------|
| GRID README / CLI | Download / install path |
| White paper abstract | Mission language |
| `letter.md` | Miner section quote |
| Token spec | Bitcoin TSL line, PoR framing |

---

## License

Site code: MIT (match GRID software).  
GRID product docs remain under their own licenses (MIT / CC-BY-4.0).
