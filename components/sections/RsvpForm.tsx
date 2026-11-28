"use client";

import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    turnstile?: { reset: () => void };
  }
}

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
    return <p className="box">Terima kasih! Konfirmasi dan ucapan Anda sudah kami terima.</p>;
  }

  return (
    <form onSubmit={submit} className="rsvp">
      {/* afterInteractive, bukan lazyOnload: animasi ornamen tema membuat browser jarang idle,
          sehingga skrip lazyOnload bisa tidak pernah dimuat. */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <label>
        <span>Nama</span>
        <input name="name" required maxLength={60} defaultValue={params.get("to")?.slice(0, 60) ?? ""} />
      </label>
      <fieldset>
        <legend>Kehadiran</legend>
        <div className="att">
          {[["hadir", "Hadir"], ["tidak_hadir", "Tidak hadir"], ["ragu", "Masih ragu"]].map(([v, label]) => (
            <label key={v}>
              <input type="radio" name="attendance" value={v} checked={attendance === v} onChange={() => setAttendance(v)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      {attendance === "hadir" && (
        <label>
          <span>Jumlah orang</span>
          <select name="pax" defaultValue="1">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Ucapan & doa (opsional)</span>
        <textarea name="message" maxLength={500} rows={4} />
      </label>
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      {state.status === "error" && <p role="alert" className="err">{state.msg}</p>}
      <button disabled={state.status === "sending"} className="btn">
        {state.status === "sending" ? "Mengirim…" : "Kirim"}
      </button>
    </form>
  );
}
