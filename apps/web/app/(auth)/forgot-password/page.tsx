"use client";

import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDone(false);
    setError(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(formData.get("email") ?? "") }),
      });

      if (!response.ok) {
        setError("Unable to send reset request.");
        return;
      }

      setDone(true);
    } catch {
      setError("Backend is unavailable. Please start the API server and try again.");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border border-border bg-card p-8">
        <h1 className="text-3xl font-semibold">Reset Password</h1>
        <label className="mt-5 block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-md border border-border px-3 py-2" />
        <button className="mt-6 w-full rounded-md bg-accent px-4 py-2 text-white">Send reset link</button>
        {done ? <p className="mt-3 text-sm text-success">If your account exists, a reset email has been queued.</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </form>
    </div>
  );
}
