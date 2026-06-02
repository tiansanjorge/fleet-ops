# CLAUDE.md — FleetOps

## Qué es este proyecto

FleetOps es un proyecto de portfolio senior-level. Simula un centro de control operacional de flota vehicular. El objetivo no es un producto real — es demostrar arquitectura fullstack limpia, explicable en entrevistas.

Frase guía: **"Esto podría conectarse a un backend real mañana sin cambiar el frontend."**

---

## Estado actual

El proyecto es un **monorepo pnpm** con tres workspaces:

```
fleet-ops/
├── apps/
│   ├── web/     # Next.js 16 — frontend completo, corriendo con MSW
│   └── api/     # Fastify 5 — backend con Prisma + PostgreSQL
├── packages/
│   └── types/   # @fleetops/types — tipos de dominio compartidos
├── docker-compose.yml
├── pnpm-workspace.yaml
└── CLAUDE.md
```

**Frontend (apps/web):** completo y funcionando. Mapa con 8 vehículos moviéndose en tiempo real (simulado), alertas automáticas por severidad, RBAC con roles admin/operator/viewer, activity log. Datos vienen de MSW.

**Backend (apps/api):** Fastify 5 corriendo en puerto 4000. Prisma conectado a PostgreSQL dockerizado. Schema migrado, seed aplicado (8 vehículos + 3 usuarios). Health check real (`SELECT 1`). Rutas de dominio, JWT y Socket.io **pendientes**.

**Tipos compartidos (packages/types):** `@fleetops/types` con todos los tipos de dominio. 28 imports en el frontend apuntan a este package.

---

## Stack completo

### Frontend (apps/web)

- Next.js 16.2.4 (App Router)
- TypeScript
- Zustand (estado de dominio)
- React Query (estado de servidor / async)
- MSW (mock API — activo en dev vía `NEXT_PUBLIC_API_MOCK`)
- React Leaflet (mapa)
- Tailwind v4

### Backend (apps/api)

- Fastify 5 + TypeScript
- Prisma 6.x + PostgreSQL (Docker local, Railway en prod)
- Socket.io 4 (pendiente de implementar)
- @fastify/jwt (pendiente)
- fastify-type-provider-zod + Zod 4
- bcryptjs (passwords)
- tsx watch (dev, sin compilación)

### Infraestructura

- pnpm workspaces (sin Turborepo — 3 paquetes no lo justifican)
- Docker Desktop — solo Postgres en contenedor, API y web corren en host
- Railway (deploy futuro — API + Postgres)
- Vercel (deploy futuro — frontend)

---

## Estructura apps/web/src

```
src/
  app/                    # Next.js App Router
  features/
    vehicles/             # Mapa, markers, panel de detalle, CRUD
    alerts/               # Lista de alertas, severidad, dismiss
    users/                # Gestión de usuarios, cambio de rol
  core/
    api/                  # Fetch wrapper base
    permissions/          # RBAC — can('action:resource')
    realtime/             # realtimeEngine.ts — se reemplazará por Socket.io
    auth/                 # Sesión actual
  shared/
    ui/                   # Componentes genéricos reutilizables
    hooks/
    utils/
  mocks/
    db.ts                 # Base de datos in-memory
    handlers.ts           # Handlers MSW
```

---

## Estructura apps/api/src

```
src/
  server.ts               # Entry point — listen()
  app.ts                  # Builder Fastify (separable para tests)
  config/
    env.ts                # Valida process.env con Zod
  plugins/
    prisma.ts             # fastify.prisma — singleton PrismaClient ✅
    auth.ts               # fastify.authenticate — preHandler JWT (pendiente)
    cors.ts               # @fastify/cors (pendiente)
    socketio.ts           # fastify.io + middleware JWT (pendiente)
  modules/                # Un módulo = un dominio
    auth/                 # POST /auth/login, GET /auth/me (pendiente)
    vehicles/             # GET/POST/PUT/DELETE /vehicles (pendiente)
    alerts/               # GET /alerts, PATCH /alerts/:id (pendiente)
    users/                # GET /users, PATCH /users/:id (pendiente)
  realtime/
    simulation.ts         # setInterval — mueve vehículos + emite eventos (pendiente)
    events.ts             # Constantes de nombres de eventos (pendiente)
  lib/
    hash.ts               # bcryptjs wrappers (pendiente)
    errors.ts             # Error helpers (pendiente)
```

---

## Domain Model

Tipos canónicos en `packages/types/src/index.ts`. Siempre importar desde `@fleetops/types`.

```ts
type VehicleStatus = "moving" | "idle" | "stopped";
interface Vehicle {
  id: string;
  label: string;
  position: [number, number]; // [lat, lng]
  status: VehicleStatus;
  driverId?: string;
}

type AlertSeverity = "low" | "medium" | "critical";
interface Alert {
  id: string;
  vehicleId: string;
  severity: AlertSeverity;
  message: string;
  timestamp: number; // epoch ms
  read: boolean;
  dismissed: boolean;
}

type UserRole = "admin" | "operator" | "viewer";
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

**Transformación en routes del backend:** la DB guarda `lat: Float, lng: Float`. Los handlers convierten a `position: [lat, lng]` para mantener el contrato del frontend intacto.

---

## Permisos (RBAC)

- Patrón: `can('action:resource')`
- Ejemplos: `can('edit:vehicle')`, `can('view:alerts')`, `can('manage:users')`
- Roles: `admin` (full), `operator` (ver + actuar), `viewer` (solo lectura)
- La lógica vive en `apps/web/src/core/permissions/`
- Los componentes **nunca** hardcodean checks de rol — siempre usan `can()`

---

## API

### MSW (desarrollo con mock)

Activo cuando `NEXT_PUBLIC_API_MOCK=true`. Intercepta todos los fetch del frontend.

- `GET /vehicles`
- `GET /alerts`
- `GET /users`

### Fastify (backend real)

Corre en `localhost:4000`. Activo cuando `NEXT_PUBLIC_API_MOCK=false`.

- `GET /health` → `{ status: 'ok', db: 'connected' }` ✅
- `POST /auth/login` → `{ token, user }` (pendiente)
- `GET /auth/me` (pendiente)
- `GET /vehicles`, `POST`, `PUT /:id`, `DELETE /:id` (pendiente)
- `GET /alerts`, `PATCH /:id` (pendiente)
- `GET /users`, `PATCH /:id/role` (pendiente)

---

## Realtime

### Actual (simulado en frontend)

`core/realtime/realtimeEngine.ts` — setInterval que emite posiciones y alertas.

### Target (Socket.io)

Single namespace `/`, sin rooms en MVP. Auth en handshake con JWT.

Eventos server → cliente:

- `vehicle:position` → `{ id, position: [lat, lng], status }`
- `vehicle:created / updated / deleted`
- `alert:new` → Alert completo

Eventos cliente → server: ninguno en MVP. Mutaciones siguen siendo REST.

El `realtimeEngine.ts` del frontend está diseñado para que el cambio sea quirúrgico — solo cambia la implementación, no los consumidores.

---

## Estado management

- **Local state** — UI-only (modales, inputs)
- **Zustand** — estado de dominio (vehicles, alerts, auth)
- **React Query** — estado de servidor / async
- No introducir estado global sin necesidad clara
- Los stores son **agnósticos de la fuente de datos** — no saben si los datos vienen de MSW o del backend real

---

## Prisma

- Schema en `apps/api/prisma/schema.prisma`
- Config en `apps/api/prisma.config.ts` (formato Prisma 6/7)
- Migrations en `apps/api/prisma/migrations/`
- Seed: `pnpm --filter api exec prisma db seed`
- Versión: 6.19.x — el linter de VS Code muestra warning sobre `url` en schema (es ruido visual de la transición 6→7, no bloquea nada)

---

## Variables de entorno

### apps/api/.env (no commitear)

```
DATABASE_URL="postgresql://fleetops:fleetops@localhost:5432/fleetops?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### apps/web/.env.local (no commitear)

```
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="http://localhost:4000"
NEXT_PUBLIC_API_MOCK="true"
```

---

## Cómo levantar el proyecto

```powershell
# Terminal 1 — Postgres
docker compose up -d postgres

# Terminal 2 — API
pnpm dev:api

# Terminal 3 — Frontend
pnpm dev:web
```

---

## Decisiones arquitectónicas clave

| Decisión          | Elección                            | Por qué                                                                    |
| ----------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Monorepo          | pnpm workspaces                     | Nativo, sin overhead. Turborepo se agrega si la build se vuelve lenta      |
| Framework backend | Fastify 5                           | Más liviano que NestJS, más explicable para portfolio frontend-oriented    |
| ORM               | Prisma                              | Type-safe, migrations, familiar para frontend devs                         |
| Mock API          | MSW                                 | Intercepta fetch real — el frontend no sabe si habla con MSW o backend     |
| Tipos compartidos | Sin build (tsx + transpilePackages) | Cero overhead, cambio en types se refleja en ambos workspaces sin compilar |
| Passwords         | bcryptjs                            | Evita node-gyp en Windows                                                  |
| Timestamps Alert  | BigInt en DB                        | Epoch ms — se transforma en la capa de routes                              |
| Socket.io rooms   | Sin rooms en MVP                    | Se agregan después si hace falta filtrar por vehículo                      |

---

## Convenciones de código

- TypeScript explícito — no `any` salvo necesidad estricta
- Componentes pequeños, responsabilidad única
- Lógica en hooks, no en componentes
- Código de feature dentro de su carpeta de feature
- Código compartido solo va a `shared/` o `core/` si lo usan 2+ features
- En el backend: módulos por dominio, no por capas. El handler de la ruta ES el service en MVP
- Siempre poder explicar: problema → decisión → trade-off

---

## Credenciales demo (seed)

```
        admin@fleetops.dev / admin123 / rol admin
        operator@fleetops.dev / password / rol operator
        viewer@fleetops.dev / password / rol viewer
```

---

## Lo que falta (próximas fases)

1. **Rutas de dominio** — vehicles, alerts, users con Zod schemas
2. **JWT auth** — POST /auth/login, plugin auth.ts, preHandler en rutas protegidas
3. **Socket.io** — plugin socketio.ts, simulation.ts con setInterval server-side
4. **Adaptador frontend** — cliente fetch que lee NEXT_PUBLIC_API_MOCK, cliente Socket.io que reemplaza realtimeEngine
5. **Deploy** — Vercel (web) + Railway (api + postgres)
6. **README** — arquitectura y decisiones para el portfolio
