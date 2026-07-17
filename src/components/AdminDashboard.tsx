"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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

  useEffect(() => {
    void (async () => {
      const ok = await refreshSession();
      if (ok) await loadRegs();
    })();
  }, [refreshSession, loadRegs]);

  useEffect(() => {
    if (authed) void loadRegs();
  }, [filter, authed, loadRegs]);

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
    setAuthed(false);
    setRows([]);
    setStats(null);
    setMsg("Signed out");
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
        <form onSubmit={onLogin} className="mt-8 space-y-4">
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
            Cash App registrations · approve after verifying $Caraveo payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadRegs()}
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
                          onClick={() => void setStatus(r.id, "pending_review")}
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

      <p className="mt-8 text-xs leading-relaxed text-white/30">
        Verify Cash App activity for note codes before Approve. Active names stay
        reserved; Reject frees the name. This page is not linked from public nav.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-emerald-500/20 text-emerald-200"
      : status === "pending_review"
        ? "bg-sky-500/20 text-sky-100"
        : status === "pending_payment"
          ? "bg-white/10 text-white/50"
          : "bg-amber-500/15 text-amber-100";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wider uppercase ${tone}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
