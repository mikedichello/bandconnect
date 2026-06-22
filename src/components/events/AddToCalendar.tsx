import { CalendarPlus } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function gcal(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Two add-to-calendar links: an .ics download and a Google Calendar template. */
export function AddToCalendar({
  event,
}: {
  event: {
    id: string;
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date | null;
    locationName: string | null;
    city: string | null;
    address: string | null;
  };
}) {
  const end = event.endAt ?? new Date(event.startAt.getTime() + 2 * 60 * 60 * 1000);
  const location = [event.locationName, event.city ? `${event.city}, CT` : null, event.address]
    .filter(Boolean)
    .join(", ");
  const details = [event.description ?? "", `${BASE}/event/${event.id}`].filter(Boolean).join("\n\n");

  const googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${gcal(event.startAt)}/${gcal(end)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`;

  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <a href={googleUrl} target="_blank" rel="noreferrer" className="btn-ghost w-full text-sm">
          Google Calendar
        </a>
        <a href={`/api/events/${event.id}/ics`} className="btn-ghost w-full text-sm">
          Apple / Outlook (.ics)
        </a>
      </div>
    </div>
  );
}
