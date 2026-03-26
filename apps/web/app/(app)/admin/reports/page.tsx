"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  const load = async () => {
    const response = await fetch(`${API_BASE_URL}/moderation/reports`, { credentials: "include" });
    const json = await response.json();
    setReports(json.data ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const closeReport = async (reportId: string) => {
    await fetch(`${API_BASE_URL}/moderation/reports/${reportId}/actions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionType: "dismiss", reason: "Reviewed by admin" }),
    });

    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold">Moderation Queue</h1>
      {reports.map((report) => (
        <article key={report.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{report.status}</p>
          <h2 className="mt-2 text-lg font-medium">{report.reason}</h2>
          <p className="mt-1 text-sm text-zinc-700">Target: {report.targetType} / {report.targetId}</p>
          <button onClick={() => closeReport(report.id)} className="mt-4 rounded-md bg-accent px-3 py-2 text-sm text-white">
            Resolve
          </button>
        </article>
      ))}
    </div>
  );
}
