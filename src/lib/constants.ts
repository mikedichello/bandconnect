// Shared domain constants used across forms, discovery, and rendering.

export type ProfileType = "FAN" | "VENUE" | "MUSICIAN" | "BAND";

export const PROFILE_TYPES: {
  id: ProfileType;
  label: string;
  emoji: string;
  blurb: string;
}[] = [
  { id: "FAN", label: "Fan", emoji: "🎟️", blurb: "Follow artists & venues, RSVP to shows, and keep your own gig calendar." },
  { id: "VENUE", label: "Venue / Host", emoji: "🏛️", blurb: "Promote your room, post events, and find acts to book." },
  { id: "MUSICIAN", label: "Musician", emoji: "🎸", blurb: "Showcase yourself, list availability & rates, and find gigs or bandmates." },
  { id: "BAND", label: "Band", emoji: "🥁", blurb: "Promote your band, post shows, find venues, and recruit musicians." },
];

export function profileTypeMeta(type: string) {
  return PROFILE_TYPES.find((t) => t.id === type) ?? PROFILE_TYPES[0];
}

export function isArtist(type: string): boolean {
  return type === "MUSICIAN" || type === "BAND";
}

export const GENRES = [
  "Rock", "Indie", "Punk", "Metal", "Hardcore", "Pop", "Hip-Hop", "R&B",
  "Soul", "Funk", "Jazz", "Blues", "Folk", "Country", "Americana",
  "Bluegrass", "Reggae", "Ska", "Electronic", "House", "Techno", "Ambient",
  "Experimental", "Post-Rock", "Shoegaze", "Emo", "Acoustic", "Cover Band",
  "Singer-Songwriter", "Classical", "World",
] as const;

export const INSTRUMENTS = [
  "Vocals", "Guitar", "Bass", "Drums", "Keys/Piano", "Synth", "Violin",
  "Cello", "Saxophone", "Trumpet", "Trombone", "Flute", "Banjo", "Mandolin",
  "Harmonica", "Percussion", "DJ/Turntables", "Production",
] as const;

export const MUSICIAN_STATUS = [
  { key: "isSolo", label: "Performing solo" },
  { key: "wantsStartBand", label: "Looking to start a band" },
  { key: "wantsJoinBand", label: "Looking to join a band" },
  { key: "openForFillIns", label: "Open for fill-in gigs" },
] as const;

export const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100];
