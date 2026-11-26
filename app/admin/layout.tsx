import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "../dashboard/actions";

export const metadata: Metadata = { title: "Admin — WeddingLink", robots: { index: false } };

export default function Layout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-blush px-4 py-3">
        <Link href="/admin" className="font-display text-xl">WeddingLink Admin</Link>
        <form action={signOut}>
          <button className="text-sm underline">Keluar</button>
        </form>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 p-4">
        <Suspense fallback={<p className="text-sm">Memuat…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}
