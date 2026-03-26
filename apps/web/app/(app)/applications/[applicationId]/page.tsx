"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/applications/${params.applicationId}`, { credentials: "include" });
      const json = await response.json();
      setApplication(json.data ?? null);
    };
    void run();
  }, [params.applicationId]);

  if (!application) {
    return <div>Loading application...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Application {application.id}</h1>
        <p className="mt-2 text-sm text-zinc-600">Status: {application.status}</p>
        <p className="mt-5 text-zinc-700">{application.note ?? "No note provided."}</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Event Timeline</h2>
        <ul className="mt-4 space-y-3 text-sm text-zinc-700">
          {(application.events ?? []).map((event: any) => (
            <li key={event.id} className="rounded-lg bg-muted p-3">
              {event.eventType} {event.fromStatus ? `${event.fromStatus} -> ${event.toStatus}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
