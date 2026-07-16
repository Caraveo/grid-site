# Prompt: wire GRID → GSITE mesh webhook (Phase 0 / 1)

Copy everything below the line into Grok (working in `/Users/caraveo/Desktop/Projects/GRID`).

---

## Task

Implement a **location-only** public mesh ping from the GRID Rust CLI / node so the marketing site globe can show peers.

**Do not send IPs, hostnames, ports, wallets, private keys, coordinator URLs, or any network endpoint in the webhook body.**  
Location is for a cinematic globe only. Coarse is fine.

### Target webhook (GSITE)

```
POST {GRID_SITE_URL}/api/mesh/ping
Authorization: Bearer {GRID_WEBHOOK_SECRET}
Content-Type: application/json
```

**Body (only these fields):**

```json
{
  "nodeId": "<from ~/.grid/config.toml node_id>",
  "label": "<operator name if present>",
  "class": "S",
  "region": "NA-W",
  "status": "online",
  "lat": 37.7,
  "lng": -122.4
}
```

- `class`: `S` | `M` | `L` from node config  
- `lat` / `lng`: WGS84 floats. Prefer operator-configured coords or a **manual opt-in** location in config. **Never geolocate from IP. Never reverse-DNS.**  
- Site quantizes coords (~0.5°) server-side.  
- Optional env on miner: `GRID_SITE_URL`, `GRID_WEBHOOK_SECRET`, `GRID_GLOBE_LAT`, `GRID_GLOBE_LNG`, `GRID_GLOBE_REGION`  
- If lat/lng missing → **skip ping** (no error spam). Globe is opt-in.

### When to call (Phase 0 / 1)

1. **On successful node start** (after config load) — one ping  
2. **On successful heartbeat** to coordinator — at most every **5 minutes** (debounce)  
3. Fire-and-forget: webhook failure must **not** stop mining  

### Implementation notes (GRID repo only)

- Add a small module e.g. `src/mesh_ping.rs` (or under `node/`) with `pub async fn ping_globe(...)`  
- Use existing `reqwest` client; short timeout (e.g. 3s)  
- Log at `debug`/`info` once: `globe ping ok` / `globe ping skipped (no coords)` / `globe ping failed`  
- Config extensions (toml), something like:

```toml
[node]
# existing fields…

# Optional public globe pin (coarse). Omit to disable site pings.
globe_lat = 37.7
globe_lng = -122.4
globe_region = "NA-W"

# Optional overrides (env wins if you prefer env-only)
# site_url and webhook secret better as env for secrets:
# GRID_SITE_URL=grid-site-ochre.vercel.app
# GRID_WEBHOOK_SECRET=replace-with-a-runtime-secret
```

- Default `GRID_SITE_URL` empty = feature off  
- **Never** put the webhook secret in git  
- **Never** include peer IP lists, listen addresses, or coordinator host in the payload  
- Do not change GSITE from this task — only GRID  

### Acceptance

- [ ] `grid node` with globe lat/lng + env set → site `/api/mesh` lists the peer  
- [ ] Globe on GSITE shows a join ping animation for new nodes  
- [ ] Without lat/lng, node runs normally with no crash  
- [ ] Payload has no IP/host fields  
- [ ] Unit-test or smoke: serialize body shape only (mock HTTP optional)  

### Local smoke (site running on :3000, secret unset in dev)

```bash
curl -s -X POST http://localhost:3000/api/mesh/ping \
  -H 'content-type: application/json' \
  -d '{"nodeId":"node_demo1","label":"garage","class":"S","region":"NA-W","lat":37.7,"lng":-122.4}'
```

Then open `https://grid-site-ochre.vercel.app/#nodes`.

---

Repo path: `/Users/caraveo/Desktop/Projects/GRID`  
Do not modify `/Users/caraveo/Desktop/Projects/GSITE`.
