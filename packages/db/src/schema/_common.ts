import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const idColumn = () => uuid("id").defaultRandom().primaryKey();

export const createdAtColumn = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const updatedAtColumn = () =>
  timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

export const deletedAtColumn = () =>
  timestamp("deleted_at", { withTimezone: true });

export const nowSql = () => sql`now()`;
