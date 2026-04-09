"use client";

import { useEffect, useMemo, useState } from "react";

import ClientTableRow from "@/components/admin/ClientTableRow";
import { Button } from "@/components/ui/button";
import { getUsers, resendVerificationEmail } from "@/service/users.service";
import type { User } from "@/types/user";

function getFullName(user: User) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

export default function AdminClientsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [statusByUserId, setStatusByUserId] = useState<Record<string, string>>({});

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

    loadClients();
  }, []);

  const clients = useMemo(() => {
    return users.filter((user) => user.role === "buyer" || user.role === "seller");
  }, [users]);

  function openVerificationModal(user: User) {
    if (user.email_verified) return;
    setSelectedUser(user);
    setIsModalOpen(true);
  }

  function closeVerificationModal() {
    if (isSendingVerification) return;
    setIsModalOpen(false);
    setSelectedUser(null);
  }

  async function handleSendVerification() {
    if (!selectedUser) return;

    try {
      setIsSendingVerification(true);

      const response = await resendVerificationEmail(selectedUser.id);

      setStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: response.message,
      }));

      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to send verification email:", err);

      setStatusByUserId((prev) => ({
        ...prev,
        [selectedUser.id]: "Failed to send verification email.",
      }));
    } finally {
      setIsSendingVerification(false);
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111827]">Client Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage and review client accounts from this view.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Clients</h2>
            <p className="mt-1 text-sm text-gray-500">
              Buyers and sellers currently in the onboarding system.
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {clients.length} Clients
          </span>
        </div>

        {isLoading ? (
          <div className="px-6 py-10 text-sm text-gray-500">Loading clients...</div>
        ) : error ? (
          <div className="px-6 py-10 text-sm text-red-600">{error}</div>
        ) : clients.length === 0 ? (
          <div className="px-6 py-10 text-sm text-gray-500">No clients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-600">
                  <th className="px-4 py-3 font-medium">User Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Current Step</th>
                  <th className="px-4 py-3 font-medium">Email Confirmed</th>
                </tr>
              </thead>

              <tbody>
                {clients.map((user) => (
                  <ClientTableRow
                    key={user.id}
                    user={user}
                    isSending={
                      isSendingVerification && selectedUser?.id === user.id
                    }
                    statusMessage={statusByUserId[user.id] ?? null}
                    onOpenVerificationModal={openVerificationModal}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#111827]">
              Send verification email
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Do you want to send a verification email to{" "}
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
    </div>
  );
}