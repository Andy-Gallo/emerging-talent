import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { db, notifications } from "@etp/db";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller("messaging")
@UseGuards(AuthGuard)
export class MessagingController {
  @Post("outbound")
  async send(
    @CurrentUser() user: { sub: string },
    @Body() body: { targetUserId: string; subject: string; message: string; actionUrl?: string },
  ) {
    const [row] = await db
      .insert(notifications)
      .values({
        userId: body.targetUserId,
        channel: "in_app",
        category: "structured_message",
        title: body.subject,
        body: body.message,
        actionUrl: body.actionUrl,
      })
      .returning();

    return { data: { ...row, sentBy: user.sub } };
  }
}
