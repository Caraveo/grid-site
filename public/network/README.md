# Public peer registry

`peers.json` is the **only** data source for the site’s Nodes map.

- You are **genesis** for Phase 0 / 1 — you track peers offline and publish safe fields here.
- **Never** commit IPs, hostnames, ports, private keys, or wallets.
- Safe fields only: `id`, `label`, `class`, `region`, `status`, `joinedAt`, `lastSeen`.

The site fetches `/network/peers.json` every 30 seconds (client-side).
