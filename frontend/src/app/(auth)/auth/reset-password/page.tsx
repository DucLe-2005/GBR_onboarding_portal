"use client";

import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/Notification";
import { updateAuthenticatedUserPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const nextPassword = password.trim();
    const nextConfirmPassword = confirmPassword.trim();

    if (!nextPassword || !nextConfirmPassword) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (nextPassword !== nextConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await updateAuthenticatedUserPassword(nextPassword);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    router.replace("/");
  }

  return (
    <>
      <Notification
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        variant="success"
        title="Password updated"
        message="Your password has been changed successfully. Click OK to continue"
      />

      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-[520px]">
          <div className="panel overflow-hidden">
            <div className="border-b border-[var(--border)] bg-white px-5 py-8 text-[var(--ink)] sm:px-8 sm:py-10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] sm:h-16 sm:w-16">
                  <svg
                    width="54"
                    height="54"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[var(--accent)]"
                  >
                    <path
                      d="M12 3L18.5 5.5V11.5C18.5 16 15.7 19.6 12 21C8.3 19.6 5.5 16 5.5 11.5V5.5L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.8 11.8L11.3 13.3L14.8 9.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h1 className="text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
                  Reset password
                </h1>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                  Choose a new password for your account.
                </p>
              </div>
            </div>

            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <form
                onSubmit={handleResetPassword}
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[var(--ink)]"
                  >
                    New password
                  </label>
                  <div className="field-shell">
                    <Lock className="mr-3 h-5 w-5 text-[var(--text-muted)]" />
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full min-w-0 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[#939891]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-[var(--ink)]"
                  >
                    Confirm new password
                  </label>
                  <div className="field-shell">
                    <Lock className="mr-3 h-5 w-5 text-[var(--text-muted)]" />
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full min-w-0 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[#939891]"
                    />
                  </div>
                </div>

                {errorMessage ? (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Updating..." : "Update password"}
                  {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
