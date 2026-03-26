import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { db, projectVisibilityInstitutions, projects, roles } from "@etp/db";
import { and, desc, eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { OptionalAuthGuard } from "../../common/guards/optional-auth.guard";
import { ProjectsService } from "./projects.service";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

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
    @Body()
    body: {
      organizationId: string;
      title: string;
      slug: string;
      summary: string;
      description: string;
      visibilityScope: "campus_only" | "selected_institutions" | "public_network";
      selectedInstitutionIds?: string[];
      locationText?: string;
      compensationSummary?: string;
      applicationDeadlineAt?: string;
    },
  ) {
    await this.projectsService.assertOrganizationEditor(user.sub, body.organizationId);

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
    @Body() body: Partial<{ status: string; title: string; summary: string; description: string; visibilityScope: string }>,
  ) {
    await this.projectsService.assertProjectEditAccess(user.sub, projectId);

    const [updated] = await db
      .update(projects)
      .set({
        title: body.title,
        summary: body.summary,
        description: body.description,
        visibilityScope: body.visibilityScope,
        status: body.status,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

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
