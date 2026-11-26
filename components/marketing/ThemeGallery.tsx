"use client";

import Link from "next/link";
import { useState } from "react";
import { FILTERS } from "@/lib/marketing";
import { PhoneMockup } from "./PhoneMockup";

type Item = { slug: string; name: string; category: string[] };

// Galeri tema + filter (PRD bagian 7 no. 2). Ketuk = halaman tema (preview & detail).
export function ThemeGallery({ themes }: { themes: Item[] }) {
  const [filter, setFilter] = useState<string>("semua");
  const shown = themes.filter((t) => filter === "semua" || t.category.includes(filter));
  return (
    <div className="space-y-6">
      <div role="group" aria-label="Filter tema" className="flex flex-wrap justify-center gap-2">
        {FILTERS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}
            className="min-h-10 rounded-full border border-rose px-4 text-sm text-rose aria-pressed:bg-rose aria-pressed:text-white">
            {label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {shown.map((t) => (
          <li key={t.slug}>
            <Link href={`/tema/${t.slug}`} className="group block text-center">
              <PhoneMockup src={`/screens/${t.slug}.webp`} alt={`Tema ${t.name}`} sizes="(min-width: 1024px) 180px, 45vw"
                className="transition-transform group-hover:-translate-y-1 motion-reduce:transition-none" />
              <span className="mt-3 block font-semibold">{t.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
