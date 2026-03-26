import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import {
  db,
  profileDisciplines,
  profileSkills,
  talentProfiles,
} from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";

@Controller("profiles")
@UseGuards(AuthGuard)
export class ProfilesController {
  @Get("me")
  async me(@CurrentUser() user: { sub: string }) {
    const [profile] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, user.sub))
      .limit(1);

    if (!profile) {
      return { data: null };
    }

    const [disciplines, skills] = await Promise.all([
      db.select().from(profileDisciplines).where(eq(profileDisciplines.profileId, profile.id)),
      db.select().from(profileSkills).where(eq(profileSkills.profileId, profile.id)),
    ]);

    return {
      data: {
        ...profile,
        disciplines,
        skills,
      },
    };
  }

  @Patch("me")
  async upsert(
    @CurrentUser() user: { sub: string; displayName: string },
    @Body()
    body: {
      slug?: string;
      headline?: string;
      bio?: string;
      locationCity?: string;
      locationRegion?: string;
      isPublic?: boolean;
      disciplines?: string[];
      skills?: string[];
    },
  ) {
    const [existing] = await db
      .select()
      .from(talentProfiles)
      .where(eq(talentProfiles.userId, user.sub))
      .limit(1);

    const profile = existing
      ? (
          await db
            .update(talentProfiles)
            .set({
              slug: body.slug ?? existing.slug,
              headline: body.headline,
              bio: body.bio,
              locationCity: body.locationCity,
              locationRegion: body.locationRegion,
              isPublic: body.isPublic ?? true,
              updatedAt: new Date(),
            })
            .where(eq(talentProfiles.id, existing.id))
            .returning()
        )[0]
      : (
          await db
            .insert(talentProfiles)
            .values({
              userId: user.sub,
              slug: body.slug ?? user.displayName.toLowerCase().replace(/\s+/g, "-"),
              headline: body.headline,
              bio: body.bio,
              locationCity: body.locationCity,
              locationRegion: body.locationRegion,
              isPublic: body.isPublic ?? true,
            })
            .returning()
        )[0];

    if (body.disciplines) {
      await db.delete(profileDisciplines).where(eq(profileDisciplines.profileId, profile.id));
      if (body.disciplines.length > 0) {
        await db.insert(profileDisciplines).values(
          body.disciplines.map((discipline) => ({
            profileId: profile.id,
            discipline,
          })),
        );
      }
    }

    if (body.skills) {
      await db.delete(profileSkills).where(eq(profileSkills.profileId, profile.id));
      if (body.skills.length > 0) {
        await db.insert(profileSkills).values(
          body.skills.map((skill) => ({
            profileId: profile.id,
            skill,
          })),
        );
      }
    }

    return { data: profile };
  }
}
