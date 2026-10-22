# Nexauren Hub — Authentication setup

Nexauren Hub uses Firebase Authentication for email/password registration, email verification, login, Google sign-in, password recovery, and browser session checks. Public online tools remain available without an account.

Follow [ACCOUNT_SETUP.md](./ACCOUNT_SETUP.md) for the full Firebase setup checklist.

## Required setup

1. Enable **Email/Password** and **Google** in Firebase Console → Authentication → Sign-in method.
2. Add the production hostname and any custom domain actually used by the site under Authentication → Settings → Authorized domains.
3. In Authentication → Templates, customize the email action URL once to `https://YOUR-DOMAIN/auth/callback/`. Firebase uses this shared handler across verification and password-reset email templates. The callback handles email verification and forwards reset codes to the existing `/reset-password/` page.
4. The registered Firebase Web App configuration is already provided as a default in source. Optional Cloudflare Pages overrides are `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID` and `PUBLIC_FIREBASE_APP_ID`; if overrides are supplied, set all four together.

## Account flows

- Email registration sends a verification email.
- Email/password login requires the email to be verified.
- Google sign-in uses Firebase's managed redirect flow.
- Password recovery uses a Firebase action code, then the existing reset-password page.
- Dashboard/account pages check the browser's signed-in Firebase session.

## Security boundary

Firebase Web App configuration is public client configuration. Never commit service-account JSON, private keys or other server credentials. A browser session check is not server-side authorization; protect future private records and entitlements with trusted backend authorization and suitable rules. The Upgrade page does not accept payments.
