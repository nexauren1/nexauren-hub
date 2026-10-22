# Nexauren Hub brand assets and SEO

The shared Astro layout applies favicon, Open Graph and X/Twitter preview metadata to every generated page automatically. No per-page copying is needed.

Add these binary image files to the repository at the exact paths below. This project intentionally does not generate these images:

- \`public/favicon.ico\` — square ICO favicon, preferably including a 48×48 or larger representation.
- \`public/favicon-32x32.png\` — 32×32 PNG browser icon.
- \`public/apple-touch-icon.png\` — 180×180 PNG for iOS bookmarks.
- \`public/icons/icon-192.png\` — 192×192 PNG PWA icon.
- \`public/icons/icon-512.png\` — 512×512 PNG PWA icon.
- \`public/images/nexauren-hub-preview.png\` — 1200×630 PNG social preview.

The code is already configured to read these paths. Until the files are added, their URLs will return 404. Add the files at these exact paths to activate them. The CI workflow validates that every generated HTML page uses the shared metadata but does not fail because the image files have not been supplied yet.

## Design direction

Use a light background and a restrained blend of coral/red, violet, blue and teal, with yellow as a small accent. Keep text high contrast and avoid placing essential text near the edges of the social preview.

## SEO checklist

- Give each tool page a title, H1 and description that describe the actual task.
- Publish useful instructions and working tools rather than repetitive keyword-only copy.
- Keep public tool/category pages crawlable and exclude private account pages from the sitemap.
- Confirm the production domain and submit its sitemap index in Google Search Console.
- Monitor Search Console impressions, clicks, queries, indexing and Core Web Vitals.
- For translated pages, use stable URLs for each language and reciprocal \`hreflang\` annotations; do not rely only on browser-language switching.
