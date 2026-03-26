"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

type Institution = { id: string; name: string };

export default function SignUpPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/institutions?activeOnly=true`);
      const json = await response.json();
      setInstitutions(json.data ?? []);
    };

    void run();
  }, []);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      institutionId: String(formData.get("institutionId") ?? "") || undefined,
      graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setError("Unable to create account.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-3xl font-semibold">Create Account</h1>
        <p className="mt-2 text-sm text-zinc-600">Join the trusted emerging talent network.</p>
        <label className="mt-5 block text-sm font-medium">Display Name</label>
        <input name="displayName" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input name="password" type="password" minLength={8} required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Institution</label>
        <select name="institutionId" className="mt-2 w-full rounded-md border border-border px-3 py-2">
          <option value="">Select a school</option>
          {institutions.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm font-medium">Graduation Year</label>
        <input name="graduationYear" type="number" className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-md bg-accent px-4 py-2 text-white">
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <div className="mt-4 text-sm">
          <Link href="/sign-in" className="underline-offset-4 hover:underline">
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
}
