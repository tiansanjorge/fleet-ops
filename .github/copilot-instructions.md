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
        ui/                 # Generic reusable components
        hooks/              # Generic reusable hooks
        utils/              # Generic helpers
      mocks/
        db.ts           # In-memory database
        handlers.ts     # MSW handlers

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

## Code Guidelines

- TypeScript with explicit types — no `any` unless strictly necessary
- Keep components small and focused on one responsibility
- Logic goes in hooks, not components
- Feature code stays inside its feature folder
- Shared code only goes to `shared/` or `core/` if used by 2+ features
- Build incrementally — MVP first, no overengineering

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
