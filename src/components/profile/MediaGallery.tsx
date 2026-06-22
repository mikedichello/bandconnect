import { ImageWithFallback } from "@/components/ImageWithFallback";
import { toEmbedUrl } from "@/lib/utils";

export interface MediaEntry {
  id: string;
  kind: string;
  url: string;
  caption: string | null;
}

export function MediaGallery({ items }: { items: MediaEntry[] }) {
  if (items.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((m) =>
        m.kind === "VIDEO" ? (
          <VideoTile key={m.id} url={m.url} caption={m.caption} />
        ) : (
          <figure key={m.id} className="overflow-hidden rounded-xl border border-white/10">
            <div className="aspect-video w-full bg-black/30">
              <ImageWithFallback
                src={m.url}
                alt={m.caption ?? "Media"}
                className="h-full w-full object-cover"
                fallback={<div className="grid h-full w-full place-items-center text-2xl">🖼️</div>}
              />
            </div>
            {m.caption && <figcaption className="px-3 py-2 text-xs text-zinc-400">{m.caption}</figcaption>}
          </figure>
        ),
      )}
    </div>
  );
}

function VideoTile({ url, caption }: { url: string; caption: string | null }) {
  const embed = toEmbedUrl(url);
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10">
      <div className="aspect-video w-full bg-black">
        {embed.kind === "iframe" ? (
          <iframe src={embed.src} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={caption ?? "Video"} />
        ) : (
          <video controls className="h-full w-full">
            <source src={embed.src} />
          </video>
        )}
      </div>
      {caption && <figcaption className="px-3 py-2 text-xs text-zinc-400">{caption}</figcaption>}
    </figure>
  );
}
