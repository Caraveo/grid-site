import type { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-3xl font-semibold tracking-tight text-fg-strong sm:text-4xl">
      {children}
    </h1>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-lg leading-relaxed text-muted">{children}</p>
  );
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mt-12 scroll-mt-24 border-b border-border pb-2 text-xl font-semibold tracking-tight text-fg-strong"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3
      id={id}
      className="mt-8 scroll-mt-24 text-base font-semibold text-fg-strong"
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 text-[15px] leading-relaxed text-muted">{children}</p>
  );
}

export function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted">
      {children}
    </ul>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
      {children}
    </div>
  );
}

export function Endpoint({
  method,
  path,
  children,
}: {
  method: "GET" | "POST";
  path: string;
  children?: ReactNode;
}) {
  const color =
    method === "GET"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : "bg-sky-500/15 text-sky-300 border-sky-500/30";
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${color}`}
        >
          {method}
        </span>
        <code className="font-mono text-sm text-foreground">{path}</code>
      </div>
      {children ? (
        <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
      ) : null}
    </div>
  );
}

export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="border-b border-border bg-surface">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-dim"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/70 last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2.5 align-top text-muted ${
                    j === 0 ? "font-mono text-[12.5px] text-foreground/90" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
