"use client";

import Link from "next/link";

import type { User } from "@/types/user";

function formatRole(role: User["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStep(step: number | null) {
  if (step === null) return "";

  const stepMap: Record<number, string> = {
    0: "Agreement",
    1: "Deposit Fee",
    2: "Complete",
  };

  return stepMap[step] ?? `Step ${step}`;
}

function getFullName(user: User) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

type ClientTableRowProps = {
  user: User;
  isSendingVerification?: boolean;
  verificationStatusMessage?: string | null;
  isSendingReminder?: boolean;
  reminderStatusMessage?: string | null;
  onOpenVerificationModal: (user: User) => void;
  onOpenReminderModal: (user: User) => void;
};

export default function ClientTableRow({
  user,
  isSendingVerification = false,
  verificationStatusMessage = null,
  isSendingReminder = false,
  reminderStatusMessage = null,
  onOpenVerificationModal,
  onOpenReminderModal,
}: ClientTableRowProps) {
  const isCompleted = user.current_step === 2;

  return (
    <tr className="border-t border-[var(--border)] transition hover:bg-[#faf9f5]">
      <td className="px-6 py-4">
        <Link
          href={`/admin/clients/${user.id}`}
          className="font-medium text-[var(--ink)] hover:text-[var(--accent-dark)] hover:underline"
        >
          {getFullName(user)}
        </Link>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
            user.role === "buyer"
              ? "border-[#a8c8dc] bg-[#edf7fc] text-[#063655]"
              : "border-[#d7d1c3] bg-[#f7f4ed] text-[#665d4f]"
          }`}
        >
          {formatRole(user.role)}
        </span>
      </td>

      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
        {formatStep(user.current_step)}
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpenVerificationModal(user)}
            disabled={user.email_verified || isSendingVerification}
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium transition ${
              user.email_verified
                ? "cursor-not-allowed border-[#a8c8dc] bg-[#edf7fc] text-[#063655]"
                : "cursor-pointer border-[#e8c2bd] bg-[#fff4f2] text-[#9a2f23] hover:bg-[#fee9e5]"
            }`}
          >
            {user.email_verified
              ? "Verified"
              : isSendingVerification
              ? "Sending..."
              : "Not verified"}
          </button>

          {verificationStatusMessage && (
            <span className="text-xs text-gray-500">
              {verificationStatusMessage}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpenReminderModal(user)}
            disabled={isCompleted || isSendingReminder}
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium transition ${
              isCompleted
                ? "cursor-not-allowed border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]"
                : "cursor-pointer border-[#d7d1c3] bg-white text-[var(--accent-dark)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {isCompleted
              ? "Completed"
              : isSendingReminder
              ? "Sending..."
              : "Send reminder"}
          </button>

          {reminderStatusMessage && (
            <span className="text-xs text-gray-500">
              {reminderStatusMessage}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
