"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useAuthSession from "@/app/hook/useAuthSession";
import { signOutUser } from "@/lib/auth";

export default function Navbar() {
  const session = useAuthSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOutUser();
    } catch (error) {
      console.error(error);
      setIsSigningOut(false);
    }
  }

  return (
    <header className="w-full bg-[#081632] text-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image
              src="/logo-gold.png"
              alt="GodBless Retirement logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">
              GodBless Retirement
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A65B]">
              Onboarding Portal
            </p>
          </div>
        </Link>

        {session ? (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSigningOut ? "Signing out..." : "Log out"}
          </button>
        ) : (
          <div className="text-sm font-medium text-gray-200">
            Secure Client Access
          </div>
        )}
      </div>
    </header>
  );
}
