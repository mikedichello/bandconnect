import { AudioLines, Disc3, Guitar, Mic, Music, Piano, Radio, Zap, type LucideIcon } from "lucide-react";
import { parseTags } from "@/lib/utils";

// Generated cover art for events without a photo. Each genre family gets its own
// gradient + icon so a dense calendar doesn't read as a wall of identical tiles
// (the #1 visual gap vs. image-led listings like Eventbrite / DICE).
type Art = { from: string; to: string; icon: LucideIcon };

const FAMILIES: { match: RegExp; art: Art }[] = [
  { match: /punk|hardcore|metal|emo|rock|shoegaze|post-/i, art: { from: "#e11d48", to: "#4c0519", icon: Zap } },
  { match: /jazz|blues|soul|funk|r&b/i, art: { from: "#f59e0b", to: "#7c2d12", icon: Piano } },
  { match: /folk|americana|bluegrass|country|acoustic|singer/i, art: { from: "#10b981", to: "#134e4a", icon: Guitar } },
  { match: /electronic|house|techno|ambient|experimental/i, art: { from: "#06b6d4", to: "#312e81", icon: AudioLines } },
  { match: /hip-hop|pop|reggae|ska/i, art: { from: "#ec4899", to: "#581c87", icon: Mic } },
  { match: /cover|classical|world/i, art: { from: "#8b5cf6", to: "#1e1b4b", icon: Radio } },
];

const DEFAULTS: Art[] = [
  { from: "#7c4dff", to: "#1e1b4b", icon: Music },
  { from: "#a855f7", to: "#3b0764", icon: Disc3 },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function eventArt(genres: string | null, seed: string): Art {
  const first = parseTags(genres)[0] ?? "";
  return FAMILIES.find((f) => f.match.test(first))?.art ?? DEFAULTS[hash(seed) % DEFAULTS.length];
}

export function EventArt({ genres, seed, size = "md" }: { genres: string | null; seed: string; size?: "md" | "lg" }) {
  const { from, to, icon: Icon } = eventArt(genres, seed);
  // Offset the highlight per event so two same-genre cards still differ.
  const x = 15 + (hash(seed) % 70);
  return (
    <div
      className="relative grid h-full w-full place-items-center overflow-hidden"
      style={{ background: `radial-gradient(circle at ${x}% 0%, ${from} 0%, transparent 65%), linear-gradient(135deg, ${from}cc, ${to})` }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(115deg,transparent_0_14px,rgba(255,255,255,.25)_14px_15px)]" />
      <Icon className={size === "lg" ? "h-20 w-20 text-white/85" : "h-12 w-12 text-white/85"} strokeWidth={1.5} />
    </div>
  );
}
