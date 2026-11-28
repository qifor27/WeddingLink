import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

const display = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"] });
const body = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: { siteName: "WeddingLink", locale: "id_ID", type: "website" },
  title: "WeddingLink — Undangan Pernikahan Digital",
  description: "Undangan pernikahan digital custom: adat Nusantara, modern, atau minimalis, dengan cerita Anda sendiri, RSVP, dan link per tamu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
