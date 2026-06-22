import { GENRES } from "@/lib/utils";

export function FilterBar({
  basePath,
  q,
  genre,
  availableOnly,
  availableLabel,
}: {
  basePath: string;
  q: string;
  genre: string;
  availableOnly: boolean;
  availableLabel: string;
}) {
  return (
    <form action={basePath} method="get" className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="label">Search</label>
        <input name="q" defaultValue={q} className="input" placeholder="Name, city, or keyword" />
      </div>
      <div className="sm:w-56">
        <label className="label">Genre</label>
        <select name="genre" defaultValue={genre} className="input">
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 pb-2.5 text-sm text-zinc-300">
        <input type="checkbox" name="available" value="1" defaultChecked={availableOnly} className="h-4 w-4 accent-brand-500" />
        {availableLabel}
      </label>
      <button type="submit" className="btn-primary">Filter</button>
    </form>
  );
}

export function DiscoverEmptyState() {
  return (
    <div className="card mt-6 p-12 text-center">
      <div className="text-3xl">🔍</div>
      <h2 className="mt-3 text-lg font-semibold">No matches yet</h2>
      <p className="mt-1 text-sm text-zinc-400">Try clearing filters or check back soon.</p>
    </div>
  );
}
