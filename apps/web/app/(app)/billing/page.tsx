"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api/client";

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const [plansResponse, userResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/billing/plans`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/users/me`, { credentials: "include" }),
      ]);

      const [plansJson, userJson] = await Promise.all([plansResponse.json(), userResponse.json()]);
      setPlans(plansJson.data ?? []);
      setUserId(userJson.data?.id ?? null);
    };
    void run();
  }, []);

  const checkout = async (planId: string) => {
    if (!userId) {
      setMessage("Unable to identify user for checkout.");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/billing/checkout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerType: "user", ownerId: userId, planId }),
    });

    if (!response.ok) {
      setMessage("Checkout failed.");
      return;
    }

    setMessage("Plan activated locally. Stripe webhook endpoint is scaffolded for production sync.");
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Billing</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">Code: {plan.code}</p>
            <button onClick={() => checkout(plan.id)} className="mt-4 rounded-md bg-accent px-4 py-2 text-white">
              Choose plan
            </button>
          </article>
        ))}
      </div>
      {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
    </div>
  );
}
