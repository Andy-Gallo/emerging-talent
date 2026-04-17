"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Missing reset token. Please request a new reset email.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        setError("This reset link is invalid or expired. Request a new one.");
        return;
      }

      setDone(true);
      window.setTimeout(() => router.push("/sign-in"), 1200);
    } catch {
      setError("Unable to reset password right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-3xl font-semibold">Set New Password</h1>
        <p className="mt-2 text-sm text-zinc-600">Use at least 8 characters for your new password.</p>
        <label className="mt-5 block text-sm font-medium">New Password</label>
        <input
          name="password"
          type="password"
          minLength={8}
          required
          className="mt-2 w-full rounded-md border border-border px-3 py-2"
        />
        <label className="mt-4 block text-sm font-medium">Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          className="mt-2 w-full rounded-md border border-border px-3 py-2"
        />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {done ? <p className="mt-3 text-sm text-success">Password updated. Redirecting to sign in...</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-md bg-accent px-4 py-2 text-white disabled:opacity-70">
          {loading ? "Updating..." : "Update password"}
        </button>
        <div className="mt-4 text-sm">
          <Link href="/sign-in" className="text-zinc-600 underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
