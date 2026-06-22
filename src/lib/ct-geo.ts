// Connecticut geography helpers.
// ---------------------------------------------------------------------------
// We avoid an external geocoding API (and its network/egress + cost) by
// shipping a built-in table of CT towns with representative coordinates, plus
// a curated ZIP -> town map. Radius filtering uses the haversine formula.

export interface CtTown {
  name: string;
  county: string;
  lat: number;
  lng: number;
  zips: string[];
}

// A broad set of Connecticut towns/cities with approximate town-center coords.
export const CT_TOWNS: CtTown[] = [
  { name: "Hartford", county: "Hartford", lat: 41.7637, lng: -72.6851, zips: ["06101", "06103", "06105", "06106", "06112", "06114", "06120"] },
  { name: "New Haven", county: "New Haven", lat: 41.3083, lng: -72.9279, zips: ["06510", "06511", "06513", "06515", "06519"] },
  { name: "Stamford", county: "Fairfield", lat: 41.0534, lng: -73.5387, zips: ["06901", "06902", "06905", "06906", "06907"] },
  { name: "Bridgeport", county: "Fairfield", lat: 41.1792, lng: -73.1894, zips: ["06604", "06605", "06606", "06607", "06608"] },
  { name: "Waterbury", county: "New Haven", lat: 41.5582, lng: -73.0515, zips: ["06702", "06704", "06705", "06706", "06708"] },
  { name: "Norwalk", county: "Fairfield", lat: 41.1177, lng: -73.4082, zips: ["06850", "06851", "06853", "06854", "06855"] },
  { name: "Danbury", county: "Fairfield", lat: 41.3948, lng: -73.4540, zips: ["06810", "06811"] },
  { name: "New Britain", county: "Hartford", lat: 41.6612, lng: -72.7795, zips: ["06051", "06052", "06053"] },
  { name: "West Hartford", county: "Hartford", lat: 41.7620, lng: -72.7420, zips: ["06107", "06110", "06117", "06119"] },
  { name: "Greenwich", county: "Fairfield", lat: 41.0262, lng: -73.6282, zips: ["06830", "06831", "06870", "06878"] },
  { name: "Hamden", county: "New Haven", lat: 41.3959, lng: -72.8968, zips: ["06514", "06517", "06518"] },
  { name: "Meriden", county: "New Haven", lat: 41.5382, lng: -72.8070, zips: ["06450", "06451"] },
  { name: "Bristol", county: "Hartford", lat: 41.6718, lng: -72.9493, zips: ["06010"] },
  { name: "Manchester", county: "Hartford", lat: 41.7759, lng: -72.5215, zips: ["06040", "06042"] },
  { name: "Middletown", county: "Middlesex", lat: 41.5623, lng: -72.6506, zips: ["06457"] },
  { name: "Milford", county: "New Haven", lat: 41.2306, lng: -73.0640, zips: ["06460", "06461"] },
  { name: "Stratford", county: "Fairfield", lat: 41.1845, lng: -73.1332, zips: ["06614", "06615"] },
  { name: "East Hartford", county: "Hartford", lat: 41.7823, lng: -72.6120, zips: ["06108", "06118"] },
  { name: "New London", county: "New London", lat: 41.3557, lng: -72.0995, zips: ["06320"] },
  { name: "Norwich", county: "New London", lat: 41.5243, lng: -72.0759, zips: ["06360"] },
  { name: "Groton", county: "New London", lat: 41.3501, lng: -72.0784, zips: ["06340"] },
  { name: "Mystic", county: "New London", lat: 41.3543, lng: -71.9665, zips: ["06355"] },
  { name: "Torrington", county: "Litchfield", lat: 41.8007, lng: -73.1212, zips: ["06790"] },
  { name: "Willimantic", county: "Windham", lat: 41.7106, lng: -72.2079, zips: ["06226"] },
  { name: "Storrs", county: "Tolland", lat: 41.8084, lng: -72.2495, zips: ["06268", "06269"] },
  { name: "Fairfield", county: "Fairfield", lat: 41.1408, lng: -73.2613, zips: ["06824", "06825", "06890"] },
  { name: "Westport", county: "Fairfield", lat: 41.1415, lng: -73.3579, zips: ["06880"] },
  { name: "Wallingford", county: "New Haven", lat: 41.4570, lng: -72.8231, zips: ["06492"] },
  { name: "Enfield", county: "Hartford", lat: 41.9763, lng: -72.5917, zips: ["06082"] },
  { name: "Southington", county: "Hartford", lat: 41.5962, lng: -72.8782, zips: ["06489"] },
  { name: "Shelton", county: "Fairfield", lat: 41.3165, lng: -73.0932, zips: ["06484"] },
  { name: "Glastonbury", county: "Hartford", lat: 41.7123, lng: -72.6081, zips: ["06033"] },
  { name: "Cheshire", county: "New Haven", lat: 41.4990, lng: -72.9006, zips: ["06410"] },
  { name: "Branford", county: "New Haven", lat: 41.2795, lng: -72.8151, zips: ["06405"] },
  { name: "Old Saybrook", county: "Middlesex", lat: 41.2917, lng: -72.3759, zips: ["06475"] },
  { name: "Litchfield", county: "Litchfield", lat: 41.7470, lng: -73.1893, zips: ["06759"] },
];

export const CT_TOWN_NAMES = CT_TOWNS.map((t) => t.name).sort();

const ZIP_INDEX: Record<string, CtTown> = (() => {
  const idx: Record<string, CtTown> = {};
  for (const town of CT_TOWNS) for (const z of town.zips) idx[z] = town;
  return idx;
})();

/** Haversine distance in miles between two coordinates. */
export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8; // earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Resolve a free-text location filter (a CT town name or ZIP) to coordinates.
 * Returns null when it can't be matched.
 */
export function resolveCtLocation(
  query: string | null | undefined,
): { lat: number; lng: number; label: string } | null {
  if (!query) return null;
  const q = query.trim();
  if (!q) return null;

  // ZIP match (5 digits)
  const zipMatch = q.match(/\b(\d{5})\b/);
  if (zipMatch && ZIP_INDEX[zipMatch[1]]) {
    const t = ZIP_INDEX[zipMatch[1]];
    return { lat: t.lat, lng: t.lng, label: `${t.name} (${zipMatch[1]})` };
  }

  // Town name match (case-insensitive, allow "Town, CT")
  const namePart = q.replace(/,?\s*CT\b.*$/i, "").trim().toLowerCase();
  const town =
    CT_TOWNS.find((t) => t.name.toLowerCase() === namePart) ??
    CT_TOWNS.find((t) => t.name.toLowerCase().startsWith(namePart)) ??
    CT_TOWNS.find((t) => namePart.length >= 3 && t.name.toLowerCase().includes(namePart));
  if (town) return { lat: town.lat, lng: town.lng, label: town.name };

  return null;
}

/** Best-effort coordinates for a town name (for seeding / event creation). */
export function coordsForTown(name: string | null | undefined): { lat: number; lng: number } | null {
  if (!name) return null;
  const t = CT_TOWNS.find((x) => x.name.toLowerCase() === name.trim().toLowerCase());
  return t ? { lat: t.lat, lng: t.lng } : null;
}
