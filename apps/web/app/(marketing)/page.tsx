import Link from "next/link";

const trustPillars = [
  "Verified student communities",
  "School-scoped and public discovery",
  "Structured casting and review workflows",
];

export default function MarketingHomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="grid gap-8 rounded-3xl border border-border bg-card p-10 md:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Emerging Talent Platform</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-zinc-900">
            Trusted casting and collaboration for emerging talent.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-700">
            Built for verified student communities first, then scaled for the broader emerging network.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/sign-up" className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
              Join as Talent
            </Link>
            <Link href="/discover" className="rounded-full border border-border px-5 py-3 text-sm font-medium">
              Browse Roles
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-muted p-6">
          <h2 className="text-xl font-semibold">Trust Layer</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-700">
            {trustPillars.map((item) => (
              <li key={item} className="rounded-xl bg-card p-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
