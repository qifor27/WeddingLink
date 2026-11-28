import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Invitation } from "@/components/Invitation";
import type { ThemeConfig } from "@/lib/theme";
import { getTheme, themes } from "@/themes";
import { sampleData } from "@/themes/sample";

// PRD F2: /tema/[slug]/preview?nama=Latifa%20%26%20Latif
export const generateStaticParams = () => themes.map((t) => ({ slug: t.slug }));

export async function generateMetadata({ params }: PageProps<"/tema/[slug]/preview">): Promise<Metadata> {
  const theme = getTheme((await params).slug);
  return { title: `Preview ${theme?.name ?? "Tema"} — WeddingLink`, robots: { index: false } };
}

export default async function Page({ params, searchParams }: PageProps<"/tema/[slug]/preview">) {
  const theme = getTheme((await params).slug);
  if (!theme) notFound();
  return (
    <Suspense fallback={<Invitation data={sampleData} theme={theme} watermark />}>
      <Named theme={theme} searchParams={searchParams} />
    </Suspense>
  );
}

// "Wanita & Pria" dari ?nama= menggantikan nama contoh. React meng-escape teks.
async function Named({ theme, searchParams }: { theme: ThemeConfig; searchParams: PageProps<"/tema/[slug]/preview">["searchParams"] }) {
  const nama = (await searchParams).nama;
  const [w, p] = typeof nama === "string" ? nama.split("&").map((s) => s.trim().slice(0, 30)) : [];
  const data = {
    ...sampleData,
    wanita: w ? { ...sampleData.wanita, nama: w, panggilan: w } : sampleData.wanita,
    pria: p ? { ...sampleData.pria, nama: p, panggilan: p } : sampleData.pria,
  };
  return <Invitation data={data} theme={theme} watermark />;
}
