import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { db, featureFlags } from "@etp/db";
import { eq } from "drizzle-orm";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("feature-flags")
export class FeatureFlagsController {
  @Get()
  async list() {
    return { data: await db.select().from(featureFlags) };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async create(@Body() body: { key: string; enabled: boolean; audience?: string }) {
    const [created] = await db
      .insert(featureFlags)
      .values({
        key: body.key,
        enabled: String(Boolean(body.enabled)),
        audience: body.audience ?? "global",
      })
      .returning();

    return { data: created };
  }

  @Patch()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async update(@Body() body: { key: string; enabled: boolean }) {
    const [updated] = await db
      .update(featureFlags)
      .set({ enabled: String(Boolean(body.enabled)), updatedAt: new Date() })
      .where(eq(featureFlags.key, body.key))
      .returning();

    return { data: updated };
  }
}
