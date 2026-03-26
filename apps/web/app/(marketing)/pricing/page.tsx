const plans = [
  {
    name: "Student Free",
    price: "$0",
    points: ["Verified student profile", "Browse and apply to eligible roles", "Notifications and audition requests"],
  },
  {
    name: "Creator",
    price: "$29/mo",
    points: ["Public project posting", "Advanced review workflow", "Collaborator seats and analytics"],
  },
  {
    name: "Campus",
    price: "Custom",
    points: ["Branded school hub", "Moderation tools", "Admin reporting"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-semibold">Pricing</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-2 text-3xl">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              {plan.points.map((point) => (
                <li key={point}>- {point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
