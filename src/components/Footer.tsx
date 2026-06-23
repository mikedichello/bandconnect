import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-app">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <span className="font-display text-base font-bold text-fg">
              Band<span className="text-brand-600 dark:text-brand-400">Connect</span>
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-subtle">
            The booking network for the local music scene. Find the room, find
            the band, fill the calendar.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-fg">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-subtle">
            <li><Link href="/" className="hover:text-fg">Event calendar</Link></li>
            <li><Link href="/venues" className="hover:text-fg">Venues & hosts</Link></li>
            <li><Link href="/artists" className="hover:text-fg">Musicians & bands</Link></li>
            <li><Link href="/pricing" className="hover:text-fg">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-fg">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-subtle">
            <li><Link href="/signup" className="hover:text-fg">Sign up</Link></li>
            <li><Link href="/login" className="hover:text-fg">Log in</Link></li>
            <li><Link href="/dashboard" className="hover:text-fg">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} BandConnect. Built for the local scene.</p>
          <p>Made with Next.js, Prisma & Stripe.</p>
        </div>
      </div>
    </footer>
  );
}
