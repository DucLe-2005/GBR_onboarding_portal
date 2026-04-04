"use client";

import { ReactNode, useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

import AdminSidebar from "@/components/admin/AdminSidebar";
import UserSidebar from "@/components/client/UserSidebar";
import {
  getCurrentSession,
  subscribeToAuthStateChange,
} from "@/lib/auth";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function syncAuth(currentSession: Session | null) {
      if (!mounted) return;

      setSession(currentSession);

      if (!currentSession) {
        setRole(null);
        return;
      }

      const sessionRole =
        typeof currentSession.user.user_metadata?.role === "string"
          ? currentSession.user.user_metadata.role
          : null;

      setRole(sessionRole);
    }

    async function initializeSession() {
      try {
        const initialSession = await getCurrentSession();
        await syncAuth(initialSession);
      } catch (error) {
        console.error("Failed to initialize session:", error);

        if (!mounted) return;

        setSession(null);
        setRole(null);
      }
    }

    void initializeSession();

    const unsubscribe = subscribeToAuthStateChange(async (newSession) => {
      if (!mounted) return;
      await syncAuth(newSession);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (session === undefined) {
    return null;
  }

  if (!session && pathname !== "/login") {
    redirect("/login");
  }

  if (session && pathname === "/login") {
    redirect("/");
  }

  const showAdminSidebar = role === "admin";
  const showUserSidebar =
    (role === "buyer" || role === "seller");

  return (
    <div className="flex min-h-dvh flex-col bg-[#F8F9FB] text-[#111827]">
      <div className="flex min-h-dvh flex-1 flex-col items-stretch lg:flex-row">
        {showAdminSidebar && <AdminSidebar />}
        {showUserSidebar && <UserSidebar currentStep={1} />}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
