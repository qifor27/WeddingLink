import Image from "next/image";

// Bingkai lengkung bergaris emas untuk tangkapan layar asli tema (public/screens).
export function Arch({ src, alt, sizes, className = "", aspect = "aspect-[3/4]", preload = false }: {
  src: string; alt: string; sizes: string; className?: string; aspect?: string; preload?: boolean;
}) {
  return (
    <div className={`rounded-t-full border border-gold/60 p-1.5 md:p-2 ${className}`}>
      <div className={`relative overflow-hidden rounded-t-full bg-cream ${aspect}`}>
        <Image src={src} alt={alt} fill sizes={sizes} preload={preload} className="object-cover" />
      </div>
    </div>
  );
}
