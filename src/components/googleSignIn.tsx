import { useState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { useStore } from "../lib/store";
import { btnCls } from "./ui";

/* ------------------------------------------------------------------ */
/*  Google Sign-In through Firebase Authentication.                    */
/*  Uses a GoogleAuthProvider popup on desktop and the redirect flow    */
/*  on mobile (handled in lib/firebase.ts). The button only ever shows  */
/*  a user that Firebase has actually authenticated.                    */
/* ------------------------------------------------------------------ */

function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.58v2.97h3.88c2.27-2.09 3.57-5.17 3.57-8.74Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-2.97c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.96H1.28v3.07A11.99 11.99 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.31A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.58.38-2.31V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.07Z" />
      <path fill="#EA4335" d="M12 4.73c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 11.99 11.99 0 0 0 1.28 6.62l4.01 3.07C6.23 6.84 8.88 4.73 12 4.73Z" />
    </svg>
  );
}

export default function GoogleSignIn({
  next = "/dashboard",
  mode = "login",
  onSignedIn,
}: {
  next?: string;
  mode?: "login" | "register";
  onSignedIn?: () => void;
}) {
  const { signInWithGoogle, authError, clearAuthError } = useStore();
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleClick = async () => {
    if (busy || redirecting) return;
    clearAuthError();
    setBusy(true);
    const result = await signInWithGoogle();
    if (!result.ok) {
      setBusy(false);
      return;
    }
    if (result.redirected) {
      // The browser is navigating to Google; the auth listener resumes on return.
      setRedirecting(true);
      return;
    }
    // Popup succeeded and Firebase returned a real user.
    setBusy(false);
    onSignedIn?.();
    window.location.hash = next;
  };

  const label = mode === "login" ? "Continue with Google" : "Sign up with Google";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-5">
        <div className="my-1 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-faint">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={handleClick}
          disabled={busy || redirecting}
          className={btnCls("secondary", "lg", "w-full")}
          aria-busy={busy || redirecting}
        >
          {busy || redirecting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {redirecting ? "Redirecting to Google…" : "Signing in…"}
            </>
          ) : (
            <>
              <GoogleG />
              {label}
            </>
          )}
        </button>
      </div>

      {authError && (
        <p className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-700 anim-fade">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {authError}
        </p>
      )}

      <p className="flex items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed text-faint">
        <Info size={12} className="mt-px shrink-0" />
        Secured by Firebase Authentication. Google opens its own account chooser — this site never sees your password.
      </p>
    </div>
  );
}

export function GoogleAuthHeader() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white shadow-soft">
        <GoogleG size={19} />
      </span>
      <div>
        <p className="text-[13px] font-semibold leading-tight text-ink">Continue with Google</p>
        <p className="text-[11px] text-faint">Google sign-in · secured by Firebase Authentication</p>
      </div>
    </div>
  );
}
