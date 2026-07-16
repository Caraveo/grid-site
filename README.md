# GRID Site

Cinematic launch site for **[GRID](https://github.com/caraveo/grid)** — useful mining for a planetary compute network.

SpaceX-inspired, fully static, download-first. Built with Next.js (static export) + Tailwind.

> Observes the GRID product/repo; **does not modify** the GRID codebase.

---

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Static production build

```bash
npm run build
# Output: out/
npx serve out
```

---

## Vercel (planned)

1. Push this repo to GitHub (e.g. `caraveo/gsite` or `caraveo/grid-site`).
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build: `npm run build` · Output: `out` (because `output: "export"`).
5. Deploy. Optional: attach a custom domain (`grid.network`, etc.).

### Env / secrets

None required for the static site. Future dynamic pieces (waitlist API, release redirects) can add serverless routes later — for now the site is pure static HTML.

### Peer mesh + globe webhook

| Endpoint | Role |
|----------|------|
| `POST /api/mesh/ping` | Webhook — location-only node pulse |
| `GET /api/mesh` | Public globe + peer list for the Nodes UI |

**Auth (production):** `Authorization: Bearer $GRID_WEBHOOK_SECRET` or header `X-Grid-Secret`.

**Body (location only — never IPs):**

```bash
curl -s -X POST http://localhost:3000/api/mesh/ping \
  -H 'content-type: application/json' \
  -H "authorization: Bearer $GRID_WEBHOOK_SECRET" \
  -d '{
    "nodeId": "node_a1b2c3d4",
    "label": "garage",
    "class": "S",
    "region": "NA-W",
    "status": "online",
    "lat": 37.7,
    "lng": -122.4
  }'
```

- Coords are **quantized ~0.5°** before storage  
- Sensitive field names are stripped if sent by mistake  
- Store: `data/mesh-store.json` (local) / memory on serverless cold starts  
- UI: cinematic globe + expanding **“I'M A NODE”** join pings  

Env: copy `.env.example` → `.env.local`.

**GRID CLI integration prompt** (paste into Grok for the GRID repo):  
[`docs/GROK_GRID_WEBHOOK_PROMPT.md`](./docs/GROK_GRID_WEBHOOK_PROMPT.md)

> Note: static `output: "export"` was removed so API routes work on Vercel.

### Releases on the Download section

macOS / Linux / Windows cards are placeholders. When GitHub Releases publish artifacts, point each card at:

```
https://github.com/caraveo/grid/releases/latest/download/<asset>
```

Or host binaries on a CDN and swap the `Download` component links.

---

## Structure

```
src/
  app/              # layout, page, global styles
  components/       # Nav, Hero, Nodes, MeshGraph, …
  lib/network.ts    # public peer types (no IPs)
public/
  network/peers.json  # genesis-maintained peer registry
```

Content is intentionally **abstract** (mission, mesh, PoR, miners, download) — product detail lives in the GRID white papers and GitHub.

---

## Content sources (read-only)

| Source | Used for |
|--------|----------|
| `GRID` README / CLI | Download / install path |
| White paper abstract | Mission language |
| `letter.md` | Miner section quote |
| Token spec | Bitcoin TSL line, PoR framing |

---

## License

Site code: MIT (match GRID software).  
GRID product docs remain under their own licenses (MIT / CC-BY-4.0).
