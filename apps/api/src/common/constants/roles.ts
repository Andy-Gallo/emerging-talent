export const GLOBAL_ROLES = ["user", "platform_admin"] as const;
export type GlobalRole = (typeof GLOBAL_ROLES)[number];

export const ORG_ROLES = ["owner", "admin", "editor", "reviewer", "billing"] as const;
export type OrganizationRole = (typeof ORG_ROLES)[number];
