# Beyond Reach — frontend-only advertising website

Premium, minimal, **100% frontend-only** site (Vite single-file build, deployed on Vercel).
No backend, no database. The only integration is **real Google Sign-In via Firebase
Authentication** (`GoogleAuthProvider`, `signInWithPopup` / `signInWithRedirect`).

## Environment variables (the only setup)

| Variable | From |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web-app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web-app config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web-app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web-app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web-app config |
| `VITE_FIREBASE_APP_ID` | Firebase web-app config |

All six come from **Firebase Console → Project settings → General → Your apps → SDK
configuration and API keys**. No values are hardcoded in the source.

## Firebase console steps (one time)

1. **Create a Firebase project** (console.firebase.google.com).
2. **Project settings → General → Your apps → Add app → Web (</>)** → register the app
   (any nickname). Copy the six `VITE_FIREBASE_*` values from the shown config.
3. **Authentication → Get started → Sign-in method → Google → Enable**
   → add your support email → save.
4. **Make sure your Vercel domain is authorized** —
   **Project settings → General → Authorized domains**: your production domain
   (e.g. `beyondreach.vercel.app`) must be listed (Firebase pre-fills the domain used
   as `authDomain`). If you use a custom domain or preview deployments, add those too.
   If sign-in ever fails with "This domain is not authorized", this is the place.
5. No service account, no database, no API keys beyond the public web config —
   nothing secret is required for Authentication.

## Vercel deployment steps

1. Vercel → your project → **Settings → Environment Variables**.
2. Add **all six** variables (available for *Production, Preview and Development*).
3. **Redeploy** (Vercel bakes `VITE_*` values in at build time — a redeploy is
   required after changing them).
4. Test on the production domain: sign-in popup on desktop, redirect flow on mobile.

## Run locally

```bash
# .env with the six VITE_FIREBASE_* values
npm install
npm run dev      # http://localhost:5173 (must be in Authorized domains too)
npm run build    # → dist/index.html (single file)
```

## Uploading to GitHub → deploying on Vercel

Upload **only these files/folders** (the `.gitignore` already excludes the rest):

```
.env               ← Firebase web config (public by design — safe to commit)
.env.example
.gitignore
README.md
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts
src/               (the whole src folder)
```

- ❌ **Never upload `node_modules/`** (288 MB — this is why direct uploads fail).
  Vercel runs `npm install` on its own.
- ❌ Never upload `dist/` — Vercel builds it.

Then in Vercel: **New Project → Import the GitHub repo → Deploy**.
Vercel picks up the `.env` from the repo automatically (or add the same six
`VITE_FIREBASE_*` variables in Vercel → Settings → Environment Variables —
dashboard values win over the repo file). After deploying, open the production
domain and sign in — if it says the domain is not authorized, add the domain in
Firebase Console → Project settings → Authorized domains.

## How the sign-in flow works

- **Desktop** — `signInWithPopup(GoogleAuthProvider)` opens Google's native
  account-chooser popup.
- **Mobile** — `signInWithRedirect` performs the full-page redirect flow and returns
  to the page you were on (`/dashboard` or `/book`).
- **`onAuthStateChanged`** drives the whole app: session is restored automatically
  after refresh (Firebase persists it in IndexedDB via explicit
  `browserLocalPersistence`) and the dashboard route is protected —
  unauthenticated users are sent to `/login`.
- **`signOut`** clears the session (nav menu, mobile menu and Account page).
- **Name, email and profile photo** come from the verified Google user object and are
  shown across the site.
- **Errors & cancellation** are handled: cancelled popup, blocked popup,
  unauthorized-domain, Google provider not enabled, network failure — each with a
  specific, honest message. Nothing is simulated.

## User accounts (automatic, no separate registration)

- The user account **is the Firebase Authentication record**, created automatically
  when a Google user signs in for the first time. No separate register step exists
  or is needed.
- **First sign-in** → account record is created (unique `uid`, registration
  timestamp), the user is logged in, and the dashboard shows a one-time
  "account created" welcome with a CTA.
- **Every later sign-in** (same or different device) resolves to the **same `uid`** —
  the same account, no duplicates possible.
- The **Account** page shows the full record: name, email, photo, User ID,
  registered-on date, last login, and status (Active).
- Honest scope: this is a frontend-only build, so the account record lives in
  Firebase Authentication (managed by Google/Firebase) — the site itself stores no
  user data on any server.

## What this version does (and doesn't)

- ✅ Homepage (with dashboard preview), pricing, about, legal, support (WhatsApp/email).
- ✅ Google sign-in → personalized dashboard with honest empty states
  ("No campaigns yet", "Analytics Not Available Yet").
- ✅ 4-step booking form → send the request on **WhatsApp / Email / Copy** (pre-filled).
  No online payment is taken or simulated.
- ❌ No campaigns are run, no payments taken, no data stored on any server —
  and the site never claims otherwise.
