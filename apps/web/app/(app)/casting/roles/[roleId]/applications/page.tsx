"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

const nextStatuses = ["in_review", "shortlisted", "audition_requested", "accepted", "rejected"];

export default function RoleApplicationsPage() {
  const params = useParams<{ roleId: string }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/applications/role/${params.roleId}`, { credentials: "include" });
    const json = await response.json();
    setApplications(json.data ?? []);
  }, [params.roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (applicationId: string, status: string) => {
    await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const addNote = async (applicationId: string) => {
    await fetch(`${API_BASE_URL}/applications/${applicationId}/notes`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: note[applicationId] ?? "" }),
    });
    setNote((value) => ({ ...value, [applicationId]: "" }));
  };

  const requestAudition = async (applicationId: string) => {
    await fetch(`${API_BASE_URL}/auditions/request`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        mode: "self_tape",
        message: "Please submit a one-minute dramatic monologue.",
      }),
    });

    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Applications Review</h1>
      {applications.map((application) => (
        <article key={application.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{application.status}</p>
          <p className="mt-2 text-sm">Applicant: {application.applicantUserId}</p>
          <p className="mt-2 text-sm text-zinc-700">{application.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => changeStatus(application.id, status)}
                className="rounded-md border border-border px-3 py-2 text-xs"
              >
                {status}
              </button>
            ))}
            <button onClick={() => requestAudition(application.id)} className="rounded-md bg-accent px-3 py-2 text-xs text-white">
              Request audition
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={note[application.id] ?? ""}
              onChange={(event) => setNote((value) => ({ ...value, [application.id]: event.target.value }))}
              placeholder="Internal note"
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
            />
            <button onClick={() => addNote(application.id)} className="rounded-md border border-border px-3 py-2 text-sm">
              Save
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
