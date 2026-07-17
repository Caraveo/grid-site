# Public peer registry

**Live registry (source of truth):**

| Endpoint | Role |
|----------|------|
| `GET https://grid-compute.com/api/registry` | Canonical public mesh registry |
| `GET https://grid-compute.com/api/mesh` | Same data (globe UI) |
| `POST https://grid-compute.com/api/mesh/ping` | Location-only node pulse (auth required in prod) |

GRID CLI:

```bash
grid registry                 # list peers from grid-compute.com
grid registry --json
```

Miners join by opt-in location ping (never IPs):

```bash
# ~/.grid/env
GRID_SITE_URL=https://grid-compute.com   # default if unset
GRID_WEBHOOK_SECRET=...
GRID_GLOBE_LAT=37.7
GRID_GLOBE_LNG=-122.4
```

`peers.json` in this folder is a **static seed only** (empty by default).  
The live map and CLI always use **KV-backed** `/api/registry` on Cloudflare.

Safe fields only: `id`, `label`, `class`, `region`, `status`, `lat`/`lng` (quantized), `joinedAt`, `lastSeen`.  
**Never** IPs, hostnames, ports, private keys, or wallets.
