import { boolean, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const institutions = pgTable(
  "institutions",
  {
    id: idColumn(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    domain: text("domain"),
    kind: text("kind").default("school").notNull(),
    city: text("city"),
    region: text("region"),
    country: text("country").default("US").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    institutionsSlugIdx: index("institutions_slug_idx").on(table.slug),
    institutionsDomainIdx: index("institutions_domain_idx").on(table.domain),
  }),
);

export const institutionPrograms = pgTable("institution_programs", {
  id: idColumn(),
  institutionId: text("institution_id").notNull(),
  name: text("name").notNull(),
  degreeType: text("degree_type"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const userAffiliations = pgTable(
  "user_affiliations",
  {
    id: idColumn(),
    userId: text("user_id").notNull(),
    institutionId: text("institution_id").notNull(),
    programName: text("program_name"),
    graduationYear: integer("graduation_year"),
    verificationMethod: text("verification_method").default("email_domain").notNull(),
    status: text("status").default("pending").notNull(),
    isPrimary: boolean("is_primary").default(true).notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => ({
    userAffiliationsUserIdx: index("user_affiliations_user_idx").on(table.userId),
    userAffiliationsInstitutionIdx: index("user_affiliations_institution_idx").on(table.institutionId),
  }),
);
