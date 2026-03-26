import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { db, institutions } from "@etp/db";
import { eq } from "drizzle-orm";
import { Roles } from "../../common/decorators/roles.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";

@Controller("institutions")
export class InstitutionsController {
  @Get()
  async list(@Query("activeOnly") activeOnly?: string) {
    if (activeOnly === "true") {
      return { data: await db.select().from(institutions).where(eq(institutions.isActive, true)) };
    }

    return { data: await db.select().from(institutions) };
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("platform_admin")
  async create(@Body() body: { name: string; slug: string; domain?: string; city?: string; region?: string }) {
    const [created] = await db
      .insert(institutions)
      .values({
        name: body.name,
        slug: body.slug,
        domain: body.domain,
        city: body.city,
        region: body.region,
        kind: "university",
        country: "US",
        isActive: true,
      })
      .returning();

    return { data: created };
  }
}
