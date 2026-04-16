"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Invalid credentials.");
        return;
      }

      router.push(nextPath);
    } catch {
      setError("Backend is unavailable. Please start the API server and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-3xl font-semibold">Sign In</h1>
        <p className="mt-2 text-sm text-zinc-600">Continue to your casting dashboard.</p>
        <label className="mt-6 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        <label className="mt-4 block text-sm font-medium">Password</label>
        <input name="password" type="password" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-md bg-accent px-4 py-2 text-white">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-zinc-600 underline-offset-4 hover:underline">
            Forgot password
          </Link>
          <Link href="/sign-up" className="text-zinc-600 underline-offset-4 hover:underline">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
