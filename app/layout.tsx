import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
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
      </body>
    </html>
  );
}
