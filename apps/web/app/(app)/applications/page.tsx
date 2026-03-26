"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/applications/mine`, { credentials: "include" });
      const json = await response.json();
      setApplications(json.data ?? []);
    };

    void run();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Applications</h1>
      {applications.map((application) => (
        <article key={application.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{application.status}</p>
          <p className="mt-2 text-sm text-zinc-700">Role: {application.roleId}</p>
          <Link href={`/applications/${application.id}`} className="mt-3 inline-block rounded-md border border-border px-3 py-2 text-sm">
            Open
          </Link>
        </article>
      ))}
    </div>
  );
}
