import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { db, projectVisibilityInstitutions, projects, roles } from "@etp/db";
import { and, desc, eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { OptionalAuthGuard } from "../../common/guards/optional-auth.guard";
import { CreateProjectDto, UpdateProjectDto } from "./projects.dto";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(@Inject(ProjectsService) private readonly projectsService: ProjectsService) {}

  @UseGuards(OptionalAuthGuard)
  @Get("discover")
  async discover(@CurrentUser() user?: { sub: string }) {
    return { data: await this.projectsService.listDiscoverableRoles(user?.sub ?? null) };
  }

  @UseGuards(OptionalAuthGuard)
  @Get(":projectId")
  async detail(@Param("projectId") projectId: string, @CurrentUser() user?: { sub: string }) {
    const canView = await this.projectsService.canUserViewProject(user?.sub ?? null, projectId);

    if (!canView) {
      return { data: null };
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    const projectRoles = await db
      .select()
      .from(roles)
      .where(and(eq(roles.projectId, projectId), eq(roles.status, "open")));

    return { data: { ...project, roles: projectRoles } };
  }

  @UseGuards(AuthGuard)
  @Get()
  async mine(@CurrentUser() user: { sub: string }) {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.createdByUserId, user.sub))
      .orderBy(desc(projects.createdAt));

    return { data: rows };
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @CurrentUser() user: { sub: string },
    @Body() body: CreateProjectDto,
  ) {
    await this.projectsService.assertOrganizationEditor(user.sub, body.organizationId);

    if (body.visibilityScope === "selected_institutions" && !body.selectedInstitutionIds?.length) {
      throw new BadRequestException("Selected institution visibility requires at least one institution.");
    }

    const [project] = await db
      .insert(projects)
      .values({
        organizationId: body.organizationId,
        createdByUserId: user.sub,
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        description: body.description,
        type: "student_film",
        status: "draft",
        visibilityScope: body.visibilityScope,
        locationText: body.locationText,
        compensationSummary: body.compensationSummary,
        applicationDeadlineAt: body.applicationDeadlineAt ? new Date(body.applicationDeadlineAt) : undefined,
      })
      .returning();

    if (body.visibilityScope === "selected_institutions" && body.selectedInstitutionIds?.length) {
      await db.insert(projectVisibilityInstitutions).values(
        body.selectedInstitutionIds.map((institutionId) => ({
          projectId: project.id,
          institutionId,
        })),
      );
    }

    return { data: project };
  }

  @UseGuards(AuthGuard)
  @Patch(":projectId")
  async update(
    @CurrentUser() user: { sub: string },
    @Param("projectId") projectId: string,
    @Body() body: UpdateProjectDto,
  ) {
    await this.projectsService.assertProjectEditAccess(user.sub, projectId);

    if (body.visibilityScope === "selected_institutions" && !body.selectedInstitutionIds?.length) {
      const existingSelectedInstitutions = await db
        .select()
        .from(projectVisibilityInstitutions)
        .where(eq(projectVisibilityInstitutions.projectId, projectId));

      if (existingSelectedInstitutions.length === 0) {
        throw new BadRequestException("Selected institution visibility requires at least one institution.");
      }
    }

    const [updated] = await db
      .update(projects)
      .set({
        title: body.title,
        summary: body.summary,
        description: body.description,
        visibilityScope: body.visibilityScope,
        status: body.status,
        applicationDeadlineAt: body.applicationDeadlineAt ? new Date(body.applicationDeadlineAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (body.selectedInstitutionIds) {
      await db.delete(projectVisibilityInstitutions).where(eq(projectVisibilityInstitutions.projectId, projectId));
      if (body.selectedInstitutionIds.length > 0) {
        await db.insert(projectVisibilityInstitutions).values(
          body.selectedInstitutionIds.map((institutionId) => ({
            projectId,
            institutionId,
          })),
        );
      }
    }

    return { data: updated };
  }

  @UseGuards(AuthGuard)
  @Post(":projectId/publish")
  async publish(@CurrentUser() user: { sub: string }, @Param("projectId") projectId: string) {
    await this.projectsService.assertProjectEditAccess(user.sub, projectId);

    const [updated] = await db
      .update(projects)
      .set({ status: "published", publishAt: new Date(), updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

    return { data: updated };
  }
}
