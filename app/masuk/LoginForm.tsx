"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { safeNext } from "@/lib/guests";
import { createClient } from "@/lib/supabase/client";

const input = "w-full rounded-xl border border-ink/20 bg-white px-4 py-3";
const button = "min-h-11 w-full rounded-full bg-ink font-semibold text-white disabled:opacity-60";

// Login tanpa password: kode OTP 6 digit lewat email. Kode (bukan magic link) supaya tetap
// jalan saat email dibuka di aplikasi lain (Gmail/WhatsApp in-app browser).
export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(fn: () => Promise<{ error: { message: string } | null }>, onOk: () => void) {
    setBusy(true);
    setError("");
    const { error } = await fn();
    setBusy(false);
    if (error) setError(error.message);
    else onOk();
  }

  if (!sent) {
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createClient().auth.signInWithOtp({ email }), () => setSent(true));
        }}
      >
        <label className="block">
          <span className="mb-1 block text-sm">Email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} className={input} />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className={button}>{busy ? "Mengirim…" : "Kirim kode"}</button>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const token = String(new FormData(e.currentTarget).get("token"));
        run(() => createClient().auth.verifyOtp({ email, token, type: "email" }), () => router.replace(next));
      }}
    >
      <p className="text-sm">Kode dikirim ke <b>{email}</b>.</p>
      <label className="block">
        <span className="mb-1 block text-sm">Kode 6 digit</span>
        <input name="token" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className={`${input} tracking-[0.5em]`} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className={button}>{busy ? "Memeriksa…" : "Masuk"}</button>
      <button type="button" onClick={() => setSent(false)} className="w-full text-sm underline">Ganti email</button>
    </form>
  );
}
