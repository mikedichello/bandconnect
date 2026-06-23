import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="aurora absolute inset-0 -z-10 opacity-40" />
      <p className="font-display text-7xl font-bold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-md text-subtle">
        The event, profile, or page you&apos;re looking for may have moved or doesn&apos;t exist.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-ghost">Go to the calendar</Link>
        <Link href="/artists" className="btn-primary">Browse artists</Link>
      </div>
    </div>
  );
}
