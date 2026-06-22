import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="aurora absolute inset-0 -z-10 opacity-60" />
      <Suspense fallback={<div className="h-72 w-full max-w-md animate-pulse rounded-2xl bg-white/5" />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
