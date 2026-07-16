import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "GRID — Useful Mining. Planetary Compute.",
  description:
    "Run a node. Do real work. Earn GRID. The planetary supercomputer built from machines everywhere — secured by Bitcoin as the Transact Security Layer.",
  keywords: [
    "GRID",
    "useful mining",
    "Proof-of-Resource",
    "distributed compute",
    "DePIN",
    "GPU mining",
    "Bitcoin TSL",
  ],
  openGraph: {
    title: "GRID — Useful Mining. Planetary Compute.",
    description:
      "The world's largest supercomputer will not be built in one place. It will emerge from millions of connected machines.",
    type: "website",
    siteName: "GRID",
  },
  twitter: {
    card: "summary_large_image",
    title: "GRID — Useful Mining",
    description: "Run a node. Do real work. Earn GRID.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
