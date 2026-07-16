import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { JsonLd } from "@/components/SEO";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0E1A',
}

export const metadata: Metadata = {
  title: "MINTIQ — টাকা আয় করুন | Micro Earning Platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.svg",
  },
  verification: {
    google: "f8JfrsCDgj4QmwqbR7vjys25FcLVJqv0WijpOWtcy3U",
  },
  description: "বিজ্ঞাপন দেখুন, ভিডিও দেখুন, সার্ভে সম্পন্ন করুন, গেম খেলুন — পয়েন্ট আয় করুন এবং টাকা তুলুন।",
  keywords: "earn money, micro tasks, watch ads, surveys, games, bKash, Nagad, টাকা আয়, বাংলাদেশ",
  openGraph: {
    title: "MINTIQ — টাকা আয় করুন",
    description: "বিজ্ঞাপন, ভিডিও, সার্ভে, গেম — সব করে আয় করুন",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-deep)] text-[var(--text-primary)]">
        <JsonLd />
        <AuthProvider>{children}</AuthProvider>
        <Script
          src="https://pl29892400.effectivecpmnetwork.com/84/78/d4/8478d4246b380557aa79b8bf01df131d.js"
          strategy="lazyOnload"
        />
        <Analytics />
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}
        </Script>
      </body>
    </html>
  );
}
