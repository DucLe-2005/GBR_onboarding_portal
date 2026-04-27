"use client";

import { useEffect, useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";

import CreateUserForm from "@/components/admin/CreateUserForm";
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
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
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

  useEffect(() => {
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
    <div className="app-page min-h-screen">
      <div className="app-container max-w-7xl space-y-6">
        <section className="panel">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-dark)]">
                Admin workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[var(--ink)]">Client Dashboard</h1>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Monitor onboarding progress and manage client accounts.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsCreateUserModalOpen(true)}
              className="w-full gap-2 lg:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Create User
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="panel p-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">All Clients</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {clients.length}
            </p>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">Verified</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {verifiedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--accent-dark)]">
              Email confirmed
            </p>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">Agreement</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {agreementCount}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">Step 0</p>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">Deposit Fee</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {depositCount}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">Step 1</p>
          </div>

          <div className="panel p-5">
            <p className="text-sm font-medium text-[var(--text-muted)]">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {completedCount}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--accent-dark)]">Step 2</p>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="panel-header">
            <h2 className="text-xl font-semibold text-[var(--ink)]">
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
                <thead className="bg-[var(--surface-muted)]">
                  <tr className="text-sm text-[var(--text-muted)]">
                    <th className="px-6 py-4 font-semibold">User Name</th>
                    <th className="px-6 py-4 font-semibold">Role</th>
                    <th className="px-6 py-4 font-semibold">Current Step</th>
                    <th className="px-6 py-4 font-semibold">Email Confirmed</th>
                    <th className="px-6 py-4 font-semibold">Reminder</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
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

      {isCreateUserModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="relative max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setIsCreateUserModalOpen(false)}
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded border border-[var(--border)] bg-white text-[var(--ink)] transition hover:bg-[var(--surface-muted)]"
              aria-label="Close create user modal"
            >
              <X className="h-4 w-4" />
            </button>

            <CreateUserForm
              onCreated={() => {
                setIsCreateUserModalOpen(false);
                void loadClients();
              }}
            />
          </div>
        </div>
      ) : null}

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
