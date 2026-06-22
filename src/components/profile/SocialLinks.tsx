function normalizeInstagram(value: string): string {
  if (value.startsWith("http")) return value;
  return `https://instagram.com/${value.replace(/^@/, "")}`;
}

export function SocialLinks({
  websiteUrl,
  instagram,
  spotify,
  bandcamp,
  youtube,
}: {
  websiteUrl?: string | null;
  instagram?: string | null;
  spotify?: string | null;
  bandcamp?: string | null;
  youtube?: string | null;
}) {
  const links = [
    websiteUrl && { label: "Website", href: websiteUrl, icon: "🌐" },
    instagram && { label: "Instagram", href: normalizeInstagram(instagram), icon: "📷" },
    spotify && { label: "Spotify", href: spotify, icon: "🎧" },
    bandcamp && { label: "Bandcamp", href: bandcamp, icon: "💿" },
    youtube && { label: "YouTube", href: youtube, icon: "▶️" },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="badge hover:border-white/30 hover:text-white"
        >
          <span>{l.icon}</span> {l.label}
        </a>
      ))}
    </div>
  );
}
