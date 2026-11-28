"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadProof({ orderId, hasProof }: { orderId: string; hasProof: boolean }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/orders/${orderId}/proof`, { method: "POST", body: formData }).catch(() => null);
    const body = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) return setMsg(body?.error ?? "Gagal mengunggah. Coba lagi.");
    setMsg("Bukti terkirim. Admin akan memeriksa mutasi rekening.");
    router.refresh();
  }

  return (
    <form action={submit} className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-sm">{hasProof ? "Ganti bukti transfer" : "Unggah bukti transfer"} (JPG/PNG/PDF, maks. 5 MB)</span>
        <input name="file" type="file" required accept="image/jpeg,image/png,application/pdf" className="block w-full text-sm" />
      </label>
      <button disabled={busy} className="min-h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white disabled:opacity-60">
        {busy ? "Mengunggah…" : "Kirim bukti"}
      </button>
      {msg && <p role="alert" className="text-sm">{msg}</p>}
    </form>
  );
}
