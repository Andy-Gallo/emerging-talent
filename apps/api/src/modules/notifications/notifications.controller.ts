import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { db, notificationPreferences, notifications } from "@etp/db";
import { and, eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller("notifications")
@UseGuards(AuthGuard)
export class NotificationsController {
  @Get()
  async list(@CurrentUser() user: { sub: string }) {
    const rows = await db.select().from(notifications).where(eq(notifications.userId, user.sub));
    return { data: rows };
  }

  @Patch("read")
  async markRead(@CurrentUser() user: { sub: string }, @Body() body: { notificationId: string }) {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.id, body.notificationId), eq(notifications.userId, user.sub)))
      .returning();

    return { data: updated };
  }

  @Get("preferences")
  async preferences(@CurrentUser() user: { sub: string }) {
    const [pref] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.sub))
      .limit(1);

    if (pref) {
      return { data: pref };
    }

    const [created] = await db
      .insert(notificationPreferences)
      .values({
        userId: user.sub,
        applicationSubmittedEmail: true,
        auditionRequestedEmail: true,
        statusChangedEmail: true,
        marketingEmail: false,
      })
      .returning();

    return { data: created };
  }

  @Patch("preferences")
  async updatePreferences(
    @CurrentUser() user: { sub: string },
    @Body() body: Partial<{ applicationSubmittedEmail: boolean; auditionRequestedEmail: boolean; statusChangedEmail: boolean; marketingEmail: boolean }>,
  ) {
    const [updated] = await db
      .update(notificationPreferences)
      .set({
        applicationSubmittedEmail: body.applicationSubmittedEmail,
        auditionRequestedEmail: body.auditionRequestedEmail,
        statusChangedEmail: body.statusChangedEmail,
        marketingEmail: body.marketingEmail,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, user.sub))
      .returning();

    return { data: updated };
  }
}
