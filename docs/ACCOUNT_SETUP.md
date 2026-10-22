# Nexauren Hub — Firebase Authentication setup

The existing account pages use Firebase Authentication for email/password registration, email verification, login, Google sign-in and password recovery. Live authentication requires enabled providers, authorized domains and the web app configuration.

## 1. Create a Firebase project and web app

1. Open https://console.firebase.google.com/ and select the intended project.
2. Under Project settings, register a Web app and check that its configuration matches the Nexauren Hub app.
3. In Authentication → Settings → Authorized domains, add the deployed hostname, currently expected to be `nexauren-hub.pages.dev`, plus any custom domain actually used by the site. Add `localhost` for local testing if it is not already listed.

Firebase Web App configuration is public client configuration. Never put service-account JSON, private keys or server credentials in the frontend or in `PUBLIC_*` variables.

## 2. Enable email/password and configure email actions

1. Go to Authentication → Sign-in method (or Sign-in providers) and enable **Email/Password**.
2. In Authentication → Templates, select an email template and choose **Customize action URL**. Set the custom handler URL once to `https://YOUR-DOMAIN/auth/callback/`. Firebase uses this custom action-handler URL across email templates, so do not set different handler URLs for verification and reset.
3. The shared `/auth/callback/` page handles email verification. When it receives a `resetPassword` action, it forwards the code to the existing `/reset-password/` page.
4. The `url` passed by the browser SDK when requesting a verification or recovery email is a continue URL. The template's **Customize action URL** setting controls which page initially receives the action code.
5. Review the sender details and email templates. Test the generated links on the real deployed domain before launch.

The custom handler validates and applies action codes using Firebase Auth methods such as `applyActionCode`, `verifyPasswordResetCode` and `confirmPasswordReset`.

## 3. Enable Google Sign-In

1. In Authentication → Sign-in method, enable **Google**.
2. Set a support email if Firebase asks for one.
3. In Authentication → Settings → Authorized domains, confirm that the deployed site hostname and any final custom domain are listed.
4. Save the provider settings. Google sign-in uses Firebase's managed redirect flow. Do not put a Google client secret in the frontend or repository.

For a custom domain or a strict browser environment, follow the current Firebase documentation for configuring the auth domain and redirect sign-in: https://firebase.google.com/docs/auth/web/redirect-best-practices

## 4. Configure Cloudflare Pages

The registered Firebase Web App configuration is provided as a default in the current source. The following build variables are optional overrides if you want environment-specific configuration. If you use overrides, set the four required values together:

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_APP_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET` (optional for authentication)
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional for authentication)

Set overrides in Cloudflare Pages → project → Settings → Environment variables, for Production and Preview as appropriate. Use the same variables in a local `.env` file for development. Trigger a new deployment after changing build variables because Astro embeds public variables into the static build.

## 5. Test before announcing accounts as live

- Register with a fresh email and confirm the email link verifies the account.
- Log in with a verified email, reload the dashboard and sign out.
- Test Google sign-in on desktop and mobile.
- Request a password reset, open the link, choose a new password and log in again.
- Test expired/used links, invalid credentials and an unauthorized preview domain.
- Verify that signed-out visitors are redirected away from the dashboard/account page.

## Official documentation

- Firebase web setup: https://firebase.google.com/docs/web/setup
- Firebase email/password authentication: https://firebase.google.com/docs/auth/web/password-auth
- Firebase Google sign-in: https://firebase.google.com/docs/auth/web/google-signin
- Firebase custom email action handlers: https://firebase.google.com/docs/auth/custom-email-handler
- Firebase redirect best practices: https://firebase.google.com/docs/auth/web/redirect-best-practices
