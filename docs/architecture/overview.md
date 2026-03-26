# Architecture

- Modular monolith API with domain-bounded modules.
- App Router frontend with split public/authorized surfaces.
- PostgreSQL source of truth with Drizzle schema grouped by domain.
- BullMQ worker for all asynchronous workflows.
