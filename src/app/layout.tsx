import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { buildMetadata, PAGES, SITE_NAME, SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  ...buildMetadata(PAGES.home),
  applicationName: SITE_NAME,
  authors: [{ name: "GRID" }],
  creator: "GRID",
  publisher: "GRID",
  category: "technology",
  openGraph: {
    ...buildMetadata(PAGES.home).openGraph,
    siteName: SITE_NAME,
  },
};

/** Runs before paint — prevents flash of wrong theme */
const themeInitScript = `
(function(){
  try {
    var k = 'grid-theme';
    var t = localStorage.getItem(k);
    if (t !== 'light' && t !== 'dark') {
      t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches)
        ? 'light' : 'dark';
    }
    var d = document.documentElement;
    d.classList.remove('light','dark');
    d.classList.add(t);
    d.dataset.theme = t;
    d.style.colorScheme = t;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
