export const APPLICATION_STATUS_TRANSITIONS: Record<string, string[]> = {
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

export function canTransitionApplicationStatus(fromStatus: string, toStatus: string): boolean {
  const allowed = APPLICATION_STATUS_TRANSITIONS[fromStatus] ?? [];
  return allowed.includes(toStatus);
}
