"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function AuditionsPage() {
  const [data, setData] = useState<{ applicantRequests: any[]; castingRequests: any[] }>({ applicantRequests: [], castingRequests: [] });

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/auditions`, { credentials: "include" });
      const json = await response.json();
      setData(json.data ?? { applicantRequests: [], castingRequests: [] });
    };
    void run();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Incoming Auditions</h1>
        <ul className="mt-4 space-y-3 text-sm">
          {data.applicantRequests.map((request) => (
            <li key={request.id} className="rounded-lg bg-muted p-3">
              {request.mode} audition request
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">Sent Requests</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {data.castingRequests.map((request) => (
            <li key={request.id} className="rounded-lg bg-muted p-3">
              Application {request.applicationId}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
