"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
      });

      if (!response.ok) {
        setError("Unable to queue reset email right now. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setError("Unable to queue reset email right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-3xl font-semibold">Reset Password</h1>
        <label className="mt-5 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-md bg-accent px-4 py-2 text-white disabled:opacity-70">
          {loading ? "Sending..." : "Send reset link"}
        </button>
        {done ? <p className="mt-3 text-sm text-success">If your account exists, a reset email has been queued.</p> : null}
      </form>
    </div>
  );
}
