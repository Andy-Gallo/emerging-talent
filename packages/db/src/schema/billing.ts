import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAtColumn, idColumn, updatedAtColumn } from "./_common";

export const plans = pgTable("plans", {
  id: idColumn(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  billingInterval: text("billing_interval").default("month").notNull(),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const billingCustomers = pgTable("billing_customers", {
  id: idColumn(),
  ownerType: text("owner_type").notNull(),
  ownerId: text("owner_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const subscriptions = pgTable("subscriptions", {
  id: idColumn(),
  ownerType: text("owner_type").notNull(),
  ownerId: text("owner_id").notNull(),
  planId: text("plan_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const subscriptionEntitlements = pgTable("subscription_entitlements", {
  id: idColumn(),
  subscriptionId: text("subscription_id").notNull(),
  key: text("key").notNull(),
  value: integer("value").default(0).notNull(),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const stripeEventLog = pgTable("stripe_event_log", {
  id: idColumn(),
  stripeEventId: text("stripe_event_id").notNull(),
  eventType: text("event_type").notNull(),
  payloadJson: text("payload_json").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  processingStatus: text("processing_status").default("pending").notNull(),
  errorMessage: text("error_message"),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
