"use client";

import { useActionState } from "react";
import { importGuests } from "../../actions";

export function ImportGuests({ id }: { id: string }) {
  const [state, action, pending] = useActionState(importGuests.bind(null, id), null);
  return (
    <form action={action} className="space-y-2">
      <label className="block">
        <span className="mb-1 block text-sm">Tempel daftar tamu: satu nama per baris, opsional <code>Nama,Grup</code> (bisa dari Excel/CSV)</span>
        <textarea name="list" rows={5} required className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5" placeholder={"Bapak Ahmad,Keluarga\nIbu Sari,Kantor\nRudi"} />
      </label>
      <button disabled={pending} className="min-h-11 rounded-full bg-rose px-5 font-semibold text-white disabled:opacity-60">
        {pending ? "Mengimpor…" : "Impor"}
      </button>
      {state?.message && <p role="status" className="text-sm">{state.message}</p>}
    </form>
  );
}
