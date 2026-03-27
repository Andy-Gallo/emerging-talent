"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/projects`, { credentials: "include" });
      const json = await response.json();
      setProjects(json.data ?? []);
    };
    void run();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Link href="/projects/new" className="rounded-md bg-accent px-4 py-2 text-sm text-white">
          New Project
        </Link>
      </div>
      {projects.map((project) => (
        <article key={project.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{project.status}</p>
          <h2 className="mt-2 text-xl font-semibold">{project.title}</h2>
          <p className="mt-2 text-sm text-zinc-700">{project.summary}</p>
          <div className="mt-4 flex gap-2">
            <Link href={`/projects/manage/${project.id}`} className="rounded-md border border-border px-3 py-2 text-sm">
              Manage
            </Link>
            <Link href={`/projects/manage/${project.id}/roles/new`} className="rounded-md border border-border px-3 py-2 text-sm">
              Add role
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
