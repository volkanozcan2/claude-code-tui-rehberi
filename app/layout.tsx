import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Code TUI Rehberi",
  description:
    "Claude Code'un terminal arayüzünü adım adım öğreten Türkçe, etkileşimli bir kurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="relative z-50 flex items-center justify-between p-4">
          <Link href="/" className="text-sm font-semibold text-fg hover:text-accent">
            Claude Code TUI Rehberi
          </Link>
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
