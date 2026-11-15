import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#080B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Reflex Arena — Think Fast. React Faster.",
  description: "The competitive browser arcade gaming platform. Benchmark your reaction speed, precision, and cognitive reflexes across 10 high-octane mini-games.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  keywords: [
    "reflex test",
    "reaction time",
    "arcade games",
    "speed test",
    "brain games",
    "esports training",
    "cognitive performance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[#080B14] text-slate-100 min-h-screen antialiased selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
