import { BadRequestException, Injectable } from "@nestjs/common";
import {
  applicationEvents,
  applications,
  auditionRequests,
  auditionSlots,
  auditionSubmissions,
  db,
  notifications,
} from "@etp/db";
import { and, eq, inArray } from "drizzle-orm";
import { ProjectsService } from "../projects/projects.service";
import { RequestAuditionDto, SubmitAuditionDto } from "./auditions.dto";

@Injectable()
export class AuditionsService {
  constructor(private readonly projectsService: ProjectsService) {}

  async request(actorUserId: string, body: RequestAuditionDto) {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, body.applicationId))
      .limit(1);

    if (!application) {
      throw new BadRequestException("Application not found.");
    }

    await this.projectsService.assertProjectReviewAccess(actorUserId, application.projectId);

    if (!["in_review", "shortlisted"].includes(application.status)) {
      throw new BadRequestException("Application must be in review or shortlisted before requesting an audition.");
    }

    if (body.mode === "live" && (!body.slots || body.slots.length === 0)) {
      throw new BadRequestException("At least one live audition slot is required.");
    }

    const [request] = await db
      .insert(auditionRequests)
      .values({
        applicationId: body.applicationId,
        requestedByUserId: actorUserId,
        mode: body.mode,
        message: body.message,
        status: "pending",
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
      })
      .returning();

    if (body.slots?.length) {
      await db.insert(auditionSlots).values(
        body.slots.map((slot) => ({
          auditionRequestId: request.id,
          startsAt: new Date(slot.startsAt),
          endsAt: new Date(slot.endsAt),
          locationText: slot.locationText,
          meetingUrl: slot.meetingUrl,
          capacity: 1,
        })),
      );
    }

    await db.insert(applicationEvents).values({
      applicationId: body.applicationId,
      actorUserId,
      eventType: "audition_requested",
      fromStatus: application.status,
      toStatus: "audition_requested",
      metadataJson: JSON.stringify({ auditionRequestId: request.id }),
    });

    await db
      .update(applications)
      .set({ status: "audition_requested", updatedAt: new Date() })
      .where(eq(applications.id, body.applicationId));

    await db.insert(notifications).values({
      userId: application.applicantUserId,
      channel: "in_app",
      category: "audition_requested",
      title: "Audition requested",
      body: "A casting team requested an audition.",
      actionUrl: `/auditions`,
    });

    return request;
  }

  async listForUser(userId: string) {
    const ownApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.applicantUserId, userId));

    const ownIds = ownApplications.map((application) => application.id);
    const applicantRequests = ownIds.length
      ? await db.select().from(auditionRequests).where(inArray(auditionRequests.applicationId, ownIds))
      : [];

    const castingRequests = await db
      .select()
      .from(auditionRequests)
      .where(eq(auditionRequests.requestedByUserId, userId));

    return { applicantRequests, castingRequests };
  }

  async submit(userId: string, body: SubmitAuditionDto) {
    const [request] = await db
      .select()
      .from(auditionRequests)
      .where(eq(auditionRequests.id, body.auditionRequestId))
      .limit(1);

    if (!request) {
      throw new BadRequestException("Audition request not found.");
    }

    if (request.status !== "pending") {
      throw new BadRequestException("Audition request is no longer pending.");
    }

    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, request.applicationId))
      .limit(1);

    if (!application || application.applicantUserId !== userId) {
      throw new BadRequestException("Not authorized for this audition request.");
    }

    if (application.status !== "audition_requested") {
      throw new BadRequestException("Application is not currently in audition requested status.");
    }

    if (request.mode === "live" && !body.slotId) {
      throw new BadRequestException("A slot is required for live auditions.");
    }

    if (request.mode === "self_tape" && !body.selfTapeMediaAssetId) {
      throw new BadRequestException("A self-tape asset is required for self-tape auditions.");
    }

    if (body.slotId) {
      const [slot] = await db
        .select()
        .from(auditionSlots)
        .where(and(eq(auditionSlots.id, body.slotId), eq(auditionSlots.auditionRequestId, request.id)))
        .limit(1);
      if (!slot) {
        throw new BadRequestException("Selected audition slot is invalid.");
      }
    }

    const [existingSubmission] = await db
      .select()
      .from(auditionSubmissions)
      .where(
        and(
          eq(auditionSubmissions.auditionRequestId, request.id),
          eq(auditionSubmissions.applicantUserId, userId),
        ),
      )
      .limit(1);

    if (existingSubmission) {
      throw new BadRequestException("You have already submitted this audition.");
    }

    const [submission] = await db
      .insert(auditionSubmissions)
      .values({
        auditionRequestId: request.id,
        applicantUserId: userId,
        slotId: body.slotId,
        selfTapeMediaAssetId: body.selfTapeMediaAssetId,
        note: body.note,
      })
      .returning();

    await db
      .update(auditionRequests)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(auditionRequests.id, request.id));

    await db.insert(applicationEvents).values({
      applicationId: application.id,
      actorUserId: userId,
      eventType: "audition_submitted",
      fromStatus: "audition_requested",
      toStatus: "audition_completed",
      metadataJson: JSON.stringify({ auditionSubmissionId: submission.id }),
    });

    await db
      .update(applications)
      .set({ status: "audition_completed", updatedAt: new Date() })
      .where(eq(applications.id, application.id));

    return submission;
  }
}
