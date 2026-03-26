import { Controller, Get, UseGuards } from "@nestjs/common";
import { db, userAffiliations, users } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller("users")
export class UsersController {
  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: { sub: string }) {
    const [record] = await db.select().from(users).where(eq(users.id, user.sub)).limit(1);
    const affiliations = await db
      .select()
      .from(userAffiliations)
      .where(eq(userAffiliations.userId, user.sub));

    return {
      data: {
        ...record,
        affiliations,
      },
    };
  }
}
