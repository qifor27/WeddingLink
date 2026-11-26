import { notFound } from "next/navigation";
import { Invitation } from "@/components/Invitation";
import { requireUser } from "@/lib/auth";
import { invitationData } from "@/lib/invitation";
import { getTheme } from "@/themes";

// Preview pemilik: selalu berwatermark & tanpa RSVP sampai terbit (PRD bagian 5 langkah 6).
export default async function Page({ params }: PageProps<"/dashboard/[id]/preview">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: inv } = await supabase
    .from("invitations")
    .select("data, themes(slug)")
    .eq("id", id)
    .maybeSingle<{ data: unknown; themes: { slug: string } }>();
  const theme = inv && getTheme(inv.themes.slug);
  if (!inv || !theme) notFound();
  return <Invitation data={invitationData.parse(inv.data)} theme={theme} watermark />;
}
