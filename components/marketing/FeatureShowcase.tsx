"use client";

import { useState } from "react";
import { Arch } from "./Arch";

type Feature = { img: string; title: string; text: string };

// Daftar fitur bernomor; fitur yang dipilih terbuka dan tangkapan layarnya tampil di bingkai lengkung.
export function FeatureShowcase({ features }: { features: Feature[] }) {
  const [active, setActive] = useState(0);
  const current = features[active];
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <ol className="order-2 md:order-1">
        {features.map((f, i) => (
          <li key={f.title} className="border-b border-gold/25 last:border-0">
            <button type="button" aria-expanded={i === active} onClick={() => setActive(i)}
              className="flex min-h-14 w-full items-center gap-4 py-3 text-left">
              <span className="w-6 shrink-0 text-xs text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden="true" className={`h-px bg-gold transition-all motion-reduce:transition-none ${i === active ? "w-10 md:w-16" : "w-0"}`} />
              <span className="font-display text-xl md:text-2xl">{f.title}</span>
            </button>
            {i === active && <p className="pb-5 pl-10 text-ink/75">{f.text}</p>}
          </li>
        ))}
      </ol>
      <Arch key={current.img} src={`/screens/${current.img}.webp`} alt={`Contoh fitur: ${current.title}`}
        sizes="(min-width: 768px) 380px, 75vw" className="order-1 mx-auto w-3/4 max-w-sm md:order-2" />
    </div>
  );
}
