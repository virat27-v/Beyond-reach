/* ------------------------------------------------------------------ */
/*  Beyond Reach accounts — created once per Firebase UID.             */
/*                                                                     */
/*  Google authentication proves who the user is; this module          */
/*  initialises the Beyond Reach account itself (profile, role,        */
/*  status, timestamps). Accounts are keyed by Firebase UID, so a       */
/*  returning user always gets the same record and duplicates are       */
/*  impossible. Pure functions + an injectable storage adapter keep it   */
/*  testable.                                                           */
/* ------------------------------------------------------------------ */

export type AccountRole = "customer";
export type AccountStatus = "Active";

export interface BeyondReachAccount {
  /** Stable public ID derived from the Firebase UID. */
  accountId: string;
  uid: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified: boolean;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string;
  provider: "google";
}

export interface AccountInput {
  uid: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified: boolean;
  /** Firebase metadata.creationTime — same on every device. */
  createdAt?: string;
  /** Firebase metadata.lastSignInTime. */
  lastLoginAt?: string;
}

export interface AccountStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const ACCOUNTS_KEY = "beyondreach.accounts.v2";

/** Deterministic account ID from the Firebase UID (BR-XXXXXXXX). */
export function accountIdFromUid(uid: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < uid.length; i++) {
    const c = uid.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  const a = (h1 >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-6);
  const b = (h2 >>> 0).toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `BR-${a}${b}`;
}

function readAll(store: AccountStore | null): Record<string, BeyondReachAccount> {
  if (!store) return {};
  try {
    const raw = store.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, BeyondReachAccount>;
  } catch {
    return {};
  }
}

function writeAll(store: AccountStore | null, accounts: Record<string, BeyondReachAccount>): void {
  if (!store) return;
  try {
    store.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    /* storage full/blocked — the session still works for this tab */
  }
}

export interface ProvisionResult {
  account: BeyondReachAccount;
  isNewUser: boolean;
  persisted: boolean;
}

/**
 * Creates the Beyond Reach account on first Google sign-in and returns the
 * existing one afterwards. Never creates a second record for the same UID.
 */
export function provisionAccount(
  input: AccountInput,
  store: AccountStore | null,
  now: string = new Date().toISOString()
): ProvisionResult {
  const accounts = readAll(store);
  const existing = accounts[input.uid];
  const isNewUser = !existing;

  const account: BeyondReachAccount = existing
    ? {
        ...existing,
        name: input.name || existing.name,
        email: input.email || existing.email,
        picture: input.picture || existing.picture,
        emailVerified: input.emailVerified,
        createdAt: input.createdAt || existing.createdAt,
        lastLoginAt: input.lastLoginAt || now,
      }
    : {
        accountId: accountIdFromUid(input.uid),
        uid: input.uid,
        name: input.name || input.email.split("@")[0] || "Beyond Reach customer",
        email: input.email,
        picture: input.picture,
        emailVerified: input.emailVerified,
        role: "customer",
        status: "Active",
        createdAt: input.createdAt || now,
        lastLoginAt: input.lastLoginAt || now,
        provider: "google",
      };

  accounts[input.uid] = account;
  writeAll(store, accounts);

  let persisted = false;
  if (store) {
    try {
      persisted = store.getItem(ACCOUNTS_KEY) !== null;
    } catch {
      persisted = false;
    }
  }
  return { account, isNewUser, persisted };
}

export function getAccount(uid: string, store: AccountStore | null): BeyondReachAccount | null {
  return readAll(store)[uid] || null;
}
