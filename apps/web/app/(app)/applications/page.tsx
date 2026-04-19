"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

type ApplicationSummary = {
  id: string;
  roleId: string;
  status: string;
  submittedAt: string | null;
  updatedAt: string;
};

type ApiResponse<T> = {
  data: T;
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  shortlisted: "Shortlisted",
  audition_requested: "Audition requested",
  audition_completed: "Audition completed",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/applications/mine`, { credentials: "include" });
        if (!response.ok) {
          setError("Unable to load your applications.");
          return;
        }

        const json = (await response.json()) as ApiResponse<ApplicationSummary[]>;
        const rows = (json.data ?? []).sort(
          (first, second) =>
            new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
        );
        setApplications(rows);
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Applications</h1>
      {isLoading ? <p className="text-sm text-zinc-500">Loading applications...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!isLoading && !error && applications.length === 0 ? (
        <article className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-zinc-700">You have not started any applications yet.</p>
          <Link
            href="/discover"
            className="mt-3 inline-block rounded-md border border-border px-3 py-2 text-sm"
          >
            Browse projects
          </Link>
        </article>
      ) : null}
      {applications.map((application) => (
        <article key={application.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {statusLabel[application.status] ?? application.status}
          </p>
          <p className="mt-2 text-sm text-zinc-700">Role ID: {application.roleId}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {application.submittedAt
              ? `Submitted: ${new Date(application.submittedAt).toLocaleString()}`
              : "Not submitted yet"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Last updated: {new Date(application.updatedAt).toLocaleString()}
          </p>
          <Link
            href={`/applications/${application.id}`}
            className="mt-3 inline-block rounded-md border border-border px-3 py-2 text-sm"
          >
            Open
          </Link>
        </article>
      ))}
    </div>
  );
}
