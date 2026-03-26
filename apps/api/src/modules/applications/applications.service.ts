import { BadRequestException, Injectable } from "@nestjs/common";
import {
  applicationEvents,
  applicationMediaAssets,
  applicationNotes,
  applicationQuestionAnswers,
  applications,
  db,
  notifications,
  profileMedia,
  roleQuestions,
  roles,
  talentProfiles,
} from "@etp/db";
import { and, eq } from "drizzle-orm";
import { ProjectsService } from "../projects/projects.service";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted", "withdrawn"],
  submitted: ["in_review", "shortlisted", "rejected", "withdrawn"],
  in_review: ["shortlisted", "audition_requested", "rejected", "accepted"],
  shortlisted: ["audition_requested", "rejected", "accepted"],
  audition_requested: ["audition_completed", "rejected", "accepted"],
  audition_completed: ["accepted", "rejected"],
  accepted: [],
  rejected: [],
  withdrawn: [],
};

@Injectable()
export class ApplicationsService {
  constructor(private readonly projectsService: ProjectsService) {}

  async listMine(userId: string) {
    return db.select().from(applications).where(eq(applications.applicantUserId, userId));
  }

  async createOrUpdateDraft(
    userId: string,
    body: {
      roleId: string;
      note?: string;
      answers?: Array<{ questionId: string; answer: string }>;
      mediaAssetIds?: string[];
      submit?: boolean;
    },
  ) {
    const [role] = await db.select().from(roles).where(eq(roles.id, body.roleId)).limit(1);
    if (!role) {
      throw new BadRequestException("Role not found.");
    }

    const canView = await this.projectsService.canUserViewProject(userId, role.projectId);
    if (!canView) {
      throw new BadRequestException("You are not eligible to apply to this role.");
    }

    const [profile] = await db.select().from(talentProfiles).where(eq(talentProfiles.userId, userId)).limit(1);
    const media = profile
      ? await db
          .select()
          .from(profileMedia)
          .where(eq(profileMedia.profileId, profile.id))
      : [];

    const [existing] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.roleId, body.roleId), eq(applications.applicantUserId, userId)))
      .limit(1);

    const nextStatus = body.submit ? "submitted" : existing?.status ?? "draft";

    const application = existing
      ? (
          await db
            .update(applications)
            .set({
              note: body.note,
              status: nextStatus,
              profileSnapshotJson: JSON.stringify(profile ?? null),
              mediaSnapshotJson: JSON.stringify(media),
              submittedAt: body.submit && existing.status !== "submitted" ? new Date() : existing.submittedAt,
              updatedAt: new Date(),
            })
            .where(eq(applications.id, existing.id))
            .returning()
        )[0]
      : (
          await db
            .insert(applications)
            .values({
              projectId: role.projectId,
              roleId: body.roleId,
              applicantUserId: userId,
              status: nextStatus,
              note: body.note,
              profileSnapshotJson: JSON.stringify(profile ?? null),
              mediaSnapshotJson: JSON.stringify(media),
              submittedAt: body.submit ? new Date() : undefined,
            })
            .returning()
        )[0];

    if (body.answers) {
      await db.delete(applicationQuestionAnswers).where(eq(applicationQuestionAnswers.applicationId, application.id));
      if (body.answers.length > 0) {
        await db.insert(applicationQuestionAnswers).values(
          body.answers.map((answer) => ({
            applicationId: application.id,
            roleQuestionId: answer.questionId,
            answer: answer.answer,
          })),
        );
      }
    }

    if (body.mediaAssetIds) {
      await db.delete(applicationMediaAssets).where(eq(applicationMediaAssets.applicationId, application.id));
      if (body.mediaAssetIds.length > 0) {
        await db.insert(applicationMediaAssets).values(
          body.mediaAssetIds.map((mediaAssetId) => ({
            applicationId: application.id,
            mediaAssetId,
          })),
        );
      }
    }

    if (body.submit && (!existing || existing.status !== "submitted")) {
      await db.insert(applicationEvents).values({
        applicationId: application.id,
        actorUserId: userId,
        eventType: "submitted",
        fromStatus: existing?.status ?? "draft",
        toStatus: "submitted",
        metadataJson: JSON.stringify({ source: "applicant" }),
      });

      await db.insert(notifications).values({
        userId,
        channel: "in_app",
        category: "application_submitted",
        title: "Application submitted",
        body: "Your application has been submitted successfully.",
        actionUrl: `/applications/${application.id}`,
      });
    }

    const questions = await db.select().from(roleQuestions).where(eq(roleQuestions.roleId, role.id));

    return {
      application,
      questions,
    };
  }

  async getDetailForOwner(userId: string, applicationId: string) {
    const [application] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!application) {
      return null;
    }

    if (application.applicantUserId !== userId) {
      await this.projectsService.assertProjectReviewAccess(userId, application.projectId);
    }

    const [answers, events, notes] = await Promise.all([
      db.select().from(applicationQuestionAnswers).where(eq(applicationQuestionAnswers.applicationId, applicationId)),
      db.select().from(applicationEvents).where(eq(applicationEvents.applicationId, applicationId)),
      db.select().from(applicationNotes).where(eq(applicationNotes.applicationId, applicationId)),
    ]);

    return {
      ...application,
      answers,
      events,
      notes,
    };
  }

  async listRoleApplications(userId: string, roleId: string) {
    const [role] = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (!role) {
      return [];
    }

    await this.projectsService.assertProjectReviewAccess(userId, role.projectId);

    return db.select().from(applications).where(eq(applications.roleId, roleId));
  }

  async updateStatus(userId: string, applicationId: string, toStatus: string) {
    const [application] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!application) {
      throw new BadRequestException("Application not found.");
    }

    await this.projectsService.assertProjectReviewAccess(userId, application.projectId);

    const allowed = ALLOWED_TRANSITIONS[application.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(`Cannot transition from ${application.status} to ${toStatus}.`);
    }

    const [updated] = await db
      .update(applications)
      .set({ status: toStatus, updatedAt: new Date() })
      .where(eq(applications.id, applicationId))
      .returning();

    await db.insert(applicationEvents).values({
      applicationId,
      actorUserId: userId,
      eventType: "status_changed",
      fromStatus: application.status,
      toStatus,
      metadataJson: JSON.stringify({}),
    });

    await db.insert(notifications).values({
      userId: application.applicantUserId,
      channel: "in_app",
      category: "application_status_changed",
      title: "Application status updated",
      body: `Your application is now ${toStatus.replaceAll("_", " ")}.`,
      actionUrl: `/applications/${application.id}`,
    });

    return updated;
  }

  async addInternalNote(userId: string, applicationId: string, note: string) {
    const [application] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!application) {
      throw new BadRequestException("Application not found.");
    }

    await this.projectsService.assertProjectReviewAccess(userId, application.projectId);

    const [created] = await db
      .insert(applicationNotes)
      .values({
        applicationId,
        authorUserId: userId,
        note,
        isPrivate: true,
      })
      .returning();

    return created;
  }
}
