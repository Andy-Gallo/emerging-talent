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
import { eq, inArray } from "drizzle-orm";
import { ApplicationsService } from "../applications/applications.service";

@Injectable()
export class AuditionsService {
  constructor(private readonly applicationsService: ApplicationsService) {}

  async request(
    actorUserId: string,
    body: {
      applicationId: string;
      mode: "live" | "self_tape";
      message?: string;
      dueAt?: string;
      slots?: Array<{ startsAt: string; endsAt: string; locationText?: string; meetingUrl?: string }>;
    },
  ) {
    const detail = await this.applicationsService.getDetailForOwner(actorUserId, body.applicationId);
    if (!detail) {
      throw new BadRequestException("Application not found.");
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
      fromStatus: detail.status,
      toStatus: "audition_requested",
      metadataJson: JSON.stringify({ auditionRequestId: request.id }),
    });

    await db
      .update(applications)
      .set({ status: "audition_requested", updatedAt: new Date() })
      .where(eq(applications.id, body.applicationId));

    await db.insert(notifications).values({
      userId: detail.applicantUserId,
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

  async submit(
    userId: string,
    body: {
      auditionRequestId: string;
      slotId?: string;
      selfTapeMediaAssetId?: string;
      note?: string;
    },
  ) {
    const [request] = await db
      .select()
      .from(auditionRequests)
      .where(eq(auditionRequests.id, body.auditionRequestId))
      .limit(1);

    if (!request) {
      throw new BadRequestException("Audition request not found.");
    }

    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, request.applicationId))
      .limit(1);

    if (!application || application.applicantUserId !== userId) {
      throw new BadRequestException("Not authorized for this audition request.");
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
