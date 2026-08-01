import { ContributorError } from "./db";

function mailConfig(): { url: string; secret: string } {
  const url = process.env.AWS_MAIL_API_URL?.trim().replace(/\/+$/, "");
  const secret = process.env.AWS_MAIL_API_SECRET?.trim();
  if (!url || !secret) {
    throw new ContributorError(503, "AWS mail service is not configured");
  }
  return { url, secret };
}

export async function awsMailRequest<T>(
  path: string,
  mailbox: string,
  init: RequestInit = {},
): Promise<T> {
  const config = mailConfig();
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      "X-Grid-Mail-Secret": config.secret,
      "X-Grid-Mailbox": mailbox,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.error(JSON.stringify({
      event: "aws_mail_error",
      status: response.status,
      path,
      detail,
    }));
    throw new ContributorError(
      response.status === 429 ? 429 : response.status === 400 ? 400 : 502,
      response.status === 429
        ? "Mail service rate limit reached"
        : "Mail service request failed",
    );
  }
  return response.json() as Promise<T>;
}

export async function provisionInbox(user: {
  id: string;
  username: string;
}): Promise<{ inbox_id: string; email: string }> {
  const domain = process.env.MAIL_DOMAIN?.trim() || "gridmail.dev";
  const email = `${user.username}@${domain}`;
  return { inbox_id: email, email };
}

export async function sendSystemEmail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const mailbox = process.env.MAIL_SYSTEM_SENDER?.trim() || "hi@gridmail.dev";
  if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.AWS_MAIL_API_URL || !process.env.AWS_MAIL_API_SECRET)
  ) {
    console.info(JSON.stringify({ event: "dev_system_email", ...input }));
    return;
  }
  await awsMailRequest("/send", mailbox, {
    method: "POST",
    body: JSON.stringify({
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });
}

