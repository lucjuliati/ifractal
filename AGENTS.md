# AGENTS.md

## Project Overview

**next-fractal** is an employee time-tracking dashboard built with Next.js 16 (App Router). It connects to an external iFractal/ifponto API (`stou.ifractal.com.br/fulltime`) to fetch punch-clock data, display daily work metrics, and show historical hours over the last 7–30 workdays.

The UI is in Brazilian Portuguese (pt-BR).

## Tech Stack

- Next.js 16.1.6 (App Router, Server Actions, Server Components)
- React 19.2.3
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Recharts (bar chart for daily hours)
- date-fns (date math, timezone offset -03:00)
- Vitest 4 + React Testing Library + jsdom
- ESLint 9 (next core-web-vitals + typescript)
- IndexedDB (client-side persistence via custom `IndexedDBUtil` wrapper)

## Architecture

### Routing (App Router)

```
src/app/(app)/
├── layout.tsx            # Root HTML layout (Geist fonts, pt-BR lang)
├── page.tsx              # Dashboard home (SSR, fetches initial data)
├── (auth)/login/         # Login page + form
├── phonto/               # Punch registration with photo flow
└── _components/          # Client components (Main, TimeClock, History, Chart)

src/app/api/
├── data/route.ts         # GET /api/data — returns user dashboard JSON
├── data/report/route.ts  # GET /api/data/report — single-day report
└── logout/               # Logout handler (rewrite from /logout)
```

### Key Path Aliases

- `@/*` → `./src/*`
- `@/components/*` → `./src/app/(app)/_components/*`

### Authentication

1. Login form submits credentials via server action (`loginAction`)
2. External API returns a `STOU_Sistemas` session cookie
3. App stores `{externalToken}:{username}` in an httpOnly cookie named `s_token`
4. `proxy.ts` middleware redirects unauthenticated users to `/login`
5. `getToken()` parses the cookie back into `{ token, user }`
6. `/logout` rewrites to `/api/logout` which clears the cookie

### Data Flow

1. `page.tsx` calls `getData()` server-side on initial load
2. `getData()` fetches the user's dashboard from the external API and calls `handleInterval()` for historical data
3. `handleInterval()` builds a workday range (7–30 days, skipping weekends), fetches each day's punch data in parallel, calculates totals, and caches per-user via `TTLCache`
4. Client-side `Main` component polls `/api/data` every 60 seconds (skips when tab is hidden)
5. `History` component syncs fetched data into IndexedDB for offline persistence

### Caching

- `TTLCache` — in-memory singleton with TTL-based expiration and periodic cleanup
- Used in `handleInterval()` to avoid re-fetching historical data on every request
- TTL is ~5 minutes (300,000ms)

### Client-Side Storage (IndexedDB)

- Database: `"dates"`, store: `"records"`
- Indexes: `byDate`, `byUser`, `byUserAndDate` (compound)
- `History` component reads/writes records per user
- `IndexedDBUtil` class provides a Promise-based CRUD API

## Commands

| Command          | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start dev server               |
| `npm run build`  | Production build               |
| `npm run start`  | Start production server        |
| `npm run lint`   | ESLint                         |
| `npm run test`   | Vitest (single run)            |
| `npm run check`  | TypeScript type check (noEmit) |

## Testing

- Framework: Vitest 4 with jsdom environment
- Setup: `src/__tests__/setup.ts` (imports `@testing-library/jest-dom`)
- Tests live in `src/__tests__/` mirroring the source structure
- External dependencies (session, config, cache, navigation) are mocked in each test file
- Run with `npm run test` (uses `vitest --run` for single execution)

## Important Conventions

- Server actions are in `src/lib/actions/`
- Utility functions are in `src/lib/utils/`
- All external API calls go through `baseUrl` (`https://stou.ifractal.com.br/fulltime`)
- Time calculations use a hardcoded `-03:00` offset (São Paulo timezone)
- The daily work target is 8 hours — totals are expressed as balance against this
- `reactStrictMode` is disabled in next.config.ts
