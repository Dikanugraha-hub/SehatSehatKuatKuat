import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DOM Traversal — IF2211 Strategi Algoritma",
  description:
    "Aplikasi BFS & DFS untuk penelusuran CSS Selector pada pohon DOM. Tugas Besar 2 IF2211 ITB.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jetbrainsMono.variable}>
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
