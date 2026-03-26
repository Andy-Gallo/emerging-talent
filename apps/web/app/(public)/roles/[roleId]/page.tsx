"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function RoleDetailPage() {
  const params = useParams<{ roleId: string }>();
  const router = useRouter();
  const [role, setRole] = useState<any>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/roles/${params.roleId}`, { credentials: "include" });
      const json = await response.json();
      setRole(json.data ?? null);
    };
    void run();
  }, [params.roleId]);

  const apply = async () => {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: params.roleId, note, submit: true }),
    });

    if (response.status === 401) {
      router.push(`/sign-in?next=/roles/${params.roleId}`);
      return;
    }

    if (!response.ok) {
      setMessage("Unable to submit application.");
      return;
    }

    setMessage("Application submitted.");
  };

  if (!role) {
    return <div className="mx-auto max-w-3xl px-6 py-14">Role not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-semibold">{role.title}</h1>
      <p className="mt-4 text-zinc-700">{role.description ?? "No description yet."}</p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <label className="text-sm font-medium">Application Note</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-border px-3 py-2"
          placeholder="Tell the team why this role fits you"
        />
        <button onClick={apply} className="mt-4 rounded-md bg-accent px-4 py-2 text-white">
          Submit Application
        </button>
        {message ? <p className="mt-3 text-sm text-zinc-700">{message}</p> : null}
      </div>
    </div>
  );
}
