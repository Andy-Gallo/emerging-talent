import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const auditionRequests = pgTable("audition_requests", {
  id: idColumn(),
  applicationId: text("application_id").notNull(),
  requestedByUserId: text("requested_by_user_id").notNull(),
  mode: text("mode").default("self_tape").notNull(),
  message: text("message"),
  status: text("status").default("pending").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const auditionSlots = pgTable("audition_slots", {
  id: idColumn(),
  auditionRequestId: text("audition_request_id").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  locationText: text("location_text"),
  meetingUrl: text("meeting_url"),
  capacity: integer("capacity").default(1).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const auditionSubmissions = pgTable("audition_submissions", {
  id: idColumn(),
  auditionRequestId: text("audition_request_id").notNull(),
  applicantUserId: text("applicant_user_id").notNull(),
  slotId: text("slot_id"),
  selfTapeMediaAssetId: text("self_tape_media_asset_id"),
  note: text("note"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
