import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** UTC timestamp in iCalendar basic format, e.g. 20260626T200000Z. */
function ics(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Download an .ics file for an event so it can be added to any calendar app. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { host: { select: { displayName: true } } },
  });
  if (!event) return new Response("Not found", { status: 404 });

  const start = event.startAt;
  const end = event.endAt ?? new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const location = [event.locationName, event.city ? `${event.city}, CT` : null, event.address]
    .filter(Boolean)
    .join(", ");
  const description = [event.description, `Hosted by ${event.host.displayName}`, `${BASE}/event/${event.id}`]
    .filter(Boolean)
    .join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BandConnect//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.id}@bandconnect`,
    `DTSTAMP:${ics(new Date())}`,
    `DTSTART:${ics(start)}`,
    `DTEND:${ics(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(description)}`,
    location ? `LOCATION:${esc(location)}` : "",
    `URL:${BASE}/event/${event.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}.ics"`,
    },
  });
}
