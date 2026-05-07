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
        styles/
          tokens.css        # Design tokens — single source of truth
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
- Restricted actions must render as visually disabled with a tooltip — never hidden

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
- Spacing, color, and typography always come from tokens — never hardcoded
- Components are small and focused — one responsibility each

### Tokens (`src/shared/styles/tokens.css`)

All colors, spacing, radius, and typography values are defined here as CSS custom properties and consumed via Tailwind or inline styles. Never hardcode hex values or spacing numbers outside of this file.

**Status colors (vehicle domain):**

    --color-status-moving: #22c55e    /* green-500 */
    --color-status-idle: #f59e0b      /* amber-400 */
    --color-status-stopped: #ef4444   /* red-500 */

**Severity colors (alert domain):**

    --color-severity-low: #eab308     /* yellow-500 */
    --color-severity-medium: #f97316  /* orange-500 */
    --color-severity-critical: #ef4444 /* red-500 */

**Role colors (RBAC):**

    --color-role-admin: #ef4444
    --color-role-operator: #378add
    --color-role-viewer: #888780

**Surfaces and text** use Tailwind's dark mode utilities (`dark:bg-*`, `dark:text-*`) rather than custom variables, to stay idiomatic with Tailwind v4.

**Border style:** `border border-zinc-200 dark:border-zinc-800` — always 1px, always subtle.

**Border radius:** `rounded-md` (8px) for most elements, `rounded-lg` (12px) for cards and panels.

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

These are the only building blocks used across features. Do not create one-off styled elements inside feature components.

**`Badge`** — displays vehicle status or alert severity.

- Props: `variant: VehicleStatus | AlertSeverity`
- Style: pill shape, dark background of the semantic color + light text of the same ramp
- Example: `<Badge variant="critical" />`

**`StatusDot`** — small colored circle, used in logs and compact lists.

- Props: `status: VehicleStatus | AlertSeverity`

**`Button`** — all interactive actions.

- Props: `variant: 'default' | 'primary' | 'danger' | 'ghost'`, `disabled`, `tooltip`
- When `disabled` due to permissions, render visually muted with a tooltip explaining why

**`Card`** — generic surface wrapper.

- Props: `children`, optional `className`
- Style: white/zinc-900 background, 1px border, `rounded-lg`, `p-4`

**`PanelHeader`** — top bar for side panels (alerts, vehicle detail).

- Props: `title`, `subtitle`, `onClose`
- Always includes a close button aligned to the right

**`EmptyState`** — shown when a list has no items.

- Props: `message`
- Style: centered, muted text, no icon required

### Patterns

- Loading states: use skeleton placeholders (`animate-pulse`), not spinners
- Empty states: always render `<EmptyState />`, never null or blank space
- Disabled actions: render the element with `opacity-40 cursor-not-allowed` + tooltip — do not hide it
- Transitions: `transition-colors duration-150` on interactive elements, nothing more
- Panel open/close: `transition-transform duration-200` sliding from the right

### Dark / Light mode

- Use Tailwind's `dark:` variant on every element that needs a different appearance
- Test mentally: if the background were near-black, would every text and icon still be readable?
- Never use `text-gray-*` alone — always pair with `dark:text-*` counterpart

---

## Code Guidelines

- TypeScript with explicit types — no `any` unless strictly necessary
- Keep components small and focused on one responsibility
- Logic goes in hooks, not components
- Feature code stays inside its feature folder
- Shared code only goes to `shared/` or `core/` if used by 2+ features
- Build incrementally — MVP first, no overengineering
- When adding a new UI element, check `shared/ui/` first before creating something new

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
