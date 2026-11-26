"use client";

import { useActionState } from "react";
import { reviewOrder } from "./actions";

export function ReviewOrder({ id }: { id: string }) {
  const [confirmState, confirm, confirming] = useActionState(reviewOrder.bind(null, id, "paid"), null);
  const [rejectState, reject, rejecting] = useActionState(reviewOrder.bind(null, id, "rejected"), null);
  const error = (confirmState && "error" in confirmState && confirmState.error) || (rejectState && "error" in rejectState && rejectState.error);

  return (
    <div className="mt-3 space-y-2">
      <form action={confirm}>
        <button disabled={confirming} className="min-h-10 rounded-full bg-rose px-4 text-sm font-semibold text-white disabled:opacity-60">
          Konfirmasi
        </button>
      </form>
      <form action={reject} className="flex gap-2">
        <input name="reason" maxLength={200} placeholder="Alasan penolakan" aria-label="Alasan penolakan"
          className="min-w-0 flex-1 rounded-xl border border-ink/20 px-3 py-2 text-sm" />
        <button disabled={rejecting} className="min-h-10 rounded-full border border-rose px-4 text-sm text-rose disabled:opacity-60">Tolak</button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
