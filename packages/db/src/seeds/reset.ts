import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../client";

const tables = [
  "ai_tasks",
  "ai_summaries",
  "ai_flags",
  "role_embeddings",
  "profile_embeddings",
  "moderation_actions",
  "reports",
  "blocked_entities",
  "audit_logs",
  "stripe_event_log",
  "subscription_entitlements",
  "subscriptions",
  "billing_customers",
  "plans",
  "notifications",
  "notification_preferences",
  "audition_submissions",
  "audition_slots",
  "audition_requests",
  "application_notes",
  "application_events",
  "application_media_assets",
  "application_question_answers",
  "applications",
  "saved_roles",
  "role_questions",
  "role_requirements",
  "roles",
  "project_stats",
  "saved_projects",
  "project_visibility_institutions",
  "project_team_members",
  "projects",
  "profile_media",
  "media_assets",
  "availability_preferences",
  "profile_links",
  "profile_credits",
  "profile_skills",
  "profile_disciplines",
  "talent_profiles",
  "organization_memberships",
  "organizations",
  "user_affiliations",
  "institution_programs",
  "institutions",
  "email_verification_tokens",
  "password_reset_tokens",
  "sessions",
  "user_emails",
  "users"
];

const reset = async () => {
  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE;`));
  }
  process.exit(0);
};

reset().catch((error) => {
  console.error(error);
  process.exit(1);
});
