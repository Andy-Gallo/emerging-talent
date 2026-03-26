import { pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const featureFlags = pgTable("feature_flags", {
  id: idColumn(),
  key: text("key").notNull(),
  enabled: text("enabled").default("false").notNull(),
  audience: text("audience").default("global").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const aiTasks = pgTable("ai_tasks", {
  id: idColumn(),
  taskType: text("task_type").notNull(),
  status: text("status").default("queued").notNull(),
  inputJson: text("input_json").notNull(),
  outputJson: text("output_json"),
  errorText: text("error_text"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const aiSummaries = pgTable("ai_summaries", {
  id: idColumn(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  summary: text("summary").notNull(),
  model: text("model").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const aiFlags = pgTable("ai_flags", {
  id: idColumn(),
  sourceType: text("source_type").notNull(),
  sourceId: text("source_id").notNull(),
  label: text("label").notNull(),
  score: text("score").notNull(),
  status: text("status").default("needs_review").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const roleEmbeddings = pgTable("role_embeddings", {
  id: idColumn(),
  roleId: text("role_id").notNull(),
  embeddingVector: text("embedding_vector").notNull(),
  model: text("model").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileEmbeddings = pgTable("profile_embeddings", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  embeddingVector: text("embedding_vector").notNull(),
  model: text("model").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
