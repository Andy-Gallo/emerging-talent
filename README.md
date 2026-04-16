# Emerging Talent Platform

This repository implements an end-to-end emerging-talent casting and collaboration platform aligned to the provided product specification.

## Monorepo Structure

- `apps/web`: Next.js App Router website with public pages, auth flows, and protected dashboards.
- `apps/api`: NestJS modular monolith API (`/api/v1`) with auth, RBAC, and all MVP domain endpoints.
- `apps/worker`: BullMQ worker for email, media, indexing, notifications, and AI queue namespaces.
- `packages/db`: Drizzle PostgreSQL schema, seeds, and database client.
- `packages/contracts`: Shared contracts and validation schemas.
- `packages/auth`: Shared auth session/cookie payload contract.
- `packages/sdk`: Shared API client primitives.
- `packages/ui`: Shared UI primitives.
- `infra/docker`: Docker Compose stack for local services.

## Features Implemented

- Authentication: email/password sign-up, sign-in, sign-out, forgot/reset password.
- Authorization: global RBAC (`user`, `platform_admin`) + organization role checks.
- Route protection: middleware + protected app layout and admin route restrictions.
- Institutions and affiliations.
- Organizations and memberships.
- Talent profile editing and retrieval.
- Media upload session + confirmation flow.
- Projects with visibility scopes (`campus_only`, `selected_institutions`, `public_network`).
- Roles and role questions.
- Application drafts/submission, status transitions, notes, timeline events.
- Casting review and audition request/submission workflows.
- In-app notifications and preferences.
- Billing plans, checkout scaffolding, Stripe webhook ingestion and local state mirror.
- Moderation reports, admin actions, block/suspend primitives, audit logs.
- AI scaffolding: provider interface, task table and admin task endpoint.
- Search/discovery endpoint and frontend discovery experience.

## Local Development

1. Copy env values:

```bash
cp .env.example .env
```

2. Start required local services (Postgres on `localhost:54331`, Valkey, Mailpit):

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres valkey mailpit
```

3. Install and bootstrap:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

4. Run all apps:

```bash
pnpm dev
```

5. Optional full Docker local stack:

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

6. Optional database UI (Adminer):

- URL: `http://localhost:8082`
- System: `PostgreSQL`
- Server: `postgres`
- Username: `postgres`
- Password: `postgres`
- Database: `emerging_talent`
- App DB connection string: `postgres://postgres:postgres@localhost:54331/emerging_talent`

## Default Seed Accounts

All seeded users share this password hash target (`password123`):

- `director@psa.edu`
- `actor@psa.edu`
- `admin@platform.local`

## Testing

- Unit and integration test scaffolding is prepared in package scripts.
- Playwright e2e can be added in a follow-up iteration.
