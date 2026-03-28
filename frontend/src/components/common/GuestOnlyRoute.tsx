"use client";

import { redirect } from "next/navigation";
import useAuthSession from "@/app/hook/useAuthSession";

export default function GuestOnlyRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = useAuthSession();

  if (session === undefined) {
    return null;
  }

  if (session) {
    redirect("/");
  }

  return <>{children}</>;
}
