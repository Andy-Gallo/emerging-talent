import { Body, Controller, ForbiddenException, Get, Headers, Post, UseGuards } from "@nestjs/common";
import { db, plans, stripeEventLog, subscriptions, subscriptionEntitlements } from "@etp/db";
import { eq } from "drizzle-orm";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthGuard } from "../../common/guards/auth.guard";
import { OrganizationsService } from "../organizations/organizations.service";
import { CheckoutDto } from "./billing.dto";

@Controller("billing")
export class BillingController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get("plans")
  async listPlans() {
    return { data: await db.select().from(plans).where(eq(plans.isActive, true)) };
  }

  @Post("checkout")
  @UseGuards(AuthGuard)
  async checkout(
    @CurrentUser() user: { sub: string },
    @Body() body: CheckoutDto,
  ) {
    if (body.ownerType === "user" && body.ownerId !== user.sub) {
      throw new ForbiddenException("You can only create subscriptions for your own user account.");
    }

    if (body.ownerType === "organization") {
      await this.organizationsService.assertOrgRole(user.sub, body.ownerId, ["owner", "admin", "billing"]);
    }

    const [created] = await db
      .insert(subscriptions)
      .values({
        ownerType: body.ownerType,
        ownerId: body.ownerId,
        planId: body.planId,
        stripeSubscriptionId: `sub_local_${Date.now()}`,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      })
      .returning();

    await db.insert(subscriptionEntitlements).values([
      { subscriptionId: created.id, key: "max_active_public_projects", value: 10 },
      { subscriptionId: created.id, key: "max_collaborator_seats", value: 10 },
    ]);

    return {
      data: {
        subscription: created,
        checkoutUrl: `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/billing?success=1`,
      },
    };
  }

  @Post("webhooks/stripe")
  async stripeWebhook(
    @Headers("stripe-signature") signature: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    const [event] = await db
      .insert(stripeEventLog)
      .values({
        stripeEventId: String(payload.id ?? `evt_local_${Date.now()}`),
        eventType: String(payload.type ?? "unknown"),
        payloadJson: JSON.stringify(payload),
        processedAt: new Date(),
        processingStatus: signature ? "processed" : "pending_signature",
      })
      .returning();

    return { data: event };
  }

  @Get("entitlements")
  @UseGuards(AuthGuard)
  async entitlements(@CurrentUser() user: { sub: string }) {
    const rows = await db.select().from(subscriptions).where(eq(subscriptions.ownerId, user.sub));
    return { data: rows };
  }
}
