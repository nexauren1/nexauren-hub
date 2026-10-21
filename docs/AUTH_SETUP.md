# Nexauren Hub — Authentication setup

The site integrates Supabase Auth for email/password registration and login, email confirmation, Google OAuth, password recovery, and client-side dashboard session checks. Public online tools remain usable without an account.

## Create and configure Supabase

1. Create a Supabase project and copy its Project URL and public publishable key from Project Settings → API.
2. Enable email/password in Authentication → Sign-in providers. For public launch, enable email confirmation and configure production SMTP; the built-in email sender may have testing limits.
3. In Authentication → URL Configuration, set the production origin as Site URL. Add these Redirect URLs:
   - `https://YOUR_DOMAIN/auth/callback/`
   - `https://YOUR_DOMAIN/reset-password/`
   - `http://localhost:4321/auth/callback/`
   - `http://localhost:4321/reset-password/`
4. Review confirmation and password-recovery email templates. Their links must preserve Supabase's `code` parameter and redirect to the allow-listed Nexauren URLs.

## Google OAuth

1. Create/select a project in Google Cloud and configure Google Auth Platform / OAuth consent.
2. Create an OAuth client with type **Web application**. Add production and local origins to Authorized JavaScript origins.
3. In Supabase → Authentication → Sign-in providers → Google, copy the callback URL shown there (usually `https://<project-ref>.supabase.co/auth/v1/callback`) and add it to the Google OAuth client's Authorized redirect URIs.
4. Paste the Google Client ID and Client Secret into the Supabase Google provider panel and enable it.
5. Ensure the Nexauren callback URLs above are in Supabase's Redirect URL allow list.

Use the callback URL shown by your current Supabase project; do not guess the project reference.

## Cloudflare Pages environment variables

- `SITE_URL=https://YOUR_DOMAIN`
- `PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...`

Only the project URL and public publishable key belong in browser code. Never expose a service-role key, database password, or Google Client Secret in source control or any `PUBLIC_*` variable.

## Test before launch

Test email signup, confirmation email, password login, Google sign-in, recovery, password update, sign-out, and visiting the dashboard without a session. Configure a monitored sender address and current legal notices before collecting personal information.

## Security boundary

The site is statically rendered. The dashboard checks the signed-in session in the browser; do not treat the UI check as server-side authorization. Before adding private profile records, synced favourites or entitlements, enforce authorization in a trusted backend and enable suitable Row Level Security policies for every database table. The Upgrade page does not accept payments.
