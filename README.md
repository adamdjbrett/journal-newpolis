# The New Polis — Eleventy Conversion

This is an Eleventy (11ty) project generated from the uploaded static site.

## What you have

- `src/` contains the original site's files, preserving the folder structure.
- A starter Nunjucks layout at `src/_includes/base.njk` (not applied by default).
- Passthrough copy is enabled for common asset directories we detected: (none detected).

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:8080

## Build for production

```bash
npm run build
```

Your built site will be in `_site/`.

## Notes

- Existing `.html` files are left untouched so the site renders as-is through Eleventy.
- If you want to convert pages into Nunjucks/Liquid templates with a shared layout:
  1. Add front matter to a page, for example:
     ```
     ---
     title: Home
     layout: base.njk
     ---
     ```
  2. Remove duplicate outer `<html>...</html>` wrappers so the page content injects into the layout's `{ content }`.
- Add or adjust passthroughs in `.eleventy.js` if you bring in new asset folders.
