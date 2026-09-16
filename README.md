# WCBT Admin Portal

Admin portal for **WhiteHouse College of Business & Technology — Birtamod Campus**
(Kathmandu University affiliated; BIT and B.Tech Ed IT). Tagline: *Learn. Innovate. Lead.*

A client-side React SPA covering Login → Dashboard → Notifications → Staff → Admissions → Settings,
running entirely on a mock data layer that is structured to be swapped for a real API.

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 8 + React 19 + TypeScript |
| Routing | React Router (`<Routes>` with a `ProtectedRoute` wrapper, lazy-loaded pages) |
| Styling | Tailwind CSS v4 with `wcbt-*` brand tokens in `src/index.css` |
| UI primitives | Hand-rolled headless components in `src/components/ui` (no Radix/shadcn) |
| State | React Context (auth, toasts) + Zustand stores per module |
| Forms | react-hook-form + zod |
| Charts | Recharts |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # oxlint
```

### Demo accounts

All three use the password `wcbt1234`:

| Email | Role | What it demonstrates |
|---|---|---|
| `principal@wcbt.edu.np` | Super Admin | Full access, including salaries and staff deletion |
| `admissions@wcbt.edu.np` | Admin | No salary visibility, cannot delete staff |
| `nabin@wcbt.edu.np` | Staff | Read-only; `/settings` and `/staff/new` redirect away |

## Modules

- **Login** — two-panel layout, show/hide password, remember me, inline error banner, soft lockout
  warning after three failed attempts, and an in-place forgot-password → check-your-email flow.
- **Dashboard** — four stat cards, admissions trend bar chart, staff-by-department donut, recent
  activity timeline, upcoming entrance tests and quick actions.
- **Notifications** — full CRUD in a slide-over with a rich text editor and live preview tab,
  category/audience/status/date filters, duplicate, publish toggle, bulk archive and bulk delete.
- **Staff** — list with filters and CSV export, four-tab create/edit form (personal, employment,
  account, documents) with per-tab error markers, and a profile page with overview, documents and
  an activity log.
- **Admissions** — filterable applicant table with CSV export and bulk stage changes, a five-tab
  application form with a status stepper, permission-gated test scores, "send notification"
  cross-module reuse, and convert-to-student.
- **Programs** — the courses the campus offers, with intake capacity, fees, coordinator and status,
  plus an add/edit side panel. Active programs feed the program select on admission applications,
  and codes are unique because `Admission.program` joins on them.
- **Settings** — general, users & roles (permission matrix), departments & lists, notification
  defaults, locked brand palette, security policy and an audit log.

## Layout of the source

```
src/
  api/          service layer (mock now, HTTP later)
  components/
    admissions/ dashboard/ notifications/ programs/ settings/   module components
    layout/     Sidebar, Topbar, PageHeader, Logo
    shared/     DataTable, Modal, SidePanel, ConfirmDialog, StatusBadge, Can, Toaster
    ui/         headless primitives
  context/      AuthContext, ToastContext
  data/         typed mock records
  layouts/      DashboardLayout
  lib/          utils, permissions, theme, sanitiser
  pages/        route components
  routes/       ProtectedRoute
  store/        Zustand stores
  types/        shared interfaces
  validation/   zod schemas
```

## Brand artwork

`public/logo.png` is the master lockup. The four transparent variants under `src/assets/brand`
(crest/lockup × brand/reversed) are generated from it, together with `public/favicon.png`:

```bash
python3 scripts/build-brand-assets.py
```

Render them through `<Logo />`; use `tone="light"` on maroon surfaces, and prefer `variant="crest"`
below roughly 60px tall, where the lockup's tagline stops being legible.

## Replacing the mock data

Every store calls into `src/api/*.ts`, which currently resolves seeded arrays through
`request()` in `src/api/client.ts` after a short delay. Point those functions at `fetch` and the
components, stores and types stay unchanged.
