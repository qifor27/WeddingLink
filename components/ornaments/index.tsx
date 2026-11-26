import type { Ornament as Name } from "@/lib/theme";

// Ornamen SVG orisinal WeddingLink (digambar dari nol, tanpa aset pihak ketiga).
// Warna ikut currentColor, kecuali marawa yang memakai warna adat (hitam, merah, kuning).

const songket = Array.from({ length: 10 }, (_, i) => i * 24);
const leaves = [20, 40, 60, 80, 100];

const svgs: Record<Name, { viewBox: string; body: React.ReactNode }> = {
  divider: {
    viewBox: "0 0 200 20",
    body: (
      <>
        <path d="M0 10h84M116 10h84M100 3l7 7-7 7-7-7z" fill="none" stroke="currentColor" />
        <circle cx="100" cy="10" r="2" fill="currentColor" />
      </>
    ),
  },
  // Pucuk rebung: segitiga berulang dengan belah ketupat di dalamnya.
  "songket-band": {
    viewBox: "0 0 240 26",
    body: (
      <g stroke="currentColor" fill="none">
        <path d="M0 1h240M0 25h240" />
        {songket.map((x) => (
          <g key={x}>
            <path d={`M${x} 22L${x + 12} 4L${x + 24} 22`} />
            <path d={`M${x + 12} 11l4 4-4 4-4-4z`} fill="currentColor" />
          </g>
        ))}
      </g>
    ),
  },
  marawa: {
    viewBox: "0 0 60 120",
    body: (
      <>
        <path d="M2 6h56" stroke="#6b5a45" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 8h16v100l-8-8-8 8z" fill="#2b2b2b" />
        <path d="M22 8h16v100l-8-8-8 8z" fill="#b83a32" />
        <path d="M40 8h16v100l-8-8-8 8z" fill="#e0b13e" />
      </>
    ),
  },
  // Siluet rumah gadang dengan empat gonjong.
  "rumah-gadang": {
    viewBox: "0 0 200 120",
    body: (
      <>
        <path
          d="M8 18Q30 58 58 62Q74 50 84 30Q92 52 100 56Q108 52 116 30Q126 50 142 62Q170 58 192 18Q176 52 160 70H40Q24 52 8 18Z"
          fill="currentColor"
          opacity=".85"
        />
        <path d="M44 70h112v36H44zM36 112h128M60 82h14v14H60zM93 82h14v24H93zM126 82h14v14h-14z" fill="none" stroke="currentColor" />
      </>
    ),
  },
  // Awan berlapis (terinspirasi mega mendung), digambar ulang sederhana.
  "mega-mendung": {
    viewBox: "0 0 200 80",
    body: (
      <g fill="none" stroke="currentColor">
        {[1, 0.75, 0.5].map((s) => (
          <path
            key={s}
            transform={`translate(100 45) scale(${s}) translate(-100 -45)`}
            d="M20 60Q20 35 45 38Q55 15 85 25Q105 8 130 25Q160 18 165 42Q190 45 182 62Z"
          />
        ))}
      </g>
    ),
  },
  butterfly: {
    viewBox: "0 0 100 80",
    body: (
      <g fill="currentColor">
        {[false, true].map((mirror) => (
          <g key={String(mirror)} transform={mirror ? "matrix(-1 0 0 1 100 0)" : undefined} opacity=".8">
            <path d="M50 40C30 0 0 10 10 35C15 50 35 50 50 40Z" />
            <path d="M50 42C35 55 20 75 35 75C45 75 50 60 50 42Z" />
          </g>
        ))}
        <path d="M50 26v36M50 26q-6-12-12-14M50 26q6-12 12-14" stroke="currentColor" fill="none" strokeWidth="1.5" />
      </g>
    ),
  },
  sprig: {
    viewBox: "0 0 120 40",
    body: (
      <g fill="currentColor">
        <path d="M5 30Q60 10 115 20" stroke="currentColor" fill="none" />
        {leaves.map((x, i) => (
          <ellipse key={x} cx={x} cy={i % 2 ? 26 : 12} rx="8" ry="3.5" transform={`rotate(${i % 2 ? 25 : -25} ${x} ${i % 2 ? 26 : 12})`} opacity=".75" />
        ))}
      </g>
    ),
  },
};

export function Ornament({ name, className }: { name: Name; className?: string }) {
  const { viewBox, body } = svgs[name];
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}
