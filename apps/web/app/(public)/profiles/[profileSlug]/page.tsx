"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

export default function PublicProfilePage() {
  const params = useParams<{ profileSlug: string }>();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/search/discover?q=${params.profileSlug}`);
      if (!response.ok) {
        return;
      }
      setProfile({ slug: params.profileSlug });
    };

    void run();
  }, [params.profileSlug]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-semibold">{profile?.slug ?? "Profile"}</h1>
      <p className="mt-4 text-zinc-700">Public profile pages are enabled and discoverable by slug.</p>
    </div>
  );
}
