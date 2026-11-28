"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// factorId ada = TOTP sudah terdaftar, cukup masukkan kode. Belum ada = daftarkan dulu (scan QR).
export function TwoFactor({ factorId: verifiedId }: { factorId?: string }) {
  const router = useRouter();
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string }>();
  const [error, setError] = useState("");
  const factorId = verifiedId ?? enroll?.id;

  async function start() {
    const supabase = createClient();
    // Bersihkan pendaftaran lama yang belum diverifikasi.
    const { data } = await supabase.auth.mfa.listFactors();
    await Promise.all((data?.all ?? []).filter((f) => f.factor_type === "totp" && f.status === "unverified")
      .map((f) => supabase.auth.mfa.unenroll({ factorId: f.id })));
    const res = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "WeddingLink" });
    if (res.error) return setError(res.error.message);
    setEnroll({ id: res.data.id, qr: res.data.totp.qr_code, secret: res.data.totp.secret });
  }

  async function verify(formData: FormData) {
    setError("");
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: factorId!, code: String(formData.get("code")) });
    if (error) return setError("Kode salah atau kedaluwarsa.");
    router.replace("/admin");
    router.refresh();
  }

  if (!factorId)
    return (
      <button onClick={start} className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">
        Siapkan aplikasi autentikator
      </button>
    );

  return (
    <form action={verify} className="space-y-3">
      {enroll && (
        <div className="space-y-2 text-sm">
          <p>Scan dengan Google Authenticator / Authy, atau masukkan kunci ini:</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR SVG data URI dari Supabase */}
          <img src={enroll.qr} alt="QR TOTP" width={180} height={180} className="bg-white" />
          <code data-testid="totp-secret" className="block break-all rounded-xl bg-white p-2">{enroll.secret}</code>
        </div>
      )}
      <label className="block">
        <span className="mb-1 block text-sm">Kode autentikator</span>
        <input name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code"
          className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5" />
      </label>
      <button className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white">Verifikasi</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
