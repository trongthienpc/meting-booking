import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user } = await validateRequest();
  if (!user) return redirect("/authentication");
  else return redirect("/dashboard");
}
