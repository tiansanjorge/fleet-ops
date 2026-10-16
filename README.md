# 🚛 FleetOps

**Centro de control operacional de flota vehicular en tiempo real.**
Mapa en vivo, alertas por severidad, gestión de vehículos y usuarios, y permisos por rol, todo sobre un monorepo fullstack tipado de punta a punta.

> 💡 **Idea guía:** *"Esto podría conectarse a un backend real mañana sin cambiar el frontend."*
> El frontend no sabe si habla con un mock (MSW) o con la API real: se cambia con **una variable de entorno**.

![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React_18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify_5-000?logo=fastify)
![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socketdotio)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 🌐 Demo en vivo (deploy)

| Servicio | Plataforma | URL |
| --- | --- | --- |
| 🖥️ Frontend | Vercel | **[https://fleetoperations.vercel.app](https://fleetoperations.vercel.app/)** |
| ⚙️ API + WebSockets | Render | `https://fleet-ops-czh1.onrender.com` ([`/health`](https://fleet-ops-czh1.onrender.com/health)) |
| 🗄️ Base de datos | Neon (PostgreSQL) | — |

### 🔑 Credenciales de prueba

| Rol | Email | Password | Qué puede hacer |
| --- | --- | --- | --- |
| 👑 Admin | `anagarcia@fleetops.com` | `admin123` | Todo: CRUD de vehículos, gestión de usuarios y roles |
| 🧑‍✈️ Operator | `carlosmendez@fleetops.com` | `password` | Ver y actuar sobre vehículos y alertas |
| 👀 Viewer | `laurarios@fleetops.com` | `password` | Solo lectura |

> ⏳ **Nota para quien lo prueba:** la API corre en el *free tier* de Render, que se duerme tras 15 min sin tráfico. Si es la primera visita, el primer login puede tardar ~30-60 s (la pantalla de login avisa cuando el backend está despertando). Un monitor de UptimeRobot pinguea `/health` para minimizarlo.

---

## 🚀 Inicio rápido (local)

### Requisitos

- **Node.js** ≥ 20
- **pnpm** 10 (`corepack enable` o `npm i -g pnpm`)
- **Docker Desktop** (solo para Postgres, y solo si querés correr el backend real)

### Opción A: solo frontend con mocks (30 segundos, sin Docker) ⚡

```bash
git clone https://github.com/tiansanjorge/fleet-ops.git
cd fleet-ops
pnpm install
```

Creá `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_MOCK=true
```

```bash
pnpm dev:web
```

Abrí **http://localhost:3000** y logueate con alguna de las credenciales de arriba. MSW intercepta los `fetch` y el movimiento/alertas se simulan en el cliente.

### Opción B: stack completo (frontend + API + Postgres) 🔌

**1. Instalar dependencias**

```bash
pnpm install
```

**2. Variables de entorno**

`apps/api/.env`

```env
DATABASE_URL="postgresql://fleetops:fleetops@localhost:5432/fleetops?schema=public"
JWT_SECRET="dev-secret-change-me"
JWT_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

`apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="http://localhost:4000"
NEXT_PUBLIC_API_MOCK="false"
```

**3. Levantar Postgres, migrar y sembrar datos**

```bash
docker compose up -d postgres
pnpm --filter @fleetops/api exec prisma migrate deploy
pnpm --filter @fleetops/api exec prisma db seed
```

**4. Correr API y frontend** (en dos terminales)

```bash
pnpm dev:api    # http://localhost:4000
pnpm dev:web    # http://localhost:3000
```

**5. Verificar**

```bash
curl http://localhost:4000/health
# { "status": "ok", "db": "connected" }
```

### Scripts útiles

| Comando | Qué hace |
| --- | --- |
| `pnpm dev:web` | Next.js en modo desarrollo |
| `pnpm dev:api` | Fastify con `tsx watch` |
| `pnpm build:web` / `pnpm build:api` | Build de producción |
| `pnpm lint:web` | ESLint del frontend |
| `pnpm --filter @fleetops/api typecheck` | Chequeo de tipos del backend |

---

## ✨ Qué hace

- 🗺️ **Mapa en vivo** (Leaflet) con la flota moviéndose en tiempo real y estados `moving` / `idle` / `stopped`.
- 🚨 **Alertas en tiempo real** con severidad (`low` / `medium` / `critical`), lectura y descarte. Lista virtualizada para soportar volumen.
- 🚗 **CRUD de vehículos** con actualización propagada a todos los clientes conectados.
- 👥 **Gestión de usuarios** y cambio de rol.
- 🔐 **Autenticación JWT** y **RBAC** (`admin` / `operator` / `viewer`) aplicado en frontend *y* backend desde una única fuente de verdad.
- 🔁 **Dos modos de ejecución** intercambiables: mock (MSW) o backend real.

---

## 🏗️ Arquitectura

```
fleet-ops/
├── apps/
│   ├── web/         # Next.js 16 (App Router): UI, estado, mocks
│   └── api/         # Fastify 5: REST + Socket.io + Prisma + JWT
├── packages/
│   └── types/       # @fleetops/types: dominio + permisos RBAC compartidos
├── docker-compose.yml   # Postgres local
├── render.yaml          # Blueprint de deploy de la API
└── pnpm-workspace.yaml
```

```
                 ┌──────────────────────────── packages/types ───────────────────────────┐
                 │   Vehicle · Alert · User · permisos RBAC (fuente única de verdad)     │
                 └───────────────▲──────────────────────────────────────▲────────────────┘
                                 │                                      │
┌───────────── apps/web ─────────┴──────┐        ┌─────────── apps/api ──┴──────────────┐
│ Zustand (dominio) + React Query       │  REST  │ Fastify + Zod (validación)           │
│ apiFetch ── mock=true ──▶ MSW         │◀──────▶│ @fastify/jwt · authorize (RBAC)      │
│          └─ mock=false ─▶ fetch real  │        │ Prisma ──▶ PostgreSQL (Neon)         │
│ realtimeEngine                        │  WS    │ Socket.io + simulación server-side   │
│   mock=true  ─▶ timer local           │◀───────│   vehicle:position · alert:new · ... │
│   mock=false ─▶ socketClient (JWT)    │        │                                      │
└───────────────────────────────────────┘        └──────────────────────────────────────┘
```

### Eventos en tiempo real (server → cliente)

| Evento | Payload |
| --- | --- |
| `vehicle:position` | `{ id, position: [lat, lng], status }` |
| `vehicle:created` / `vehicle:updated` | `Vehicle` completo |
| `vehicle:deleted` | `{ id }` |
| `alert:new` | `Alert` completo |

Las mutaciones siguen siendo REST; el socket es solo de difusión.

### Endpoints REST

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado del servicio y la DB |
| `POST` | `/auth/login` | Devuelve `{ token, user }` |
| `GET` | `/auth/me` | Usuario de la sesión |
| `GET` `POST` `PUT` `DELETE` | `/vehicles` · `/vehicles/:id` | CRUD de vehículos |
| `GET` `PATCH` | `/alerts` · `/alerts/:id` | Listar y actualizar alertas |
| `GET` `PATCH` | `/users` · `/users/:id/role` | Listar usuarios y cambiar rol |

---

## 🧠 Decisiones técnicas (problema → decisión → trade-off)

| Tema | Decisión | Por qué / trade-off |
| --- | --- | --- |
| **Mock vs real** | MSW + flag `NEXT_PUBLIC_API_MOCK` | Intercepta `fetch` real, así el frontend no cambia. Costo: mantener dos implementaciones del comportamiento (se mitiga replicando fielmente la simulación en el server). |
| **Tipos compartidos** | `@fleetops/types` sin paso de build (`tsx` + `transpilePackages`) | Un cambio en el dominio se refleja en web y api sin compilar. Costo: no se puede publicar el paquete tal cual. |
| **RBAC** | `can('action:resource')` con permisos en el package compartido | Los componentes nunca hardcodean roles; el backend valida con la misma definición. |
| **Estado** | Zustand (dominio) + React Query (servidor) | Los stores son agnósticos de la fuente de datos (MSW o backend). |
| **Backend** | Fastify 5 + Zod 4 (`fastify-type-provider-zod`) | Más liviano y explícito que NestJS; validación y tipos salen del mismo schema. En MVP el handler de la ruta *es* el service. |
| **Realtime** | Socket.io, sin *rooms* en el MVP | Simple y suficiente; se agregan rooms si hay que filtrar por vehículo. |
| **Timestamps** | `BigInt` (epoch ms) en DB | Evita ambigüedad de zonas horarias; se transforma en la capa de rutas. |
| **Posición** | `lat`/`lng` en DB, `[lat, lng]` en la API | Se transforma en el handler para no romper el contrato del frontend. |
| **Passwords** | `bcryptjs` | Evita `node-gyp` en Windows. |
| **Monorepo** | pnpm workspaces, sin Turborepo | Con 3 paquetes no se justifica el overhead. |
| **CORS** | `allowedHeaders` explícitos | Sin lista explícita algunos browsers no envían PUT/DELETE tras el preflight. |
| **Base de datos** | Neon (branching) | Branch por feature, free tier que no expira. |

---

## 🧰 Stack

**Frontend:** Next.js 16 (App Router) · React 18 · TypeScript · Zustand · TanStack Query · TanStack Virtual · React Leaflet · Tailwind v4 · Framer Motion · MSW · socket.io-client

**Backend:** Fastify 5 · TypeScript · Prisma 6 · PostgreSQL · Socket.io 4 · `@fastify/jwt` · Zod 4 · bcryptjs

**Infra:** pnpm workspaces · Docker (Postgres local) · Render (API) · Neon (DB) · Vercel (web) · UptimeRobot (keep-alive)

---

## ☁️ Guía de deploy (para replicarlo)

1. **Neon:** crear proyecto y copiar `DATABASE_URL`.
2. **Render:** crear *Web Service* desde el repo usando [`render.yaml`](render.yaml) y cargar las variables:
   - `DATABASE_URL` (Neon)
   - `JWT_SECRET` (`openssl rand -base64 32`)
   - `CORS_ORIGIN` (placeholder, se ajusta en el paso 5)
3. **Render shell:** migrar y sembrar.
   ```bash
   pnpm --filter @fleetops/api exec prisma migrate deploy
   pnpm --filter @fleetops/api exec prisma db seed   # ⚠️ hace deleteMany() antes de insertar
   ```
4. **Vercel:** importar el repo, root directory `apps/web`, con:
   - `NEXT_PUBLIC_API_MOCK=false`
   - `NEXT_PUBLIC_API_URL=<URL de Render>`
   - `NEXT_PUBLIC_WS_URL=<URL de Render>`
5. **Render:** actualizar `CORS_ORIGIN` con la URL de Vercel (redeploy automático).
6. **UptimeRobot:** monitor HTTP a `GET <URL de Render>/health` cada 5 min (evita el sleep de Render y la pausa de Neon).

> Si Render falla con `PrismaClientInitializationError`, agregar `pnpm --filter @fleetops/api exec prisma generate` al `buildCommand`.

---

## 🗂️ Estructura del código

<details>
<summary><b>apps/web/src</b></summary>

```
app/            # App Router
features/       # vehicles · alerts · users (cada una con components/hooks/store)
core/
  api/          # apiFetch: inyecta JWT y arma la URL según el modo
  auth/         # sesión (token + user)
  permissions/  # RBAC: can('action:resource')
  realtime/     # realtimeEngine + socketClient
shared/         # ui · hooks · utils reutilizables
mocks/          # db in-memory + handlers MSW
```
</details>

<details>
<summary><b>apps/api/src</b></summary>

```
server.ts / app.ts   # entry point y builder de Fastify (separable para tests)
config/env.ts        # valida process.env con Zod
plugins/             # prisma · auth (authenticate/authorize) · cors · socketio
modules/             # auth · vehicles · alerts · users (por dominio, no por capas)
realtime/            # simulation.ts (movimiento + alertas) y events.ts
lib/                 # hash · errors
```
</details>

---

## 👤 Autor

**Sebastián Sanjorge**: [GitHub](https://github.com/tiansanjorge)

> Proyecto de portfolio: simula un centro de control de flota para demostrar arquitectura fullstack limpia, explicable de punta a punta.
