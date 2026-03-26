import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const notifications = pgTable("notifications", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  channel: text("channel").default("in_app").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  applicationSubmittedEmail: boolean("application_submitted_email").default(true).notNull(),
  auditionRequestedEmail: boolean("audition_requested_email").default(true).notNull(),
  statusChangedEmail: boolean("status_changed_email").default(true).notNull(),
  marketingEmail: boolean("marketing_email").default(false).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
