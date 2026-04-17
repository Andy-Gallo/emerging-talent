"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    const verify = async () => {
      setState("loading");

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        setState(response.ok ? "success" : "error");
      } catch {
        setState("error");
      }
    };

    void verify();
  }, [token]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl font-semibold">Verify Email</h1>
      {state === "loading" ? <p className="mt-4 text-zinc-700">Verifying your email...</p> : null}
      {state === "success" ? (
        <>
          <p className="mt-4 text-success">Your email is verified. You can continue to your account.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-zinc-700 underline-offset-4 hover:underline">
            Go to dashboard
          </Link>
        </>
      ) : null}
      {state === "error" ? (
        <>
          <p className="mt-4 text-destructive">
            This verification link is invalid or expired. Request a new verification email from your account settings.
          </p>
          <Link href="/sign-in" className="mt-4 inline-block text-zinc-700 underline-offset-4 hover:underline">
            Return to sign in
          </Link>
        </>
      ) : null}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-14">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
