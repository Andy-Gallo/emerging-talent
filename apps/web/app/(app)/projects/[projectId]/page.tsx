"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const [projectRes, rolesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projects/${params.projectId}`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/roles/project/${params.projectId}`, { credentials: "include" }),
      ]);
      const [projectJson, rolesJson] = await Promise.all([projectRes.json(), rolesRes.json()]);
      setProject(projectJson.data ?? null);
      setRoles(rolesJson.data ?? []);
    };

    void run();
  }, [params.projectId]);

  const publish = async () => {
    await fetch(`${API_BASE_URL}/projects/${params.projectId}/publish`, {
      method: "POST",
      credentials: "include",
    });

    const response = await fetch(`${API_BASE_URL}/projects/${params.projectId}`, { credentials: "include" });
    const json = await response.json();
    setProject(json.data ?? null);
  };

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{project.status}</p>
        <h1 className="mt-2 text-3xl font-semibold">{project.title}</h1>
        <p className="mt-3 text-zinc-700">{project.summary}</p>
        <button onClick={publish} className="mt-5 rounded-md bg-accent px-4 py-2 text-white">
          Publish
        </button>
      </section>
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Roles</h2>
          <Link href={`/projects/${params.projectId}/roles/new`} className="rounded-md border border-border px-3 py-2 text-sm">
            New role
          </Link>
        </div>
        <ul className="mt-4 space-y-3">
          {roles.map((role) => (
            <li key={role.id} className="rounded-lg bg-muted p-3">
              {role.title} ({role.status})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
