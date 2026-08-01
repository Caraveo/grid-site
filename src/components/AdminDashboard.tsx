"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

type RegStatus =
  | "pending_payment"
  | "pending_review"
  | "active"
  | "rejected";

type Registration = {
  id: string;
  name: string;
  nodeId: string;
  label: string;
  class: string;
  region: string;
  kinds?: string[];
  status: RegStatus;
  feeUsd: number;
  paymentNote: string;
  cashConfirm?: string;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  pending_payment: number;
  pending_review: number;
  active: number;
  rejected: number;
};

type Tab =
  | "names"
  | "orders"
  | "tickets"
  | "compliance"
  | "entity"
  | "reserved";

type ShopOrderRow = {
  id: string;
  productId: string;
  productTitle: string;
  productNumber: string;
  size: string;
  email: string;
  name?: string;
  phone?: string;
  shipping?: string;
  feeUsd: number;
  paymentNote: string;
  paymentMethod?: string;
  cashConfirm?: string;
  btcTxid?: string;
  tracked: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

type OrderStats = {
  total: number;
  payment_submitted: number;
  fulfilled: number;
  cancelled: number;
  pending_payment: number;
};

type Otg27OrderRow = {
  id: string;
  ticketId: string;
  ticketName: string;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
  name: string;
  email: string;
  organization?: string;
  paymentNote: string;
  paymentMethod?: string;
  paymentReference?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Otg27Stats = {
  total: number;
  payment_submitted: number;
  confirmed: number;
  cancelled: number;
  pending_payment: number;
  attendees: number;
  revenueUsd: number;
};

type ReservedTerm = {
  term: string;
  title: string;
  brand?: string;
  note?: string;
  source: "system" | "brand" | "admin";
  createdAt: string;
  updatedAt: string;
};

type ReservedStats = {
  total: number;
  system: number;
  brand: number;
  admin: number;
};

type ComplianceRow = {
  id: string;
  gpId: string;
  realm: string;
  gridUrl: string;
  nodeId: string;
  machineRef: string;
  consentVersion: string;
  collectedAt: string;
  updatedAt: string;
  ip?: string;
  mac?: string;
};

type EntityApp = {
  id: string;
  tier: string;
  realm: string;
  gpId: string;
  status: string;
  feeUsd: number;
  paymentNote: string;
  cashConfirm?: string;
  entityName?: string;
  updatedAt: string;
};

export function AdminDashboard() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("names");
  const [cmpRows, setCmpRows] = useState<ComplianceRow[]>([]);
  const [cmpTotal, setCmpTotal] = useState(0);
  const [cmpPage, setCmpPage] = useState(1);
  const [cmpDecrypted, setCmpDecrypted] = useState(false);
  const [stepupSecret, setStepupSecret] = useState("");
  const [entityRows, setEntityRows] = useState<EntityApp[]>([]);
  const [entityStats, setEntityStats] = useState<Record<string, number> | null>(
    null,
  );
  const [reservedRows, setReservedRows] = useState<ReservedTerm[]>([]);
  const [reservedStats, setReservedStats] = useState<ReservedStats | null>(
    null,
  );
  const [reservedFilter, setReservedFilter] = useState<string>("");
  const [newTerm, setNewTerm] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newNote, setNewNote] = useState("");
  const [orderRows, setOrderRows] = useState<ShopOrderRow[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("");
  const [ticketRows, setTicketRows] = useState<Otg27OrderRow[]>([]);
  const [ticketStats, setTicketStats] = useState<Otg27Stats | null>(null);
  const [ticketFilter, setTicketFilter] = useState<string>("");

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      setConfigured(data.configured !== false);
      setAuthed(!!data.authenticated);
      return !!data.authenticated;
    } catch {
      setConfigured(null);
      setAuthed(false);
      return false;
    }
  }, []);

  const loadRegs = useCallback(async () => {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    const res = await fetch(`/api/admin/registrations${q}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Failed to load");
      return;
    }
    setStats(data.stats);
    setRows(data.registrations ?? []);
    setError(null);
  }, [filter]);

  const loadCompliance = useCallback(
    async (decrypt: boolean) => {
      const q = new URLSearchParams({
        page: String(cmpPage),
        pageSize: "25",
      });
      if (decrypt) q.set("decrypt", "1");
      const res = await fetch(`/api/admin/compliance?${q}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (res.status === 403 || data.needStepup) {
        setError(data.error ?? "Forensics step-up required");
        setCmpDecrypted(false);
        // still show metadata if returned without decrypt
        if (data.rows) {
          setCmpRows(data.rows);
          setCmpTotal(data.total ?? 0);
        }
        return;
      }
      if (!data.ok) {
        setError(data.error ?? "Failed to load compliance");
        return;
      }
      setCmpRows(data.rows ?? []);
      setCmpTotal(data.total ?? 0);
      setCmpDecrypted(!!decrypt);
      setError(null);
    },
    [cmpPage],
  );

  const loadEntities = useCallback(async () => {
    const res = await fetch("/api/admin/entity", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Failed to load entity apps");
      return;
    }
    setEntityRows(data.applications ?? []);
    setEntityStats(data.stats ?? null);
    setError(null);
  }, []);

  const loadReserved = useCallback(async () => {
    const res = await fetch("/api/admin/reserved", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Failed to load reserved terms");
      return;
    }
    setReservedRows(data.terms ?? []);
    setReservedStats(data.stats ?? null);
    setError(null);
  }, []);

  const loadOrders = useCallback(async () => {
    const q = orderFilter
      ? `?status=${encodeURIComponent(orderFilter)}`
      : "";
    const res = await fetch(`/api/admin/orders${q}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      setError(data.error ?? "Failed to load orders");
      return;
    }
    setOrderRows(data.orders ?? []);
    setOrderStats(data.stats ?? null);
    setError(null);
  }, [orderFilter]);

  const loadTickets = useCallback(async () => {
    const query = ticketFilter
      ? `?status=${encodeURIComponent(ticketFilter)}`
      : "";
    const response = await fetch(`/api/admin/otg27${query}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (response.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await response.json();
    if (!data.ok) {
      setError(data.error ?? "Failed to load OTG27 tickets");
      return;
    }
    setTicketRows(data.orders ?? []);
    setTicketStats(data.stats ?? null);
    setError(null);
  }, [ticketFilter]);

  useEffect(() => {
    void (async () => {
      const ok = await refreshSession();
      if (ok) await loadRegs();
    })();
  }, [refreshSession, loadRegs]);

  useEffect(() => {
    if (!authed) return;
    if (tab === "names") void loadRegs();
    if (tab === "orders") void loadOrders();
    if (tab === "tickets") void loadTickets();
    if (tab === "compliance") void loadCompliance(false);
    if (tab === "entity") void loadEntities();
    if (tab === "reserved") void loadReserved();
  }, [
    filter,
    orderFilter,
    ticketFilter,
    authed,
    loadRegs,
    loadOrders,
    loadTickets,
    tab,
    loadCompliance,
    loadEntities,
    loadReserved,
  ]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ secret }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      setSecret("");
      setAuthed(true);
      setMsg("Signed in");
      await loadRegs();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    await fetch("/api/admin/stepup", {
      method: "DELETE",
      credentials: "same-origin",
    }).catch(() => null);
    setAuthed(false);
    setRows([]);
    setStats(null);
    setCmpRows([]);
    setEntityRows([]);
    setReservedRows([]);
    setReservedStats(null);
    setOrderRows([]);
    setOrderStats(null);
    setTicketRows([]);
    setTicketStats(null);
    setCmpDecrypted(false);
    setMsg("Signed out");
  }

  async function onOrderStatus(id: string, status: string) {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_status", id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setMsg(`Order ${id.slice(0, 12)}… → ${status}`);
      await loadOrders();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onOrderDelete(id: string) {
    if (!confirm(`Delete order ${id}?`)) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Delete failed");
        return;
      }
      setMsg("Order deleted");
      await loadOrders();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onTicketAction(
    id: string,
    action: "set_status" | "delete",
    status?: string,
  ) {
    if (action === "delete" && !confirm(`Delete OTG27 order ${id}?`)) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const response = await fetch("/api/admin/otg27", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, id, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Ticket update failed");
        return;
      }
      setMsg(
        action === "delete"
          ? "Ticket order deleted"
          : `OTG27 order → ${status}`,
      );
      await loadTickets();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onReserve(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/reserved", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "reserve",
          term: newTerm,
          title: newTitle || undefined,
          brand: newBrand || undefined,
          note: newNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Reserve failed");
        return;
      }
      setMsg(`Reserved «${data.term?.term ?? newTerm}»`);
      setNewTerm("");
      setNewTitle("");
      setNewBrand("");
      setNewNote("");
      await loadReserved();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onUnreserve(term: string) {
    if (!confirm(`Unreserve «${term}»? It becomes registerable again.`)) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/reserved", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "unreserve", term }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Unreserve failed");
        return;
      }
      setMsg(`Unreserved «${term}»`);
      await loadReserved();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onStepup(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stepup", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret: stepupSecret }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Step-up failed");
        return;
      }
      setStepupSecret("");
      setMsg("Forensics step-up granted (15m)");
      await loadCompliance(true);
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function setEntityStatus(id: string, status: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/entity", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_status", id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      const hasCert = !!data.application?.certJson || !!data.application?.hasCert;
      setMsg(
        status === "active"
          ? `${id} → active${hasCert || data.application?.status === "active" ? " · permanent cert issued" : ""}`
          : `${id} → ${status}`,
      );
      await loadEntities();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: RegStatus) {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_status", id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Update failed");
        return;
      }
      setMsg(`${data.registration?.name ?? id} → ${status}`);
      await loadRegs();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete registration «${name}» permanently?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Delete failed");
        return;
      }
      setMsg(`Deleted ${name}`);
      await loadRegs();
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  if (configured === false) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] text-amber-200/80 uppercase">
          Setup required
        </p>
        <h1 className="mt-3 text-xl font-thin">Admin secret not set</h1>
        <pre className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-black/50 p-4 text-left font-mono text-xs text-white/70">
          {`cd grid-site
npx wrangler secret put GRID_ADMIN_SECRET
# use a long random string (16+ chars)
npm run deploy`}
        </pre>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md">
        <p className="font-mono text-[0.65rem] tracking-[0.22em] text-white/40 uppercase">
          Restricted
        </p>
        <h1 className="mt-3 text-3xl font-thin tracking-wide">Admin</h1>
        <p className="mt-3 text-sm text-white/45">
          Sign in with your operator secret. Sessions are HttpOnly, SameSite
          Strict, 8-hour expiry.
        </p>
        <div className="mt-6 flex justify-end">
          <LanguageSwitcher />
        </div>
        <form onSubmit={onLogin} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <div>
            <label className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
              Admin secret
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              minLength={16}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 font-mono text-sm text-white outline-none focus:border-white/40"
              placeholder="GRID_ADMIN_SECRET"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full disabled:opacity-40"
          >
            {busy ? "Checking…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-white/25">
          Not linked from public nav. Rate-limited login.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.22em] text-white/40 uppercase">
            Operator
          </p>
          <h1 className="mt-2 text-3xl font-thin tracking-wide">Dashboard</h1>
          <p className="mt-2 text-sm text-white/45">
            Cash App registrations · shop orders · OTG27 tickets · reserved ·
            compliance · Key / Verified
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => {
              if (tab === "names") void loadRegs();
              if (tab === "orders") void loadOrders();
              if (tab === "tickets") void loadTickets();
              if (tab === "compliance") void loadCompliance(cmpDecrypted);
              if (tab === "entity") void loadEntities();
              if (tab === "reserved") void loadReserved();
            }}
            className="btn-ghost text-[0.65rem]"
            disabled={busy}
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="btn-ghost text-[0.65rem]"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["names", "Names ($5)"],
            ["orders", "Orders (tees)"],
            ["tickets", "OTG27 tickets"],
            ["reserved", "Reserved"],
            ["compliance", "Compliance / IP·MAC"],
            ["entity", "Key · Verified"],
          ] as const
        ).map(([id, lab]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-wider uppercase transition ${
              tab === id
                ? "border-white bg-white text-black"
                : "border-white/20 text-white/60 hover:border-white/40"
            }`}
          >
            {lab}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {msg}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {tab === "names" && (
        <>
          {stats && (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(
                [
                  ["Total", stats.total],
                  ["Review", stats.pending_review],
                  ["Payment", stats.pending_payment],
                  ["Active", stats.active],
                  ["Rejected", stats.rejected],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <p className="font-mono text-[0.6rem] tracking-wider text-white/35 uppercase">
                    {k}
                  </p>
                  <p className="mt-1 text-2xl font-thin text-white">{v}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {(
              [
                ["", "All"],
                ["pending_review", "Needs review"],
                ["pending_payment", "Awaiting pay"],
                ["active", "Active"],
                ["rejected", "Rejected"],
              ] as const
            ).map(([v, lab]) => (
              <button
                key={lab}
                type="button"
                onClick={() => setFilter(v)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-wider uppercase transition ${
                  filter === v
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/60 hover:border-white/40"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">Name</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-3 py-2.5 font-normal">Note / confirm</th>
                  <th className="px-3 py-2.5 font-normal">Fee</th>
                  <th className="px-3 py-2.5 font-normal">Updated</th>
                  <th className="px-3 py-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No registrations
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 align-top last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-mono text-white">{r.name}</p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {r.label} · {r.class} · {r.region}
                          {(r as { kinds?: string[] }).kinds?.length
                            ? ` · ${(r as { kinds: string[] }).kinds.join("+")}`
                            : ""}
                        </p>
                        <p className="mono mt-0.5 text-[0.65rem] text-white/25">
                          {r.id}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-mono text-xs text-white/70">
                          {r.paymentNote}
                        </p>
                        {r.cashConfirm && (
                          <p className="mt-1 text-xs text-white/40">
                            confirm: {r.cashConfirm}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-white/55">
                        ${r.feeUsd.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.65rem] text-white/35">
                        {r.updatedAt?.slice(0, 19).replace("T", " ")}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1.5">
                          {r.status !== "active" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void setStatus(r.id, "active")}
                              className="rounded border border-emerald-500/40 px-2 py-1 text-[0.65rem] text-emerald-200 hover:bg-emerald-500/10"
                            >
                              Approve
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void setStatus(r.id, "rejected")}
                              className="rounded border border-amber-500/40 px-2 py-1 text-[0.65rem] text-amber-100 hover:bg-amber-500/10"
                            >
                              Reject
                            </button>
                          )}
                          {r.status === "rejected" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void setStatus(r.id, "pending_review")
                              }
                              className="rounded border border-white/20 px-2 py-1 text-[0.65rem] text-white/60 hover:bg-white/5"
                            >
                              Reopen
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onDelete(r.id, r.name)}
                            className="rounded border border-red-500/30 px-2 py-1 text-[0.65rem] text-red-200/80 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "compliance" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-white/50">
            Paginated{" "}
            <span className="font-mono text-white/70">grid://{"{realm}"}</span>{" "}
            rows with 128-hex id. IP/MAC decrypt requires step-up (15m). Public
            site never sees this data.
          </p>
          <form
            onSubmit={onStepup}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 p-4"
          >
            <label className="min-w-[200px] flex-1 text-xs text-white/50">
              Forensics step-up secret
              <input
                type="password"
                value={stepupSecret}
                onChange={(e) => setStepupSecret(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
                placeholder="GRID_ADMIN_STEPUP_SECRET or admin secret"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-40"
            >
              Unlock IP/MAC
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void loadCompliance(false)}
              className="rounded-full border border-white/25 px-4 py-2 text-xs text-white/70"
            >
              Metadata only
            </button>
          </form>
          <p className="font-mono text-[0.65rem] text-white/35">
            {cmpTotal} rows · page {cmpPage}
            {cmpDecrypted ? " · DECRYPTED" : " · sealed"}
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">grid://</th>
                  <th className="px-3 py-2.5 font-normal">128-hex id</th>
                  <th className="px-3 py-2.5 font-normal">Machine ref</th>
                  <th className="px-3 py-2.5 font-normal">IP</th>
                  <th className="px-3 py-2.5 font-normal">MAC</th>
                  <th className="px-3 py-2.5 font-normal">Updated</th>
                </tr>
              </thead>
              <tbody>
                {cmpRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No compliance attestations yet
                    </td>
                  </tr>
                ) : (
                  cmpRows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 align-top last:border-0"
                    >
                      <td className="px-3 py-3 font-mono text-white">
                        {r.gridUrl}
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.6rem] break-all text-white/50">
                        {r.gpId}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-white/45">
                        {r.machineRef}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-emerald-100/90">
                        {r.ip ?? "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-emerald-100/90">
                        {r.mac ?? "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-[0.65rem] text-white/35">
                        {r.updatedAt?.slice(0, 19).replace("T", " ")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={cmpPage <= 1}
              onClick={() => setCmpPage((p) => Math.max(1, p - 1))}
              className="rounded border border-white/20 px-3 py-1 text-xs text-white/60 disabled:opacity-30"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={cmpPage * 25 >= cmpTotal}
              onClick={() => setCmpPage((p) => p + 1)}
              className="rounded border border-white/20 px-3 py-1 text-xs text-white/60 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {tab === "reserved" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-white/50">
            Reserve grid labels so the public cannot register them. System
            labels (home, registry, …) are permanent. Brand seeds (google, me,
            microsoft, …) ship with MESH logos. Admin-added terms block
            registration immediately.
          </p>

          {reservedStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  ["Total", reservedStats.total],
                  ["System", reservedStats.system],
                  ["Brand", reservedStats.brand],
                  ["Admin", reservedStats.admin],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <p className="font-mono text-[0.6rem] tracking-wider text-white/35 uppercase">
                    {k}
                  </p>
                  <p className="mt-1 text-2xl font-thin text-white">{v}</p>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={onReserve}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <p className="font-mono text-[0.65rem] tracking-[0.18em] text-white/40 uppercase">
              Reserve a term
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-white/50">
                Term *
                <input
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  required
                  pattern="[A-Za-z][A-Za-z0-9_-]{0,31}"
                  placeholder="openai"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
                />
              </label>
              <label className="text-xs text-white/50">
                Title
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="OpenAI"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                />
              </label>
              <label className="text-xs text-white/50">
                Brand key (optional logo)
                <input
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="openai"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-white/40"
                />
              </label>
              <label className="text-xs text-white/50">
                Note
                <input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Trademark / partner"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-white outline-none focus:border-white/40"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={busy || !newTerm.trim()}
              className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-medium text-black disabled:opacity-40"
            >
              {busy ? "Saving…" : "Reserve"}
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["", "All"],
                ["admin", "Admin"],
                ["brand", "Brand"],
                ["system", "System"],
              ] as const
            ).map(([v, lab]) => (
              <button
                key={lab}
                type="button"
                onClick={() => setReservedFilter(v)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-wider uppercase transition ${
                  reservedFilter === v
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/60 hover:border-white/40"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">Term</th>
                  <th className="px-3 py-2.5 font-normal">Title / brand</th>
                  <th className="px-3 py-2.5 font-normal">Source</th>
                  <th className="px-3 py-2.5 font-normal">Note</th>
                  <th className="px-3 py-2.5 font-normal">Updated</th>
                  <th className="px-3 py-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservedRows.filter(
                  (r) => !reservedFilter || r.source === reservedFilter,
                ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No reserved terms
                    </td>
                  </tr>
                ) : (
                  reservedRows
                    .filter(
                      (r) => !reservedFilter || r.source === reservedFilter,
                    )
                    .map((r) => (
                      <tr
                        key={r.term}
                        className="border-b border-white/5 align-top last:border-0"
                      >
                        <td className="px-3 py-3">
                          <p className="font-mono text-white">{r.term}</p>
                          <p className="mt-0.5 font-mono text-[0.6rem] text-white/30">
                            grid://{r.term}.grid
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-white/85">{r.title}</p>
                          {r.brand && (
                            <p className="mt-0.5 font-mono text-[0.65rem] text-white/40">
                              brand: {r.brand}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wider uppercase ${
                              r.source === "system"
                                ? "bg-white/10 text-white/50"
                                : r.source === "brand"
                                  ? "bg-sky-500/15 text-sky-200"
                                  : "bg-violet-500/15 text-violet-200"
                            }`}
                          >
                            {r.source}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-white/45">
                          {r.note || "—"}
                        </td>
                        <td className="px-3 py-3 font-mono text-[0.65rem] text-white/35">
                          {r.updatedAt?.slice(0, 19).replace("T", " ")}
                        </td>
                        <td className="px-3 py-3">
                          {r.source === "system" ? (
                            <span className="font-mono text-[0.6rem] text-white/25">
                              locked
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void onUnreserve(r.term)}
                              className="rounded border border-red-500/30 px-2 py-1 text-[0.65rem] text-red-200/80 hover:bg-red-500/10"
                            >
                              Unreserve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-white/30">
            Public list:{" "}
            <span className="font-mono text-white/45">
              GET /api/registry/reserved
            </span>
          </p>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-white/50">
            Shop tees · only listed after the buyer submits payment (Cash App{" "}
            $Caraveo or Bitcoin). Mark fulfilled when shipped.
          </p>
          {orderStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(
                [
                  ["Tracked", orderStats.total],
                  ["Submitted", orderStats.payment_submitted],
                  ["Fulfilled", orderStats.fulfilled],
                  ["Cancelled", orderStats.cancelled],
                  ["Draft pay", orderStats.pending_payment],
                ] as const
              ).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <p className="font-mono text-[0.6rem] tracking-wider text-white/35 uppercase">
                    {k}
                  </p>
                  <p className="mt-1 text-2xl font-thin text-white">{v}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["", "Tracked (all)"],
                ["payment_submitted", "Submitted"],
                ["fulfilled", "Fulfilled"],
                ["cancelled", "Cancelled"],
              ] as const
            ).map(([id, lab]) => (
              <button
                key={id || "all"}
                type="button"
                onClick={() => setOrderFilter(id)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-wider uppercase transition ${
                  orderFilter === id
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/60 hover:border-white/40"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">Product</th>
                  <th className="px-3 py-2.5 font-normal">Buyer</th>
                  <th className="px-3 py-2.5 font-normal">Payment</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-3 py-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No tracked orders yet
                    </td>
                  </tr>
                ) : (
                  orderRows.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-white/5 align-top last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-mono text-white">
                          {o.productNumber} · {o.productTitle}
                        </p>
                        <p className="mt-0.5 text-xs text-white/45">
                          Size {o.size} · ${o.feeUsd}
                        </p>
                        <p className="mt-1 font-mono text-[0.55rem] break-all text-white/25">
                          {o.id}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-white/85">{o.email}</p>
                        {o.name && (
                          <p className="text-xs text-white/50">{o.name}</p>
                        )}
                        {o.phone && (
                          <p className="text-xs text-white/40">{o.phone}</p>
                        )}
                        {o.shipping && (
                          <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs text-white/35">
                            {o.shipping}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-white/60">
                        <p>{o.paymentNote}</p>
                        <p className="mt-1 text-white/40">
                          {o.paymentMethod ?? "—"}
                        </p>
                        {o.cashConfirm && (
                          <p className="mt-1 text-white/35">
                            cash: {o.cashConfirm}
                          </p>
                        )}
                        {o.btcTxid && (
                          <p className="mt-1 break-all text-white/35">
                            btc: {o.btcTxid}
                          </p>
                        )}
                        {o.paidAt && (
                          <p className="mt-1 text-[0.6rem] text-white/25">
                            {new Date(o.paidAt).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {o.status !== "fulfilled" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onOrderStatus(o.id, "fulfilled")
                              }
                              className="rounded border border-emerald-500/30 px-2 py-1 text-[0.65rem] text-emerald-200/90 hover:bg-emerald-500/10"
                            >
                              Fulfill
                            </button>
                          )}
                          {o.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onOrderStatus(o.id, "cancelled")
                              }
                              className="rounded border border-white/15 px-2 py-1 text-[0.65rem] text-white/50 hover:bg-white/5"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void onOrderDelete(o.id)}
                            className="rounded border border-red-500/30 px-2 py-1 text-[0.65rem] text-red-200/80 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "tickets" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-white/50">
            OTG27 passes · payment submissions appear here for verification.
            Confirm only after matching the payment note in Cash App or Bitcoin.
          </p>

          {ticketStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {(
                [
                  ["Orders", ticketStats.total],
                  ["Submitted", ticketStats.payment_submitted],
                  ["Confirmed", ticketStats.confirmed],
                  ["Cancelled", ticketStats.cancelled],
                  ["Draft pay", ticketStats.pending_payment],
                  ["Attendees", ticketStats.attendees],
                  ["Revenue", `$${ticketStats.revenueUsd}`],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                >
                  <p className="font-mono text-[0.6rem] tracking-wider text-white/35 uppercase">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-thin text-white">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["", "Tracked (all)"],
                ["payment_submitted", "Submitted"],
                ["confirmed", "Confirmed"],
                ["cancelled", "Cancelled"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id || "all"}
                type="button"
                onClick={() => setTicketFilter(id)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-wider uppercase transition ${
                  ticketFilter === id
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-white/60 hover:border-white/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">Pass</th>
                  <th className="px-3 py-2.5 font-normal">Attendee</th>
                  <th className="px-3 py-2.5 font-normal">Payment</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-3 py-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticketRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No tracked OTG27 ticket orders yet
                    </td>
                  </tr>
                ) : (
                  ticketRows.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 align-top last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="text-white">{order.ticketName}</p>
                        <p className="mt-0.5 text-xs text-white/45">
                          {order.quantity} × ${order.unitPriceUsd} · $
                          {order.totalUsd}
                        </p>
                        <p className="mt-1 font-mono text-[0.55rem] text-white/25">
                          {order.id}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-white/85">{order.name}</p>
                        <p className="text-xs text-white/50">{order.email}</p>
                        {order.organization && (
                          <p className="text-xs text-white/35">
                            {order.organization}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-white/60">
                        <p>{order.paymentNote}</p>
                        <p className="mt-1 text-white/40">
                          {order.paymentMethod ?? "—"}
                        </p>
                        {order.paymentReference && (
                          <p className="mt-1 break-all text-white/30">
                            {order.paymentReference}
                          </p>
                        )}
                        <p className="mt-1 text-[0.6rem] text-white/25">
                          {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {order.status !== "confirmed" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onTicketAction(
                                  order.id,
                                  "set_status",
                                  "confirmed",
                                )
                              }
                              className="rounded border border-emerald-500/30 px-2 py-1 text-[0.65rem] text-emerald-200/90 hover:bg-emerald-500/10"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status !== "cancelled" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void onTicketAction(
                                  order.id,
                                  "set_status",
                                  "cancelled",
                                )
                              }
                              className="rounded border border-white/15 px-2 py-1 text-[0.65rem] text-white/50 hover:bg-white/5"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void onTicketAction(order.id, "delete")
                            }
                            className="rounded border border-red-500/30 px-2 py-1 text-[0.65rem] text-red-200/80 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "entity" && (
        <div className="mt-8 space-y-6">
          <p className="text-sm text-white/50">
            Key ($300) permanent security credential · Verified Entity ($10k).
            Cash App $Caraveo + note. Approve after payment verification.
          </p>
          {entityStats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(entityStats)
                .slice(0, 8)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-white/10 px-4 py-3"
                  >
                    <p className="font-mono text-[0.6rem] tracking-wider text-white/35 uppercase">
                      {k}
                    </p>
                    <p className="mt-1 text-xl font-thin">{v}</p>
                  </div>
                ))}
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] font-mono text-[0.6rem] tracking-wider text-white/40 uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-normal">Tier / realm</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-3 py-2.5 font-normal">Note</th>
                  <th className="px-3 py-2.5 font-normal">Fee</th>
                  <th className="px-3 py-2.5 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entityRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      No Key / Verified applications
                    </td>
                  </tr>
                ) : (
                  entityRows.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-white/5 align-top last:border-0"
                    >
                      <td className="px-3 py-3">
                        <p className="font-mono text-white">
                          [{a.tier === "key" ? "Key" : "Verified"}]{" "}
                          grid://{a.realm}.grid
                        </p>
                        {a.entityName && (
                          <p className="text-xs text-white/45">{a.entityName}</p>
                        )}
                        <p className="mt-1 font-mono text-[0.55rem] break-all text-white/25">
                          {a.gpId}
                        </p>
                        <p className="font-mono text-[0.6rem] text-white/25">
                          {a.id}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-white/60">
                        {a.paymentNote}
                        {a.cashConfirm && (
                          <p className="mt-1 text-white/35">
                            confirm: {a.cashConfirm}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-white/55">
                        ${a.feeUsd.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1.5">
                          {a.status !== "active" && a.status !== "revoked" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void setEntityStatus(a.id, "active")}
                              className="rounded border border-emerald-500/40 px-2 py-1 text-[0.65rem] text-emerald-200 hover:bg-emerald-500/10"
                            >
                              Approve
                            </button>
                          )}
                          {a.status === "active" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void setEntityStatus(a.id, "revoked")
                              }
                              className="rounded border border-red-500/40 px-2 py-1 text-[0.65rem] text-red-200 hover:bg-red-500/10"
                            >
                              Revoke
                            </button>
                          )}
                          {a.status !== "rejected" && a.status !== "revoked" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void setEntityStatus(a.id, "rejected")
                              }
                              className="rounded border border-amber-500/40 px-2 py-1 text-[0.65rem] text-amber-100 hover:bg-amber-500/10"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs leading-relaxed text-white/30">
        Verify Cash App activity for note codes before Approve. Active names stay
        held; Reject frees the name. Use the Reserved tab to block brand/system
        terms from registration. This page is not linked from public nav. Set
        GRID_COMPLIANCE_KEY and GRID_ADMIN_STEPUP_SECRET for forensics.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active" || status === "fulfilled"
      ? "bg-emerald-500/20 text-emerald-200"
      : status === "pending_review" || status === "payment_submitted"
        ? "bg-sky-500/20 text-sky-100"
        : status === "pending_payment"
          ? "bg-white/10 text-white/50"
          : status === "cancelled" || status === "rejected"
            ? "bg-red-500/15 text-red-200"
            : "bg-amber-500/15 text-amber-100";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wider uppercase ${tone}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
