# Use Form

Live link---- https://use-form-e8ejuqf3r-rohan2248s-projects.vercel.app/

A form builder for indie creators and small teams — build a form, publish it, share the link, and read the responses. Turborepo monorepo with a Next.js 16 web app and an Express + tRPC API sharing one end-to-end type-safe contract.

- **Builder dashboard** — create forms, add and reorder fields, publish/unpublish, tune settings
- **Public fill page** at `/form/[form_id]` with per-form themes
- **Responses & analytics** — per-form submissions, cross-form summary, 30-day trend, CSV export
- **Explore** page listing publicly visible forms
- **Auth** — email + password, JWT in an httpOnly cookie
- **REST + docs for free** — every tRPC procedure is also exposed as REST via `trpc-to-openapi`, with a Scalar API reference at `/docs`

## Stack

| Layer   | Tech                                                                        |
| ------- | --------------------------------------------------------------------------- |
| Web     | Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI, TanStack Query |
| API     | Express 5, tRPC 11, `trpc-to-openapi`, Scalar                               |
| Data    | PostgreSQL 15, Drizzle ORM + drizzle-kit                                    |
| Shared  | Zod 4 schemas, Winston logging                                              |
| Tooling | Turborepo, pnpm workspaces, TypeScript 5.9, ESLint 9, Prettier              |

## Repo layout

```
apps/
  web/          Next.js frontend (port 3000)
  api/          Express + tRPC HTTP server (port 8000)
packages/
  trpc/         tRPC router, procedures, context, cookie utils  (server + client entrypoints)
  services/     Business logic: user, form, submission
  database/     Drizzle schema, models, migrations, db client
  logger/       Winston logger
  eslint-config/, typescript-config/   Shared configs
```

Dependency direction: `web` and `api` → `@repo/trpc` → `@repo/services` → `@repo/database`. The web app imports **types only** from `@repo/trpc/client`, so the API contract is checked at compile time on both sides.

## Getting started

**Prerequisites:** Node ≥ 18, pnpm 9, Docker (for Postgres).

```bash
pnpm install
```

### 1. Environment

Create a `.env` at the repo root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dev
JWT_SECRET=replace-me-with-a-long-random-string
```

Every workspace reads env vars from this one root file — the root scripts wrap Turbo in `dotenv-cli`, and [setup.sh](setup.sh) links the root `.env` into each workspace for tools (drizzle-kit, Next.js) that load `.env` themselves. On Windows, copy it instead:

```powershell
Copy-Item .env apps/web/.env; Copy-Item .env packages/database/.env
```

The web app additionally needs `NEXT_PUBLIC_API_URL` in `apps/web/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
```

| Variable              | Used by             | Required | Default                      |
| --------------------- | ------------------- | -------- | ---------------------------- |
| `DATABASE_URL`        | `@repo/database`    | yes      | —                            |
| `JWT_SECRET`          | `@repo/services`    | yes      | —                            |
| `NEXT_PUBLIC_API_URL` | `web`               | no       | `http://localhost:8000/trpc` |
| `PORT`                | `api`               | no       | `8000`                       |
| `BASE_URL`            | `api` (OpenAPI doc) | no       | `http://localhost:8000`      |
| `NODE_ENV`            | `api`, `logger`     | no       | `development`                |
| `LOGGER_LEVEL`        | `logger`            | no       | —                            |

Each package validates its own env with Zod at import time, so a missing variable fails loudly at boot rather than at first request.

### 2. Database

```bash
docker compose up -d      # Postgres 15 on :5432
pnpm db:migrate           # apply migrations in packages/database/drizzle
```

### 3. Run

```bash
pnpm dev
```

| Service        | URL                                         |
| -------------- | ------------------------------------------- |
| Web            | http://localhost:3000                       |
| API            | http://localhost:8000                       |
| Health check   | http://localhost:8000/health                |
| API docs       | http://localhost:8000/docs                  |
| OpenAPI JSON   | http://localhost:8000/openapi.json          |
| Drizzle Studio | started by `pnpm dev` (see terminal output) |

## Scripts

| Command            | What it does                                 |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | All apps + Drizzle Studio in watch mode      |
| `pnpm build`       | Build every workspace (`next build`, `tsup`) |
| `pnpm db:generate` | Generate a migration from schema changes     |
| `pnpm db:migrate`  | Apply pending migrations                     |
| `pnpm lint`        | ESLint across the monorepo                   |
| `pnpm check-types` | `tsc --noEmit` across the monorepo           |
| `pnpm format`      | Prettier over all `.ts`, `.tsx`, `.md`       |

## API surface

Three routers, mounted in [packages/trpc/server/index.ts](packages/trpc/server/index.ts):

**`auth`** — `createUserWithEmailAndPassword`, `signInUserWithEmailAndPassword`, `logoutUser`, `getLoggedInUserInfo`

**`form`** — `createForm`, `deleteForm`, `listForms`, `getForm`, `getFields`, `createField`, `updateField`, `deleteField`, `reorderField`, `updateFormStatus`, `updateFormVisibility`, `updateFormSettings`, `getAnalyticsSummary`, `listPublicForms`

**`submission`** — `submitForm`, `getFormSubmissions`, `getAllSubmissions`

Each is reachable two ways:

```
POST /trpc/form.createForm            # tRPC (used by the web app)
POST /api/form/createForm             # REST, generated from the same procedure
```

`getForm`, `listPublicForms`, `submitForm`, and the auth entry points are public; everything else runs through `authenticatedProcedure`, which reads the `authentication-token` cookie, verifies the JWT, and puts `ctx.user.id` in scope.

## Data model

| Table              | Notes                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`            | Email + salted SHA-256 password hash                                                                                                                                           |
| `forms`            | `status` (draft/published/unpublished), `visibility` (public/unlisted), settings, theme, `response_count`                                                                      |
| `form-fields`      | 9 field types (text, number, date, email, select, checkbox, radio, yesno, multiselect); `index` is a numeric sort key, unique per form, so reordering never renumbers siblings |
| `form-submissions` | One row per submission; answers stored as a JSON array of `{ formFieldId, value }`                                                                                             |

Schema lives in [packages/database/models/](packages/database/models/). Change a model, then `pnpm db:generate && pnpm db:migrate`.

## Adding a procedure

1. Define input/output Zod models in `packages/trpc/server/routes/<domain>/model.ts`.
2. Add the procedure in `route.ts` using `publicProcedure` or `authenticatedProcedure`, with an `openapi` meta block so it also lands in the REST surface and docs.
3. Put the actual logic in `packages/services/<domain>/` — routes stay thin.
4. Add a hook in `apps/web/hooks/api/` wrapping `trpc.<router>.<procedure>`; types flow through automatically.

## Notes

- Auth cookies use `secure: false` and CORS is only enabled outside `NODE_ENV=prod` (locked to `http://localhost:3000`) — both need revisiting before a real deployment.
- Product direction, users, and design principles live in [PRODUCT.md](PRODUCT.md).
