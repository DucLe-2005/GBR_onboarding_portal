"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b border-[#0b3d61] bg-[#052b46] text-white">
      <div className="mx-auto flex h-[70px] max-w-screen-xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-[50px] w-[176px]">
            <Image
              src="/logo.avif"
              sizes="176px"
              alt="GodBless Retirement logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <div className="text-sm font-medium text-[#c6e5f5]">
          Secure Client Access
        </div>
      </div>
    </header>
  );
}
