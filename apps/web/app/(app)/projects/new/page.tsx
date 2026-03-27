"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function NewProjectPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/organizations/mine`, { credentials: "include" });
      const json = await response.json();
      setOrganizations(json.data ?? []);
    };
    void run();
  }, []);

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: String(form.get("organizationId") ?? ""),
        title: String(form.get("title") ?? ""),
        slug: String(form.get("slug") ?? ""),
        summary: String(form.get("summary") ?? ""),
        description: String(form.get("description") ?? ""),
        visibilityScope: String(form.get("visibilityScope") ?? "campus_only"),
        locationText: String(form.get("locationText") ?? ""),
        compensationSummary: String(form.get("compensationSummary") ?? ""),
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return;
    }

    router.push(`/projects/manage/${json.data.id}`);
  };

  return (
    <form onSubmit={create} className="grid max-w-4xl gap-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-3xl font-semibold">Create Project</h1>
      <select name="organizationId" required className="rounded-md border border-border px-3 py-2">
        <option value="">Select organization</option>
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
      <input name="title" placeholder="Project title" required className="rounded-md border border-border px-3 py-2" />
      <input name="slug" placeholder="project-slug" required className="rounded-md border border-border px-3 py-2" />
      <input name="summary" placeholder="Short summary" required className="rounded-md border border-border px-3 py-2" />
      <textarea name="description" placeholder="Project description" required className="min-h-32 rounded-md border border-border px-3 py-2" />
      <select name="visibilityScope" className="rounded-md border border-border px-3 py-2">
        <option value="campus_only">Campus only</option>
        <option value="selected_institutions">Selected institutions</option>
        <option value="public_network">Public emerging network</option>
      </select>
      <input name="locationText" placeholder="Location" className="rounded-md border border-border px-3 py-2" />
      <input name="compensationSummary" placeholder="Compensation" className="rounded-md border border-border px-3 py-2" />
      <button className="w-fit rounded-md bg-accent px-4 py-2 text-white">Create project</button>
    </form>
  );
}
