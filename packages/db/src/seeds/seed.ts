import "dotenv/config";
import { db } from "../client";
import {
  applications,
  applicationEvents,
  institutions,
  organizationMemberships,
  organizations,
  plans,
  projectTeamMembers,
  projects,
  roleQuestions,
  roles,
  talentProfiles,
  userAffiliations,
  users,
} from "../schema";

const seed = async () => {
  const [school] = await db
    .insert(institutions)
    .values({
      name: "Pacific School of Arts",
      slug: "pacific-school-of-arts",
      domain: "psa.edu",
      kind: "university",
      city: "Los Angeles",
      region: "CA",
      country: "US",
      isActive: true,
    })
    .returning();

  const [director, actor, admin] = await db
    .insert(users)
    .values([
      {
        primaryEmail: "director@psa.edu",
        displayName: "Student Director",
        passwordHash: "$2b$10$dzQcgQw4WIgb4oN6M1NQ5OBOy6B8xN4jQxA2wmM4ZE5Y2s9Xf4pNO",
        accountType: "student",
        globalRole: "user",
        isActive: true,
      },
      {
        primaryEmail: "actor@psa.edu",
        displayName: "Emerging Performer",
        passwordHash: "$2b$10$dzQcgQw4WIgb4oN6M1NQ5OBOy6B8xN4jQxA2wmM4ZE5Y2s9Xf4pNO",
        accountType: "student",
        globalRole: "user",
        isActive: true,
      },
      {
        primaryEmail: "admin@platform.local",
        displayName: "Platform Admin",
        passwordHash: "$2b$10$dzQcgQw4WIgb4oN6M1NQ5OBOy6B8xN4jQxA2wmM4ZE5Y2s9Xf4pNO",
        accountType: "staff",
        globalRole: "platform_admin",
        isActive: true,
      },
    ])
    .returning();

  await db.insert(userAffiliations).values([
    {
      userId: director.id,
      institutionId: school.id,
      programName: "Film",
      graduationYear: 2027,
      verificationMethod: "email_domain",
      status: "verified",
      isPrimary: true,
    },
    {
      userId: actor.id,
      institutionId: school.id,
      programName: "Theatre",
      graduationYear: 2028,
      verificationMethod: "email_domain",
      status: "verified",
      isPrimary: true,
    },
  ]);

  const [org] = await db
    .insert(organizations)
    .values({
      name: "PSA Film Collective",
      slug: "psa-film-collective",
      kind: "student_group",
      institutionId: school.id,
      createdByUserId: director.id,
      isVerified: true,
    })
    .returning();

  await db.insert(organizationMemberships).values([
    { organizationId: org.id, userId: director.id, role: "owner", isActive: true },
    { organizationId: org.id, userId: actor.id, role: "reviewer", isActive: true },
  ]);

  const [project] = await db
    .insert(projects)
    .values({
      organizationId: org.id,
      createdByUserId: director.id,
      title: "Sundown on Mercer",
      slug: "sundown-on-mercer",
      summary: "A student short film about friendship and memory.",
      description: "A final-year production seeking actors for principal roles.",
      type: "student_film",
      status: "published",
      visibilityScope: "public_network",
      locationText: "Los Angeles, CA",
      compensationSummary: "Unpaid + meals + reel footage",
    })
    .returning();

  await db.insert(projectTeamMembers).values([
    { projectId: project.id, userId: director.id, role: "owner" },
  ]);

  const [role] = await db
    .insert(roles)
    .values({
      projectId: project.id,
      title: "Lead Performer - Alex",
      roleType: "performer",
      description: "Looking for grounded emotional range and strong listening.",
      status: "open",
      isRemote: false,
      compensationType: "unpaid",
      compensationText: "Meals, credit, and footage.",
    })
    .returning();

  await db.insert(roleQuestions).values([
    {
      roleId: role.id,
      question: "Share a short note about why this role resonates with you.",
      inputType: "text",
      isRequired: true,
      sortOrder: 0,
    },
  ]);

  await db.insert(talentProfiles).values([
    {
      userId: actor.id,
      slug: "emerging-performer",
      headline: "Actor and movement artist",
      bio: "Performer focused on intimate drama and grounded character work.",
      locationCity: "Los Angeles",
      locationRegion: "CA",
      isPublic: true,
    },
  ]);

  const [application] = await db
    .insert(applications)
    .values({
      projectId: project.id,
      roleId: role.id,
      applicantUserId: actor.id,
      status: "submitted",
      note: "Would love to collaborate on this project.",
      profileSnapshotJson: JSON.stringify({ name: actor.displayName }),
      mediaSnapshotJson: JSON.stringify([]),
    })
    .returning();

  await db.insert(applicationEvents).values([
    {
      applicationId: application.id,
      actorUserId: actor.id,
      eventType: "submitted",
      fromStatus: "draft",
      toStatus: "submitted",
      metadataJson: JSON.stringify({ source: "seed" }),
    },
  ]);

  await db.insert(plans).values([
    {
      code: "student_free",
      name: "Student Free",
      billingInterval: "month",
      isActive: true,
    },
    {
      code: "creator_pro",
      name: "Creator Plan",
      billingInterval: "month",
      stripePriceId: "price_creator_monthly",
      isActive: true,
    },
  ]);

  console.log("Seed completed.");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
