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
    <tr className="border-t border-gray-200">
      <td className="px-4 py-4">
        <Link
          href={`/admin/clients/${user.id}`}
          className="font-medium text-[#111827] hover:text-[#1d4ed8] hover:underline"
        >
          {getFullName(user)}
        </Link>
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            user.role === "buyer"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {formatRole(user.role)}
        </span>
      </td>

      <td className="px-4 py-4 text-sm text-gray-700">
        {formatStep(user.current_step)}
      </td>

      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpenVerificationModal(user)}
            disabled={user.email_verified || isSendingVerification}
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium transition ${
              user.email_verified
                ? "cursor-not-allowed bg-green-100 text-green-700"
                : "cursor-pointer bg-red-100 text-red-700 hover:bg-red-200"
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

      <td className="px-4 py-4">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onOpenReminderModal(user)}
            disabled={isCompleted || isSendingReminder}
            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium transition ${
              isCompleted
                ? "cursor-not-allowed bg-gray-100 text-gray-500"
                : "cursor-pointer bg-amber-100 text-amber-700 hover:bg-amber-200"
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