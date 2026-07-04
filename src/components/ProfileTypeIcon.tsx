import { Ticket, Landmark, Guitar, Drum, type LucideIcon } from "lucide-react";

// Maps the string `icon` key on PROFILE_TYPES (lib/constants) to a Lucide
// component. Shared by server and client components — the key stays a plain
// string so it can cross the server→client boundary.
const ICONS: Record<string, LucideIcon> = {
  ticket: Ticket,
  landmark: Landmark,
  guitar: Guitar,
  drum: Drum,
};

export function ProfileTypeIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICONS[icon] ?? Ticket;
  return <Icon className={className} aria-hidden="true" />;
}
