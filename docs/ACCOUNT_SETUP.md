# Nexauren Hub — Firebase Authentication setup

The existing account pages now use Firebase Authentication for email/password registration, email verification, login, Google sign-in and password recovery. The code is ready to connect, but live authentication requires a Firebase project, enabled providers, authorized domains and the web app's public configuration.

## 1. Create a Firebase project and web app

1. Open https://console.firebase.google.com/ and create a project for Nexauren Hub (or select the intended existing project).
2. In Project settings, add a **Web app** and copy its configuration.
3. In Authentication → Settings → Authorized domains, add the deployed domain, such as `nexauren-hub.pages.dev`, and any final custom domain. Add `localhost` for local development if it is not already listed.

Firebase web configuration values are intended to be present in browser applications. Never put service-account JSON, private keys or other server credentials into `PUBLIC_*` variables.

## 2. Enable email/password

1. Go to Authentication → Sign-in method (or Sign-in providers).
2. Enable **Email/Password**.
3. In Authentication → Templates, open **Email address verification** and **Password reset**. For each template, use **Customize action URL** to set the custom handler URL to your deployed Nexauren page: `/auth/callback/` for email verification and `/reset-password/` for password reset. Firebase appends the `mode` and `oobCode` parameters to these URLs. Review the sender details too.
4. In Authentication → Settings, confirm the project's email action URL behavior. The site uses these routes:
   - Email verification: `https://YOUR-DOMAIN/auth/callback/?mode=verifyEmail&oobCode=...` (Firebase appends its action parameters).
   - Password recovery: `https://YOUR-DOMAIN/reset-password/?mode=resetPassword&oobCode=...` (Firebase appends its action parameters).

The application processes the Firebase action codes on these custom handler pages using `applyActionCode`, `verifyPasswordResetCode` and `confirmPasswordReset`. The `url` passed by the client SDK is a continue URL; the email template’s **Customize action URL** setting determines the page that receives the action code. Test both email types on the actual deployed domain before launch.

## 3. Enable Google Sign-In

1. In Authentication → Sign-in method, enable **Google**.
2. Set the project support email if Firebase asks for it.
3. In Authentication → Settings → Authorized domains, add the site's deployed hostname and custom domain.
4. Save the provider settings. Google sign-in uses Firebase's managed redirect flow; do not put a Google client secret in the frontend or repository.

For a custom domain or a strict browser environment, follow the current Firebase documentation for configuring the auth domain and redirect sign-in: https://firebase.google.com/docs/auth/web/redirect-best-practices

## 4. Configure Cloudflare Pages

In Cloudflare Pages → your project → Settings → Environment variables, add the following values from the Firebase Web App configuration. Set them for both Production and Preview if you use preview deployments:

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET` (optional for authentication)
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional for authentication)

Use the same variables in a local `.env` file for development. Do not commit real project credentials unnecessarily; Firebase's web config is public client configuration, but server credentials must remain secret. Trigger a new deployment after setting variables because Astro embeds public variables into the static build.

## 5. Test before announcing accounts as live

- Register with a fresh email; confirm the email link opens Nexauren Hub and verifies the account.
- Log in with a verified email, reload the dashboard, and sign out.
- Test Google sign-in on desktop and mobile.
- Request a password reset, open the link, set a new password, and log in again.
- Test expired/used links, invalid credentials, and an unauthorized preview domain.
- Verify that signed-out visitors cannot remain on the dashboard/account page.

## Official documentation

- Firebase web setup: https://firebase.google.com/docs/web/setup
- Firebase email/password authentication: https://firebase.google.com/docs/auth/web/password-auth
- Firebase Google sign-in: https://firebase.google.com/docs/auth/web/google-signin
- Firebase password authentication and email actions: https://firebase.google.com/docs/auth
