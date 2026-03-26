"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function PublicProjectPage() {
  const params = useParams<{ projectSlug: string }>();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/search/discover?q=${params.projectSlug}`);
      const json = await response.json();
      const match = (json.data?.projects ?? [])[0];
      setProject(match ?? null);
    };
    void run();
  }, [params.projectSlug]);

  if (!project) {
    return <div className="mx-auto max-w-3xl px-6 py-14">Project not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-semibold">{project.title}</h1>
      <p className="mt-5 text-zinc-700">{project.summary}</p>
    </div>
  );
}
