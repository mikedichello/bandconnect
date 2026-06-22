import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="aurora absolute inset-0 -z-10 opacity-60" />
      <Suspense fallback={<div className="h-72 w-full max-w-md animate-pulse rounded-2xl bg-white/5" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
