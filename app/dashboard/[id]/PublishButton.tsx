"use client";

import { useActionState } from "react";
import { publishInvitation } from "../actions";

export function PublishButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(() => publishInvitation(id), null);
  return (
    <form action={action} className="space-y-1">
      <button disabled={pending} className="min-h-11 rounded-full bg-rose px-5 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Menerbitkan…" : "Terbitkan"}
      </button>
      {state && "error" in state && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
