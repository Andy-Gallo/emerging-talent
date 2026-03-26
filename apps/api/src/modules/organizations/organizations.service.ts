import { ForbiddenException, Injectable } from "@nestjs/common";
import { db, organizationMemberships, organizations } from "@etp/db";
import { and, eq, inArray } from "drizzle-orm";
import type { OrganizationRole } from "../../common/constants/roles";

@Injectable()
export class OrganizationsService {
  async assertOrgRole(userId: string, organizationId: string, accepted: OrganizationRole[]) {
    const [membership] = await db
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.userId, userId),
          eq(organizationMemberships.organizationId, organizationId),
          eq(organizationMemberships.isActive, true),
          inArray(organizationMemberships.role, accepted as string[]),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException("Organization permissions required.");
    }

    return membership;
  }

  async getMyOrganizations(userId: string) {
    const memberships = await db
      .select()
      .from(organizationMemberships)
      .where(and(eq(organizationMemberships.userId, userId), eq(organizationMemberships.isActive, true)));

    const orgIds = memberships.map((membership) => membership.organizationId);
    if (orgIds.length === 0) {
      return [];
    }

    return db.select().from(organizations).where(inArray(organizations.id, orgIds));
  }
}
