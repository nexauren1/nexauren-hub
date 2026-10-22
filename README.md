# Nexauren Hub

A mobile-first directory of free online tools for images, PDF documents, text and audio. Built with Astro for static HTML, individual SEO pages and browser-side processing wherever practical.

## Develop

Requires Node.js 20.11+.

```sh
npm install
npm run dev
npm run build
npm run preview
```

Set `SITE_URL` to the final canonical origin before production deployment. The Pages domain in the config is provisional.

## Add a tool

1. Create `src/tools/<category>/<tool-slug>/logic.ts` for the tool-specific processing function and `metadata.json` for its metadata.
2. Register it in `src/data/data-<category>.json`. Include a unique id and slug, category, original useful description, SEO title and meta description, keywords, features, steps and runtime mode.
3. Define the category copy and SEO in `src/data/category-<category>.json`.
4. Connect the mode in `src/lib/tool-runtime.ts` and build its accessible controls in `src/components/ToolWorkspace.astro`.
5. Run `npm run build`. Static category and tool pages are generated from the registries.

JSON registries drive all category and tool listings. Don't hard-code tool cards into pages. Each tool's processing logic stays in its own folder; shared low-level helpers live under that category's `shared/` directory.

## Current features

- Categories: Image, PDF, Text and Audio, with five tools in each category.
- Responsive light UI with red primary, blue secondary and yellow highlight colors.
- Individual tool pages, category pages, canonical metadata, Open Graph metadata, JSON-LD, breadcrumbs, sitemap and robots.txt.
- Account pages integrated with Firebase Authentication: email/password registration, email verification, login, Google sign-in, password recovery and sign-out.
- Public tools remain available without an account.

## Firebase Authentication

Follow [docs/ACCOUNT_SETUP.md](docs/ACCOUNT_SETUP.md) to create/configure a Firebase project and set the `PUBLIC_FIREBASE_*` variables in Cloudflare Pages. Email/Password and Google providers must be enabled in Firebase Console, and deployed hostnames must be authorized. Account flows cannot work on a deployment until these steps are completed.

Firebase browser configuration is public client configuration; never commit service-account JSON or private server credentials.

## Cloudflare Pages

Build command: `npm run build`; output directory: `dist`; Node.js: 20+. Connect this repository to Cloudflare Pages and configure those settings. Replace the provisional site URL with the final canonical domain before launch.

## Production checklist

- Configure Firebase Authentication and test every account flow on desktop and mobile.
- Confirm domain and configure a monitored contact address.
- Review legal pages for the actual operator and jurisdiction.
- Test real tool tasks, keyboard/mobile use, file-size limits and generated outputs.
- Verify canonical URLs, sitemap, 404 page, redirects and deployed asset paths.
- Add analytics only after choosing a privacy-respecting setup and updating the policy.
- Never present paid features as active until secure server-side implementation has been built and tested.

The legal pages are starting drafts, not legal advice. Browser support for file formats and large files varies.
