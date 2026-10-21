# Nexauren Hub account setup

The registration, login, Google OAuth, email confirmation and password recovery screens use Supabase Auth. The code is ready to connect, but live account creation requires a Supabase project and provider settings.

## 1. Build environment

Add these build-time variables in Cloudflare Pages → Settings → Environment variables, and use a private local `.env` for development:

- `PUBLIC_SUPABASE_URL`: Supabase project URL
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable/anon key

See `.env.example` for the names. Use only the publishable key in the browser. Never expose a service-role key or Google client secret in frontend code. Astro embeds public variables into the static build, so redeploy after changing them.

## 2. Email and password

In Supabase → Authentication → URL Configuration, set the Site URL to the deployed Nexauren Hub origin. Add these redirect URLs:
- `https://YOUR-DOMAIN/auth/callback/`
- `https://YOUR-DOMAIN/reset-password/`
- Local equivalents such as `http://localhost:4321/auth/callback/` and `http://localhost:4321/reset-password/`

Enable email/password sign-up. Configure confirmation and recovery email templates to return to these routes. Set up a trusted email sender/domain before public launch; default test email limits are not suitable for a growing service.

## 3. Google OAuth

1. Create a Web OAuth client in Google Cloud Console.
2. Add the exact deployed site origin to Authorized JavaScript origins.
3. Add the Supabase project's Auth callback URL (shown in Supabase → Authentication → Providers → Google) to Authorized redirect URIs.
4. Enable Google in Supabase and enter the Google client ID and client secret in Supabase's provider settings.
5. Add the deployed callback route to Supabase's allowed redirect URLs and test sign-in on mobile and desktop.

Do not commit the Google client secret or expose it in any `PUBLIC_*` variable.

## 4. Pre-launch test checklist

- Register with a fresh email and confirm it from the inbox.
- Log in, reload the dashboard, and sign out.
- Test Google OAuth on desktop and mobile.
- Request a password reset, open the link and change the password.
- Test an expired link and wrong password.
- Confirm the dashboard redirects logged-out visitors to login.

References:
- Supabase Astro quickstart: https://supabase.com/docs/guides/auth/quickstarts/astrojs
- Google provider setup: https://supabase.com/docs/guides/auth/social-login/auth-google
