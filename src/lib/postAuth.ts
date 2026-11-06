/* ------------------------------------------------------------------ */
/*  Post-login landing rule: after an interactive Google sign-in the   */
/*  customer must always see the dashboard first — never the campaign  */
/*  form, even if sign-in was started from /book (or after a mobile     */
/*  redirect that returns to the page where it began).                  */
/*                                                                      */
/*  Restored sessions (page refresh) are NOT affected: only a sign-in   */
/*  the user actively started sets the pending flag.                    */
/* ------------------------------------------------------------------ */

const PENDING_KEY = "beyondreach.auth.pending";
export const POST_AUTH_DESTINATION = "/dashboard";

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Call immediately before starting an interactive Google sign-in. */
export function markPendingAuth(): void {
  try {
    storage()?.setItem(PENDING_KEY, "1");
  } catch {
    /* storage blocked — the sign-in page redirect still lands on the dashboard */
  }
}

/** Call when an interactive sign-in fails or is cancelled. */
export function clearPendingAuth(): void {
  try {
    storage()?.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** True once per completed interactive sign-in (the flag is consumed). */
export function consumePendingAuth(): boolean {
  try {
    const s = storage();
    if (!s || s.getItem(PENDING_KEY) !== "1") return false;
    s.removeItem(PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Safe internal destination. */
export function isDashboardRoute(path: string): boolean {
  return path === POST_AUTH_DESTINATION || path.startsWith(`${POST_AUTH_DESTINATION}/`);
}
