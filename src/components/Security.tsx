import { PasskeyIcon } from "./PasskeyIcon";
import { ScrambleText } from "./ScrambleText";

/**
 * Abstract surface for GRID operator auth modes (CLI: `grid auth …`).
 * Modes: passkey | password | keyphrase | combo | nocrypt.
 */
const modes = [
  {
    cmd: "passkey",
    title: "Passkey",
    tag: "Recommended",
    icon: "passkey" as const,
    body: "Device-bound. Face ID, Touch ID, or a hardware key. Phishing-resistant by design — your vault unlocks with you, not a string someone can steal.",
  },
  {
    cmd: "password",
    title: "Password",
    tag: "Familiar",
    icon: "lock" as const,
    body: "You choose the secret. Classic encryption when you want something portable across machines without a platform passkey.",
  },
  {
    cmd: "keyphrase",
    title: "Keyphrase",
    tag: "Recovery-grade",
    icon: "words" as const,
    body: "A human-readable phrase you write down once. Built for restore-from-paper and air-gapped habits miners already trust.",
  },
  {
    cmd: "combo",
    title: "Combo",
    tag: "Stacked",
    icon: "layers" as const,
    body: "Password → passkey → keyphrase. Layered unlock: something you know, something you are, something you can recover. Maximum ceremony, maximum control.",
  },
  {
    cmd: "nocrypt",
    title: "No crypt",
    tag: "Raw keys",
    icon: "key" as const,
    body: "Just the keys. No envelope. For labs, throwaway nodes, and operators who already wrap secrets their own way — you own the risk.",
  },
];

function ModeIcon({ kind }: { kind: (typeof modes)[number]["icon"] }) {
  const cls = "h-6 w-6 text-white";
  switch (kind) {
    case "passkey":
      return <PasskeyIcon className={cls} />;
    case "lock":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <rect
            x="5"
            y="11"
            width="14"
            height="10"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 11V8a4 4 0 018 0v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "words":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M5 7h14M5 12h10M5 17h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M12 4l8 4-8 4-8-4 8-4z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M4 12l8 4 8-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16l8 4 8-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <circle
            cx="8.5"
            cy="10.5"
            r="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M11.5 13.5L20 22M16.5 17.5h3M18.5 19.5v-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function Security() {
  return (
    <section
      id="security"
      className="relative overflow-hidden border-t border-white/10 px-5 py-28 sm:py-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.05)_0%,transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-6">
            <p className="section-label">
              <ScrambleText text="Security by Design" />
            </p>
            <h2 className="section-title mt-5">
              You choose
              <br />
              the <ScrambleText text="lock." />
            </h2>
            <p className="section-body mt-6">
              GRID does not decide how your secrets sleep. You pick the envelope —
              passkey, password, keyphrase, all three stacked, or raw keys with no
              wrap at all. Same mesh. Your rules.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="panel relative overflow-hidden p-8 sm:p-10">
              <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/[0.04] blur-2xl" />
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/25 bg-white/[0.04] text-white">
                  <PasskeyIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-white/45 uppercase">
                    Default path
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Encrypted by{" "}
                    <ScrambleText text="Passkey" />
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                    One command to live under device credentials. Or step down to
                    password, keyphrase, combo, or no envelope — when the operator
                    knows what they are doing.
                  </p>
                </div>
              </div>
              <p className="mt-8 font-mono text-[0.7rem] tracking-wide text-white/35">
                grid auth &lt;mode&gt;
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => (
            <article
              key={m.cmd}
              className={`panel flex flex-col p-6 sm:p-7 ${
                m.cmd === "passkey"
                  ? "border-white/30 bg-white/[0.05]"
                  : ""
              } ${m.cmd === "combo" ? "sm:col-span-2 lg:col-span-2" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center border border-white/20 bg-black/40">
                  <ModeIcon kind={m.icon} />
                </div>
                <span className="text-[0.6rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  {m.tag}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                <ScrambleText text={m.title} />
              </h3>
              <p className="mt-1 font-mono text-[0.7rem] tracking-wide text-white/40">
                grid auth {m.cmd}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/50">
                {m.body}
              </p>

              {m.cmd === "combo" && (
                <ol className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-[0.65rem] tracking-[0.12em] text-white/55 uppercase">
                  <li className="border border-white/20 px-2.5 py-1">Password</li>
                  <li className="text-white/25" aria-hidden>
                    →
                  </li>
                  <li className="inline-flex items-center gap-1.5 border border-white/25 px-2.5 py-1 text-white">
                    <PasskeyIcon className="h-3 w-3" />
                    Passkey
                  </li>
                  <li className="text-white/25" aria-hidden>
                    →
                  </li>
                  <li className="border border-white/20 px-2.5 py-1">Keyphrase</li>
                </ol>
              )}
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            {
              t: "Your choice",
              d: "Set once per node. Change when your threat model changes.",
            },
            {
              t: "Local only",
              d: "Unlock happens on your machine. The mesh never sees the envelope.",
            },
            {
              t: "Honest modes",
              d: "Including nocrypt — for people who already have a better vault.",
            },
          ].map((x) => (
            <div key={x.t}>
              <h4 className="text-sm font-semibold tracking-tight">{x.t}</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/45">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
