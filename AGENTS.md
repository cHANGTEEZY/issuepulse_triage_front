# TanStack Start

This project runs on TanStack Start — file-based routing over TanStack Router, built with Vite. It is not a Next.js app; do not use `next/*` imports or App Router conventions.

- Routes live in `src/routes/`. `__root.tsx` is the document shell (head, global CSS, `ScrollToTop`, `<Outlet />` / `<Scripts />`). `_app.tsx` is the pathless app layout (sidebar + `<Outlet />`); `_app/index.tsx` renders `@/features/home/page` at `/`, `_app/users.tsx` renders `@/features/users/page` at `/users`, `_app/settings.tsx` renders `@/features/settings/page` at `/settings`. Auth lives outside the app shell in `(auth)/` (`/login`, `/register`, `/otp`, `/reset-password`).
- Feature code lives in `src/features/<feature>/` with its own `components/`, `lib/`, `data/`, `stores/`. Shared UI is `src/components/`, shared helpers `src/lib/`.
- API layer lives in `src/api/` (endpoint registry, resource modules, TanStack Query hooks) on top of `src/lib/apiClient.ts`.
- `robots.txt`, `sitemap.xml` and `llms.txt` are server file routes (`server.handlers.GET`) in `src/routes/`.
- Head/meta comes from each route's `head()` config rendered by `<HeadContent />` — build it with `headMeta()` / `canonicalLink()` from `src/lib/seo.ts`.
- SVGs import as React components with a `?react` suffix (vite-plugin-svgr).
- There is no image optimizer — use the `@/components/_ui/image` shim (plain `<img>`) instead of `next/image`.
- Framework docs: https://tanstack.com/start/latest/docs — check the installed version in `node_modules/@tanstack/react-start`.
