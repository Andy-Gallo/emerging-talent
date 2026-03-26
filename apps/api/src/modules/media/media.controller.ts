import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { db, mediaAssets } from "@etp/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller("media")
@UseGuards(AuthGuard)
export class MediaController {
  @Post("upload-session")
  async createUploadSession(
    @CurrentUser() user: { sub: string },
    @Body() body: { kind: string; mimeType: string; originalFileName: string; sizeBytes: number },
  ) {
    const objectKey = `${user.sub}/${randomUUID()}-${body.originalFileName}`;

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        ownerUserId: user.sub,
        kind: body.kind,
        mimeType: body.mimeType,
        bucket: process.env.SEAWEEDFS_BUCKET ?? "media",
        objectKey,
        originalFileName: body.originalFileName,
        sizeBytes: body.sizeBytes,
        status: "pending",
      })
      .returning();

    return {
      data: {
        mediaAsset: asset,
        upload: {
          method: "PUT",
          signedUrl: `${process.env.SEAWEEDFS_S3_ENDPOINT ?? "http://localhost:8333"}/${process.env.SEAWEEDFS_BUCKET ?? "media"}/${objectKey}`,
        },
      },
    };
  }

  @Post(":mediaAssetId/confirm")
  async confirm(@CurrentUser() user: { sub: string }, @Param("mediaAssetId") mediaAssetId: string) {
    const [asset] = await db
      .update(mediaAssets)
      .set({ status: "ready", updatedAt: new Date() })
      .where(eq(mediaAssets.id, mediaAssetId))
      .returning();

    return { data: asset };
  }

  @Get("mine")
  async mine(@CurrentUser() user: { sub: string }) {
    const assets = await db.select().from(mediaAssets).where(eq(mediaAssets.ownerUserId, user.sub));
    return { data: assets };
  }
}
