import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/common/AppShell";
import { RouteProgressProvider } from "@/contexts/RouteProgressContext";

export const metadata: Metadata = {
  title: "GBR Onboarding Portal",
  description: "God Bless Retirement onboarding portal",
  icons: {
    icon: "/small_logo.jpg",
    shortcut: "/small_logo.jpg",
    apple: "/small_logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] antialiased">
        <RouteProgressProvider>
          <AppShell>{children}</AppShell>
        </RouteProgressProvider>
      </body>
    </html>
  );
}
