# Beyond Reach — Firebase Google Sign-In

A premium, minimalist advertising website with **real Google Sign-In via Firebase
Authentication**. Frontend only: no Supabase, no custom backend, no database.

- React 19 + Vite 7 + Tailwind CSS 4 (static build, deploys to Vercel)
- `signInWithPopup` on desktop, `signInWithRedirect` on mobile / when popups are blocked
- `onAuthStateChanged` keeps the session in sync and restores it after refresh
- Protected customer dashboard (Firebase auth state is the gate)
- Displays the Google name, email and profile photo
- Real `signOut`
- Honest empty states — no fabricated campaigns, payments or analytics

## 1. Create the Firebase project (one time)

1. Open <https://console.firebase.google.com/> → **Add project** (or use an existing one).
2. **Build → Authentication → Get started**.
3. **Sign-in method → Google → Enable**. Choose a project support email → **Save**.
4. **Project settings (gear) → General → Your apps → Web (`</>`)**. Register the app
   (nickname e.g. `Beyond Reach Web`). Copy the `firebaseConfig` values from the
   SDK setup snippet — they map 1:1 to the variables below.
5. **Authentication → Settings → Authorized domains** — add your production domain
   **without** protocol or path, for example:

   ```
   beyond-reach.vercel.app
   your-custom-domain.com
   localhost
   ```

   `localhost` is present by default. Google sign-in fails with
   `auth/unauthorized-domain` if the domain is missing.

> Google Cloud OAuth consent screen: Firebase usually configures this for you when
> you enable Google. If Google prompts about the consent screen, open
> **Google Cloud Console → APIs & Services → OAuth consent screen**, set the app
> name/support email and add the `openid`, `email`, `profile` scopes. Web Client ID
> and secret are managed by Firebase — do not paste them into the frontend.

## 2. Vercel environment variables (exact names)

Add all six in **Vercel → Project → Settings → Environment Variables** (Production,
Preview and Development), then redeploy:

| Variable | Value from Firebase |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` (e.g. `your-project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` (e.g. `your-project.appspot.com`) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` (e.g. `1:1234567890:web:abcdef`) |

These are **public Firebase web identifiers**, not secrets. No service account,
private key or client secret is used. Vite inlines `VITE_*` variables **at build
time**, so you must **redeploy after adding or changing them**.

Local development: copy `.env.example` to `.env`, fill the six values, then run:

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static production build → dist/
npm run preview
```

## 3. Vercel deployment steps

1. Push this project to Git (or deploy from Arena AI to Vercel).
2. In Vercel, **Framework preset: Vite**, build command `npm run build`,
   output directory `dist` (already set in `vercel.json`).
3. Add the six `VITE_FIREBASE_*` variables for Production **and** Preview.
4. Deploy, then open the production URL. Sign in with Google.
5. Add that exact production domain to **Firebase → Authentication → Authorized domains**.
6. Confirm the Google provider is **Enabled** in Firebase Authentication.
7. Test: sign in, refresh (session persists), sign out, cancel the popup
   (friendly error, no login), and open `/dashboard` while signed out
   (redirects to `/login?next=/dashboard`).

## Troubleshooting (firebase project `beyond-reach-c3fae`)

| Firebase error | Meaning | Fix |
|---|---|---|
| `auth/invalid-api-key` | Google rejected the API key | Copy `apiKey` again from **Project settings → General → Your apps → Web app**; update `VITE_FIREBASE_API_KEY`; redeploy. Also check **Google Cloud Console → APIs & Services → Credentials → API key restrictions** (allow Identity Toolkit, or set Application restrictions to *None* / your domains). |
| `auth/unauthorized-domain` | Current host missing in Firebase | **Authentication → Settings → Authorized domains** → add the domain shown in the error (no `https://`, no path). |
| `auth/operation-not-allowed` | Google provider disabled | **Authentication → Sign-in method → Google → Enable**. |
| `auth/configuration-not-found` | Authentication not initialised | Open **Authentication → Get started** in the Firebase console. |
| Popup does nothing on mobile | Popups blocked | The app automatically falls back to `signInWithRedirect`. |

## How authentication works

```
src/lib/firebase.ts   initializeApp + getAuth (config from VITE_FIREBASE_*)
                      signInWithPopup (desktop) / signInWithRedirect (mobile)
                      getRedirectResult, onAuthStateChanged, signOut, error mapping
src/lib/store.tsx     AuthProvider: authLoading, user, signInWithGoogle, logout, toasts
src/components/googleSignIn.tsx  Premium "Continue with Google" button + errors
src/App.tsx           RequireAuth gate for every /dashboard route
```

- The dashboard never renders until `authLoading` is false and Firebase reports a user.
- The signed-in name, email and profile photo come from the Firebase `User`
  (`displayName`, `email`, `photoURL`).
- Session persistence uses Firebase's `browserLocalPersistence`, so a refresh keeps
  the user signed in. Sign-out clears it.
- Google account cancellation/closure yields a friendly message — never a fake login.
- If the environment variables are missing, no fake session is created: clicking the
  button explains that Firebase configuration is required.

## Honest limits of a frontend-only build

Firebase Authentication authenticates the user; it is **not** authorization for
private data. There is no database in this project, so the dashboard shows the
verified profile plus clean empty states (“No campaigns yet”, “No orders or
payments”, “Analytics not available yet”). A campaign brief creates your own email
draft — it does not place an order or take payment. If you later store private
campaign data or accept payments, add server-side Firebase ID-token verification
(Admin SDK) and a proper database; never trust the client alone.

## Removed from earlier versions

Supabase, custom backend/API, SQLite, Razorpay/payment UI, the GIS
`VITE_GOOGLE_CLIENT_ID` flow and its “not configured” screen have been removed.
Firebase Authentication is now the only sign-in mechanism.
