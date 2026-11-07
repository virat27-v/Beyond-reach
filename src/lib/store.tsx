import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { User, UserData, emptyData, uid } from "./data";
import {
  AUTH_READY,
  FIREBASE_CONFIGURED,
  auth,
  authErrorCode,
  browserPopupRedirectResolver,
  friendlyFirebaseError,
  googleProvider,
} from "./firebase";

/* ------------------------------------------------------------------ */
/*  Frontend-only store backed by Firebase Authentication.             */
/*  Popup-first on every device so mobile never lands on a 404.        */
/*  Redirect is only a last-resort fallback if the popup is blocked.   */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone?: "success" | "error" | "info";
}

type Result = { ok: true } | { ok: false; error: string; code?: string };

interface Store {
  firebaseConfigured: boolean;
  authReady: boolean;
  ready: boolean;
  user: User | null;
  data: UserData;
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

export const PENDING_REDIRECT_KEY = "br:pendingGoogle";
export const NEXT_PATH_KEY = "br:next";

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

  useEffect(() => {
    if (!auth) {
      setReady(true);
      return;
    }
    const failSafe = window.setTimeout(() => setReady(true), 2500);

    getRedirectResult(auth)
      .then((cred) => {
        if (cred?.user) {
          const u = toAppUser(cred.user);
          setUser(u);
          sessionStorage.removeItem(PENDING_REDIRECT_KEY);
          toast(
            u.isFirstLogin ? "Account created" : "Welcome back",
            u.isFirstLogin ? `Your Beyond Reach account was created with ${u.email}.` : `Signed in as ${u.name}.`
          );
        }
      })
      .catch((e) => {
        console.warn("[BR-AUTH] Redirect result error:", e);
      });

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(toAppUser(fbUser));
      } else {
        setUser(null);
      }
      setReady(true);
    });
    return () => {
      window.clearTimeout(failSafe);
      unsub();
    };
  }, [toast]);

  const googleLogin = useCallback(
    async (next: string): Promise<Result> => {
      const fbAuth = auth;
      if (!fbAuth) {
        return {
          ok: false,
          error:
            "Firebase is not configured for this deployment yet. Set the six VITE_FIREBASE_* environment variables (see README) and redeploy.",
        };
      }
      const target = next || "/dashboard";
      sessionStorage.setItem(NEXT_PATH_KEY, target);

      const finish = (fbUser: FirebaseUserLike) => {
        const u = toAppUser(fbUser);
        toast(
          u.isFirstLogin ? "Account created" : "Welcome back",
          u.isFirstLogin ? `Your Beyond Reach account was created with ${u.email}.` : `Signed in as ${u.name}.`
        );
      };

      try {
        // Popup-first on every device. Redirect leaves the page and often
        // returns to /__/auth/handler which this SPA used to 404.
        const cred = await signInWithPopup(fbAuth, googleProvider(), browserPopupRedirectResolver);
        if (cred.user) finish(cred.user);
        sessionStorage.removeItem(PENDING_REDIRECT_KEY);
        return { ok: true };
      } catch (popupErr) {
        const code = authErrorCode(popupErr) ?? "";
        if (code === "auth/popup-closed-before-sign-in" || code === "auth/cancelled-popup-request") {
          return { ok: false, error: friendlyFirebaseError(popupErr), code };
        }
        if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
          try {
            sessionStorage.setItem(PENDING_REDIRECT_KEY, "1");
            await signInWithRedirect(fbAuth, googleProvider(), browserPopupRedirectResolver);
            return { ok: true };
          } catch (redirectErr) {
            sessionStorage.removeItem(PENDING_REDIRECT_KEY);
            return { ok: false, error: friendlyFirebaseError(redirectErr), code: authErrorCode(redirectErr) };
          }
        }
        return { ok: false, error: friendlyFirebaseError(popupErr), code };
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
    authReady: AUTH_READY,
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
