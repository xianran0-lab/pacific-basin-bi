# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (HMR enabled)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Serve the production build locally
```

No test runner is configured yet.

## Stack

- **React 19** + **TypeScript 6** via **Vite 8**
- **Tailwind CSS v4** — integrated via `@tailwindcss/vite` plugin (no `tailwind.config.*` file). Styles are activated by `@import "tailwindcss"` at the top of `src/index.css`.
- **Recharts** — charting library available for data visualizations

## Architecture

This is a greenfield BI dashboard project. Currently only the Vite scaffold exists in `src/`. The intended direction is a Pacific Basin business intelligence UI built with Recharts charts and Tailwind utility classes.

Key wiring points:
- `vite.config.ts` — registers both `@vitejs/plugin-react` and `@tailwindcss/vite`
- `src/index.css` — global styles; `@import "tailwindcss"` must stay at the top
- `src/main.tsx` → `src/App.tsx` — entry point; replace/extend `App.tsx` for new pages or routes

TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`). All source lives under `src/`; `tsconfig.app.json` scopes compilation to that directory.
