import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAdditionalUserInfo,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from "firebase/auth";
import { provisionAccount, type AccountStore, type BeyondReachAccount } from "./accounts";
import { BUILD_ID } from "./build";

/* ==================================================================== */
/*  Beyond Reach — Google authentication (rebuilt).                    */
/*                                                                      */
/*  One Firebase app. One Auth instance. One state listener.            */
/*  Desktop  → signInWithPopup                                          */
/*  Mobile / tablets / installed PWA / embedded webview                 */
/*           → signInWithRedirect + getRedirectResult                   */
/*  Persistence and resolver classes are imported directly and passed   */
/*  to initializeAuth, so the SDK never has to look a class up at        */
/*  runtime (the source of "Expected a class definition").              */
/* ==================================================================== */

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

const REQUIRED = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

export const missingEnv: string[] = REQUIRED.filter((k) => {
  const v = (env as Record<string, unknown>)[k];
  return typeof v !== "string" || !v.trim();
});

export const firebaseConfigured = missingEnv.length === 0;

/* ------------------------------ types ------------------------------- */

export type AuthFlow = "popup" | "redirect" | "restored" | "none";

export interface AuthIssue {
  code: string;
  message: string;
  stack?: string;
  flow: AuthFlow;
  at: string;
}

export interface AuthUser extends BeyondReachAccount {
  /** Alias kept for existing UI code. */
  lastSignInAt: string;
  isNewUser: boolean;
}

type Listener = (user: AuthUser | null) => void;

/* ------------------------- local account store ---------------------- */

function safeStorage(): AccountStore | null {
  try {
    const s = window.localStorage;
    const probe = "__br__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/* --------------------------- Firebase init -------------------------- */

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function createAuth(): Auth | null {
  if (!firebaseConfigured) return null;
  if (firebaseAuth) return firebaseAuth;
  try {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
    try {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence],
        popupRedirectResolver: browserPopupRedirectResolver,
      });
    } catch (error) {
      // Only expected when Auth was already initialised (e.g. HMR).
      if ((error as { code?: string })?.code === "auth/already-initialized") {
        firebaseAuth = getAuth(firebaseApp);
      } else {
        throw error;
      }
    }
    logDiagnostic("auth:ready", diagnostics());
    return firebaseAuth;
  } catch (error) {
    firebaseAuth = null;
    logDiagnostic("auth:init-failed", describe(error));
    return null;
  }
}

/* --------------------------- environment ---------------------------- */

export function isMobileOrEmbedded(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const mobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|Mobile|BlackBerry|Opera Mobi|CriOS|FxiOS/i.test(ua);
  const iPadDesktopMode = /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  const narrow = window.matchMedia?.("(max-width: 767px)")?.matches ?? false;
  const touch = navigator.maxTouchPoints > 0 && (window.matchMedia?.("(pointer: coarse)")?.matches ?? false);
  return mobileUa || iPadDesktopMode || narrow || touch;
}

export function isEmbeddedBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|Twitter|LinkedInApp|Snapchat|Pinterest|TikTok|musical_ly|; wv\)/i.test(
    navigator.userAgent || ""
  );
}

/* ------------------------------- errors ----------------------------- */

const lastErrorKey = "beyondreach.lastAuthError";

export function describe(error: unknown): { code: string; message: string; stack?: string } {
  const e = (typeof error === "object" && error !== null ? error : {}) as {
    code?: string;
    message?: string;
    stack?: string;
  };
  const code = typeof e.code === "string" && e.code ? e.code : "auth/unknown";
  const message = e.message || (typeof error === "string" ? error : "(no message)");
  return { code, message, stack: e.stack };
}

export function friendlyError(error: unknown): AuthIssue {
  const { code, message, stack } = describe(error);
  const flow: AuthFlow = lastFlow;
  const technical: AuthIssue = { code, message, stack, flow, at: new Date().toISOString() };
  try {
    sessionStorage.setItem(lastErrorKey, JSON.stringify(technical));
  } catch {
    /* ignore */
  }
  // Full original error (never swallowed). No tokens are included.
  // eslint-disable-next-line no-console
  console.error(`[Beyond Reach auth] ${code}`, {
    message,
    stack,
    flow,
    build: BUILD_ID,
    origin: typeof window !== "undefined" ? window.location.origin : "n/a",
  });

  const friendly: Record<string, string> = {
    "auth/popup-closed-by-user": "Google sign-in was cancelled. You can try again anytime.",
    "auth/cancelled-popup-request": "Google sign-in was cancelled. Please try again.",
    "auth/popup-blocked":
      "Your browser blocked the Google window. Tap Continue with Google again — the full-page method will be used.",
    "auth/redirect-cancelled-by-user": "Google sign-in was cancelled. Please try again.",
    "auth/unauthorized-domain": "This website's domain is not authorised for Google sign-in in Firebase. Please contact support.",
    "auth/operation-not-allowed": "Google sign-in isn't enabled for this project in Firebase. Please contact support.",
    "auth/invalid-api-key": "The Firebase configuration was rejected. Please contact support.",
    "auth/api-key-not-valid": "The Firebase configuration was rejected. Please contact support.",
    "auth/network-request-failed": "Network error while contacting Google. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/account-exists-with-different-credential":
      "An account already exists for this email with a different sign-in method. Please contact support.",
    "auth/user-disabled": "This Beyond Reach account has been disabled. Please contact support.",
    "auth/invalid-credential": "Google returned an invalid sign-in. Please try again.",
    "auth/invalid-app-credential": "This app's sign-in credential was rejected. Please try again or contact support.",
    "auth/redirect-result-missing": "Google sign-in didn't come back to Beyond Reach. Tap Continue with Google again — it will open in a Google window this time.",
    "auth/not-configured": "Sign-in is temporarily unavailable. Please contact support.",
  };

  let display = friendly[code];
  if (!display) {
    if (/INTERNAL ASSERTION FAILED|Expected a class definition/i.test(message)) {
      display =
        "This browser stumbled while opening Google's window. Tap Continue with Google again — the full-page method will be used instead.";
    } else {
      display = "Google sign-in couldn't be completed. Please try again.";
    }
  }

  return { ...technical, message: display };
}

export function lastIssue(): AuthIssue | null {
  try {
    const raw = sessionStorage.getItem(lastErrorKey);
    return raw ? (JSON.parse(raw) as AuthIssue) : null;
  } catch {
    return null;
  }
}

export function clearLastIssue(): void {
  try {
    sessionStorage.removeItem(lastErrorKey);
  } catch {
    /* ignore */
  }
}

/* --------------------------- account mapping ------------------------ */

const storage = typeof window !== "undefined" ? safeStorage() : null;

function isoOrUndefined(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Firebase metadata is identical on every device, so it decides "new user". */
function firebaseSaysNew(user: User): boolean {
  const { creationTime, lastSignInTime } = user.metadata;
  if (!creationTime || !lastSignInTime) return false;
  return Math.abs(new Date(lastSignInTime).getTime() - new Date(creationTime).getTime()) < 5000;
}

function toAuthUser(user: User, isNewUser: boolean): AuthUser {
  const result = provisionAccount(
    {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      picture: user.photoURL || undefined,
      emailVerified: Boolean(user.emailVerified),
      createdAt: isoOrUndefined(user.metadata.creationTime),
      lastLoginAt: isoOrUndefined(user.metadata.lastSignInTime),
    },
    storage
  );
  return { ...result.account, lastSignInAt: result.account.lastLoginAt, isNewUser };
}

function fromCredential(credential: UserCredential): AuthUser {
  let isNew = firebaseSaysNew(credential.user);
  try {
    const info = getAdditionalUserInfo(credential);
    if (info && typeof info.isNewUser === "boolean") isNew = info.isNewUser;
  } catch {
    /* metadata fallback above */
  }
  return toAuthUser(credential.user, isNew);
}

/* ---------------------------- state -------------------------------- */

let lastFlow: AuthFlow = "none";
const listeners = new Set<Listener>();
let unsubscribeFirebase: (() => void) | null = null;
let redirectHandled = false;
let currentUser: AuthUser | null = null;

function emit(user: AuthUser | null): void {
  currentUser = user;
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      logDiagnostic("listener:error", describe(error));
    }
  });
}

function ensureListener(auth: Auth): void {
  if (unsubscribeFirebase) return;
  unsubscribeFirebase = onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        clearRedirectPending();
        emit(toAuthUser(user, false));
      } else {
        emit(null);
      }
    },
    (error) => {
      logDiagnostic("state:error", describe(error));
    }
  );
}

/** Subscribe once; returns unsubscribe with reference counting. */
export function subscribeAuth(callback: Listener): () => void {
  listeners.add(callback);
  const auth = createAuth();
  if (auth) {
    ensureListener(auth);
    if (currentUser) callback(currentUser);
  } else {
    callback(null);
  }
  return () => {
    listeners.delete(callback);
  };
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

/* ---------------------------- sign-in ------------------------------ */

export interface SignInResult {
  ok: boolean;
  redirected?: boolean;
  user?: AuthUser;
  issue?: AuthIssue;
  newAccount?: boolean;
}

const provider = () => {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: "select_account" });
  return p;
};

/**
 * Starts Google sign-in.
 * forceRedirect is used after a popup failure or by the "full page" action.
 */
const REDIRECT_PENDING = "beyondreach.redirectPending";
const POPUP_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
]);

function markRedirectPending(): void {
  try {
    sessionStorage.setItem(REDIRECT_PENDING, String(Date.now()));
  } catch {
    /* ignore */
  }
}
function clearRedirectPending(): void {
  try {
    sessionStorage.removeItem(REDIRECT_PENDING);
  } catch {
    /* ignore */
  }
}
function redirectWasPending(): boolean {
  try {
    const at = Number(sessionStorage.getItem(REDIRECT_PENDING) || 0);
    return at > 0 && Date.now() - at < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

async function startRedirect(auth: Auth): Promise<SignInResult> {
  lastFlow = "redirect";
  try {
    markRedirectPending();
    // Exactly two arguments. Passing anything else as the 3rd argument (the
    // PopupRedirectResolver slot) is what crashed the previous deployment with
    // "INTERNAL ASSERTION FAILED: Expected a class definition".
    await signInWithRedirect(auth, provider());
    return { ok: true, redirected: true };
  } catch (error) {
    clearRedirectPending();
    return { ok: false, issue: friendlyError(error) };
  }
}

/**
 * Google sign-in.
 *  - Every real browser (desktop AND mobile Chrome/Safari/Edge/Firefox):
 *    signInWithPopup, called as the first await of the click so the user
 *    gesture is preserved. Immune to third-party storage partitioning.
 *  - In-app webviews (Instagram/Facebook/…): signInWithRedirect.
 *  - Popup genuinely unavailable (blocked/unsupported): ONE redirect fallback.
 * No other automatic switching, so popup/redirect can never loop.
 */
export async function signInWithGoogle(forceRedirect = false): Promise<SignInResult> {
  clearLastIssue();
  const auth = createAuth();
  if (!auth) {
    const issue = friendlyError(Object.assign(new Error("Firebase is not configured."), { code: "auth/not-configured" }));
    return { ok: false, issue };
  }

  if (forceRedirect || isEmbeddedBrowser()) return startRedirect(auth);

  lastFlow = "popup";
  try {
    const credential = await signInWithPopup(auth, provider());
    const user = fromCredential(credential);
    emit(user);
    return { ok: true, user, newAccount: user.isNewUser };
  } catch (error) {
    const issue = friendlyError(error);
    if (POPUP_FALLBACK_CODES.has(issue.code)) {
      logDiagnostic("auth:popup-unavailable-using-redirect", { code: issue.code });
      return startRedirect(auth);
    }
    return { ok: false, issue };
  }
}

/**
 * Completes a redirect sign-in exactly once, then provisions the account.
 * Called on app start; safe to call when no redirect is pending.
 */
export async function completeRedirectSignIn(): Promise<{ user?: AuthUser; issue?: AuthIssue } | null> {
  if (redirectHandled) return null;
  redirectHandled = true;
  const auth = createAuth();
  if (!auth) return null;
  try {
    const credential = await getRedirectResult(auth);
    if (credential?.user) {
      clearRedirectPending();
      lastFlow = "redirect";
      const user = fromCredential(credential);
      emit(user);
      return { user };
    }
    // Came back from Google but no result and nobody signed in: the browser
    // dropped the cross-site redirect state. Report it once; the next tap uses
    // the popup flow (no automatic retry => no loop).
    if (redirectWasPending()) {
      clearRedirectPending();
      await auth.authStateReady().catch(() => undefined);
      if (!auth.currentUser) {
        return {
          issue: friendlyError(
            Object.assign(new Error("Redirect returned without a sign-in result."), { code: "auth/redirect-result-missing" })
          ),
        };
      }
    }
    return null;
  } catch (error) {
    clearRedirectPending();
    return { issue: friendlyError(error) };
  }
}

/* ----------------------------- logout ------------------------------ */

export async function signOutGoogle(): Promise<void> {
  const auth = createAuth();
  if (auth) {
    try {
      await signOut(auth);
    } catch (error) {
      logDiagnostic("auth:signout-error", describe(error));
    }
  }
  emit(null);
}

/* --------------------------- diagnostics --------------------------- */

function logDiagnostic(context: string, details: object): void {
  // eslint-disable-next-line no-console
  console.info(`[Beyond Reach ${context}]`, details);
}

export interface Diagnostics {
  build: string;
  origin: string;
  firebase: { configured: boolean; projectId?: string; authDomain?: string };
  flow: AuthFlow;
  signedIn: boolean;
  sdk: {
    authInitialised: boolean;
    persistenceClasses: number;
    resolver: boolean;
    popup: boolean;
    redirect: boolean;
  };
  device: { mobileOrEmbedded: boolean; embeddedBrowser: boolean; secureContext: boolean; storage: boolean };
  lastError: AuthIssue | null;
}

export function diagnostics(): Diagnostics {
  return {
    build: BUILD_ID,
    origin: typeof window !== "undefined" ? window.location.origin : "n/a",
    firebase: {
      configured: firebaseConfigured,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    },
    flow: lastFlow,
    signedIn: Boolean(currentUser),
    sdk: {
      authInitialised: Boolean(firebaseAuth),
      persistenceClasses: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence].filter(Boolean).length,
      resolver: Boolean(browserPopupRedirectResolver),
      popup: typeof signInWithPopup === "function",
      redirect: typeof signInWithRedirect === "function",
    },
    device: {
      mobileOrEmbedded: isMobileOrEmbedded(),
      embeddedBrowser: isEmbeddedBrowser(),
      secureContext: typeof window !== "undefined" ? window.isSecureContext : false,
      storage: Boolean(storage),
    },
    lastError: lastIssue(),
  };
}

export type { AuthUser as AppUser };
