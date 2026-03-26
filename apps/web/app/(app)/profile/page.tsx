"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/profiles/me`, { credentials: "include" });
      const json = await response.json();
      setProfile(json.data ?? {});
    };
    void run();
  }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      slug: String(form.get("slug") ?? ""),
      headline: String(form.get("headline") ?? ""),
      bio: String(form.get("bio") ?? ""),
      locationCity: String(form.get("locationCity") ?? ""),
      locationRegion: String(form.get("locationRegion") ?? ""),
      disciplines: String(form.get("disciplines") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      skills: String(form.get("skills") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    const response = await fetch(`${API_BASE_URL}/profiles/me`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("Unable to save profile.");
      return;
    }

    setMessage("Profile updated.");
  };

  return (
    <form onSubmit={save} className="grid max-w-3xl gap-4 rounded-2xl border border-border bg-card p-6">
      <h1 className="text-3xl font-semibold">Profile</h1>
      <input name="slug" defaultValue={profile?.slug ?? ""} placeholder="Profile slug" className="rounded-md border border-border px-3 py-2" />
      <input name="headline" defaultValue={profile?.headline ?? ""} placeholder="Headline" className="rounded-md border border-border px-3 py-2" />
      <textarea name="bio" defaultValue={profile?.bio ?? ""} placeholder="Bio" className="min-h-32 rounded-md border border-border px-3 py-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="locationCity" defaultValue={profile?.locationCity ?? ""} placeholder="City" className="rounded-md border border-border px-3 py-2" />
        <input name="locationRegion" defaultValue={profile?.locationRegion ?? ""} placeholder="Region" className="rounded-md border border-border px-3 py-2" />
      </div>
      <input name="disciplines" placeholder="Disciplines (comma-separated)" className="rounded-md border border-border px-3 py-2" />
      <input name="skills" placeholder="Skills (comma-separated)" className="rounded-md border border-border px-3 py-2" />
      <button className="w-fit rounded-md bg-accent px-4 py-2 text-white">Save profile</button>
      {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
    </form>
  );
}
