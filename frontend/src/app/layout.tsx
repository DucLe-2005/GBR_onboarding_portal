import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/common/AppShell";

export const metadata: Metadata = {
  title: "GBR Onboarding Portal",
  description: "God Bless Retirement onboarding portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[#F8F9FB] text-[#111827] antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
