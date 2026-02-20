// app/dashboard/page.jsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = token ? await verifyToken(token) : null;

  // Double-check even though middleware handles this
  if (!decoded) {
    redirect("/login");
  }

  return <DashboardClient user={decoded} />;
}
