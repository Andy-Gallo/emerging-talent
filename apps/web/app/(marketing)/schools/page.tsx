"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

type Institution = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<Institution[]>([]);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/institutions?activeOnly=true`);
      const json = await response.json();
      setSchools(json.data ?? []);
    };
    void run();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <h1 className="text-4xl font-semibold">Verified Schools</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {schools.map((school) => (
          <article key={school.id} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-medium">{school.name}</h2>
            <p className="text-sm text-zinc-600">
              {school.city ?? ""} {school.region ?? ""}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
