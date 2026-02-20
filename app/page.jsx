// app/page.jsx
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

// Server Component — runs on the server, no useEffect needed
export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = token ? await verifyToken(token) : null;

  if (decoded) {
    // User is logged in → go to dashboard
    redirect("/dashboard");
  } else {
    // User is not logged in → go to login
    redirect("/login");
  }
}
