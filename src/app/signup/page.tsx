import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUserId()) redirect("/dashboard");
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="aurora absolute inset-0 -z-10 opacity-60" />
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-2xl bg-elevated" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
