"use client";

import { useEffect, useMemo, useState } from "react";

import ClientTableRow from "@/components/admin/ClientTableRow";
import { Button } from "@/components/ui/button";
import {
  getUsers,
  resendVerificationEmail,
  sendReminderEmail,
} from "@/service/users.service";
import type { User } from "@/types/user";
import AppLoadingScreen from "@/components/common/AppLoadingScreen";

function getFullName(user: User) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

function getStepLabel(step: number | null) {
  const stepMap: Record<number, string> = {
    0: "Agreement",
    1: "Deposit Fee",
    2: "Complete",
  };

  if (step === null) return "Unknown";
  return stepMap[step] ?? `Step ${step}`;
}

export default function AdminClientsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isSendingReminderForUserId, setIsSendingReminderForUserId] = useState<
    string | null
  >(null);

  const [verificationStatusByUserId, setVerificationStatusByUserId] = useState<
    Record<string, string>
  >({});

  const [reminderStatusByUserId, setReminderStatusByUserId] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    async function loadClients() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load clients:", err);
        setError("Failed to load clients.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadClients();
  }, []);

  const clients = useMemo(() => {
    return users.filter(
      (user) => user.role === "buyer" || user.role === "seller",
    );
  }, [users]);

  const verifiedCount = useMemo(() => {
    return clients.filter((u) => u.email_verified).length;
  }, [clients]);

  const agreementCount = useMemo(() => {
    return clients.filter((u) => u.current_step === 0).length;
  }, [clients]);

  const depositCount = useMemo(() => {
    return clients.filter((u) => u.current_step === 1).length;
  }, [clients]);

  const completedCount = useMemo(() => {
    return clients.filter((u) => u.current_step === 2).length;
  }, [clients]);

  function openVerificationModal(user: User) {
    if (user.email_verified) return;
    setSelectedUser(user);
    setIsVerificationModalOpen(true);
  }

  function closeVerificationModal() {
    if (isSendingVerification) return;
    setIsVerificationModalOpen(false);
    setSelectedUser(null);
  }

  function openReminderModal(user: User) {
    if (user.current_step === 2) return;
    setSelectedUser(user);
    setIsReminderModalOpen(true);
  }

  function closeReminderModal() {
    if (isSendingReminder) return;
    setIsReminderModalOpen(false);
    setSelectedUser(null);
  }

  async function handleSendVerification() {
    if (!selectedUser) return;

    try {
      setIsSendingVerification(true);

      const response = await resendVerificationEmail(selectedUser.id);

      setVerificationStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: response.message,
      }));

      setIsVerificationModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to send verification email:", err);

      setVerificationStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: "Failed to send verification email.",
      }));
    } finally {
      setIsSendingVerification(false);
    }
  }

  async function handleSendReminder() {
    if (!selectedUser) return;

    try {
      setIsSendingReminder(true);
      setIsSendingReminderForUserId(selectedUser.id);

      const response = await sendReminderEmail(selectedUser.id);

      setReminderStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: response.message,
      }));

      setIsReminderModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to send reminder email:", err);

      setReminderStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: "Failed to send reminder email.",
      }));
    } finally {
      setIsSendingReminder(false);
      setIsSendingReminderForUserId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-8 text-white lg:px-8">
            <h1 className="text-3xl font-semibold">Client Dashboard</h1>
            <p className="mt-2 text-sm text-slate-200">
              Monitor onboarding progress and manage client accounts.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[#E5C07B] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#B8962E]">All Clients</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {clients.length}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-orange-700">Verified</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {verifiedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-orange-700">
              Email confirmed
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Agreement</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {agreementCount}
            </p>
            <p className="mt-1 text-sm font-medium text-blue-700">Step 0</p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-purple-700">Deposit Fee</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {depositCount}
            </p>
            <p className="mt-1 text-sm font-medium text-purple-700">Step 1</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {completedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-700">Step 2</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Client Accounts
            </h2>
          </div>

          {isLoading ? (
            <AppLoadingScreen
              title="Loading clients"
              description="Fetching all client accounts and onboarding progress."
              variant="admin"
            />
          ) : error ? (
            <div className="px-6 py-10 text-sm text-red-600">{error}</div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              No clients found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="text-sm text-slate-600">
                    <th className="px-6 py-4 font-semibold">User Name</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Current Step</th>
                    <th className="px-6 py-4 font-semibold">Email Confirmed</th>
                    <th className="px-6 py-4 font-semibold">Reminder</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {clients.map((user) => (
                    <ClientTableRow
                      key={user.id}
                      user={user}
                      isSendingVerification={
                        isSendingVerification && selectedUser?.id === user.id
                      }
                      verificationStatusMessage={
                        verificationStatusByUserId[user.id] ?? null
                      }
                      isSendingReminder={isSendingReminderForUserId === user.id}
                      reminderStatusMessage={
                        reminderStatusByUserId[user.id] ?? null
                      }
                      onOpenVerificationModal={openVerificationModal}
                      onOpenReminderModal={openReminderModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {isVerificationModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Send verification email
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Send verification email to{" "}
              <span className="font-medium text-[#111827]">
                {getFullName(selectedUser)}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-gray-500">{selectedUser.email}</p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={closeVerificationModal}
                disabled={isSendingVerification}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? "Sending..." : "Send Verification"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isReminderModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Send reminder email
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Send a reminder email to{" "}
              <span className="font-medium text-[#111827]">
                {getFullName(selectedUser)}
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-gray-500">{selectedUser.email}</p>
            <p className="mt-2 text-sm text-gray-500">
              Next step: {getStepLabel(selectedUser.current_step)}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={closeReminderModal}
                disabled={isSendingReminder}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={handleSendReminder}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? "Sending..." : "Send Reminder"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}