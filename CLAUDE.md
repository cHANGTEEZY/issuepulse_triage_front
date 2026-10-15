@AGENTS.md

@CONVENTIONS.md

Read `CONVENTIONS.md` before writing any component, section, or page. Rule 1 comes first on every design: check the design's mobile + desktop `h1`/`h2`/`h3`/`p` values against the `@layer base` scale in `src/styles.css` and update the globals if they don't match. The rest covers the component + asset folder structure, section structure, typography rules, `Button` usage (always pass an explicit `variant`), `em`-based max-widths, Tailwind-only styling, the outline patterns for borders between items, SVG handling (`<Image />` by path, SVGR component only when it needs CSS), the shared GSAP power easings for Tailwind and Framer Motion, inlining the navbar + hero assets so the first screen paints instantly, the responsive layout patterns (aspect-ratio wrappers, absolute bleeds, negative-margin overlaps), the no-comments rule, the Figma layer-name directives (`[[hover]]`, `[[export]]`, `[[lightbox-image]]`), the `Asset` component — every image, video, Rive and Lottie goes through it, typed by `type` with `width`/`height` as the aspect ratio — icons exported from Figma instead of any icon library, the managed scroll restoration in `ScrollToTop`, and the SEO layer (`src/lib/seo.ts` → `headMeta()` + route `head()`, server routes `src/routes/robots[.]txt.ts`, `sitemap[.]xml.ts`, `llms[.]txt.ts`).

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
