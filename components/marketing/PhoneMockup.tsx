import Image from "next/image";

// Bingkai HP CSS (PRD bagian 7). Isi = tangkapan layar asli tema (public/screens, dibuat scripts/screenshots.ts).
export function PhoneMockup({ src, alt, className = "", sizes = "240px", preload = false, crop = true }: {
  src: string; alt: string; className?: string; sizes?: string; preload?: boolean; crop?: boolean;
}) {
  return (
    <div className={`rounded-[2.2rem] bg-ink p-2 shadow-xl shadow-ink/20 ${className}`}>
      <div className={`relative overflow-hidden rounded-[1.7rem] bg-bg ${crop ? "aspect-[390/844]" : ""}`}>
        <span aria-hidden="true" className="absolute top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-ink" />
        <Image src={src} alt={alt} width={540} height={1169} sizes={sizes} preload={preload}
          className={crop ? "size-full object-cover object-top" : "h-auto w-full"} />
      </div>
    </div>
  );
}
