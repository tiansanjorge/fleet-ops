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
│   ├── web/     # Next.js 16 — frontend completo
│   └── api/     # Fastify 5 — backend completo con Prisma + Socket.io + JWT
├── packages/
│   └── types/   # @fleetops/types — tipos de dominio compartidos
├── docker-compose.yml
├── pnpm-workspace.yaml
└── CLAUDE.md
```

**Frontend (apps/web):** completo y funcionando en ambos modos.
- `NEXT_PUBLIC_API_MOCK=true` → MSW intercepta todos los fetch, simulación de movimiento y alertas en cliente.
- `NEXT_PUBLIC_API_MOCK=false` → fetch real a Fastify (puerto 4000), JWT en localStorage, Socket.io conectado al backend (simulación server-side).

**Backend (apps/api):** completo. Fastify 5 en puerto 4000. Prisma + PostgreSQL dockerizado. JWT auth. Socket.io con simulación server-side que replica exactamente el comportamiento del frontend mock. CORS configurado. Todos los endpoints de dominio implementados.

**Tipos compartidos (packages/types):** `@fleetops/types` con todos los tipos de dominio + permisos RBAC. 28+ imports en el frontend apuntan a este package.

### Fases completadas

- **Fase F** ✅ — Rutas de dominio completas (vehicles, alerts, users con Zod schemas)
- **Fase G** ✅ — JWT auth (POST /auth/login, GET /auth/me, plugin auth.ts, RBAC compartido en @fleetops/types)
- **Fase H** ✅ — Socket.io + simulación server-side (réplica fiel del frontend mock)
- **Fase I** ✅ — Adaptador frontend completo. Con `NEXT_PUBLIC_API_MOCK=false` el frontend consume la API real, login JWT real, WebSockets funcionando. CORS configurado. MSW sigue funcionando con `NEXT_PUBLIC_API_MOCK=true`.
- **Deploy prep** ✅ — `postinstall: prisma generate` en apps/api, `start` sin `--env-file`, `transpilePackages` verificado en next.config.ts, `.env` no trackeado en git.

---

## Stack completo

### Frontend (apps/web)

- Next.js 16.2.4 (App Router)
- TypeScript
- Zustand (estado de dominio)
- React Query (estado de servidor / async)
- MSW (mock API — activo en dev vía `NEXT_PUBLIC_API_MOCK=true`)
- React Leaflet (mapa)
- Tailwind v4
- socket.io-client 4

### Backend (apps/api)

- Fastify 5 + TypeScript
- Prisma 6.x + PostgreSQL (Docker local, Railway en prod)
- Socket.io 4
- @fastify/jwt
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
    api/
      client.ts           # apiFetch — wrapper que inyecta JWT y construye URL absoluta en modo real
    permissions/          # RBAC — can('action:resource')
    realtime/
      realtimeEngine.ts   # mock=true → timer local; mock=false → connectSocket()
      socketClient.ts     # Socket.io singleton con JWT en handshake
    auth/                 # Sesión actual (authStore con token + user)
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
    auth.ts               # fastify.authenticate + fastify.authorize — preHandlers JWT/RBAC ✅
    cors.ts               # @fastify/cors con methods y allowedHeaders explícitos ✅
    socketio.ts           # fastify.io + middleware JWT ✅
  modules/
    auth/                 # POST /auth/login, GET /auth/me ✅
    vehicles/             # GET/POST/PUT/DELETE /vehicles ✅
    alerts/               # GET /alerts, PATCH /alerts/:id ✅
    users/                # GET /users, PATCH /users/:id/role ✅
  realtime/
    simulation.ts         # setInterval — mueve vehículos + emite eventos ✅
    events.ts             # Constantes de nombres de eventos ✅
  lib/
    hash.ts               # bcryptjs wrappers ✅
    errors.ts             # Error helpers ✅
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
- `PUT /vehicles/:id`
- `DELETE /vehicles/:id`
- `PATCH /users/:id/role`

### Fastify (backend real)

Corre en `localhost:4000`. Activo cuando `NEXT_PUBLIC_API_MOCK=false`.

- `GET /health` → `{ status: 'ok', db: 'connected' }` ✅
- `POST /auth/login` → `{ token, user }` ✅
- `GET /auth/me` ✅
- `GET /vehicles` ✅
- `POST /vehicles` ✅
- `PUT /vehicles/:id` ✅
- `DELETE /vehicles/:id` ✅
- `GET /alerts` ✅
- `PATCH /alerts/:id` ✅
- `GET /users` ✅
- `PATCH /users/:id/role` ✅

---

## Realtime

### mock=true (simulado en cliente)

`core/realtime/realtimeEngine.ts` — setInterval que emite posiciones y alertas desde el cliente. `startRealtimeEngine(onTick)` corre el timer local.

### mock=false (Socket.io real)

`realtimeEngine.ts` → `connectSocket()` → Socket.io singleton con JWT en handshake (`auth: { token }`). Los consumidores del engine no cambian — el cambio es quirúrgico.

Eventos server → cliente:

- `vehicle:position` → `{ id, position: [lat, lng], status }`
- `vehicle:created` → Vehicle completo
- `vehicle:updated` → Vehicle completo
- `vehicle:deleted` → `{ id }`
- `alert:new` → Alert completo

Eventos cliente → server: ninguno en MVP. Mutaciones siguen siendo REST.

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
NEXT_PUBLIC_API_MOCK="true"   # cambiar a "false" para usar el backend real
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

| Decisión              | Elección                            | Por qué                                                                    |
| --------------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Monorepo              | pnpm workspaces                     | Nativo, sin overhead. Turborepo se agrega si la build se vuelve lenta      |
| Framework backend     | Fastify 5                           | Más liviano que NestJS, más explicable para portfolio frontend-oriented    |
| ORM                   | Prisma                              | Type-safe, migrations, familiar para frontend devs                         |
| Mock API              | MSW                                 | Intercepta fetch real — el frontend no sabe si habla con MSW o backend     |
| Tipos compartidos     | Sin build (tsx + transpilePackages) | Cero overhead, cambio en types se refleja en ambos workspaces sin compilar |
| Passwords             | bcryptjs                            | Evita node-gyp en Windows                                                  |
| Timestamps Alert      | BigInt en DB                        | Epoch ms — se transforma en la capa de routes                              |
| Socket.io rooms       | Sin rooms en MVP                    | Se agregan después si hace falta filtrar por vehículo                      |
| CORS allowedHeaders   | Explícitos (Content-Type, Auth)     | Sin lista explícita, algunos browsers no envían PUT/DELETE tras preflight  |
| createVehicle no-mock | addVehicle solo vía socket          | El POST emite vehicle:created — agregar desde REST y socket causa duplicado |

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
anagarcia@fleetops.com    / admin123  / rol admin    (Ana García)
carlosmendez@fleetops.com / password  / rol operator (Carlos Méndez)
laurarios@fleetops.com    / password  / rol viewer   (Laura Ríos)
```

---

## Lo que falta

1. **Deploy Render + Neon + Vercel** — pendiente (ver orden de operaciones abajo)
2. **README** — arquitectura y decisiones para el portfolio

### Plan de deploy

**Infraestructura decidida:**
- PostgreSQL: Neon (free tier, no expira)
- API: Render Web Service (free tier) — `render.yaml` en raíz del repo
- Frontend: Vercel (free tier) — root directory `apps/web`
- Anti-sleep: UptimeRobot pingea `GET /health` cada 5 minutos (config manual post-deploy)

**Orden de operaciones:**
1. Neon: crear proyecto → obtener `DATABASE_URL`
2. Render: crear Web Service desde repo (`tiansanjorge/fleet-ops`), rama `auth-socket`, usar `render.yaml`
3. Render: agregar env vars — `DATABASE_URL` (Neon), `JWT_SECRET` (generar con `openssl rand -base64 32`), `CORS_ORIGIN` placeholder
4. Render: primer deploy → verificar en logs que `prisma generate` corre en postinstall
5. Render shell: `pnpm --filter @fleetops/api exec prisma migrate deploy`
6. Render shell: `pnpm --filter @fleetops/api exec prisma db seed`
7. Render: obtener URL pública del servicio (ej: `https://fleetops-api.onrender.com`)
8. Vercel: importar repo, root directory `apps/web`, agregar env vars:
   - `NEXT_PUBLIC_API_MOCK=false`
   - `NEXT_PUBLIC_API_URL=<URL Render>`
   - `NEXT_PUBLIC_WS_URL=<URL Render>`
9. Vercel: obtener URL del frontend (ej: `https://fleet-ops.vercel.app`)
10. Render: actualizar `CORS_ORIGIN` con URL de Vercel → redeploy automático
11. UptimeRobot: monitor HTTP para `GET <render-url>/health` cada 5 minutos
12. Verificación end-to-end: login, mapa, websockets, CRUD, alertas

**Gotchas:**
- Si Render falla con `PrismaClientInitializationError`: agregar `pnpm --filter @fleetops/api exec prisma generate` al `buildCommand` en `render.yaml`
- Vercel install command debe correr desde la raíz: configurar como `cd ../.. && pnpm install --frozen-lockfile` o dejar root directory vacío con build command `pnpm --filter @fleetops/web build`
- Render free tier duerme después de 15 min de inactividad — UptimeRobot lo mitiga
- Neon pausa la DB después de 5 días sin actividad en free tier — UptimeRobot también resuelve esto
- El seed hace `deleteMany()` antes de insertar — no correr si hay datos reales
