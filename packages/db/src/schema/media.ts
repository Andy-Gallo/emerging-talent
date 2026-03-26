import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const mediaAssets = pgTable("media_assets", {
  id: idColumn(),
  ownerUserId: text("owner_user_id").notNull(),
  kind: text("kind").notNull(),
  mimeType: text("mime_type").notNull(),
  bucket: text("bucket").notNull(),
  objectKey: text("object_key").notNull(),
  originalFileName: text("original_file_name").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  status: text("status").default("pending").notNull(),
  checksum: text("checksum"),
  metadataJson: text("metadata_json"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const profileMedia = pgTable("profile_media", {
  id: idColumn(),
  profileId: text("profile_id").notNull(),
  mediaAssetId: text("media_asset_id").notNull(),
  label: text("label"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
