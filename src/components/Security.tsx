import { PasskeyIcon } from "./PasskeyIcon";
import { ScrambleText } from "./ScrambleText";

/**
 * Abstract surface for GRID operator auth modes (CLI: `grid auth …`).
 * Modes: passkey | password | keyphrase | combo | master | nocrypt.
 */
const modes = [
  {
    cmd: "passkey",
    title: "Passkey",
    tag: "Default",
    icon: "passkey" as const,
    body: "Device-bound. Face ID, Touch ID, or a hardware key. Phishing-resistant — your vault unlocks with you.",
  },
  {
    cmd: "password",
    title: "Password",
    tag: "Familiar",
    icon: "lock" as const,
    body: "You choose the secret. Portable encryption without a platform passkey.",
  },
  {
    cmd: "keyphrase",
    title: "24-word keyphrase",
    tag: "Recovery",
    icon: "words" as const,
    body: "A full BIP39 twenty-four word phrase, shown once. Write it offline. The node will not repeat it.",
  },
  {
    cmd: "combo",
    title: "Combo",
    tag: "Stacked",
    icon: "layers" as const,
    body: "Password → passkey → keyphrase. Layered unlock for operators who want stacked ceremony.",
  },
  {
    cmd: "master",
    title: "Master",
    tag: "Maximum",
    icon: "layers" as const,
    body: "Password + passkey + 24 words + randomized master key. All four required. One factor alone unlocks nothing.",
  },
  {
    cmd: "nocrypt",
    title: "No crypt",
    tag: "Raw keys",
    icon: "key" as const,
    body: "Just the keys on disk (mode 0600). No envelope. Labs and throwaway nodes only.",
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
              GRID does not decide how your secrets sleep. Passkey by default —
              or password, twenty-four words, stacked combo, full master factors,
              or raw keys. Same mesh. Your rules.
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
                    <span className="font-mono text-white/70">grid auth</span>{" "}
                    lives under device credentials. Or step into master mode when
                    you need a key this machine is not allowed to keep.
                  </p>
                </div>
              </div>
              <p className="mt-8 font-mono text-[0.7rem] tracking-wide text-white/35">
                grid auth &lt;mode&gt;
              </p>
            </div>
          </div>
        </div>

        {/* The Master is Destroyed */}
        <div
          id="master-destruction"
          className="mt-16 border border-white/20 bg-gradient-to-b from-white/[0.07] to-transparent px-6 py-12 sm:px-12"
        >
          <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-white/50 uppercase">
            Master destruction
          </p>
          <blockquote className="mt-6 max-w-3xl text-xl font-medium leading-snug tracking-tight text-white sm:text-2xl sm:leading-snug">
            The master is born once and dies on the node.
            <span className="mt-4 block text-base font-normal leading-relaxed text-white/55 sm:text-lg">
              GRID never keeps a recoverable master key under its home directory.
              In master mode you set a password, register a device passkey, write
              down a twenty-four word phrase, and receive a randomized master key.
              After you type{" "}
              <span className="font-mono text-white/80">DESTROY</span>, the master
              is wiped from this machine. Unlock forever requires every factor —
              password, passkey, phrase, and master key file. Knowing one is
              knowing nothing.
            </span>
          </blockquote>
          <p className="mt-8 font-mono text-[0.7rem] tracking-wide text-white/35">
            grid auth master
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((m) => (
            <article
              key={m.cmd}
              className={`panel flex flex-col p-6 sm:p-7 ${
                m.cmd === "passkey"
                  ? "border-white/30 bg-white/[0.05]"
                  : ""
              } ${m.cmd === "master" ? "border-white/25 sm:col-span-2 lg:col-span-2" : ""}`}
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
                {m.cmd === "passkey"
                  ? "grid auth  (default)"
                  : `grid auth ${m.cmd}`}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/50">
                {m.body}
              </p>

              {m.cmd === "master" && (
                <ol className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5 text-[0.65rem] tracking-[0.12em] text-white/55 uppercase">
                  <li className="border border-white/20 px-2.5 py-1">Password</li>
                  <li className="text-white/25" aria-hidden>
                    +
                  </li>
                  <li className="border border-white/25 px-2.5 py-1 text-white">
                    Passkey
                  </li>
                  <li className="text-white/25" aria-hidden>
                    +
                  </li>
                  <li className="border border-white/20 px-2.5 py-1">24 words</li>
                  <li className="text-white/25" aria-hidden>
                    +
                  </li>
                  <li className="border border-white/25 px-2.5 py-1 text-white">
                    Master key
                  </li>
                  <li className="text-white/25" aria-hidden>
                    →
                  </li>
                  <li className="border border-white/40 px-2.5 py-1 text-white">
                    DESTROY on node
                  </li>
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
              t: "Master dies here",
              d: "In master mode the node keeps no recoverable master — only encrypted shares.",
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
