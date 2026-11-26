"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Nama tamu dibaca di klien supaya semua tamu berbagi satu halaman cache (PRD bagian 8).
// Dirender sebagai teks React (ter-escape), maks. 60 karakter (PRD F5).
export function GuestName() {
  const to = useSearchParams().get("to")?.trim().slice(0, 60);
  return <p className="mt-1 text-lg font-semibold">{to || "Tamu Undangan"}</p>;
}

const UNITS = [
  ["Hari", 86_400_000],
  ["Jam", 3_600_000],
  ["Menit", 60_000],
  ["Detik", 1_000],
] as const;

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = now === null ? null : Math.max(0, Date.parse(target) - now);
  return (
    <div className="flex justify-center gap-3" role="timer" aria-label="Hitung mundur acara">
      {UNITS.map(([label, ms], i) => {
        // Sisa setelah satuan yang lebih besar: modulo satuan sebelumnya.
        const v = left === null ? null : Math.floor((i ? left % UNITS[i - 1][1] : left) / ms);
        return (
          <div key={label} className="w-16 rounded-xl bg-(--surface) py-3 shadow-sm">
            <div className="text-2xl tabular-nums">{v ?? "–"}</div>
            <div className="text-xs text-(--muted)">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function CopyButton({ text, label = "Salin nomor" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="min-h-11 rounded-full border border-current px-5 text-sm"
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        })
      }
    >
      {done ? "Tersalin" : label}
    </button>
  );
}
