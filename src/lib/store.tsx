import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { User, UserData, emptyData, uid } from "./data";
import { FIREBASE_CONFIGURED, auth, friendlyFirebaseError, googleProvider, isLikelyMobile } from "./firebase";

/* ------------------------------------------------------------------ */
/*  Frontend-only store backed by Firebase Authentication.             */
/*  - onAuthStateChanged → persistent, refresh-proof auth state        */
/*  - signInWithPopup (desktop) / signInWithRedirect (mobile)          */
/*  - real Google identity only: name, email, photo from Google        */
/*  - no database, no custom backend, no simulated users               */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone?: "success" | "error" | "info";
}

type Result = { ok: true } | { ok: false; error: string };

interface Store {
  firebaseConfigured: boolean;
  ready: boolean; // Firebase auth state resolved
  user: User | null;
  data: UserData; // always empty in this build — nothing is stored on a server
  unread: number;
  toasts: Toast[];
  toast: (title: string, body?: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
  googleLogin: (next: string) => Promise<Result>;
  logout: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}

interface FirebaseUserLike {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  lastSignInTime?: string | null;
  metadata?: { creationTime?: string };
}

/**
 * The "user account" is the Firebase Authentication record — created automatically
 * by Google/Firebase on first sign-in (uid = unique internal id, creationTime =
 * registration timestamp). One Google identity = one account, ever; re-signing-in
 * always resolves to the same uid, so no duplicates can exist.
 */
function toAppUser(fb: FirebaseUserLike): User {
  const created = Date.parse(fb.metadata?.creationTime ?? "");
  const now = Date.now();
  return {
    id: fb.uid,
    name: fb.displayName || fb.email?.split("@")[0] || "Customer",
    email: fb.email || "",
    provider: "google",
    createdAt: fb.metadata?.creationTime || new Date().toISOString(),
    lastLoginAt: fb.lastSignInTime || (Number.isFinite(created) ? new Date(created).toISOString() : new Date().toISOString()),
    isFirstLogin: Number.isFinite(created) && now - created < 15 * 60 * 1000,
    prefs: { emailNotifs: true, whatsappNotifs: false },
    avatar: fb.photoURL ?? null,
  };
}

const PENDING_REDIRECT_KEY = "br:pendingGoogle";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((title: string, body?: string, tone: Toast["tone"] = "success") => {
    const id = uid("t");
    setToasts((t) => [...t, { id, title, body, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4800);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  /* Persistent auth state: restored automatically after refresh
     (Firebase keeps the session in IndexedDB and re-asserts it here). */
  useEffect(() => {
    if (!auth) {
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const u = toAppUser(fbUser);
        setUser(u);
        // Completion of the mobile redirect flow: surface account feedback once.
        if (sessionStorage.getItem(PENDING_REDIRECT_KEY)) {
          sessionStorage.removeItem(PENDING_REDIRECT_KEY);
          toast(
            u.isFirstLogin ? "Account created" : "Welcome back",
            u.isFirstLogin ? `Your Beyond Reach account was created with ${u.email}.` : `Signed in as ${u.name}.`
          );
        }
      } else {
        sessionStorage.removeItem(PENDING_REDIRECT_KEY);
        setUser(null);
      }
      setReady(true);
    });
    return unsub;
  }, [toast]);

  const googleLogin = useCallback(
    async (next: string): Promise<Result> => {
      if (!auth) {
        return {
          ok: false,
          error:
            "Firebase is not configured for this deployment yet. Set the six VITE_FIREBASE_* environment variables (see README) and redeploy.",
        };
      }
      const provider = googleProvider();
      const target = next || "/dashboard";
      try {
        if (isLikelyMobile()) {
          // Mobile-friendly flow: full-page redirect to Google and back.
          const url = `${window.location.origin}${window.location.pathname}#${target}`;
          sessionStorage.setItem(PENDING_REDIRECT_KEY, "1");
          await signInWithRedirect(auth, provider, { url });
          return { ok: true };
        }
        // Desktop: native Google account-chooser popup.
        // Firebase automatically creates the account record on first sign-in
        // and returns the same record on every later sign-in (no duplicates).
        const cred = await signInWithPopup(auth, provider);
        if (cred.user) {
          const u = toAppUser(cred.user);
          toast(
            u.isFirstLogin ? "Account created" : "Welcome back",
            u.isFirstLogin ? `Your Beyond Reach account was created with ${u.email}.` : `Signed in as ${u.name}.`
          );
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: friendlyFirebaseError(e) };
      }
    },
    [toast]
  );

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
  }, []);

  const value: Store = {
    firebaseConfigured: FIREBASE_CONFIGURED,
    ready,
    user,
    data: emptyData(),
    unread: 0,
    toasts,
    toast,
    dismissToast,
    googleLogin,
    logout,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export type { Result };
