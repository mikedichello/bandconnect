"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders an <img>, but swaps to a fallback node if the image is missing or
 * fails to load (broken URL, deleted asset, blocked host). Keeps public pages
 * looking intentional instead of showing a broken-image icon.
 *
 * The mount check covers the case where the image errors during initial HTML
 * parse — before React hydrates and can attach the onError handler.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
