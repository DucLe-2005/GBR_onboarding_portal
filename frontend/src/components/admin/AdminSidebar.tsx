"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { FileText, Home, LogOut, ShieldCheck } from "lucide-react";
import { signOutUser, getCurrentSession, subscribeToAuthStateChange } from "@/lib/auth";
import { ProfileModal } from "@/components/common/ProfileModal";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

const navItems: NavItem[] = [
  { label: "Create", href: "/admin/create", icon: Home },
  { label: "Client Dashboard", href: "/admin/clients", icon: FileText },
];

function displayNameFromUser(user: User | null): string {
  if (!user) return "Admin";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const first =
    typeof meta?.first_name === "string" ? meta.first_name.trim() : "";
  const last =
    typeof meta?.last_name === "string" ? meta.last_name.trim() : "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (user.email) return user.email.split("@")[0] ?? "Admin";
  return "Admin";
}

function initialFromUser(user: User | null): string {
  const name = displayNameFromUser(user);
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "A";
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const session = await getCurrentSession();
      if (!mounted) return;
      setAuthUser(session?.user ?? null);
    }

    void load();

    const unsub = subscribeToAuthStateChange((next: Session | null) => {
      if (!mounted) return;
      setAuthUser(next?.user ?? null);
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  if (shouldRedirectToLogin) {
    redirect("/login");
  }

  async function handleLogout() {
    try {
      await signOutUser();
      setShouldRedirectToLogin(true);
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  function isNavActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const displayName = displayNameFromUser(authUser);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#151d2e] bg-[#0a1120] text-white lg:w-64 lg:border-b-0 lg:border-r lg:border-[#151d2e]">
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col lg:min-h-dvh">
        <div className="border-b border-[#151d2e] px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0d1528] ring-1 ring-[#C9A65B]/35">
              <ShieldCheck
                className="h-6 w-6 text-[#C9A65B]"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-lg font-bold tracking-tight text-white">
                GodBless
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A65B]">
                RETIREMENT
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 lg:py-6">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8ea0bd]">
            Navigation
          </p>

          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#1a2332] text-[#C9A65B]"
                        : "text-white hover:bg-white/6"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${active ? "text-[#C9A65B]" : "text-white"}`}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-[#151d2e] px-4 py-5">
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="mb-5 flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition hover:bg-white/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A65B]/50"
            aria-label="Open profile"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1528] text-sm font-semibold text-[#C9A65B] ring-1 ring-[#C9A65B]/30"
              aria-hidden
            >
              {initialFromUser(authUser)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{displayName}</p>
              <p className="text-xs text-[#8ea0bd]">Admin</p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8ea0bd] transition hover:bg-white/6 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
