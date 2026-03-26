"use client";

import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function NewRolePage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: params.projectId,
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        status: String(form.get("status") ?? "draft"),
        compensationType: String(form.get("compensationType") ?? "unpaid"),
        compensationText: String(form.get("compensationText") ?? ""),
      }),
    });

    if (response.ok) {
      router.push(`/projects/${params.projectId}`);
    }
  };

  return (
    <form onSubmit={create} className="grid max-w-3xl gap-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-3xl font-semibold">Create Role</h1>
      <input name="title" placeholder="Role title" required className="rounded-md border border-border px-3 py-2" />
      <textarea name="description" placeholder="Role description" className="min-h-28 rounded-md border border-border px-3 py-2" />
      <select name="status" className="rounded-md border border-border px-3 py-2">
        <option value="draft">Draft</option>
        <option value="open">Open</option>
      </select>
      <select name="compensationType" className="rounded-md border border-border px-3 py-2">
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
      </select>
      <input name="compensationText" placeholder="Compensation details" className="rounded-md border border-border px-3 py-2" />
      <button className="w-fit rounded-md bg-accent px-4 py-2 text-white">Create role</button>
    </form>
  );
}
