import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { db, organizationMemberships, organizations } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
@UseGuards(AuthGuard)
export class OrganizationsController {
  constructor(@Inject(OrganizationsService) private readonly organizationsService: OrganizationsService) {}

  @Get("mine")
  async mine(@CurrentUser() user: { sub: string }) {
    return { data: await this.organizationsService.getMyOrganizations(user.sub) };
  }

  @Post()
  async create(
    @CurrentUser() user: { sub: string },
    @Body() body: { name: string; slug: string; kind?: string; institutionId?: string },
  ) {
    const [created] = await db
      .insert(organizations)
      .values({
        name: body.name,
        slug: body.slug,
        kind: body.kind ?? "student_group",
        institutionId: body.institutionId,
        createdByUserId: user.sub,
        isVerified: false,
      })
      .returning();

    await db.insert(organizationMemberships).values({
      organizationId: created.id,
      userId: user.sub,
      role: "owner",
      isActive: true,
    });

    return { data: created };
  }

  @Get(":organizationId/members")
  async members(@CurrentUser() user: { sub: string }, @Param("organizationId") organizationId: string) {
    await this.organizationsService.assertOrgRole(user.sub, organizationId, ["owner", "admin", "editor", "reviewer", "billing"]);

    const members = await db
      .select()
      .from(organizationMemberships)
      .where(eq(organizationMemberships.organizationId, organizationId));

    return { data: members };
  }

  @Post(":organizationId/members")
  async addMember(
    @CurrentUser() user: { sub: string },
    @Param("organizationId") organizationId: string,
    @Body() body: { userId: string; role: string },
  ) {
    await this.organizationsService.assertOrgRole(user.sub, organizationId, ["owner", "admin"]);

    const [created] = await db
      .insert(organizationMemberships)
      .values({
        organizationId,
        userId: body.userId,
        role: body.role,
        isActive: true,
      })
      .returning();

    return { data: created };
  }
}
