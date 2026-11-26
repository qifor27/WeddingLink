import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { TwoFactor } from "./TwoFactor";

// Admin wajib TOTP (aal2) sebelum melihat/menyentuh pesanan (PRD bagian 8 & 10).
export default async function Page() {
  const { supabase, aal2 } = await requireAdmin({ allowAal1: true });
  if (aal2) redirect("/admin");
  const { data: factors } = await supabase.auth.mfa.listFactors();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Verifikasi 2 langkah</h1>
      <TwoFactor factorId={factors?.totp[0]?.id} />
    </div>
  );
}
