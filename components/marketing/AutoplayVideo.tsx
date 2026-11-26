"use client";

import { useEffect, useRef } from "react";

// Putar hanya saat terlihat, tanpa suara (PRD bagian 7 no. 3). Hormati prefers-reduced-motion.
export function AutoplayVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.5 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label}
      className="aspect-[390/844] size-full object-cover object-top" />
  );
}
