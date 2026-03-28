"use client";

import { redirect, usePathname } from "next/navigation";
import useAuthSession from "@/app/hook/useAuthSession";

const LOGIN_PATH = "/login";

export default function AuthGate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const session = useAuthSession();

  if (session === undefined) {
    return null;
  }

  if (!session && pathname !== LOGIN_PATH) {
    redirect(LOGIN_PATH);
  }

  if (session && pathname === LOGIN_PATH) {
    redirect("/");
  }

  return <>{children}</>;
}
