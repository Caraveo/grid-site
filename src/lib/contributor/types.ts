export type ContributorRole = "admin" | "contributor";
export type ContributorStatus =
  | "pending_email"
  | "pending_approval"
  | "approved"
  | "suspended"
  | "rejected";

export type ContributorUser = {
  id: string;
  username: string;
  recovery_email: string;
  password_hash: string;
  role: ContributorRole;
  status: ContributorStatus;
  email_verified_at: number | null;
  approved_at: number | null;
  approved_by: string | null;
  mail_inbox_id: string | null;
  mail_email: string | null;
  totp_secret_encrypted: string | null;
  totp_enabled_at: number | null;
  failed_login_count: number;
  locked_until: number | null;
  mailbox_quota_mb: number;
  daily_send_limit: number;
  daily_sent_count: number;
  daily_sent_date: string | null;
  created_at: number;
  updated_at: number;
};

export type PublicContributor = Omit<
  ContributorUser,
  "password_hash" | "totp_secret_encrypted"
> & {
  has_2fa: boolean;
};

export function publicContributor(user: ContributorUser): PublicContributor {
  const { password_hash: _password, totp_secret_encrypted: _totp, ...safe } = user;
  void _password;
  void _totp;
  return { ...safe, has_2fa: Boolean(user.totp_enabled_at) };
}
