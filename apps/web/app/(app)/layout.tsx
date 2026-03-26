import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("etp_session")?.value;

  if (!token) {
    redirect("/sign-in");
  }

  return <AppShell>{children}</AppShell>;
}
