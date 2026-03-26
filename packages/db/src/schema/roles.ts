import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const roles = pgTable("roles", {
  id: idColumn(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  roleType: text("role_type").default("performer").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(),
  isRemote: boolean("is_remote").default(false).notNull(),
  compensationType: text("compensation_type").default("unpaid").notNull(),
  compensationText: text("compensation_text"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  genderExpression: text("gender_expression"),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const roleRequirements = pgTable("role_requirements", {
  id: idColumn(),
  roleId: text("role_id").notNull(),
  requirementText: text("requirement_text").notNull(),
  isRequired: boolean("is_required").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const roleQuestions = pgTable("role_questions", {
  id: idColumn(),
  roleId: text("role_id").notNull(),
  question: text("question").notNull(),
  inputType: text("input_type").default("text").notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const savedRoles = pgTable("saved_roles", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  roleId: text("role_id").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
