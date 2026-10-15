# Kargul Starter

TanStack Start (Vite) + React 19 + Tailwind CSS 4 boilerplate. Read `CONVENTIONS.md` before writing any component, section, or page — it is the whole spec for how this repo is built.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script                 | What it does                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Start the dev server                                               |
| `npm run build`        | Production build                                                   |
| `npm run start`        | Serve the production build                                         |
| `npm run lint`         | ESLint                                                             |
| `npm run to:avif`      | Convert an image to AVIF and report its inline cost — rule 11      |
| `npm run extract:avif` | Pull the first frame of every `.webm` under `public/` as a poster  |
| `npm run frame:rive`   | Render a still from a `.riv` file for use as its poster            |

## First things to set on a new project

1. **`src/lib/seo.ts`** — `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `SITE_ROUTES`. Everything in `src/routes/robots[.]txt.ts`, `src/routes/sitemap[.]xml.ts`, `src/routes/llms[.]txt.ts` and every route's `head()` derives from these. Set `VITE_SITE_URL` in the environment to override the URL per deploy.
2. **`src/styles.css`** — match the `@layer base` type scale and the `--padding-section-*` tokens to the design before building anything (rules 1 and 3).
3. **`public/opengraph-image.jpg`** — 1200×630, referenced by `DEFAULT_OG_IMAGE` in `src/lib/seo.ts`.
4. **Fonts** — `src/styles.css` ships Geist Variable (`@fontsource-variable/geist` via `--font-geist`); swap it for the design's typeface.

## Structure

```
src/routes/       file-based routes + server routes (robots, sitemap, llms)
src/features/     feature folders — page, components, lib, data, stores
src/components/   shared UI (_ui, _common, motion-primitives)
src/lib/          shared helpers (seo, utils, sidebar, easings)
src/router.tsx    TanStack Router config
```

## Docs

| File               | What's in it                                                        |
| ------------------ | ------------------------------------------------------------------- |
| `CONVENTIONS.md`   | The build rules. Read first.                                        |
| `AGENTS.md`        | TanStack Start notes for agents                                     |
| `OPTIMIZATION.md`  | Why `Asset`'s Rive loading is gated behind LCP, with the measurements |
