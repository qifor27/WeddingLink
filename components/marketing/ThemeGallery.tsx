"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FILTERS } from "@/lib/marketing";

type Item = { slug: string; name: string; category: string[] };

// Galeri tema + filter (PRD bagian 7 no. 2), tata letak kolase. Ketuk = halaman tema (preview & detail).
export function ThemeGallery({ themes }: { themes: Item[] }) {
  const [filter, setFilter] = useState<string>("semua");
  const shown = themes.filter((t) => filter === "semua" || t.category.includes(filter));
  return (
    <div className="space-y-10">
      <div role="group" aria-label="Filter tema" className="flex flex-wrap justify-center gap-2">
        {FILTERS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}
            className="min-h-10 rounded-full border border-gold/50 px-5 text-sm transition-colors hover:border-gold aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white">
            {label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:pb-12">
        {shown.map((t) => (
          <li key={t.slug} className="md:nth-[3n+2]:translate-y-12">
            <Link href={`/tema/${t.slug}`} className="group block">
              <div className="overflow-hidden rounded-2xl bg-cream ring-1 ring-gold/25">
                <Image src={`/screens/${t.slug}.webp`} alt="" width={540} height={1169} sizes="(min-width: 768px) 340px, 45vw"
                  className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
              </div>
              <span className="mt-3 block text-xs tracking-wider text-gold-deep uppercase">{FILTERS.find(([v]) => t.category.includes(v))?.[1]}</span>
              <span className="block font-display text-lg md:text-xl">{t.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
