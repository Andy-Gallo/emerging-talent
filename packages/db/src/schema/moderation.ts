import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const reports = pgTable("reports", {
  id: idColumn(),
  reporterUserId: text("reporter_user_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").default("open").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const moderationActions = pgTable("moderation_actions", {
  id: idColumn(),
  reportId: text("report_id").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  actionType: text("action_type").notNull(),
  reason: text("reason").notNull(),
  metadataJson: text("metadata_json"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const blockedEntities = pgTable("blocked_entities", {
  id: idColumn(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  reason: text("reason").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const auditLogs = pgTable("audit_logs", {
  id: idColumn(),
  actorUserId: text("actor_user_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  metadataJson: text("metadata_json"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
