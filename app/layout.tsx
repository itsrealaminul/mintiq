import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MINTIQ — Creator Exchange",
  description: "Creator-দের মধ্যে real cross-promotion network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0F1115] text-[#E8E8EA]">
        <AuthProvider>{children}</AuthProvider>
        {/* Adsterra Social Bar - সম্পূর্ণ সাইটে ভাসমান থাকে */}
        <Script
          src="https://pl29892400.effectivecpmnetwork.com/84/78/d4/8478d4246b380557aa79b8bf01df131d.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
