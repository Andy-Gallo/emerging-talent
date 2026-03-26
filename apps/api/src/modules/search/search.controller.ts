import { Controller, Get, Query } from "@nestjs/common";
import { db, projects, roles } from "@etp/db";
import { ilike } from "drizzle-orm";

@Controller("search")
export class SearchController {
  @Get("discover")
  async discover(@Query("q") q?: string) {
    if (!q) {
      const roleRows = await db.select().from(roles);
      const projectRows = await db.select().from(projects);
      return { data: { roles: roleRows, projects: projectRows } };
    }

    const [roleRows, projectRows] = await Promise.all([
      db.select().from(roles).where(ilike(roles.title, `%${q}%`)),
      db.select().from(projects).where(ilike(projects.title, `%${q}%`)),
    ]);

    return { data: { roles: roleRows, projects: projectRows } };
  }
}
