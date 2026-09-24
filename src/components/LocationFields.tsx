import { MapPin } from "lucide-react";
import { CT_TOWN_NAMES } from "@/lib/ct-geo";
import { RADIUS_OPTIONS } from "@/lib/constants";

/** "Near [town/ZIP] within [N] mi" inputs for plain GET filter forms. */
export function LocationFields({
  idPrefix,
  loc,
  radius,
  resolvedLabel,
}: {
  idPrefix: string;
  loc: string;
  radius: number;
  resolvedLabel: string | null;
}) {
  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-loc`} className="label">Near (CT town or ZIP)</label>
        <input
          id={`${idPrefix}-loc`}
          name="loc"
          defaultValue={loc}
          list={`${idPrefix}-towns`}
          className="input"
          placeholder="e.g. Hartford or 06103"
          autoComplete="address-level2"
        />
        <datalist id={`${idPrefix}-towns`}>
          {CT_TOWN_NAMES.map((t) => <option key={t} value={t} />)}
        </datalist>
        {loc && (
          <p role="status" className={resolvedLabel ? "mt-1 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300" : "mt-1 text-xs text-amber-700 dark:text-amber-300"}>
            {resolvedLabel ? <><MapPin className="h-3 w-3" aria-hidden="true" /> {resolvedLabel}</> : "Couldn't match that CT location."}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-radius`} className="label">Within</label>
        <select id={`${idPrefix}-radius`} name="radius" defaultValue={String(radius)} className="input">
          {RADIUS_OPTIONS.map((r) => <option key={r} value={r}>{r} miles</option>)}
        </select>
      </div>
    </>
  );
}
