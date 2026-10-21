# Nexauren Hub — Useful Tool Roadmap

## Product rule

The website is an online-tools product first. The home page, top-level navigation, search, categories and individual SEO landing pages should help a visitor finish a task. Native apps belong only on the separate Apps page, linked from the secondary navigation and footer. Avoid app promos on the home page.

## Research notes

A quick review of current online-tool directories shows repeat demand patterns across their publicly featured collections: PDF compression and splitting, image resizing/compression/cropping/conversion, word and character counts, text cleanup and comparison, audio trimming/conversion, JSON formatting, and QR-code generation. Examples include [ZeroFee Tools](https://zerofeetools.com/), [TechbyJeel Tools](https://techbyjeel.com/), [UseFreeTools](https://usefreetools.net/) and [UtilityCove](https://utilitycove.org/). These are observed product patterns, not audited keyword search volumes or a guarantee of traffic.

## Priority 1 — strengthen the four existing categories

### PDF
- Compress PDF with a user-visible quality/size choice and verified output.
- Split PDF by page numbers or ranges.
- Images to PDF.
- PDF pages to PNG/JPG.
- Rotate and reorder pages.

### Image
- Crop and rotate images with a live preview.
- Add common dimension presets for profile pictures, social posts and thumbnails.
- Show original/output dimensions and file sizes before download.
- Strip EXIF/location metadata when exporting, with a clear explanation of what is removed.
- Add HEIC input only after bundling/testing a browser-compatible decoder; do not claim support based only on the file extension.

### Text
- JSON formatter and validator with useful line/column error messages.
- Text diff to compare two passages or code snippets.
- Slug generator for URLs.
- Reading-time estimate in addition to word/character counts.

### Audio
- Join audio clips, after verifying format/sample-rate handling.
- Show duration, sample rate, channel count and waveform preview.
- Add volume normalization or speed change only when export quality has real tests.
- Explain supported codecs and WAV file-size implications.

## Priority 2 — only after the core is reliable

- QR code generator (possibly a future dedicated category).
- CSV/JSON conversion and data-cleaning utilities.
- Everyday calculators and unit converters.
- Developer utilities such as Base64 and URL encode/decode.

## Quality bar for every tool

- One permanent URL and one clear task per page.
- Unique title, meta description, H1, intro, instructions, limitations and FAQ.
- Processing mode stated honestly: local browser processing vs. a remote service.
- Real file/text input, validation, progress or clear busy state, useful error message and working output.
- Keyboard-accessible labels and focus states, usable touch targets and mobile layouts.
- Test files for valid, malformed, empty, unusually large and unsupported inputs.
- Do not generate thin pages just to capture keywords; write for the task and its constraints.
- Keep tool registration in `src/data/data-<category>.json`, category presentation in `src/data/category-<category>.json`, and tool-specific logic in `src/tools/<category>/<slug>/`.

## SEO and discovery checklist

- Static, crawlable HTML for category and individual tool pages.
- Unique descriptive titles and concise meta descriptions; headings should describe the actual task.
- Internal links from categories to tools, from tools to relevant sibling tools, and from every page back to its category.
- Valid sitemap, canonical URLs, robots rules and useful 404 handling.
- Use structured data only when it accurately reflects visible page content; validate before production.
- Measure actual search impressions and query performance in Search Console after launch; prioritize based on data, not guessed search volume.
- Keep the Apps directory separate from the core online-tools journey.
