import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Masuk — WeddingLink", robots: { index: false } };

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="font-display text-3xl">Masuk</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
