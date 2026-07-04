import { Image as ImageIcon } from "lucide-react";
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
          <figure key={m.id} className="overflow-hidden rounded-xl border border-line">
            <div className="aspect-video w-full bg-input">
              <ImageWithFallback
                src={m.url}
                alt={m.caption ?? "Media"}
                className="h-full w-full object-cover"
                fallback={<div className="grid h-full w-full place-items-center"><ImageIcon className="h-6 w-6 text-subtle" aria-hidden="true" /></div>}
              />
            </div>
            {m.caption && <figcaption className="px-3 py-2 text-xs text-subtle">{m.caption}</figcaption>}
          </figure>
        ),
      )}
    </div>
  );
}

function VideoTile({ url, caption }: { url: string; caption: string | null }) {
  const embed = toEmbedUrl(url);
  return (
    <figure className="overflow-hidden rounded-xl border border-line">
      <div className="aspect-video w-full bg-black">
        {embed.kind === "iframe" ? (
          <iframe src={embed.src} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={caption ?? "Video"} />
        ) : (
          <video controls className="h-full w-full">
            <source src={embed.src} />
          </video>
        )}
      </div>
      {caption && <figcaption className="px-3 py-2 text-xs text-subtle">{caption}</figcaption>}
    </figure>
  );
}
