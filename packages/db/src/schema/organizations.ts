import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const organizations = pgTable(
  "organizations",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    kind: text("kind").default("student_group").notNull(),
    institutionId: text("institution_id"),
    createdByUserId: text("created_by_user_id").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    organizationsSlugIdx: index("organizations_slug_idx").on(table.slug),
  }),
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: idColumn(),
    organizationId: text("organization_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").default("editor").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    organizationMembershipsOrgIdx: index("organization_memberships_org_idx").on(table.organizationId),
    organizationMembershipsUserIdx: index("organization_memberships_user_idx").on(table.userId),
  }),
);
