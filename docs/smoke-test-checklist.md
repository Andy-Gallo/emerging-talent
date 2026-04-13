# MVP Smoke Test Checklist

This checklist is for quick, practical validation of the platform without heavy test overhead.

## 1) One-time setup

1. Install Docker Desktop and make sure it is running.
2. In the repo root, copy env values:
   - `Copy-Item .env.example .env.local`
3. Start infra services:
   - `docker compose -f infra/docker/docker-compose.yml up -d`
4. Install dependencies:
   - `corepack pnpm install`
5. Apply schema and seed data:
   - `corepack pnpm db:migrate`
   - `corepack pnpm db:seed`

## 2) Start the apps

Open 3 terminals from repo root:

1. API:
   - `corepack pnpm --filter @etp/api dev`
2. Web:
   - `corepack pnpm --filter @etp/web dev`
3. Worker (optional but recommended for notifications/email jobs):
   - `corepack pnpm --filter @etp/worker dev`

## 3) Quick health gate

Run these before manual clicks:

1. `corepack pnpm --filter @etp/api test`
2. `corepack pnpm typecheck`
3. `corepack pnpm lint`
4. `corepack pnpm build`

Expected: all commands pass.

## 4) Manual MVP flow checks

Use this status scale for each item: `PASS`, `FAIL`, `BLOCKED`.

1. Auth: sign up, sign in, sign out.
2. Route protection: logged-out user is redirected away from app routes.
3. Admin gate: non-admin user cannot access `/admin/reports`.
4. Project flow: create project from an organization.
5. Role flow: create role under the project.
6. Application flow: applicant submits application to open role.
7. Casting flow: reviewer updates application status.
8. Audition flow: reviewer requests audition; applicant submits response.

## 5) What to log when something breaks

Capture these details so fixes are fast:

1. Exact page and action.
2. Browser error message.
3. API response status + body.
4. API terminal log lines around the error.
5. Whether the issue is reproducible on retry.

## 6) Done criteria for this smoke pass

1. All health-gate commands pass.
2. All manual MVP flows are either `PASS` or have a clear, reproducible bug note.
3. No unknown blockers remain.
