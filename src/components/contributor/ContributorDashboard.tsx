"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser";
import styles from "./ContributorDashboard.module.css";
import { useContributorTheme } from "./useContributorTheme";

type User = {
  id: string; username: string; recovery_email: string; role: "admin" | "contributor";
  status: string; mail_email: string | null; has_2fa: boolean; mailbox_quota_mb: number;
  daily_send_limit: number; daily_sent_count: number; created_at: number;
  is_task_moderator?: number | boolean;
};
type Session = { id: string; user_agent: string; created_at: number; last_seen_at: number; expires_at: number };
type AuditEvent = { id: string; action: string; detail?: string; created_at: number; actor_username?: string; target_username?: string };
type Address = { email?: string; name?: string };
type Attachment = { attachment_id: string; filename: string; content_type: string; size: number };
type Message = {
  message_id?: string; from?: Address; to?: Address[]; cc?: Address[];
  subject?: string; text?: string; html?: string; timestamp?: string;
  direction?: "inbound" | "outbound"; attachments?: Attachment[]; is_read?: boolean;
};
type Thread = {
  thread_id?: string; id?: string; subject?: string; preview?: string; snippet?: string;
  from?: Address; to?: Address[]; senders?: Address[]; timestamp?: string; received_at?: string;
  updated_at?: string; unread_count?: number; message_count?: number; messages?: Message[];
};
type Folder = "inbox" | "sent" | "archive" | "trash";
type Tab = "mail" | "tasks" | "compose" | "security" | "admin";
type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
type TaskItem = {
  id: string; title: string; description: string; status: TaskStatus;
  priority: "low" | "normal" | "high" | "urgent"; assigned_to: string;
  assignee_username: string; creator_username: string; due_at: number | null;
  created_at: number; updated_at: number; completed_at: number | null; comment_count: number;
};
type TaskComment = { id: string; body: string; created_at: number; author_username: string };
type TaskContributor = { id: string; username: string; mail_email: string | null };
type Passkey = {
  credential_id: string;
  device_name: string;
  created_at: number;
  last_used_at: number | null;
};

const folders: Array<{ id: Folder; label: string; icon: string }> = [
  { id: "inbox", label: "Inbox", icon: "⌂" },
  { id: "sent", label: "Sent", icon: "↗" },
  { id: "archive", label: "Archive", icon: "□" },
  { id: "trash", label: "Trash", icon: "⌫" },
];

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/contributor/${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });
  const text = await response.text();
  let data: Record<string, unknown> = {};
  try { data = text ? JSON.parse(text) as Record<string, unknown> : {}; } catch { /* handled below */ }
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
  return data;
}

function displayAddress(address?: Address) {
  return address?.name || address?.email || "Unknown";
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatBytes(value = 0) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

export default function ContributorDashboard({ initialTab = "mail" }: { initialTab?: string }) {
  const router = useRouter();
  const { theme, toggleTheme } = useContributorTheme();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab === "mail" ? "mail" : "mail");
  const [folder, setFolder] = useState<Folder>("inbox");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [mailLoading, setMailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [replyMode, setReplyMode] = useState<"reply" | "reply-all" | "forward" | null>(null);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [totp, setTotp] = useState<{ secret: string; otpauth: string } | null>(null);
  const qrCanvas = useRef<HTMLCanvasElement>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskContributors, setTaskContributors] = useState<TaskContributor[]>([]);
  const [canManageTasks, setCanManageTasks] = useState(false);
  const [taskScope, setTaskScope] = useState<"mine" | "all">("mine");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);

  const loadThreads = useCallback(async (targetFolder: Folder, search = "") => {
    setMailLoading(true);
    try {
      const params = new URLSearchParams({ folder: targetFolder });
      if (search.trim()) params.set("q", search.trim());
      const result = await request(`mail/threads?${params}`);
      const payload = result.data as { threads?: Thread[] };
      setThreads(payload?.threads ?? []);
    } finally {
      setMailLoading(false);
    }
  }, []);

  useEffect(() => {
    request("me")
      .then(async (data) => {
        const account = data.user as User;
        setUser(account);
        if (account.status === "approved" && account.mail_email) await loadThreads("inbox");
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [loadThreads, router]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!totp?.otpauth || !qrCanvas.current) return;
    QRCode.toCanvas(qrCanvas.current, totp.otpauth, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#071009", light: "#ffffff" },
    }).catch(() => setError("Could not render the authenticator QR code."));
  }, [totp]);

  const messages = useMemo(() => selected?.messages ?? [], [selected]);
  const selectedId = selected?.thread_id ?? selected?.id;
  const lastMessage = messages[messages.length - 1];

  async function chooseFolder(next: Folder) {
    setFolder(next);
    setTab("mail");
    setSelected(null);
    setReplyMode(null);
    setQuery("");
    try { await loadThreads(next); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load mail"); }
  }

  async function openThread(thread: Thread) {
    setSelected(thread);
    setReplyMode(null);
    const id = thread.thread_id ?? thread.id;
    if (!id) return;
    try {
      const data = await request(`mail/thread?id=${encodeURIComponent(id)}`);
      setSelected(data.data as Thread);
      if ((thread.unread_count ?? 0) > 0) {
        await request("mail/thread-action", {
          method: "POST", body: JSON.stringify({ threadId: id, action: "read" }),
        });
        setThreads((current) => current.map((item) =>
          (item.thread_id ?? item.id) === id ? { ...item, unread_count: 0 } : item));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load conversation");
    }
  }

  async function threadAction(action: "archive" | "trash" | "restore" | "delete" | "read" | "unread") {
    if (!selectedId || actionBusy) return;
    if (action === "delete" && !window.confirm("Permanently delete this conversation? This cannot be undone.")) return;
    setActionBusy(true);
    try {
      await request("mail/thread-action", {
        method: "POST",
        body: JSON.stringify({ threadId: selectedId, action }),
      });
      setSelected(null);
      setReplyMode(null);
      setNotice(action === "delete" ? "Conversation permanently deleted." : `Conversation ${action}d.`);
      await loadThreads(folder, query);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Mail action failed");
    } finally {
      setActionBusy(false);
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    try {
      await request("mail/send", {
        method: "POST",
        body: JSON.stringify({
          to: String(data.get("to") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          cc: String(data.get("cc") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          subject: data.get("subject"),
          text: data.get("text"),
        }),
      });
      form.reset();
      setNotice("Message sent.");
      await chooseFolder("sent");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Send failed");
    }
  }

  async function sendResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!replyMode || !lastMessage?.message_id) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await request(`mail/${replyMode}`, {
        method: "POST",
        body: JSON.stringify({
          messageId: lastMessage.message_id,
          to: String(data.get("to") ?? "").split(",").map((value) => value.trim()).filter(Boolean),
          text: data.get("text"),
        }),
      });
      setReplyMode(null);
      setNotice("Message sent.");
      if (selected) await openThread(selected);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Send failed");
    }
  }

  async function downloadAttachment(messageId: string, attachment: Attachment) {
    try {
      const data = await request(`mail/attachment?message=${encodeURIComponent(messageId)}&attachment=${encodeURIComponent(attachment.attachment_id)}`);
      const payload = data.data as { url?: string };
      if (payload?.url) window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Attachment download failed");
    }
  }

  async function loadAdmin() {
    try {
      const [usersData, auditData] = await Promise.all([request("admin/users"), request("admin/audit")]);
      setAdminUsers(usersData.users as User[]);
      setAuditEvents(auditData.events as AuditEvent[]);
      setTab("admin");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load contributors"); }
  }

  async function loadTasks(scope: "mine" | "all" = taskScope) {
    try {
      const data = await request(`tasks?scope=${scope}`) as {
        tasks?: TaskItem[]; contributors?: TaskContributor[]; canManage?: boolean;
      };
      setTasks(data.tasks ?? []);
      setTaskContributors(data.contributors ?? []);
      setCanManageTasks(Boolean(data.canManage));
      setTaskScope(scope);
      setTab("tasks");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load tasks");
    }
  }

  async function openTask(task: TaskItem) {
    setSelectedTask(task);
    try {
      const data = await request(`tasks/comments?id=${encodeURIComponent(task.id)}`);
      setTaskComments((data.comments ?? []) as TaskComment[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load task discussion");
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      await request("tasks/create", {
        method: "POST",
        body: JSON.stringify({
          title: data.get("title"),
          description: data.get("description"),
          assignedTo: data.get("assignedTo"),
          priority: data.get("priority"),
          dueAt: data.get("dueAt") || null,
        }),
      });
      form.reset();
      setNotice("Task assigned.");
      await loadTasks(taskScope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create task");
    }
  }

  async function updateTaskStatus(task: TaskItem, status: TaskStatus) {
    try {
      await request("tasks/status", {
        method: "POST", body: JSON.stringify({ taskId: task.id, status }),
      });
      setNotice(status === "done" ? "Task completed." : "Task status updated.");
      setSelectedTask((current) => current?.id === task.id ? { ...current, status } : current);
      await loadTasks(taskScope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update task");
    }
  }

  async function addTaskComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask) return;
    const form = event.currentTarget;
    const comment = new FormData(form).get("comment");
    try {
      await request("tasks/comment", {
        method: "POST", body: JSON.stringify({ taskId: selectedTask.id, comment }),
      });
      form.reset();
      await openTask(selectedTask);
      await loadTasks(taskScope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not add comment");
    }
  }

  async function deleteTask(task: TaskItem) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    try {
      await request("tasks/delete", {
        method: "POST", body: JSON.stringify({ taskId: task.id }),
      });
      setSelectedTask(null);
      setNotice("Task deleted.");
      await loadTasks(taskScope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete task");
    }
  }

  async function openSecurity() {
    setTab("security");
    try {
      const [sessionData, passkeyData] = await Promise.all([
        request("sessions"),
        request("passkeys"),
      ]);
      setSessions(sessionData.sessions as Session[]);
      setPasskeys(passkeyData.passkeys as Passkey[]);
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load sessions"); }
  }

  async function addPasskey() {
    if (!browserSupportsWebAuthn()) {
      setError("This browser does not support passkeys.");
      return;
    }
    setPasskeyBusy(true);
    setError("");
    try {
      const start = await request("passkey/register-options", { method: "POST", body: "{}" }) as {
        options?: Parameters<typeof startRegistration>[0]["optionsJSON"];
        challengeId?: string;
      };
      if (!start.options || !start.challengeId) throw new Error("Could not start passkey setup");
      const credential = await startRegistration({ optionsJSON: start.options });
      const deviceName = window.prompt("Name this passkey", "My device")?.trim() || "My device";
      const result = await request("passkey/register-verify", {
        method: "POST",
        body: JSON.stringify({
          challengeId: start.challengeId,
          response: credential,
          deviceName,
        }),
      });
      setPasskeys(result.passkeys as Passkey[]);
      setNotice("Passkey added. You can now sign in without your password.");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Passkey setup failed";
      setError(/not allowed|cancel|abort/i.test(message) ? "Passkey setup was cancelled." : message);
    } finally {
      setPasskeyBusy(false);
    }
  }

  async function removePasskey(credentialId: string) {
    if (!window.confirm("Remove this passkey? You will no longer be able to sign in with it.")) return;
    try {
      const result = await request("passkeys/delete", {
        method: "POST",
        body: JSON.stringify({ credentialId }),
      });
      setPasskeys(result.passkeys as Passkey[]);
      setNotice("Passkey removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove passkey");
    }
  }

  async function revokeSession(sessionId: string) {
    await request("sessions/revoke", { method: "POST", body: JSON.stringify({ sessionId }) });
    await openSecurity();
  }

  async function adminAction(userId: string, action: string) {
    try {
      await request("admin/user", { method: "POST", body: JSON.stringify({ userId, action }) });
      await loadAdmin();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Admin action failed"); }
  }

  async function begin2fa() {
    try { setTotp(await request("2fa/setup", { method: "POST", body: "{}" }) as { secret: string; otpauth: string }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not begin setup"); }
  }

  async function enable2fa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = await request("2fa/enable", {
        method: "POST", body: JSON.stringify({ code: new FormData(event.currentTarget).get("code") }),
      });
      setRecoveryCodes(data.recoveryCodes as string[]);
      setTotp(null);
      setUser((current) => current ? { ...current, has_2fa: true } : current);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not enable 2FA"); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const result = await request("password/change", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      form.reset();
      setNotice(String(result.message ?? "Password updated."));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update password");
    }
  }

  async function logout() {
    await request("logout", { method: "POST", body: "{}" });
    router.replace("/login"); router.refresh();
  }

  if (loading) return <main className={styles.loading}>Opening your mailbox…</main>;
  if (!user) return null;

  return (
    <main className={`${styles.shell} ${theme === "light" ? styles.light : ""}`}>
      <header className={styles.header}>
        <div className={styles.wordmark}><Link href="/">GRID</Link><span>MAIL</span></div>
        <div className={styles.account}>
          <span className={styles.onlineDot} /> <span>{user.mail_email ?? `@${user.username}`}</span>
          <button onClick={toggleTheme} className={styles.themeButton} title={`Use ${theme === "dark" ? "light" : "dark"} theme`}>
            <span aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button onClick={logout} className={styles.headerButton}>Sign out</button>
        </div>
      </header>

      <div className={styles.app}>
        <aside className={styles.sidebar}>
          <button className={styles.composeButton} onClick={() => setTab("compose")}><span>＋</span> Compose</button>
          <nav className={styles.folderNav}>
            {folders.slice(0, 1).map((item) => (
              <button key={item.id} onClick={() => chooseFolder(item.id)}
                className={tab === "mail" && folder === item.id ? styles.folderActive : styles.folderButton}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
            <button onClick={() => loadTasks("mine")} className={tab === "tasks" ? styles.folderActive : styles.folderButton}>
              <span>✓</span>Tasks
            </button>
            {folders.slice(1).map((item) => (
              <button key={item.id} onClick={() => chooseFolder(item.id)}
                className={tab === "mail" && folder === item.id ? styles.folderActive : styles.folderButton}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className={styles.sideDivider} />
          <button className={tab === "security" ? styles.folderActive : styles.folderButton} onClick={openSecurity}>
            <span>◇</span>Security
          </button>
          {user.role === "admin" && (
            <button className={tab === "admin" ? styles.folderActive : styles.folderButton} onClick={loadAdmin}>
              <span>⌘</span>Contributors
            </button>
          )}
          <div className={styles.accountCard}>
            <div><span>STORAGE</span><strong>1 GB</strong></div>
            <div className={styles.meter}><i /></div>
            <small>{user.daily_sent_count} of {user.daily_send_limit} sent today</small>
          </div>
        </aside>

        <section className={styles.content}>
          {error && <div className={styles.toastError} role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
          {notice && <div className={styles.toast} role="status">{notice}</div>}

          {tab === "mail" && (
            <div className={styles.mail}>
              <section className={`${styles.threadPane} ${selected ? styles.threadPaneHiddenMobile : ""}`}>
                <div className={styles.listHeader}>
                  <div><p>MAILBOX</p><h1>{folders.find((item) => item.id === folder)?.label}</h1></div>
                  <button title="Refresh" onClick={() => loadThreads(folder, query)}>↻</button>
                </div>
                <form className={styles.search} onSubmit={(event) => {
                  event.preventDefault(); loadThreads(folder, query).catch((reason) => setError(reason.message));
                }}>
                  <span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" />
                </form>
                <div className={styles.threadScroll}>
                  {mailLoading && <div className={styles.listStatus}>Syncing mail…</div>}
                  {!mailLoading && threads.length === 0 && <div className={styles.listStatus}>Nothing here yet.</div>}
                  {threads.map((thread) => {
                    const id = thread.thread_id ?? thread.id ?? "";
                    const sender = folder === "sent" ? thread.to?.[0] : (thread.from ?? thread.senders?.[0]);
                    const unread = (thread.unread_count ?? 0) > 0;
                    return (
                      <button key={id} onClick={() => openThread(thread)}
                        className={`${styles.thread} ${selectedId === id ? styles.threadSelected : ""} ${unread ? styles.threadUnread : ""}`}>
                        <span className={styles.avatar}>{displayAddress(sender).slice(0, 1).toUpperCase()}</span>
                        <span className={styles.threadCopy}>
                          <span className={styles.threadTop}><strong>{displayAddress(sender)}</strong><time>{formatDate(thread.timestamp ?? thread.updated_at ?? thread.received_at)}</time></span>
                          <span className={styles.subject}>{thread.subject || "(no subject)"}{(thread.message_count ?? 1) > 1 ? ` · ${thread.message_count}` : ""}</span>
                          <span className={styles.preview}>{thread.preview || thread.snippet || "No preview"}</span>
                        </span>
                        {unread && <i className={styles.unreadDot} />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <article className={`${styles.reader} ${selected ? styles.readerOpenMobile : ""}`}>
                {!selected && (
                  <div className={styles.emptyReader}><div>✦</div><h2>Your inbox, uninterrupted.</h2><p>Select a conversation to read it here.</p></div>
                )}
                {selected && (
                  <>
                    <div className={styles.readerToolbar}>
                      <button className={styles.backMobile} onClick={() => setSelected(null)}>←</button>
                      {folder === "trash" ? (
                        <>
                          <button onClick={() => threadAction("restore")} disabled={actionBusy}>Restore</button>
                          <button className={styles.dangerButton} onClick={() => threadAction("delete")} disabled={actionBusy}>Delete forever</button>
                        </>
                      ) : (
                        <>
                          {folder !== "archive" && <button onClick={() => threadAction("archive")} disabled={actionBusy}>Archive</button>}
                          {folder === "archive" && <button onClick={() => threadAction("restore")} disabled={actionBusy}>Move to inbox</button>}
                          <button onClick={() => threadAction("unread")} disabled={actionBusy}>Mark unread</button>
                          <button className={styles.iconDanger} onClick={() => threadAction("trash")} disabled={actionBusy}>Trash</button>
                        </>
                      )}
                    </div>
                    <div className={styles.readerBody}>
                      <div className={styles.subjectBlock}>
                        <p>{folder.toUpperCase()}</p>
                        <h1>{selected.subject || "(no subject)"}</h1>
                        <span>{messages.length} message{messages.length === 1 ? "" : "s"}</span>
                      </div>
                      {messages.map((message, index) => (
                        <section key={message.message_id ?? index} className={styles.message}>
                          <div className={styles.messageHead}>
                            <span className={styles.avatar}>{displayAddress(message.from).slice(0, 1).toUpperCase()}</span>
                            <div><strong>{displayAddress(message.from)}</strong><small>to {message.to?.map(displayAddress).join(", ") || "you"}</small></div>
                            <time>{new Date(message.timestamp ?? "").toLocaleString()}</time>
                          </div>
                          <div className={styles.messageText}>{message.text || "This message contains HTML content."}</div>
                          {(message.attachments?.length ?? 0) > 0 && (
                            <div className={styles.attachments}>
                              {message.attachments?.map((attachment) => (
                                <button key={attachment.attachment_id} onClick={() => message.message_id && downloadAttachment(message.message_id, attachment)}>
                                  <span>↓</span><span><strong>{attachment.filename}</strong><small>{formatBytes(attachment.size)}</small></span>
                                </button>
                              ))}
                            </div>
                          )}
                        </section>
                      ))}
                      {folder !== "trash" && lastMessage && (
                        <div className={styles.responseArea}>
                          {!replyMode ? (
                            <div className={styles.responseButtons}>
                              <button onClick={() => setReplyMode("reply")}>↩ Reply</button>
                              <button onClick={() => setReplyMode("reply-all")}>↩ Reply all</button>
                              <button onClick={() => setReplyMode("forward")}>→ Forward</button>
                            </div>
                          ) : (
                            <form onSubmit={sendResponse} className={styles.inlineCompose}>
                              <div><strong>{replyMode === "forward" ? "Forward message" : replyMode === "reply-all" ? "Reply all" : "Reply"}</strong>
                                <button type="button" onClick={() => setReplyMode(null)}>×</button></div>
                              {replyMode === "forward" && <input name="to" type="text" placeholder="Recipient email" required />}
                              <textarea name="text" rows={7} placeholder="Write your message…" required autoFocus />
                              <button className={styles.sendButton}>Send</button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </article>
            </div>
          )}

          {tab === "compose" && (
            <div className={styles.pagePanel}>
              <div className={styles.pageTitle}><p>NEW MESSAGE</p><h1>Compose</h1></div>
              <form onSubmit={send} className={styles.compose}>
                <label>To<input name="to" type="text" placeholder="person@example.com, another@example.com" required /></label>
                <label>Cc<input name="cc" type="text" placeholder="Optional" /></label>
                <label>Subject<input name="subject" required /></label>
                <textarea name="text" required rows={16} placeholder="Write something worth reading…" />
                <div className={styles.composeFooter}><span>From {user.mail_email}</span><button className={styles.sendButton}>Send message ↗</button></div>
              </form>
            </div>
          )}

          {tab === "tasks" && (
            <div className={styles.pagePanel}>
              <div className={styles.taskTitleRow}>
                <div className={styles.pageTitle}><p>ASSIGNMENTS</p><h1>Tasks</h1><span>Keep contributor work visible and moving.</span></div>
                {canManageTasks && <div className={styles.scopeToggle}>
                  <button className={taskScope === "mine" ? styles.scopeActive : ""} onClick={() => loadTasks("mine")}>My tasks</button>
                  <button className={taskScope === "all" ? styles.scopeActive : ""} onClick={() => loadTasks("all")}>All tasks</button>
                </div>}
              </div>
              {canManageTasks && (
                <form onSubmit={createTask} className={styles.taskComposer}>
                  <input name="title" placeholder="What needs to be done?" maxLength={160} required />
                  <select name="assignedTo" required defaultValue=""><option value="" disabled>Assign contributor</option>
                    {taskContributors.map((entry) => <option key={entry.id} value={entry.id}>{entry.username}</option>)}
                  </select>
                  <select name="priority" defaultValue="normal"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select>
                  <input name="dueAt" type="datetime-local" />
                  <textarea name="description" placeholder="Details, links, acceptance criteria…" rows={3} />
                  <button className={styles.sendButton}>Assign task</button>
                </form>
              )}
              <div className={styles.taskLayout}>
                <section className={styles.taskBoard}>
                  {(["todo", "in_progress", "blocked", "done"] as TaskStatus[]).map((status) => {
                    const statusTasks = tasks.filter((task) => task.status === status);
                    return <div key={status} className={styles.taskColumn}>
                      <header><span>{status === "todo" ? "TO DO" : status === "in_progress" ? "IN PROGRESS" : status.toUpperCase()}</span><b>{statusTasks.length}</b></header>
                      {statusTasks.map((task) => <button key={task.id} onClick={() => openTask(task)} className={`${styles.taskCard} ${selectedTask?.id === task.id ? styles.taskCardActive : ""}`}>
                        <span className={`${styles.priority} ${styles[`priority_${task.priority}`]}`}>{task.priority}</span>
                        <strong>{task.title}</strong>
                        <small>{task.description || "No description"}</small>
                        <footer><span>@{task.assignee_username}</span><span>{task.due_at ? new Date(task.due_at).toLocaleDateString() : "No due date"}</span></footer>
                        {task.comment_count > 0 && <i>◌ {task.comment_count}</i>}
                      </button>)}
                    </div>;
                  })}
                </section>
                {selectedTask && <aside className={styles.taskDetail}>
                  <div className={styles.taskDetailHead}><div><span className={`${styles.priority} ${styles[`priority_${selectedTask.priority}`]}`}>{selectedTask.priority}</span><h2>{selectedTask.title}</h2></div><button onClick={() => setSelectedTask(null)}>×</button></div>
                  <p>{selectedTask.description || "No description provided."}</p>
                  <dl><div><dt>Assigned to</dt><dd>@{selectedTask.assignee_username}</dd></div><div><dt>Assigned by</dt><dd>@{selectedTask.creator_username}</dd></div><div><dt>Due</dt><dd>{selectedTask.due_at ? new Date(selectedTask.due_at).toLocaleString() : "No due date"}</dd></div></dl>
                  <label>Status<select value={selectedTask.status} onChange={(event) => updateTaskStatus(selectedTask, event.target.value as TaskStatus)}>
                    <option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option>
                  </select></label>
                  <div className={styles.taskComments}><h3>Discussion</h3>{taskComments.map((comment) => <article key={comment.id}><strong>@{comment.author_username}</strong><time>{new Date(comment.created_at).toLocaleString()}</time><p>{comment.body}</p></article>)}
                    <form onSubmit={addTaskComment}><textarea name="comment" rows={3} placeholder="Add an update…" required /><button className={styles.sendButton}>Comment</button></form>
                  </div>
                  {canManageTasks && <button className={styles.deleteTask} onClick={() => deleteTask(selectedTask)}>Delete task</button>}
                </aside>}
              </div>
            </div>
          )}

          {tab === "security" && (
            <div className={styles.pagePanel}>
              <div className={styles.pageTitle}><p>ACCOUNT</p><h1>Security</h1><span>Protect your mailbox and review signed-in devices.</span></div>
              <section className={styles.settingsCard}>
                <h2>Password</h2>
                <p>Add or replace the password used to sign in to your GRID account.</p>
                <form onSubmit={changePassword} className={styles.securityForm}>
                  <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} placeholder="New password" required />
                  <input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} placeholder="Confirm new password" required />
                  <button className={styles.sendButton}>Save password</button>
                </form>
              </section>
              <section className={styles.settingsCard}>
                <div className={styles.settingHeader}>
                  <div><h2>Passkeys</h2><p>Sign in with Face ID, Touch ID, Windows Hello, or a hardware security key.</p></div>
                  <button className={styles.sendButton} disabled={passkeyBusy} onClick={addPasskey}>
                    {passkeyBusy ? "Waiting for device…" : "Add passkey"}
                  </button>
                </div>
                {passkeys.length === 0 && <p className={styles.emptySetting}>No passkeys registered yet.</p>}
                {passkeys.map((passkey) => (
                  <div key={passkey.credential_id} className={styles.passkeyRow}>
                    <span className={styles.passkeyIcon}>◇</span>
                    <div>
                      <strong>{passkey.device_name}</strong>
                      <small>
                        Added {new Date(passkey.created_at).toLocaleDateString()}
                        {passkey.last_used_at ? ` · Last used ${new Date(passkey.last_used_at).toLocaleString()}` : ""}
                      </small>
                    </div>
                    <button onClick={() => removePasskey(passkey.credential_id)}>Remove</button>
                  </div>
                ))}
              </section>
              <section className={styles.settingsCard}>
                <h2>Authenticator app</h2>
                <p>Use 1Password, Apple Passwords, Google Authenticator, Authy, or another TOTP app.</p>
                {!user.has_2fa && !totp && <button className={styles.sendButton} onClick={begin2fa}>Set up authenticator</button>}
                {user.has_2fa && <div className={styles.successBadge}>✓ Two-factor authentication is active</div>}
                {totp && <form onSubmit={enable2fa} className={styles.securityForm}>
                  <div className={styles.qrSetup}>
                    <div className={styles.qrFrame}>
                      <canvas ref={qrCanvas} aria-label="Authenticator setup QR code" />
                    </div>
                    <div>
                      <h3>Scan this QR code</h3>
                      <p>Open your authenticator app, add a new account, and scan the code.</p>
                      <details>
                        <summary>Can&apos;t scan it?</summary>
                        <p>Enter this setup key manually:</p>
                        <code>{totp.secret}</code>
                      </details>
                    </div>
                  </div>
                  <label className={styles.codeLabel}>Enter the six-digit code from your app
                    <input name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="000000" required />
                  </label>
                  <button className={styles.sendButton}>Verify and enable 2FA</button>
                </form>}
                {recoveryCodes.length > 0 && <pre className={styles.recovery}>{recoveryCodes.join("\n")}</pre>}
              </section>
              <section className={styles.settingsCard}><h2>Active sessions</h2>
                {sessions.map((session) => <div key={session.id} className={styles.session}><div><strong>{session.user_agent || "Unknown device"}</strong><small>Last active {new Date(session.last_seen_at).toLocaleString()}</small></div><button onClick={() => revokeSession(session.id)}>Revoke</button></div>)}
              </section>
            </div>
          )}

          {tab === "admin" && user.role === "admin" && (
            <div className={styles.pagePanel}>
              <div className={styles.pageTitle}><p>ADMINISTRATION</p><h1>Contributors</h1><span>Approve access, provision mailboxes, and review security events.</span></div>
              <section className={styles.settingsCard}>
                <div className={styles.tableWrap}><table><thead><tr><th>User</th><th>Recovery</th><th>Status</th><th>Mailbox</th><th>Action</th></tr></thead>
                  <tbody>{adminUsers.map((entry) => <tr key={entry.id}><td><strong>{entry.username}</strong>{entry.role === "admin" && <small>ADMIN</small>}{Boolean(entry.is_task_moderator) && <small>TASK MOD</small>}</td><td>{entry.recovery_email}</td><td><span className={styles.statusPill}>{entry.status}</span></td><td>{entry.mail_email || "—"}</td><td className={styles.actions}>
                    {entry.status === "pending_approval" && <><button onClick={() => adminAction(entry.id, "approve")}>Approve</button><button onClick={() => adminAction(entry.id, "reject")}>Reject</button></>}
                    {entry.status === "approved" && !entry.mail_email && <button onClick={() => adminAction(entry.id, "provision")}>Activate mailbox</button>}
                    {entry.status === "approved" && entry.id !== user.id && <button onClick={() => adminAction(entry.id, "suspend")}>Suspend</button>}
                    {entry.status === "suspended" && <button onClick={() => adminAction(entry.id, "restore")}>Restore</button>}
                    {entry.status === "approved" && entry.role !== "admin" && !entry.is_task_moderator && <button onClick={() => adminAction(entry.id, "grant_task_moderator")}>Make task mod</button>}
                    {entry.is_task_moderator && <button onClick={() => adminAction(entry.id, "revoke_task_moderator")}>Remove task mod</button>}
                  </td></tr>)}</tbody></table></div>
              </section>
              <section className={styles.settingsCard}><h2>Security audit</h2>
                <div className={styles.tableWrap}><table><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Target</th></tr></thead>
                  <tbody>{auditEvents.map((event) => <tr key={event.id}><td>{new Date(event.created_at).toLocaleString()}</td><td>{event.action}</td><td>{event.actor_username || "system"}</td><td>{event.target_username || "—"}</td></tr>)}</tbody></table></div>
              </section>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
