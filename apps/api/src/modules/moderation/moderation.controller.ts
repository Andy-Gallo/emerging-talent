import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { auditLogs, blockedEntities, db, moderationActions, reports } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("moderation")
export class ModerationController {
  @Post("reports")
  @UseGuards(AuthGuard)
  async createReport(
    @CurrentUser() user: { sub: string },
    @Body() body: { targetType: string; targetId: string; reason: string; details?: string },
  ) {
    const [report] = await db
      .insert(reports)
      .values({
        reporterUserId: user.sub,
        targetType: body.targetType,
        targetId: body.targetId,
        reason: body.reason,
        details: body.details,
        status: "open",
      })
      .returning();

    return { data: report };
  }

  @Get("reports")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async queue() {
    return { data: await db.select().from(reports) };
  }

  @Post("reports/:reportId/actions")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async action(
    @CurrentUser() user: { sub: string },
    @Param("reportId") reportId: string,
    @Body() body: { actionType: string; reason: string; blockEntityType?: string; blockEntityId?: string },
  ) {
    const [action] = await db
      .insert(moderationActions)
      .values({
        reportId,
        actorUserId: user.sub,
        actionType: body.actionType,
        reason: body.reason,
        metadataJson: JSON.stringify(body),
      })
      .returning();

    await db.update(reports).set({ status: "closed", updatedAt: new Date() }).where(eq(reports.id, reportId));

    if (body.blockEntityType && body.blockEntityId) {
      await db.insert(blockedEntities).values({
        entityType: body.blockEntityType,
        entityId: body.blockEntityId,
        isActive: true,
        reason: body.reason,
      });
    }

    await db.insert(auditLogs).values({
      actorUserId: user.sub,
      action: `moderation.${body.actionType}`,
      targetType: "report",
      targetId: reportId,
      metadataJson: JSON.stringify(body),
    });

    return { data: action };
  }
}
