"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { signInWithEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Email or password is missing");
      return;
    }

    setLoading(true);

    try {
      const data = await signInWithEmail(email, password);
      if (!data.session) {
        setErrorMessage("No session returned.");
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase() === "invalid login credentials"
      ) {
        setErrorMessage("Email or password is not correct");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Sign in failed.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#f7f9fb] px-4 py-10 sm:px-6">
      <div className="w-full max-w-[440px]">
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[0_18px_45px_rgba(5,43,70,0.08)]">
          <div className="border-b border-[var(--border)] px-6 py-7 sm:px-8">
            <div className="relative mx-auto h-[50px] w-[176px]">
              <Image
                src="/logo.avif"
                alt="God Bless Retirement"
                fill
                priority
                className="object-contain"
                sizes="176px"
              />
            </div>

            <div className="mt-7 text-center">
              <h1 className="text-2xl font-semibold text-[var(--ink)]">
                Sign in to your portal
              </h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                Secure access for invited clients and partners.
              </p>
            </div>
          </div>

          <div className="px-6 py-7 sm:px-8">
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[var(--ink)]"
                >
                  Email Address
                </label>
                <div className="field-shell">
                  <Mail className="mr-3 h-5 w-5 text-[var(--text-muted)]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="client@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full min-w-0 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[#939891]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-[var(--ink)]"
                >
                  Password
                </label>
                <div className="field-shell">
                  <Lock className="mr-3 h-5 w-5 text-[var(--text-muted)]" />
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-w-0 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[#939891]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[var(--accent-dark)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {errorMessage ? (
                <p className="text-sm text-red-600">{errorMessage}</p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full"
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-5 px-2 text-center text-sm leading-6 text-[var(--text-muted)]">
          Need access? Contact your God Bless Retirement advisor.
        </p>
      </div>
    </div>
  );
}
