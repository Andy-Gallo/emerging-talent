"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function CastingPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const projectRes = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const projectJson = await projectRes.json();
      const ownProjects = projectJson.data ?? [];
      setProjects(ownProjects);

      const rolePromises = ownProjects.map((project: any) =>
        fetch(`${API_BASE_URL}/roles/project/${project.id}`, { credentials: "include" }).then((response) => response.json()),
      );
      const roleResults = await Promise.all(rolePromises);
      setRoles(roleResults.flatMap((result) => result.data ?? []));
    };

    void run();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-3xl font-semibold">Casting Dashboard</h1>
        <p className="mt-2 text-zinc-700">Review applications, update statuses, and request auditions.</p>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Active Roles</h2>
        <ul className="mt-4 space-y-3">
          {roles.map((role) => (
            <li key={role.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
              <span>{role.title}</span>
              <Link href={`/casting/roles/${role.id}/applications`} className="rounded-md border border-border px-3 py-2 text-sm">
                View applications
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">My Projects</h2>
        <ul className="mt-4 space-y-3">
          {projects.map((project) => (
            <li key={project.id} className="rounded-lg bg-muted p-3">
              {project.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
