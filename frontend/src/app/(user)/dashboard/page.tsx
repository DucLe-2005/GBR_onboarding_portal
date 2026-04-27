"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, FileText, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserStep } from "@/contexts/UserStepContext";
import { USER_STEP_ROUTES, isRouteCompletedForStep, isRouteUnlockedForStep } from "@/lib/user-step";

const steps = [
  {
    id: 1,
    title: "Buyer's Listing Agreement",
    description:
      "Sign the official brokerage agreement to commence our partnership as a buyer.",
    cta: "Start Task",
    href: USER_STEP_ROUTES.agreement,
    icon: FileText,
  },
  {
    id: 2,
    title: "Deposit Fee",
    description: "Submit your initial $5,000 retainer invoice securely.",
    cta: "Start Task",
    href: USER_STEP_ROUTES.depositFees,
    icon: CircleDollarSign,
  },
] as const;

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e2ded4]">
      <div
        className="h-full rounded-full bg-[var(--accent)] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { currentStep, isLoading } = useUserStep();
  const progress = isLoading ? 0 : Math.min(100, currentStep / 2 * 100);

  return (
    <div className="app-page min-h-dvh">
      <section className="app-container max-w-5xl">
        <div className="panel px-6 py-6 sm:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-dark)]">
                Client onboarding
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                Welcome, Client
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                Please complete the following steps to finalize your onboarding.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span className="text-[var(--text-muted)]">Overall Progress</span>
                <span className="text-[var(--accent-dark)]">{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const unlocked = isLoading ? step.id === 1 : isRouteUnlockedForStep(step.href, currentStep);
            const completed = isLoading ? false : isRouteCompletedForStep(step.href, currentStep);
            const badge = completed ? "Completed" : unlocked ? null : "Locked";

            return (
              <article
                key={step.id}
                className={`panel px-5 py-5 transition sm:px-6 ${
                  unlocked
                    ? "border-[#9bbfb2]"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border ${
                        unlocked
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                      }`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2
                          className={`text-xl font-semibold ${
                            unlocked ? "text-[var(--ink)]" : "text-[#9a9f99]"
                          }`}
                        >
                          {`Step ${step.id}: ${step.title}`}
                        </h2>
                        {badge ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                              completed
                                ? "border border-[#a8c8dc] bg-[#edf7fc] text-[#063655]"
                                : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                            }`}
                          >
                            <Lock className="h-3.5 w-3.5" strokeWidth={2} />
                            {badge}
                          </span>
                        ) : null}
                      </div>
                      <p
                        className={`mt-2 max-w-3xl text-base ${
                          unlocked ? "text-[var(--text-muted)]" : "text-[#9a9f99]"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {unlocked ? (
                    <Link href={step.href} className="self-start lg:self-center">
                      <Button
                        variant="inverse"
                        className="min-w-36 px-5"
                      >
                        {completed ? "Review Step" : step.cta}
                        <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.25} />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      disabled
                      className="min-w-36 self-start border-[var(--border)] bg-[#e5e2d9] px-5 text-[#888f88] hover:bg-[#e5e2d9] lg:self-center"
                    >
                      {step.cta}
                      <ArrowRight className="ml-2 h-4 w-4" strokeWidth={2.25} />
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
