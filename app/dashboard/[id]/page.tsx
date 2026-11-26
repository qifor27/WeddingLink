import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { invitationData } from "@/lib/invitation";
import { themes } from "@/themes";
import { Editor } from "./Editor";

export default async function Page({ params }: PageProps<"/dashboard/[id]">) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: inv } = await supabase
    .from("invitations")
    .select("id, data, themes(slug)")
    .eq("id", id)
    .maybeSingle<{ id: string; data: unknown; themes: { slug: string } }>();
  if (!inv) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-3xl">Edit undangan</h1>
        <Link href={`/dashboard/${id}/preview`} target="_blank" className="rounded-full border border-rose px-4 py-2 text-sm text-rose">
          Lihat preview
        </Link>
      </div>
      <Editor
        id={id}
        initialData={invitationData.parse(inv.data)}
        initialTheme={inv.themes.slug}
        themes={themes.map((t) => ({ slug: t.slug, name: t.name }))}
      />
    </div>
  );
}
