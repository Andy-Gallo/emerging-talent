"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";
import { SectionCard } from "@/components/layout/section-card";

export default function DashboardPage() {
  const [counts, setCounts] = useState({ projects: 0, applications: 0, notifications: 0 });

  useEffect(() => {
    const run = async () => {
      const [projectsRes, applicationsRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projects`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/applications/mine`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/notifications`, { credentials: "include" }),
      ]);

      const [projectsJson, applicationsJson, notificationsJson] = await Promise.all([
        projectsRes.json(),
        applicationsRes.json(),
        notificationsRes.json(),
      ]);

      setCounts({
        projects: (projectsJson.data ?? []).length,
        applications: (applicationsJson.data ?? []).length,
        notifications: (notificationsJson.data ?? []).length,
      });
    };

    void run();
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <SectionCard title="My Projects">
        <p className="text-3xl font-semibold">{counts.projects}</p>
        <Link href="/projects" className="mt-3 inline-block text-sm underline">
          Manage projects
        </Link>
      </SectionCard>
      <SectionCard title="My Applications">
        <p className="text-3xl font-semibold">{counts.applications}</p>
        <Link href="/applications" className="mt-3 inline-block text-sm underline">
          Review applications
        </Link>
      </SectionCard>
      <SectionCard title="Notifications">
        <p className="text-3xl font-semibold">{counts.notifications}</p>
        <Link href="/notifications" className="mt-3 inline-block text-sm underline">
          Open inbox
        </Link>
      </SectionCard>
    </div>
  );
}
