import { formatDate, formatTime } from "@/lib/utils";

export interface PublicShow {
  id: string;
  title: string;
  date: Date;
  city: string | null;
  venueName: string | null;
  bandName: string | null;
  ticketUrl: string | null;
}

export function ShowList({ shows, accent }: { shows: PublicShow[]; accent?: string }) {
  if (shows.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
        No upcoming shows announced yet — check back soon.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {shows.map((s) => (
        <li key={s.id} className="card flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-4">
            <div
              className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl text-center"
              style={{ backgroundColor: accent ? `${accent}26` : "rgba(124,77,255,0.15)" }}
            >
              <div className="text-xs font-semibold uppercase" style={{ color: accent ?? "#b7a6ff" }}>
                {s.date.toLocaleDateString("en-US", { month: "short" })}
              </div>
              <div className="font-display text-lg font-bold leading-none text-white">
                {s.date.getDate()}
              </div>
            </div>
            <div>
              <p className="font-semibold text-white">{s.title}</p>
              <p className="text-sm text-zinc-400">
                {formatDate(s.date)} · {formatTime(s.date)}
                {s.venueName ? ` · ${s.venueName}` : ""}
                {s.city ? ` · ${s.city}` : ""}
              </p>
            </div>
          </div>
          {s.ticketUrl && (
            <a
              href={s.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-outline px-4 py-1.5 text-xs"
            >
              Tickets ↗
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
