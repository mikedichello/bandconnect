import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUserId()) redirect("/dashboard");
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="aurora absolute inset-0 -z-10 opacity-60" />
      <Suspense fallback={<div className="h-80 w-full max-w-md animate-pulse rounded-2xl bg-white/5" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
