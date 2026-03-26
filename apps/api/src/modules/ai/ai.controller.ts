import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { aiTasks, db, featureFlags } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { StubModelProvider } from "./provider";

@Controller("ai")
export class AiController {
  private readonly provider = new StubModelProvider();

  @Get("flags")
  async flags() {
    return { data: await db.select().from(featureFlags) };
  }

  @Post("tasks")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async createTask(
    @CurrentUser() user: { sub: string },
    @Body() body: { taskType: string; input: Record<string, unknown> },
  ) {
    const [task] = await db
      .insert(aiTasks)
      .values({
        taskType: body.taskType,
        status: "queued",
        inputJson: JSON.stringify({ ...body.input, requestedBy: user.sub }),
      })
      .returning();

    if (body.taskType === "draft") {
      const output = await this.provider.draft({ prompt: String(body.input.prompt ?? "") });
      await db
        .update(aiTasks)
        .set({ status: "completed", outputJson: JSON.stringify(output), updatedAt: new Date() })
        .where(eq(aiTasks.id, task.id));
    }

    return { data: task };
  }
}
