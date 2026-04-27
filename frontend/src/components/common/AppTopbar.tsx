"use client";

import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  Bell,
  ChevronDown,
  KeyRound,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";
import { ProfileModal } from "@/components/common/ProfileModal";
import {
  getCurrentSession,
  signOutUser,
  subscribeToAuthStateChange,
} from "@/lib/auth";

type AppTopbarProps = {
  role?: "admin" | "client" | "default";
};

function displayNameFromUser(user: User | null, fallback: string): string {
  if (!user) return fallback;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const first =
    typeof meta?.first_name === "string" ? meta.first_name.trim() : "";
  const last = typeof meta?.last_name === "string" ? meta.last_name.trim() : "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  if (user.email) return user.email.split("@")[0] ?? fallback;
  return fallback;
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return (parts[0]?.slice(0, 2) || "GB").toUpperCase();
}

export default function AppTopbar({ role = "default" }: AppTopbarProps) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!accountMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const el = accountMenuRef.current;
      if (el && !el.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [accountMenuOpen]);

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  const fallbackName = role === "admin" ? "Administrator" : "Client User";
  const name = displayNameFromUser(authUser, fallbackName);
  const label =
    role === "admin" ? "Administrator" : role === "client" ? "Client" : "Account";
  const initials = initialsFromName(name);

  return (
    <>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      <header className="flex h-[70px] shrink-0 items-center justify-between border-b border-[#0b3d61] bg-[#052b46] px-5 text-white lg:px-6">
        <div className="text-base font-medium text-white">
          Onboarding Portal
        </div>

        <div className="flex min-w-0 items-center gap-4">
          {role !== "client" ? (
            <label className="hidden h-9 w-[290px] items-center gap-2 rounded border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-muted)] lg:flex">
              <span className="sr-only">Search</span>
              <input
                type="search"
                placeholder="Search clients, tasks, docs..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[#777d78]"
              />
              <Search className="h-4 w-4 shrink-0 text-[var(--ink)]" strokeWidth={1.8} />
            </label>
          ) : null}

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded text-white transition hover:bg-white/10 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>

          <div ref={accountMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded px-1 py-1 text-left transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc8e8]/50"
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#052b46] text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-semibold text-white">
                  {name}
                </span>
                <span className="block text-xs text-[#c6e5f5]">
                  {label}
                </span>
              </span>
              <ChevronDown
                className="hidden h-4 w-4 text-white sm:block"
                strokeWidth={1.8}
              />
            </button>

            {accountMenuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded border border-[var(--border)] bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setProfileOpen(true);
                  }}
                >
                  <UserRound className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    setChangePasswordOpen(true);
                  }}
                >
                  <KeyRound className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
                  Change password
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-3 border-t border-[var(--border)] px-3 py-2.5 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
