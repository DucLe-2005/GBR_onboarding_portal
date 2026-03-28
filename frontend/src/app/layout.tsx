import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AuthGate from "@/components/common/AuthGate";

export const metadata: Metadata = {
  title: "GBR Onboarding Portal",
  description: "GodBless Retirement onboarding portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FB] text-[#111827]">
        <AuthGate>
          <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </AuthGate>
      </body>
    </html>
  );
}
