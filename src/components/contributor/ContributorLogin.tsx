"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";
import { useContributorTheme } from "./useContributorTheme";

type Mode = "login" | "register" | "forgot" | "reset" | "2fa";
type ApiResult = {
  error?: string;
  message?: string;
  ticket?: string;
  requires2fa?: boolean;
  options?: Parameters<typeof startAuthentication>[0]["optionsJSON"];
  challengeId?: string;
};

async function api(path: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/contributor/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let data: ApiResult;
  try {
    data = text ? JSON.parse(text) as ApiResult : {};
  } catch {
    data = {};
  }
  if (!response.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export default function ContributorLogin() {
  const router = useRouter();
  const { theme, toggleTheme } = useContributorTheme();
  const search = useSearchParams();
  const [mode, setMode] = useState<Mode>(
    search.get("reset") ? "reset" : search.get("mode") === "register" ? "register" : "login",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ticket, setTicket] = useState("");
  const [identity, setIdentity] = useState("");
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const returnTo = search.get("returnTo") === "/api/exchange/handoff"
    ? "/api/exchange/handoff"
    : "/dashboard";

  function finishLogin() {
    router.push(returnTo);
    router.refresh();
  }

  useEffect(() => {
    const verify = search.get("verify");
    if (!verify) return;
    api("verify-email", { token: verify })
      .then((data) => setMessage(data.message ?? "Email verified."))
      .catch((reason) => setError(reason.message))
      .finally(() => setPending(false));
  }, [search]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      if (mode === "register") {
        const data = await api("register", {
          username: form.get("username"),
          recoveryEmail: form.get("recoveryEmail"),
          password: form.get("password"),
        });
        setMessage(data.message ?? "Request submitted.");
      } else if (mode === "forgot") {
        const data = await api("password/forgot", { email: form.get("email") });
        setMessage(data.message ?? "If that address is registered, a reset link has been sent.");
      } else if (mode === "reset") {
        const data = await api("password/reset", {
          token: search.get("reset"),
          password: form.get("password"),
        });
        setMessage(data.message ?? "Password updated.");
        setMode("login");
      } else if (mode === "2fa") {
        await api("login/2fa", { ticket, code: form.get("code") });
        finishLogin();
      } else {
        const data = await api("login", {
          identity: form.get("identity"),
          password: form.get("password"),
        });
        if (data.requires2fa) {
          setTicket(data.ticket ?? "");
          setMode("2fa");
        } else {
          finishLogin();
        }
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request failed");
    } finally {
      setPending(false);
    }
  }

  async function signInWithPasskey() {
    if (!identity.trim()) {
      setError("Enter your username or email first.");
      return;
    }
    if (!browserSupportsWebAuthn()) {
      setError("This browser does not support passkeys.");
      return;
    }
    setPasskeyBusy(true);
    setError("");
    try {
      const start = await api("passkey/auth-options", { identity });
      if (!start.options || !start.challengeId) throw new Error("Could not start passkey sign-in");
      const credential = await startAuthentication({ optionsJSON: start.options });
      await api("passkey/auth-verify", {
        identity,
        challengeId: start.challengeId,
        response: credential,
      });
      finishLogin();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Passkey sign-in failed";
      setError(/not allowed|cancel|abort/i.test(message) ? "Passkey sign-in was cancelled." : message);
    } finally {
      setPasskeyBusy(false);
    }
  }

  return (
    <main
      style={{
        ...styles.shell,
        ...(theme === "light" ? lightVariables : darkVariables),
      }}
    >
      <button
        type="button"
        onClick={toggleTheme}
        title={`Use ${theme === "dark" ? "light" : "dark"} theme`}
        style={styles.themeButton}
      >
        {theme === "dark" ? "☼ Light" : "☾ Dark"}
      </button>
      <section style={styles.card}>
        <Link href="/" style={styles.brand}>GRID / CONTRIBUTORS</Link>
        <p style={styles.eyebrow}>LEGACY INTERNET ACCESS</p>
        <h1 style={styles.title}>
          {mode === "register" ? "Request access" :
            mode === "forgot" ? "Recover account" :
            mode === "reset" ? "Choose a new password" :
            mode === "2fa" ? "Authenticator check" : "Sign in"}
        </h1>
        <p style={styles.copy}>
          {mode === "register"
            ? "Verify a personal recovery address. An administrator must approve every contributor."
            : "Secure access to your GRID contributor dashboard and mailbox."}
        </p>

        {message && <p role="status" style={styles.success}>{message}</p>}
        {error && <p role="alert" style={styles.error}>{error}</p>}

        <form onSubmit={submit} style={styles.form}>
          {mode === "register" && (
            <>
              <label style={styles.label}>
                GRID username
                <input
                  name="username"
                  autoComplete="username"
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z][A-Za-z0-9._-]{2,31}"
                  required
                  style={styles.input}
                />
                <small style={styles.hint}>3–32 characters; this becomes username@gridmail.dev</small>
              </label>
              <label style={styles.label}>
                Personal recovery email
                <input name="recoveryEmail" type="email" autoComplete="email" required style={styles.input} />
              </label>
            </>
          )}
          {mode === "login" && (
            <label style={styles.label}>
              Username or recovery email
              <input
                name="identity"
                autoComplete="username webauthn"
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                required
                style={styles.input}
              />
            </label>
          )}
          {mode === "forgot" && (
            <label style={styles.label}>
              Personal recovery email
              <input name="email" type="email" autoComplete="email" required style={styles.input} />
            </label>
          )}
          {["login", "register", "reset"].includes(mode) && (
            <label style={styles.label}>
              {mode === "reset" ? "New password" : "Password"}
              <input
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={12}
                maxLength={128}
                required
                style={styles.input}
              />
              {mode !== "login" && <small style={styles.hint}>12–128 characters</small>}
            </label>
          )}
          {mode === "2fa" && (
            <label style={styles.label}>
              Six-digit code or recovery code
              <input name="code" autoComplete="one-time-code" required autoFocus style={styles.input} />
            </label>
          )}
          <button disabled={pending} style={styles.button}>
            {pending ? "Working…" :
              mode === "register" ? "Submit request" :
              mode === "forgot" ? "Send reset link" :
              mode === "reset" ? "Update password" :
              mode === "2fa" ? "Verify" : "Sign in"}
          </button>
          {mode === "login" && browserSupportsWebAuthn() && (
            <button
              type="button"
              disabled={passkeyBusy}
              onClick={signInWithPasskey}
              style={styles.passkeyButton}
            >
              <span aria-hidden="true">◇</span>
              {passkeyBusy ? "Waiting for passkey…" : "Sign in with a passkey"}
            </button>
          )}
        </form>

        <nav style={styles.nav}>
          {mode !== "login" && (
            <button type="button" onClick={() => setMode("login")} style={styles.link}>Back to sign in</button>
          )}
          {mode === "login" && (
            <>
              <button type="button" onClick={() => setMode("register")} style={styles.link}>Request contributor access</button>
              <button type="button" onClick={() => setMode("forgot")} style={styles.link}>Forgot password?</button>
            </>
          )}
        </nav>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--login-bg)", color: "var(--login-text)", transition: "background .2s ease, color .2s ease" },
  card: { width: "100%", maxWidth: 480, border: "1px solid var(--login-border)", borderRadius: 18, padding: "36px 32px", background: "var(--login-card)", boxShadow: "var(--login-shadow)" },
  brand: { color: "var(--login-green)", textDecoration: "none", fontFamily: "monospace", fontWeight: 700 },
  eyebrow: { color: "var(--login-muted)", fontFamily: "monospace", fontSize: 12, letterSpacing: 2, marginTop: 34 },
  title: { fontSize: 34, margin: "8px 0 10px", letterSpacing: -1 },
  copy: { color: "var(--login-copy)", lineHeight: 1.6, marginBottom: 26 },
  form: { display: "grid", gap: 17 },
  label: { display: "grid", gap: 7, fontSize: 13, color: "var(--login-label)" },
  input: { width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 9, border: "1px solid var(--login-input-border)", background: "var(--login-input)", color: "var(--login-text)", fontSize: 16, outlineColor: "var(--login-green)" },
  hint: { color: "var(--login-muted)" },
  button: { marginTop: 6, padding: "14px 18px", border: 0, borderRadius: 9, background: "#79f29e", color: "#061109", fontWeight: 800, cursor: "pointer" },
  passkeyButton: { padding: "13px 18px", border: "1px solid var(--login-input-border)", borderRadius: 9, background: "var(--login-secondary)", color: "var(--login-text)", fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", gap: 9 },
  nav: { marginTop: 24, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  link: { border: 0, background: "transparent", color: "var(--login-link)", padding: 0, cursor: "pointer" },
  success: { padding: 12, borderRadius: 8, background: "#10281a", color: "#9effbb" },
  error: { padding: 12, borderRadius: 8, background: "#321318", color: "#ffabb5" },
  themeButton: { position: "fixed", top: 18, right: 18, border: "1px solid var(--login-border)", borderRadius: 9, background: "var(--login-card)", color: "var(--login-text)", padding: "9px 12px", cursor: "pointer", zIndex: 2 },
};

const darkVariables = {
  "--login-bg": "#080a0d",
  "--login-card": "#0d1117",
  "--login-text": "#f4f7fa",
  "--login-border": "#29313a",
  "--login-input-border": "#36404b",
  "--login-input": "#070a0e",
  "--login-secondary": "#121820",
  "--login-green": "#8fffb0",
  "--login-muted": "#7f8b99",
  "--login-copy": "#aab4c0",
  "--login-label": "#c9d1d9",
  "--login-link": "#8cb9ff",
  "--login-shadow": "0 24px 80px #0008",
} as React.CSSProperties;

const lightVariables = {
  "--login-bg": "#eef3f0",
  "--login-card": "#ffffff",
  "--login-text": "#17221b",
  "--login-border": "#ced8d2",
  "--login-input-border": "#c4d0c9",
  "--login-input": "#f8faf9",
  "--login-secondary": "#f1f5f2",
  "--login-green": "#14763a",
  "--login-muted": "#6f7c75",
  "--login-copy": "#596760",
  "--login-label": "#34423a",
  "--login-link": "#2268a9",
  "--login-shadow": "0 24px 70px #50615926",
} as React.CSSProperties;
