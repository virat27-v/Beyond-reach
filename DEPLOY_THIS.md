# Beyond Reach — Firebase Auth master repair (report)

## Root cause of "INTERNAL ASSERTION FAILED: Expected a class definition" (verified)

Reproduced on the LIVE site in real Chromium (fresh Android profile). Stack `Nn <- Bu <- v2 <- ie`,
de-minified from the deployed bundle:

    // deployed app code (frame "ie")
    await signInWithRedirect(auth, provider, { url: continueUrl });   // 3rd arg = object (WRONG)
    // Firebase SDK, frame "Bu" (_withDefaultResolver)
    return resolverOverride ? _getInstance(resolverOverride) : auth._popupRedirectResolver;
    // Firebase SDK, frame "Nn" (_getInstance)
    debugAssert(cls instanceof Function, "Expected a class definition");   // throws

The 3rd parameter of signInWithRedirect must be a PopupRedirectResolver class. Desktop used
signInWithPopup (2 args) and worked; mobile/other devices took the redirect branch and crashed.

## Root cause of "Sign-in didn't finish automatically"

Redirect sign-in with authDomain beyond-reach-c3fae.firebaseapp.com on beyond-reach.vercel.app is
cross-site; browsers that partition third-party storage drop the redirect state, so
getRedirectResult() returns null with no error (Firebase "redirect best practices").

## Fix in this codebase (src/lib/firebase.ts, src/lib/accounts.ts, src/components/googleSignIn.tsx)

- signInWithRedirect(auth, provider) — exactly two arguments.
- Popup on every real browser (desktop, Android, iOS) as the first await of the click.
- Redirect only for in-app webviews, and ONE fallback when a popup is blocked/unsupported. No loops.
- Redirect returning without a result: one clear message; next tap uses popup.
- One Firebase app, one initializeAuth (persistence classes imported directly), one
  onAuthStateChanged, getRedirectResult once, no setPersistence.
- New/existing user from Firebase (getAdditionalUserInfo + metadata); account ID from UID;
  registration and last-login dates from Firebase metadata (same on every device).

## Real-browser results (Chromium, production hostname over HTTPS, fresh profiles)

| Scenario | Flow | Google chooser | Assertions |
|---|---|---|---|
| Desktop Chrome (new laptop) | popup | yes | 0 |
| Android Chrome | popup | yes | 0 |
| iPhone Safari UA | popup | yes | 0 |
| Instagram in-app browser | redirect | yes | 0 |
| Popup blocked | single redirect fallback | yes | 0 |
| Redirect returned without result | message, no loop, button enabled | n/a | 0 |

Not verifiable here: completing a login with a real Google account; physical iPhone/Android.

## Manual actions

Firebase Console (verified via API, already correct): Google provider enabled; authorized domains
include beyond-reach.vercel.app. Add any custom domain.

Vercel -> Settings -> Environment Variables (Production + Preview): VITE_FIREBASE_API_KEY,
VITE_FIREBASE_AUTH_DOMAIN=beyond-reach-c3fae.firebaseapp.com, VITE_FIREBASE_PROJECT_ID=beyond-reach-c3fae,
VITE_FIREBASE_STORAGE_BUCKET=beyond-reach-c3fae.firebasestorage.app,
VITE_FIREBASE_MESSAGING_SENDER_ID=497688569615,
VITE_FIREBASE_APP_ID=1:497688569615:web:b13ff092b9c0f0bc1e807a.
Build `npm run build`, output `dist`, then REDEPLOY THIS CODEBASE (the live site serves a different
build, firebase-10-14-1-br-..., that contains the defect). Verify the console shows
build "auth-master-repair-2026-11-06". No Google Cloud OAuth change is needed for the popup flow.
