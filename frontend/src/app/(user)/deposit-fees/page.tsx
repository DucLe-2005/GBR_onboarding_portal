"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  UserCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/Notification";
import { useRouteProgress } from "@/contexts/RouteProgressContext";
import { createInvoice } from "@/service/quickbooks.service";

const DEPOSIT_FEE_AMOUNT = 5000;

function formatDateForQbo(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function DepositFeesPage() {
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [billEmail, setBillEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const routeProgress = useRouteProgress();

  async function handleCreateInvoice() {
    try {
      setIsCreatingInvoice(true);
      setErrorMessage("");
      routeProgress.start({ minDurationMs: 1100 });

      const txnDate = new Date();
      const dueDate = new Date(txnDate);
      dueDate.setDate(dueDate.getDate() + 7);

      const response = await createInvoice({
        amount: DEPOSIT_FEE_AMOUNT,
        txn_date: formatDateForQbo(txnDate),
        due_date: formatDateForQbo(dueDate),
        customer_memo: "Initial deposit fee invoice",
        private_note: "Created from the deposit fee onboarding page.",
      });

      setBillEmail(response.bill_email);
      setNotificationOpen(true);
      setIsCreatingInvoice(false);
      routeProgress.complete();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to create the QuickBooks invoice.",
      );
      setIsCreatingInvoice(false);
      routeProgress.fail();
    }
  }

  return (
    <div className="app-page flex flex-1 flex-col">
      <Notification
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        variant="success"
        title="Payment Email Sent"
        message={`Your QuickBooks invoice has been created and emailed${billEmail ? ` to ${billEmail}` : ""}. Please check your inbox for the payment link.`}
      />

      <div className="border-b border-[var(--border)] bg-white px-5 py-3 sm:px-6 lg:px-10">
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
          >
            <UserCircle2 className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
            <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" strokeWidth={1.75} />
            <span>Book Strategy Session</span>
          </button>
        </div>
      </div>

      <section className="app-container max-w-5xl">
        <div className="mb-6 flex items-center gap-3 border-b border-[var(--border)] pb-5">
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-white hover:text-[var(--ink)]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </Link>
          <h1 className="text-3xl font-semibold text-[var(--ink)]">
            Deposit Fee
          </h1>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--accent)] text-white">
              <CircleDollarSign className="h-7 w-7" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-dark)]">
                Step 2
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                Retainer payment is now available
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                Your agreement has been completed successfully. Send your
                $5,000 QuickBooks deposit invoice email from this page to continue the
                payment workflow.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-6">
            <p className="text-base leading-7 text-[var(--text-muted)]">
              This screen creates the QuickBooks invoice for the logged-in user
              and immediately asks QuickBooks to send the invoice email to the
              billing email on file.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button
                type="button"
                disabled={isCreatingInvoice}
                onClick={() => void handleCreateInvoice()}
                className="px-5"
              >
                {isCreatingInvoice ? "Sending Payment Email..." : "Send Payment Email"}
              </Button>
            </div>

            {errorMessage ? (
              <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-[#B42318]">
                  {errorMessage}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-lg border border-[var(--border)] bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-dark)]">
              Invoice Summary
            </p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-base text-[var(--text-muted)]">Deposit fee amount</p>
              <p className="text-2xl font-semibold text-[var(--ink)]">
                $5,000
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              Clicking Send Payment Email creates the QuickBooks invoice and
              asks QuickBooks to email it to the billing address. Webhooks still
              sync the transaction record using the stored QuickBooks invoice ID.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
