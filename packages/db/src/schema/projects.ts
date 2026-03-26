import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const projects = pgTable("projects", {
  id: idColumn(),
  organizationId: text("organization_id").notNull(),
  createdByUserId: text("created_by_user_id").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  type: text("type").default("student_film").notNull(),
  status: text("status").default("draft").notNull(),
  visibilityScope: text("visibility_scope").default("campus_only").notNull(),
  locationText: text("location_text"),
  compensationSummary: text("compensation_summary"),
  applicationDeadlineAt: timestamp("application_deadline_at", { withTimezone: true }),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const projectTeamMembers = pgTable("project_team_members", {
  id: idColumn(),
  projectId: text("project_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").default("reviewer").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const projectVisibilityInstitutions = pgTable("project_visibility_institutions", {
  id: idColumn(),
  projectId: text("project_id").notNull(),
  institutionId: text("institution_id").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const savedProjects = pgTable("saved_projects", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  projectId: text("project_id").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const projectStats = pgTable("project_stats", {
  id: idColumn(),
  projectId: text("project_id").notNull(),
  openRoleCount: integer("open_role_count").default(0).notNull(),
  submittedApplicationCount: integer("submitted_application_count").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
