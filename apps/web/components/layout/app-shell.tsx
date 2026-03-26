"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/discover", label: "Discover" },
  { href: "/projects", label: "Projects" },
  { href: "/applications", label: "Applications" },
  { href: "/casting", label: "Casting" },
  { href: "/auditions", label: "Auditions" },
  { href: "/notifications", label: "Notifications" },
  { href: "/billing", label: "Billing" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("Member");

  useEffect(() => {
    const run = async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" });
      if (!response.ok) {
        return;
      }
      const json = await response.json();
      if (json?.data?.displayName) {
        setDisplayName(json.data.displayName);
      }
    };

    void run();
  }, []);

  const handleSignOut = async () => {
    await fetch(`${API_BASE_URL}/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard" className="text-xl font-semibold tracking-tight">
            Emerging Talent
          </Link>
          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-sm transition ${
                    active ? "bg-accent text-white" : "text-zinc-700 hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">{displayName}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
