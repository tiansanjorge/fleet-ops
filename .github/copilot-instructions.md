# Copilot Instructions — FleetOps

## Project Overview

FleetOps is a frontend system that simulates a real-time fleet tracking platform built as a senior-level portfolio project.

Core idea:

- Vehicles displayed on a map with real-time position updates (simulated)
- Alert system with severity levels
- Role-based access control (RBAC)
- Activity log of live events

---

## Stack

- React + TypeScript
- Zustand (global/domain state)
- React Query (server state, async)
- MSW (mock API, intercepts fetch)
- React Leaflet (map)
- Next.js 15 (App Router)
- Tailwind CSS v4

---

## File Structure

    src/
      app/                  # Next.js App Router (layout, pages, routing)
      features/
        vehicles/
          components/
          hooks/
          store/
          api/
          types.ts
          utils.ts
        alerts/
          components/
          store/
          api/
          types.ts
        users/
          components/
          store/
          api/
          types.ts
      core/
        api/                # Base fetch wrapper
        permissions/        # RBAC logic
        realtime/           # setInterval event emitter
        auth/               # Current user / session
      shared/
        ui/                 # Generic reusable components (Badge, Button, Card, etc.)
        hooks/              # Generic reusable hooks
        utils/              # Generic helpers
      mocks/
        db.ts               # In-memory database
        handlers.ts         # MSW handlers

---

## Domain Model

    type VehicleStatus = 'moving' | 'idle' | 'stopped'

    interface Vehicle {
      id: string
      label: string
      position: [number, number] // [lat, lng]
      status: VehicleStatus
      driverId?: string
    }

    type AlertSeverity = 'low' | 'medium' | 'critical'

    interface Alert {
      id: string
      vehicleId: string
      severity: AlertSeverity
      message: string
      timestamp: number
      read: boolean
    }

    type UserRole = 'admin' | 'operator' | 'viewer'

    interface User {
      id: string
      name: string
      role: UserRole
    }

---

## Permissions (RBAC)

- Pattern: `can('action:resource')`
- Examples: `can('edit:vehicle')`, `can('view:alerts')`, `can('manage:users')`
- Roles:
  - `admin` — full access
  - `operator` — can view and act on vehicles/alerts
  - `viewer` — read only
- Permission logic lives in `core/permissions/`
- Components never hardcode role checks, always use `can()`
- Restricted actions must always render — never use conditional rendering to hide them based on permissions. When a user lacks permission, render the action with `disabled`, `opacity-40`, `cursor-default`, `pointer-events-none`, and a tooltip explaining why. This applies to every interactive element gated by can().

---

## API (MSW)

- MSW intercepts all fetch requests in development
- Endpoints:
  - `GET /vehicles`
  - `GET /alerts`
  - `GET /users`
- In-memory database in `src/mocks/db.ts`
- Handlers in `src/mocks/handlers.ts`

---

## Realtime (Simulated)

- `setInterval` in `core/realtime/` emits position updates and new alerts
- Updates vehicle positions slightly every 1–2 seconds
- Designed to be replaceable by WebSockets later without changing consumers

---

## State Management

- Local state for UI-only concerns
- Zustand for domain state (vehicles, alerts)
- React Query for async/server state
- Do not introduce global state unless there is a clear need

---

## Design System

### Philosophy

- Clean, modern dashboard aesthetic
- Dark and light mode — both must work at all times
- Flat design: no gradients, no drop shadows, no glow effects
- Semantic colors are mapped in each component using Tailwind classes — never use `style={{}}` or hardcoded hex values
- Components are small and focused — one responsibility each
- When creating any new component, never use style={{}}. If Tailwind doesn't have a utility for something, use arbitrary values like w-[320px] or top-[24px] instead.

### Color pattern

Semantic color mapping lives inside each component as a `Record<variant, string>`. This is the established pattern — follow it consistently.

Example from `Badge`:

    const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
      moving:   { bg: 'bg-green-500/15',  text: 'text-green-400'  },
      idle:     { bg: 'bg-amber-400/15',  text: 'text-amber-400'  },
      stopped:  { bg: 'bg-red-500/15',    text: 'text-red-400'    },
      low:      { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
      medium:   { bg: 'bg-orange-500/15', text: 'text-orange-400' },
      critical: { bg: 'bg-red-500/15',    text: 'text-red-400'    },
    }

Reference colors by domain meaning:

- Vehicle status: `green` (moving) · `amber` (idle) · `red` (stopped)
- Alert severity: `yellow` (low) · `orange` (medium) · `red` (critical)
- Roles: `red` (admin) · `blue` (operator) · `zinc` (viewer)

### Surfaces and borders

Surfaces and text use **semantic token utilities** defined in `globals.css` via `@theme inline`. **Always use the token utility — never replace it with a raw zinc class, even if you know the current mapped value.** This is what makes theme changes possible from a single file. When in doubt, reach for the token first.

| Purpose                | Token utility       | Light value | Dark value |
| ---------------------- | ------------------- | ----------- | ---------- |
| Page background        | `bg-background`     | white       | zinc-950   |
| Panel / sidebar        | `bg-surface`        | zinc-100    | zinc-900   |
| Card                   | `bg-card`           | white       | zinc-900   |
| Raised card / elevated | `bg-surface-raised` | white       | zinc-800   |
| Border                 | `border-border`     | zinc-200    | zinc-800   |
| Primary text           | `text-foreground`   | #171717     | zinc-50    |
| Secondary / muted text | `text-muted`        | zinc-500    | zinc-400   |

Opacity modifiers work with tokens: `bg-card/70`, `border-border/50`.

**globals.css architecture — canonical Tailwind v4 pattern:**
Raw CSS variables live in `:root` and `.dark`. Tailwind `@theme inline` references them via `var()`. Never put static values directly in `@theme inline` — that causes Tailwind to bake in the light-mode value at build time and tokens won't respond to dark mode.

```
:root { --foreground: #171717; }
.dark { --foreground: #fafafa; }
@theme inline { --color-foreground: var(--foreground); }  ← correct
```

**What NOT to migrate:** hover state backgrounds, domain-specific colors (severity, status, roles), and one-off interactive shades — these stay as explicit zinc classes.

### Typography

- Two weights only: `font-normal` (400) and `font-medium` (500). Never `font-semibold` or `font-bold`.
- Scale: `text-xs` (11–12px) for metadata, `text-sm` (13px) for body, `text-base` (15px) for titles, `text-lg` (18px) for headings.
- Monospace (`font-mono`) for coordinates, IDs, timestamps, and log entries.
- Sentence case everywhere — never ALL CAPS or Title Case in UI labels.

### Map

- Tile layer: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)
- Vehicle markers: SVG pin with status color fill and white stroke
- Selected marker: larger `iconSize`, same color — never a different shape
- No popups — selection opens the detail panel instead

### Shared UI components (`src/shared/ui/`)

These are the only building blocks used across features. Do not create one-off styled elements inside feature components. Always check `shared/ui/` before creating anything new.

**`Badge`** — displays vehicle status or alert severity.

- Props: `variant: VehicleStatus | AlertSeverity`
- Style: pill shape, translucent background + matching text color

**`StatusDot`** — small colored circle, used in logs and compact lists.

- Props: `status: VehicleStatus | AlertSeverity`

**`Button`** — all interactive actions.

- Props: `variant: 'default' | 'primary' | 'danger' | 'ghost'`, `disabled`, `tooltip`
- When `disabled` due to permissions, render with `opacity-40 cursor-default pointer-events-none` + tooltip explaining why

**`Card`** — generic surface wrapper.

- Props: `children`, optional `className`
- Style: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4`

**`PanelHeader`** — top bar for side panels (alerts, vehicle detail).

- Props: `title`, `subtitle`, `onClose`
- Always includes a close button aligned to the right

**`EmptyState`** — shown when a list has no items.

- Props: `message`
- Style: centered, muted text

### Patterns

- Loading states: use skeleton placeholders (`animate-pulse`), not spinners
- Empty states: always render `<EmptyState />`, never null or blank space
- Disabled actions: render with `opacity-40`, `cursor-default` and `pointer-events-none` + tooltip — never hidden
- Transitions: `transition-colors duration-150` on interactive elements, nothing more
- Panel open/close: `transition-transform duration-200` sliding from the right

### Dark / Light mode

- Use Tailwind's `dark:` variant on every element that needs a different appearance
- Every color class must have its `dark:` counterpart — no exceptions
- Never use `text-gray-*` — use `text-zinc-*` with its `dark:` pair
- Mental check before finishing a component: would every element be readable on a near-black background?

---

## Code Guidelines

- TypeScript with explicit types — no `any` unless strictly necessary
- Keep components small and focused on one responsibility
- Logic goes in hooks, not components
- Feature code stays inside its feature folder
- Shared code only goes to `shared/` or `core/` if used by 2+ features
- Build incrementally — MVP first, no overengineering
- Never use `style={{}}` — all styles via Tailwind classes
- **Always prefer semantic token utilities over raw Tailwind classes.** Before writing any color class (`text-zinc-*`, `bg-zinc-*`, `border-zinc-*`, etc.), check if a token utility covers it (`text-foreground`, `text-muted`, `bg-surface`, `bg-card`, `bg-surface-raised`, `border-border`). Raw zinc classes are only allowed for hover states, domain-specific colors (severity, status, roles), and one-off interactive shades not covered by any token.
- All interactive elements (buttons, links, clickable divs) must have `cursor-pointer`. Disabled elements use `opacity-40`, `cursor-default` and `pointer-events-none` — never `cursor-not-allowed`.

---

## MVP Definition (first goal)

1. Map rendering vehicles with markers
2. Positions updating every 1–2s (fake realtime)
3. Click on vehicle → basic detail panel
4. Data served by MSW

---

## Memory Keys

- "fleet-ops/stack"
- "fleet-ops/decisiones"
- "fleet-ops/convenciones"
- "fleet-ops/design-system"
