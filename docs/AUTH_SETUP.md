# Nexauren Hub — Authentication setup

Nexauren Hub uses Firebase Authentication for email/password registration, email verification, login, Google sign-in, password recovery, and browser session checks. Public online tools remain usable without an account.

The detailed Firebase checklist is maintained in [ACCOUNT_SETUP.md](./ACCOUNT_SETUP.md). This page is retained as the short authentication entry point.

## Required setup

1. Create/select the Firebase project and register a Web app.
2. Enable **Email/Password** and **Google** in Firebase Console → Authentication → Sign-in method.
3. Add the production domain, any custom domain and `localhost` (for development) under Authentication → Settings → Authorized domains. In Authentication → Templates, customize the Email address verification action URL to `https://YOUR-DOMAIN/auth/callback/` and Password reset action URL to `https://YOUR-DOMAIN/reset-password/`; Firebase appends the `mode` and `oobCode` parameters.
4. Add these Cloudflare Pages build environment variables from the Firebase Web App config:
   - `PUBLIC_FIREBASE_API_KEY`
   - `PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `PUBLIC_FIREBASE_PROJECT_ID`
   - `PUBLIC_FIREBASE_APP_ID`
   - `PUBLIC_FIREBASE_STORAGE_BUCKET` (optional for authentication)
   - `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional for authentication)
5. Redeploy the site after setting variables. Astro embeds these public client values during the build.

## Account flows

- Email registration creates the account and sends a verification email.
- Email/password login requires a verified email address.
- Google sign-in uses Firebase's managed redirect flow.
- Password recovery sends a Firebase action link to the site's reset-password page.
- Dashboard/account pages check the browser's signed-in Firebase session.

## Security boundary

Firebase Web App configuration is public client configuration. Never commit service-account JSON, private keys, or server credentials. The dashboard's browser session check is not server-side authorization; protect any future private records or entitlements with trusted backend authorization and appropriate security rules. The Upgrade page does not accept payments.

See [Firebase Authentication setup instructions](./ACCOUNT_SETUP.md) for the full step-by-step checklist and official documentation links.
