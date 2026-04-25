/**
 * Mock auth service backing the hybrid SMS / WhatsApp OTP flow.
 *
 * Account records live in localStorage (persist across reloads).
 * OTP, reset tokens, and session state live in sessionStorage.
 * The passwordHash is a base64-only placeholder — swap for argon2id server-side.
 */

export type Channel = "sms" | "whatsapp";
export type OtpPurpose = "signup" | "login" | "reset";

const ACCOUNTS_KEY = "nativeid_accounts";
const OTP_KEY = "nativeid_otp";
const OTP_ATTEMPTS_KEY = "nativeid_otp_attempts";
const RESET_KEY = "nativeid_reset_token";
const SESSION_KEY = "nativeid_session";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Account = {
  phone: string;
  passwordHash?: string;
  marketingOptIn?: boolean;
  createdAt: number;
};

const MARKETING_OPT_IN_KEY = "nativeid_marketing_opt_in";

export type OtpState = {
  phone: string;
  channel: Channel;
  code: string;
  sentAt: number;
  expiresAt: number;
  purpose: OtpPurpose;
};

type ResetToken = {
  phone: string;
  expiresAt: number;
};

function loadAccounts(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAccounts(a: Record<string, Account>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatPhone(raw: string): string {
  const d = normalizePhone(raw);
  if (d.length < 4) return `+234 ${d}`;
  return `+234 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`.trim();
}

export function accountExists(phone: string): boolean {
  return !!loadAccounts()[normalizePhone(phone)];
}

export function hasPassword(phone: string): boolean {
  return !!loadAccounts()[normalizePhone(phone)]?.passwordHash;
}

export function ensureAccount(phone: string): Account {
  const p = normalizePhone(phone);
  const accounts = loadAccounts();
  const isNew = !accounts[p];
  if (isNew) {
    accounts[p] = { phone: p, createdAt: Date.now() };
  }
  // Marketing opt-in is captured on the signup screen and stashed in
  // sessionStorage. Apply it on first account creation, then clear so a later
  // login doesn't accidentally inherit a stale signup choice.
  const stash = sessionStorage.getItem(MARKETING_OPT_IN_KEY);
  if (isNew && stash !== null) {
    accounts[p].marketingOptIn = stash === "1";
  }
  if (stash !== null) sessionStorage.removeItem(MARKETING_OPT_IN_KEY);
  saveAccounts(accounts);
  return accounts[p];
}

export function sendOtp(phone: string, channel: Channel, purpose: OtpPurpose): OtpState {
  const p = normalizePhone(phone);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const state: OtpState = {
    phone: p,
    channel,
    code,
    sentAt: now,
    expiresAt: now + OTP_TTL_MS,
    purpose,
  };
  sessionStorage.setItem(OTP_KEY, JSON.stringify(state));
  sessionStorage.removeItem(OTP_ATTEMPTS_KEY);
  return state;
}

export function currentOtp(): OtpState | null {
  try {
    const raw = sessionStorage.getItem(OTP_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as OtpState;
    if (Date.now() >= s.expiresAt) {
      sessionStorage.removeItem(OTP_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export type VerifyReason = "expired" | "locked" | "mismatch" | "ok";

export type VerifyResult = {
  ok: boolean;
  reason: VerifyReason;
  attemptsLeft: number;
};

export function verifyOtp(input: string): VerifyResult {
  const state = currentOtp();
  if (!state) return { ok: false, reason: "expired", attemptsLeft: 0 };

  const attempts = Number(sessionStorage.getItem(OTP_ATTEMPTS_KEY) || "0");
  if (attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "locked", attemptsLeft: 0 };
  }

  if (input === state.code) {
    sessionStorage.removeItem(OTP_KEY);
    sessionStorage.removeItem(OTP_ATTEMPTS_KEY);
    return { ok: true, reason: "ok", attemptsLeft: MAX_ATTEMPTS - attempts };
  }

  const next = attempts + 1;
  sessionStorage.setItem(OTP_ATTEMPTS_KEY, String(next));
  return {
    ok: false,
    reason: next >= MAX_ATTEMPTS ? "locked" : "mismatch",
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - next),
  };
}

export function issueResetToken(phone: string) {
  const token: ResetToken = {
    phone: normalizePhone(phone),
    expiresAt: Date.now() + RESET_TTL_MS,
  };
  sessionStorage.setItem(RESET_KEY, JSON.stringify(token));
}

export function resetTokenValidFor(phone: string): boolean {
  try {
    const raw = sessionStorage.getItem(RESET_KEY);
    if (!raw) return false;
    const t = JSON.parse(raw) as ResetToken;
    return t.phone === normalizePhone(phone) && Date.now() < t.expiresAt;
  } catch {
    return false;
  }
}

export function consumeResetToken(phone: string): boolean {
  const ok = resetTokenValidFor(phone);
  if (ok) sessionStorage.removeItem(RESET_KEY);
  return ok;
}

export function setPassword(phone: string, password: string) {
  const p = normalizePhone(phone);
  const accounts = loadAccounts();
  if (!accounts[p]) accounts[p] = { phone: p, createdAt: Date.now() };
  accounts[p].passwordHash = btoa(password);
  saveAccounts(accounts);
}

export function verifyPassword(phone: string, password: string): boolean {
  const a = loadAccounts()[normalizePhone(phone)];
  return !!a?.passwordHash && a.passwordHash === btoa(password);
}

export function signIn() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function signOut() {
  sessionStorage.removeItem(SESSION_KEY);
}

export type PasswordScore = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: { label: string; passed: boolean }[];
};

export function scorePassword(pw: string): PasswordScore {
  const checks = [
    { label: "8+ characters", passed: pw.length >= 8 },
    { label: "A number", passed: /\d/.test(pw) },
    { label: "Upper & lower case", passed: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: "A symbol (recommended)", passed: /[^A-Za-z0-9]/.test(pw) },
  ];
  let score = checks.filter((c) => c.passed).length;
  if (pw.length >= 12) score = Math.min(4, score + 1);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  return { score: clamped, label: labels[clamped], checks };
}
