import { Building2, Drum, Guitar, Ticket, type LucideProps } from "lucide-react";

// Profile type → lucide icon. Takes the type *string* so it's safe to render
// from both server and client components (no component props cross the boundary).
const ICONS = { FAN: Ticket, VENUE: Building2, MUSICIAN: Guitar, BAND: Drum } as const;

export function ProfileTypeIcon({ type, ...props }: { type: string } & LucideProps) {
  const Icon = ICONS[type as keyof typeof ICONS] ?? Ticket;
  return <Icon aria-hidden="true" {...props} />;
}
