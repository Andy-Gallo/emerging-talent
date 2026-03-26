import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { db, roleQuestions, roles } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { OptionalAuthGuard } from "../../common/guards/optional-auth.guard";
import { ProjectsService } from "../projects/projects.service";

@Controller("roles")
export class RolesController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(OptionalAuthGuard)
  @Get("project/:projectId")
  async byProject(@Param("projectId") projectId: string, @CurrentUser() user?: { sub: string }) {
    const canView = await this.projectsService.canUserViewProject(user?.sub ?? null, projectId);
    if (!canView) {
      return { data: [] };
    }

    const rows = await db.select().from(roles).where(eq(roles.projectId, projectId));
    return { data: rows };
  }

  @Get(":roleId")
  async detail(@Param("roleId") roleId: string) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return { data: null };
    }

    const questions = await db.select().from(roleQuestions).where(eq(roleQuestions.roleId, role.id));
    return { data: { ...role, questions } };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @CurrentUser() user: { sub: string },
    @Body()
    body: {
      projectId: string;
      title: string;
      roleType?: string;
      description?: string;
      compensationType?: string;
      compensationText?: string;
      deadlineAt?: string;
      isRemote?: boolean;
      status?: "draft" | "open" | "paused" | "closed";
      roleQuestions?: Array<{ question: string; isRequired?: boolean; inputType?: string }>;
    },
  ) {
    await this.projectsService.assertProjectEditAccess(user.sub, body.projectId);

    const [role] = await db
      .insert(roles)
      .values({
        projectId: body.projectId,
        title: body.title,
        roleType: body.roleType ?? "performer",
        description: body.description,
        compensationType: body.compensationType ?? "unpaid",
        compensationText: body.compensationText,
        deadlineAt: body.deadlineAt ? new Date(body.deadlineAt) : undefined,
        isRemote: body.isRemote ?? false,
        status: body.status ?? "draft",
      })
      .returning();

    if (body.roleQuestions?.length) {
      await db.insert(roleQuestions).values(
        body.roleQuestions.map((question, index) => ({
          roleId: role.id,
          question: question.question,
          isRequired: question.isRequired ?? false,
          inputType: question.inputType ?? "text",
          sortOrder: index,
        })),
      );
    }

    return { data: role };
  }

  @UseGuards(AuthGuard)
  @Patch(":roleId")
  async update(
    @CurrentUser() user: { sub: string },
    @Param("roleId") roleId: string,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      status: "draft" | "open" | "paused" | "closed";
      compensationType: string;
      compensationText: string;
      deadlineAt: string;
      isRemote: boolean;
    }>,
  ) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return { data: null };
    }

    await this.projectsService.assertProjectEditAccess(user.sub, role.projectId);

    const [updated] = await db
      .update(roles)
      .set({
        title: body.title,
        description: body.description,
        status: body.status,
        compensationType: body.compensationType,
        compensationText: body.compensationText,
        deadlineAt: body.deadlineAt ? new Date(body.deadlineAt) : undefined,
        isRemote: body.isRemote,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, roleId))
      .returning();

    return { data: updated };
  }
}
