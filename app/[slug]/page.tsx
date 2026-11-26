import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Invitation } from "@/components/Invitation";
import { getPublishedInvitation, getWishes } from "@/lib/data";
import { invitationData } from "@/lib/invitation";
import { getTheme } from "@/themes";

// Undangan publik: noindex, slug acak, dirender sekali lalu di-cache (PRD bagian 8 & 10).
// Nama tamu (?to=) & kode tamu (?k=) dibaca di klien, jadi semua tamu berbagi satu cache.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Cache Components butuh minimal satu param; slug asli dirender saat dikunjungi pertama (ISR).
const PLACEHOLDER = "__contoh__";
export const generateStaticParams = () => [{ slug: PLACEHOLDER }];

export default function Page({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <InvitationPage params={params} />
    </Suspense>
  );
}

async function InvitationPage({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  if (slug === PLACEHOLDER || !/^[A-Za-z0-9_-]{6,40}$/.test(slug)) notFound();

  const inv = await getPublishedInvitation(slug);
  const theme = inv && getTheme(inv.themes.slug);
  if (!inv || !theme) notFound();

  const wishes = await getWishes(inv.id);
  return <Invitation data={invitationData.parse(inv.data)} theme={theme} rsvp={{ invitationId: inv.id, wishes }} />;
}
