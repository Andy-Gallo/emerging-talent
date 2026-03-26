import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const talentProfiles = pgTable("talent_profiles", {
  id: idColumn(),
  userId: text("user_id").notNull(),
  slug: text("slug").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  locationCity: text("location_city"),
  locationRegion: text("location_region"),
  locationCountry: text("location_country").default("US"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileDisciplines = pgTable("profile_disciplines", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  discipline: text("discipline").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileSkills = pgTable("profile_skills", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  skill: text("skill").notNull(),
  proficiency: text("proficiency"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileCredits = pgTable("profile_credits", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  title: text("title").notNull(),
  role: text("role").notNull(),
  year: integer("year"),
  organizationName: text("organization_name"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileLinks = pgTable("profile_links", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  kind: text("kind").notNull(),
  url: text("url").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const availabilityPreferences = pgTable("availability_preferences", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  openToPaid: boolean("open_to_paid").default(true).notNull(),
  openToUnpaid: boolean("open_to_unpaid").default(true).notNull(),
  openToTravel: boolean("open_to_travel").default(false).notNull(),
  notes: text("notes"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
