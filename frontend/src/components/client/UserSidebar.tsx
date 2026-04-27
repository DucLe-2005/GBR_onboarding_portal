"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  FileText,
  Home,
  LogOut,
} from "lucide-react";
import { useUserStep } from "@/contexts/UserStepContext";
import { isRouteCompletedForStep, isRouteUnlockedForStep } from "@/lib/user-step";
import { signOutUser } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    label: "Contract",
    href: "/agreement",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/agreement"),
  },
  {
    label: "Payment",
    href: "/deposit-fees",
    icon: CircleDollarSign,
    isActive: (pathname) => pathname === "/deposit-fees",
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { currentStep, isLoading: isStepLoading } = useUserStep();

  async function handleLogout() {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#061f33] bg-[#052b46] text-white lg:sticky lg:top-0 lg:h-dvh lg:w-[260px] lg:border-b-0 lg:border-r">
      <div className="flex min-h-0 flex-1 flex-col lg:h-dvh">
        <div className="flex h-[70px] items-center border-b border-[#0b3d61] px-4">
          <div className="relative h-[50px] w-[176px] shrink-0">
            <Image
              src="/logo.avif"
              alt="God Bless Retirement"
              fill
              priority
              className="object-contain object-left"
              sizes="176px"
            />
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              const Icon = item.icon;
              const isUnlocked =
                item.href === "/dashboard"
                  ? true
                  : isRouteUnlockedForStep(item.href, currentStep);
              const isCompleted =
                item.href === "/dashboard"
                  ? false
                  : isRouteCompletedForStep(item.href, currentStep);
              const isDisabled = !isStepLoading && !isUnlocked;
              const isTemporarilyDisabled =
                item.href !== "/dashboard" && (isStepLoading || isDisabled);
              const itemClassName = `relative mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-[#073454] text-white"
                  : isTemporarilyDisabled
                    ? "cursor-not-allowed text-white/35"
                    : "text-[#e6edf3] hover:bg-[#073454] hover:text-white"
              }`;

              return (
                <li key={`${item.label}-${item.href}`}>
                  {isTemporarilyDisabled ? (
                    <div
                      aria-disabled="true"
                      className={itemClassName}
                    >
                      <Icon
                        className="h-5 w-5 shrink-0 text-white/35"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className="flex-1">{item.label}</span>
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#c6e5f5]">
                        {isStepLoading ? "Loading" : "Locked"}
                      </span>
                    </div>
                  ) : (
                    <Link href={item.href} className={itemClassName}>
                      {active ? (
                        <span className="absolute -left-2 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#2f81f7]" />
                      ) : null}
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          active
                            ? "text-white"
                            : isCompleted
                              ? "text-white"
                              : "text-white"
                        }`}
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span className="flex-1">{item.label}</span>
                      {isCompleted ? (
                        <span className="rounded-full bg-[#edf7fc] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#063655]">
                          Done
                        </span>
                      ) : null}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-[#0b3d61] px-4 py-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-[#e6edf3] transition hover:bg-[#073454] hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
