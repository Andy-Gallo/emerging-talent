import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const applications = pgTable("applications", {
  id: idColumn(),
  projectId: text("project_id").notNull(),
  roleId: text("role_id").notNull(),
  applicantUserId: text("applicant_user_id").notNull(),
  status: text("status").default("draft").notNull(),
  note: text("note"),
  profileSnapshotJson: text("profile_snapshot_json").notNull(),
  mediaSnapshotJson: text("media_snapshot_json").notNull(),
  submittedAt: createdAtColumn(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const applicationQuestionAnswers = pgTable("application_question_answers", {
  id: idColumn(),
  applicationId: text("application_id").notNull(),
  roleQuestionId: text("role_question_id").notNull(),
  answer: text("answer").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const applicationMediaAssets = pgTable("application_media_assets", {
  id: idColumn(),
  applicationId: text("application_id").notNull(),
  mediaAssetId: text("media_asset_id").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const applicationEvents = pgTable("application_events", {
  id: idColumn(),
  applicationId: text("application_id").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  eventType: text("event_type").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status"),
  metadataJson: text("metadata_json"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const applicationNotes = pgTable("application_notes", {
  id: idColumn(),
  applicationId: text("application_id").notNull(),
  authorUserId: text("author_user_id").notNull(),
  note: text("note").notNull(),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
