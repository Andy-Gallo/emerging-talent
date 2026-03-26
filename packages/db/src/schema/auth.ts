import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAtColumn, deletedAtColumn, idColumn, updatedAtColumn } from "./_common";

export const users = pgTable(
  "users",
  {
    id: idColumn(),
    primaryEmail: text("primary_email").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    accountType: text("account_type").default("student").notNull(),
    globalRole: text("global_role").default("user").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => ({
    usersEmailUniqueIdx: index("users_email_unique_idx").on(table.primaryEmail),
    usersRoleIdx: index("users_role_idx").on(table.globalRole),
  }),
);

export const userEmails = pgTable("user_emails", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const sessions = pgTable("sessions", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
