"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

type DiscoverRow = {
  role: {
    id: string;
    title: string;
    compensationText: string | null;
    compensationType: string;
    deadlineAt: string | null;
  };
  project: {
    id: string;
    title: string;
    summary: string;
    visibilityScope: string;
    locationText: string | null;
  };
};

export default function DiscoverPage() {
  const [rows, setRows] = useState<DiscoverRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/projects/discover`, { credentials: "include" });
      const json = await response.json();
      setRows(json.data ?? []);
    };
    void run();
  }, []);

  const filtered = useMemo(() => {
    if (!query) {
      return rows;
    }

    return rows.filter((row) => {
      const haystack = `${row.role.title} ${row.project.title} ${row.project.summary}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [query, rows]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="sticky top-[72px] z-10 mb-6 rounded-2xl border border-border bg-card p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by role, project, or keyword"
          className="w-full rounded-md border border-border px-3 py-2"
        />
      </div>
      <div className="grid gap-4">
        {filtered.map((row) => (
          <article key={row.role.id} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-muted px-2 py-1">{row.project.visibilityScope}</span>
              <span>{row.project.locationText ?? "Location TBD"}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{row.role.title}</h2>
            <p className="mt-1 text-sm text-zinc-700">{row.project.title}</p>
            <p className="mt-3 text-zinc-700">{row.project.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-muted px-3 py-1">
                {row.role.compensationText ?? row.role.compensationType}
              </span>
              <Link href={`/roles/${row.role.id}`} className="rounded-full bg-accent px-4 py-2 text-white">
                View role
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
