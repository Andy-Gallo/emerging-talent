import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import {
  db,
  organizations,
  projectVisibilityInstitutions,
  projects,
  roles,
  userAffiliations,
} from "@etp/db";
import { and, eq, inArray } from "drizzle-orm";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class ProjectsService {
  constructor(@Inject(OrganizationsService) private readonly organizationsService: OrganizationsService) {}

  async assertOrganizationEditor(userId: string, organizationId: string) {
    await this.organizationsService.assertOrgRole(userId, organizationId, ["owner", "admin", "editor"]);
  }

  async canUserViewProject(userId: string | null, projectId: string): Promise<boolean> {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) {
      return false;
    }

    if (project.visibilityScope === "public_network") {
      return true;
    }

    if (!userId) {
      return false;
    }

    const [affiliation] = await db
      .select()
      .from(userAffiliations)
      .where(and(eq(userAffiliations.userId, userId), eq(userAffiliations.status, "verified")))
      .limit(1);

    if (!affiliation) {
      return false;
    }

    if (project.visibilityScope === "campus_only") {
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, project.organizationId))
        .limit(1);

      return organization?.institutionId === affiliation.institutionId;
    }

    const rows = await db
      .select()
      .from(projectVisibilityInstitutions)
      .where(eq(projectVisibilityInstitutions.projectId, projectId));

    return rows.some((row) => row.institutionId === affiliation.institutionId);
  }

  async assertProjectReviewAccess(userId: string, projectId: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) {
      throw new ForbiddenException("Project not found.");
    }

    await this.organizationsService.assertOrgRole(userId, project.organizationId, [
      "owner",
      "admin",
      "editor",
      "reviewer",
    ]);

    return project;
  }

  async assertProjectEditAccess(userId: string, projectId: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) {
      throw new ForbiddenException("Project not found.");
    }

    await this.organizationsService.assertOrgRole(userId, project.organizationId, ["owner", "admin", "editor"]);

    return project;
  }

  async listDiscoverableRoles(userId: string | null) {
    const openRoles = await db.select().from(roles).where(eq(roles.status, "open"));
    const projectIds = [...new Set(openRoles.map((role) => role.projectId))];
    const projectRows = projectIds.length
      ? await db.select().from(projects).where(inArray(projects.id, projectIds))
      : [];

    const visibilityMap = new Map(projectRows.map((project) => [project.id, project]));

    const result = [];
    for (const role of openRoles) {
      const project = visibilityMap.get(role.projectId);
      if (!project) {
        continue;
      }
      const allowed = await this.canUserViewProject(userId, project.id);
      if (allowed) {
        result.push({ role, project });
      }
    }

    return result;
  }
}
