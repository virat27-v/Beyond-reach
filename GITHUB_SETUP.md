# GitHub + Vercel setup (do this once)

This project was never a Git repository, which is why nothing appeared on
GitHub. A local repository with one commit now exists.

## 1. Push this code to your GitHub repo

Create an **empty** repository on GitHub (no README, no .gitignore), then run
these commands in the project folder:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If the remote already exists with old files:

```bash
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main --force
```

> `.env` is intentionally git-ignored. Never commit it. Firebase web config
> belongs in Vercel environment variables.

## 2. Connect Vercel

- Vercel → Project → Settings → Git → connect the repository.
- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Every push to `main` deploys automatically.

## 3. Environment variables (Vercel → Settings → Environment Variables)

Production **and** Preview:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=beyond-reach-c3fae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=beyond-reach-c3fae
VITE_FIREBASE_STORAGE_BUCKET=beyond-reach-c3fae.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=497688569615
VITE_FIREBASE_APP_ID=1:497688569615:web:b13ff092b9c0f0bc1e807a
VITE_FIREBASE_MEASUREMENT_ID=G-2WK0WR3E23
VITE_GOOGLE_CLIENT_ID=497688569615-q2tbj19k8ap13h106l39t7a5meiehua6.apps.googleusercontent.com
```

Optional (only for browsers that block third-party cookies):

```
VITE_AUTH_SAME_ORIGIN=true
```

Vite inlines `VITE_*` at build time → **redeploy** after changing them.

## 4. Verify the deployment actually updated

Open the site → DevTools → Console. You must see:

```
[Beyond Reach] build 2026-11-05-auth-fix-6 · https://beyond-reach.vercel.app
```

If that line is missing, the old bundle is still live — redeploy.

## 5. Firebase console checklist

- Authentication → Sign-in method → **Google enabled**
- Authentication → Settings → Authorized domains → `beyond-reach.vercel.app`
- Authentication → Users → after sign-in the Google account must appear
