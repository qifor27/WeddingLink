import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import "./globals.css";

const display = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"] });
const body = Jost({ variable: "--font-jost", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WeddingLink — Undangan Pernikahan Digital",
  description: "Undangan pernikahan digital dengan tema adat Nusantara orisinal, RSVP, dan link per tamu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
