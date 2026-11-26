"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

const field = "w-full rounded-xl border border-(--muted)/40 bg-(--surface) px-4 py-3";

export function RsvpForm({ invitationId }: { invitationId: string }) {
  const params = useSearchParams();
  const [attendance, setAttendance] = useState("hadir");
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; msg?: string }>({ status: "idle" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState({ status: "sending" });
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        invitationId,
        code: params.get("k") || undefined,
        name: f.get("name"),
        attendance,
        pax: Number(f.get("pax") ?? 1),
        message: f.get("message") || undefined,
        token: f.get("cf-turnstile-response") ?? "",
      }),
    }).catch(() => null);
    if (res?.ok) return setState({ status: "done" });
    window.turnstile?.reset(); // token Turnstile sekali pakai
    setState({ status: "error", msg: (await res?.json().catch(() => null))?.error ?? "Koneksi gagal. Coba lagi." });
  }

  if (state.status === "done") {
    return <p className="rounded-2xl bg-(--surface) p-6">Terima kasih! Konfirmasi dan ucapan Anda sudah kami terima.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
      <label className="block">
        <span className="mb-1 block text-sm">Nama</span>
        <input name="name" required maxLength={60} defaultValue={params.get("to")?.slice(0, 60) ?? ""} className={field} />
      </label>
      <fieldset>
        <legend className="mb-1 text-sm">Kehadiran</legend>
        <div className="grid grid-cols-3 gap-2">
          {[["hadir", "Hadir"], ["tidak_hadir", "Tidak hadir"], ["ragu", "Masih ragu"]].map(([v, label]) => (
            <label key={v} className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-(--muted)/40 text-sm has-checked:bg-(--ink) has-checked:text-(--surface)">
              <input type="radio" name="attendance" value={v} checked={attendance === v} onChange={() => setAttendance(v)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {attendance === "hadir" && (
        <label className="block">
          <span className="mb-1 block text-sm">Jumlah orang</span>
          <select name="pax" defaultValue="1" className={field}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-sm">Ucapan & doa (opsional)</span>
        <textarea name="message" maxLength={500} rows={4} className={field} />
      </label>
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      {state.status === "error" && <p role="alert" className="text-sm text-red-700">{state.msg}</p>}
      <button
        disabled={state.status === "sending"}
        className="min-h-11 w-full rounded-full bg-(--ink) font-semibold text-(--surface) disabled:opacity-60"
      >
        {state.status === "sending" ? "Mengirim…" : "Kirim"}
      </button>
    </form>
  );
}
