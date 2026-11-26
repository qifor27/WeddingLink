import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-3xl">Halaman tidak ditemukan</h1>
      <p className="text-sm">Undangan mungkin belum terbit, sudah berakhir, atau link-nya salah.</p>
      <Link href="/" className="rounded-full bg-rose px-5 py-2 text-white">Ke beranda</Link>
    </main>
  );
}
