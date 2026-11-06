# Beyond Reach — Google Sign-In (rebuilt)

Premium advertising website with a single, production-ready Google sign-in built
on **Firebase Authentication** (`GoogleAuthProvider`). No backend, no database,
no Supabase, no fake accounts.

## Authentication architecture

```
src/lib/firebase.ts        ONE Firebase app → ONE Auth instance (initializeAuth)
                           popup (desktop) / redirect (mobile, tablet, PWA, webview)
                           getRedirectResult once · onAuthStateChanged once
                           error capture (code, message, stack) + diagnostics
src/lib/accounts.ts        Beyond Reach account created once per Firebase UID
src/lib/store.tsx          single auth store fed by the single listener
src/components/googleSignIn.tsx  the ONE Google button (branding, loading,
                           disabled, errors, full-page retry, support details)
```

- `signInWithPopup` on desktop; `signInWithRedirect` on mobile/tablet/PWA and on
  any popup-blocked/unsupported error (automatic retry).
- The redirect result is completed once at app start and provisions the account.
- Persistence classes are imported directly and passed to `initializeAuth`, so
  the SDK never resolves a class at runtime (the cause of
  “Expected a class definition”).
- No `setPersistence` call, no duplicate listener, no second Firebase app.
- Sessions survive refresh through Firebase persistence; logout calls
  `signOut(auth)` and updates the UI immediately.

## Account lifecycle

1. Google authentication returns a Firebase user (`uid`).
2. `provisionAccount()` looks the UID up in `beyondreach.accounts.v2`.
3. First time → creates the account with the Google name, email, photo, a stable
   `BR-XXXXXXXX` account ID, role `customer`, status `Active`, `createdAt` and
   `lastLoginAt`.
4. Afterwards → returns the same record, refreshes profile fields and
   `lastLoginAt`; duplicates are impossible (keyed by UID).
5. Login and registration both end on `/dashboard`.

## Manual configuration (required once)

### Firebase Console
1. **Authentication → Get started**.
2. **Sign-in method → Google → Enable** → choose a support email → Save.
3. **Authentication → Settings → Authorized domains** must contain the exact
   production hosts (no protocol, no path):
   - `beyond-reach.vercel.app`
   - your custom domain, if any
   - `localhost` only for local development (already present by default)

### Vercel
**Project → Settings → Environment Variables** (Production + Preview):

```
VITE_FIREBASE_API_KEY=<from Firebase web app config>
VITE_FIREBASE_AUTH_DOMAIN=beyond-reach-c3fae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=beyond-reach-c3fae
VITE_FIREBASE_STORAGE_BUCKET=beyond-reach-c3fae.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=497688569615
VITE_FIREBASE_APP_ID=1:497688569615:web:b13ff092b9c0f0bc1e807a
```

Build command `npm run build` · output directory `dist` · then **Redeploy**
(Vite inlines `VITE_*` at build time).

No Google Cloud OAuth client configuration is required manually: Firebase manages
the Google provider client. Never put a client secret in the frontend.

## Verifying a deployment

Open the site console:

```js
__BR_AUTH__()
```

Expected: `build: "google-signin-rebuild-2026-11-06"`, `sdk.authInitialised: true`,
`sdk.resolver: true`, `sdk.popup: true`, `sdk.redirect: true`,
`device.mobileOrEmbedded` true on phones. The sign-in screen shows the same build
string under the button.

## Verified in this workspace

- `tsc --noEmit` clean, `npm run build` succeeds.
- 18/18 account-provisioning tests (new user, returning user, no duplicates,
  stable IDs, role/status/timestamps, storage-blocked behaviour).
- One Firebase SDK copy, version pinned 13.2.0, no `firebase/compat`, zero
  `setPersistence` calls, one auth instance, one listener.

Interactive Google account selection requires a real browser and Google account,
so it is verified on the deployed Vercel site (open `/login`, click Continue with
Google, choose an account, land on `/dashboard`).
