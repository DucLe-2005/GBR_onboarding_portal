"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import UpdateUserProfileModal from "@/components/admin/UserProfileModal";
import { getUserById } from "@/service/users.service";
import type { User } from "@/types/user";
import AppLoadingScreen from "@/components/common/AppLoadingScreen";

function getFullName(user: User) {
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  return fullName || user.email;
}

const progressSteps = [
  ["Client Profile", "Completed", "Apr 17, 2025"],
  ["Documents", "Completed", "Apr 18, 2025"],
  ["Agreements", "In Progress", ""],
  ["Funding", "Not Started", ""],
  ["Review", "Not Started", ""],
  ["Activate", "Not Started", ""],
] as const;

const taskRows = [
  ["Review Client Profile", "Sarah Thompson", "Apr 17, 2025", "Completed", "-"],
  ["Collect Client Documents", "John Miller", "Apr 18, 2025", "Completed", "-"],
  ["Review & Sign Agreements", "John Miller", "Apr 22, 2025", "In Progress", "High"],
  ["Fund Account", "John Miller", "Apr 29, 2025", "Pending", "High"],
  ["Compliance Review", "Compliance Team", "May 1, 2025", "Pending", "Medium"],
  ["Account Activation", "Operations Team", "May 2, 2025", "Pending", "Medium"],
] as const;

const documentRows = [
  ["Pre-Application", "Completed", "Apr 17, 2025"],
  ["ID Verification", "Completed", "Apr 17, 2025"],
  ["Account Application", "Completed", "Apr 18, 2025"],
  ["Disclosures & Notices", "In Progress", "Apr 18, 2025"],
  ["IRA Adoption Agreement", "Pending", "-"],
  ["Custodial Agreement", "Pending", "-"],
  ["Beneficiary Designation", "Pending", "-"],
] as const;

const activityRows = [
  ["Apr 18, 2025  2:14 PM", "John Miller", "Uploaded document: Account Application", "View"],
  ["Apr 18, 2025  11:03 AM", "John Miller", "Completed task: Collect Client Documents", "View"],
  ["Apr 17, 2025  4:28 PM", "Sarah Thompson", "Task completed: Review Client Profile", "View"],
  ["Apr 17, 2025  4:15 PM", "System", "Onboarding process started", "-"],
] as const;

function statusClass(status: string) {
  if (status === "Completed") {
    return "border-[#a8c8dc] bg-[#edf7fc] text-[#063655]";
  }

  if (status === "In Progress") {
    return "border-[#0b5e89] bg-white text-[#063655]";
  }

  return "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink)]";
}

export default function AdminClientDetailPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const hasFetchedRef = useRef(false);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function loadUser() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserById(userId);
        setUser(data);
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError("Failed to load user details.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-6 lg:p-10">
        <AppLoadingScreen
          title="Loading user details"
          description="Fetching the selected client profile and account information."
          variant="admin"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="rounded border border-red-200 bg-red-50 p-8">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-10">
        <div className="panel p-8">
          <p className="text-sm text-[var(--text-muted)]">User not found.</p>
        </div>
      </div>
    );
  }

  const initials = `${user.first_name?.[0] || user.email?.[0] || "J"}${user.last_name?.[0] || "D"}`.toUpperCase();

  return (
    <div className="app-container">
      <div className="mx-auto max-w-[1320px]">
        <Link
          href="/admin/clients"
          className="inline-flex items-center text-sm font-medium text-[var(--ink)] hover:text-[var(--accent-dark)]"
        >
          &larr; Back to Clients
        </Link>

        <div className="mt-5 flex flex-col gap-3">
          <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-white text-2xl font-medium text-[var(--ink)]">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-semibold leading-tight text-[var(--ink)]">
                  {getFullName(user)}
                </h1>
                <p className="mt-1 text-sm text-[var(--ink)]">
                  Individual Retirement Account (IRA)
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  ONB-2025-0417 <span className="mx-1">•</span> Started Apr 17, 2025
                </p>
              </div>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-[120px_100px_120px_150px_100px] lg:items-center">
              <div className="border-l border-[var(--border)] pl-5">
                <p className="text-xs text-[var(--text-muted)]">Advisor</p>
                <p className="mt-1 font-medium text-[var(--ink)]">Sarah Thompson</p>
              </div>
              <div className="border-l border-[var(--border)] pl-5">
                <p className="text-xs text-[var(--text-muted)]">Branch</p>
                <p className="mt-1 font-medium text-[var(--ink)]">Dallas, TX</p>
              </div>
              <div className="border-l border-[var(--border)] pl-5">
                <p className="text-xs text-[var(--text-muted)]">Account Type</p>
                <p className="mt-1 font-medium text-[var(--ink)]">Traditional IRA</p>
              </div>
              <div className="border-l border-[var(--border)] pl-5">
                <p className="text-xs text-[var(--text-muted)]">Onboarding Status</p>
                <span className="mt-1 inline-flex rounded border border-[var(--accent)] px-4 py-1 text-xs font-medium text-[var(--accent-dark)]">
                  In Progress
                </span>
              </div>
              <button className="inline-flex h-9 items-center justify-center gap-2 rounded border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]">
                Actions <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </section>

          <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
            <section className="panel">
              <div className="panel-header">
                <h2 className="text-base font-semibold text-[var(--ink)]">Onboarding Progress</h2>
              </div>
              <div className="px-8 py-6">
                <div className="relative grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="absolute left-[8%] right-[8%] top-4 hidden h-px bg-[var(--border)] lg:block" />
                  <div className="absolute left-[8%] top-4 hidden h-px w-[31%] bg-[var(--accent)] lg:block" />
                  {progressSteps.map(([label, state, date], index) => {
                    const done = index < 2;
                    const active = index === 2;
                    return (
                      <div key={label} className="relative z-10 text-center">
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            done || active
                              ? "bg-[var(--accent)] text-white"
                              : "bg-[#e8e6e0] text-[var(--ink)]"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : index + 1}
                        </div>
                        <p className="mt-4 text-sm font-medium text-[var(--ink)]">{label}</p>
                        <p className={`mt-1 text-xs ${done || active ? "text-[var(--accent-dark)]" : "text-[var(--text-muted)]"}`}>
                          {state}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{date || "\u00a0"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="panel overflow-hidden">
              <div className="panel-header">
                <h2 className="text-base font-semibold text-[var(--ink)]">Documents & Agreements</h2>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {documentRows.map(([name, status, date]) => (
                  <div key={name} className="grid grid-cols-[1fr_100px_76px] items-center gap-3 px-4 py-2.5 text-sm">
                    <div className="flex items-center gap-3 text-[var(--ink)]">
                      <FileText className="h-4 w-4" strokeWidth={1.8} />
                      {name}
                    </div>
                    <span className={status === "Pending" ? "text-[var(--ink)]" : "text-[var(--accent-dark)]"}>
                      {status}
                    </span>
                    <span className="text-right text-[var(--text-muted)]">{date}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <button className="text-sm font-medium text-[var(--accent-dark)]">View all documents</button>
              </div>
            </section>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
            <section className="panel overflow-hidden">
              <div className="panel-header">
                <h2 className="text-base font-semibold text-[var(--ink)]">Tasks</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--ink)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Task</th>
                      <th className="px-4 py-3 font-medium">Owner</th>
                      <th className="px-4 py-3 font-medium">Due Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {taskRows.map(([task, owner, due, status, priority]) => (
                      <tr key={task}>
                        <td className="px-4 py-3 text-[var(--ink)]">{task}</td>
                        <td className="px-4 py-3 text-[var(--ink)]">{owner}</td>
                        <td className="px-4 py-3 text-[var(--ink)]">{due}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded border px-2 py-1 text-xs ${statusClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className={priority === "High" ? "px-4 py-3 text-[#d6421f]" : priority === "Medium" ? "px-4 py-3 text-[#c26b00]" : "px-4 py-3 text-[var(--text-muted)]"}>
                          {priority}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <button className="text-sm font-medium text-[var(--accent-dark)]">View all tasks</button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--ink)]">Client Profile Summary</h2>
                <button className="text-sm font-medium text-[var(--accent-dark)]" onClick={() => setIsUpdateModalOpen(true)}>
                  Edit
                </button>
              </div>
              <div className="grid gap-6 px-4 py-4 text-sm md:grid-cols-2">
                <dl className="grid grid-cols-[86px_1fr] gap-x-4 gap-y-2">
                  <dt className="text-[var(--text-muted)]">Name</dt>
                  <dd>{getFullName(user)}</dd>
                  <dt className="text-[var(--text-muted)]">Date of Birth</dt>
                  <dd>May 14, 1962 (62)</dd>
                  <dt className="text-[var(--text-muted)]">Email</dt>
                  <dd className="break-all">{user.email}</dd>
                  <dt className="text-[var(--text-muted)]">Phone</dt>
                  <dd>{user.phone_number || "(214) 555-0198"}</dd>
                  <dt className="text-[var(--text-muted)]">Address</dt>
                  <dd>1234 Maple Rd.<br />Dallas, TX 75201</dd>
                </dl>
                <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 border-l border-[var(--border)] pl-6">
                  <dt className="text-[var(--text-muted)]">Citizenship</dt>
                  <dd>U.S. Citizen</dd>
                  <dt className="text-[var(--text-muted)]">Tax ID (SSN)</dt>
                  <dd>XXX-XX-6789</dd>
                  <dt className="text-[var(--text-muted)]">Marital Status</dt>
                  <dd>Married</dd>
                  <dt className="text-[var(--text-muted)]">Employment Status</dt>
                  <dd>Retired</dd>
                  <dt className="text-[var(--text-muted)]">Annual Income</dt>
                  <dd>$120,000 - $150,000</dd>
                  <dt className="text-[var(--text-muted)]">Net Worth</dt>
                  <dd>$1,000,000 - $2,500,000</dd>
                </dl>
              </div>
            </section>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.35fr_1fr]">
            <section className="panel overflow-hidden">
              <div className="panel-header">
                <h2 className="text-base font-semibold text-[var(--ink)]">Activity Feed</h2>
              </div>
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Activity</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {activityRows.map(([date, actor, activity, details]) => (
                    <tr key={`${date}-${activity}`}>
                      <td className="px-4 py-3">{date}</td>
                      <td className="px-4 py-3">{actor}</td>
                      <td className="px-4 py-3">{activity}</td>
                      <td className="px-4 py-3 text-[var(--accent-dark)]">{details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <button className="text-sm font-medium text-[var(--accent-dark)]">View full activity</button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--ink)]">Internal Notes</h2>
                <button className="inline-flex h-8 items-center gap-2 rounded border border-[var(--accent)] px-3 text-sm font-medium text-[var(--accent-dark)]">
                  <Plus className="h-4 w-4" /> Add Note
                </button>
              </div>
              <div className="space-y-5 px-4 py-5 text-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">Apr 18, 2025&nbsp;&nbsp; 2:15 PM <span className="mx-1">•</span> Sarah Thompson</p>
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[var(--ink)]">Client uploaded remaining documents. Waiting on e-signatures for agreements.</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)]">Apr 17, 2025&nbsp;&nbsp; 4:20 PM <span className="mx-1">•</span> Sarah Thompson</p>
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-[var(--ink)]">Spoke with client about IRA options and next steps.</p>
                </div>
              </div>
              <div className="border-t border-[var(--border)] px-4 py-3">
                <button className="text-sm font-medium text-[var(--accent-dark)]">View all notes</button>
              </div>
            </section>
          </div>
        </div>
      </div>

      <UpdateUserProfileModal
        open={isUpdateModalOpen}
        user={user}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdated={(updatedUser) => {
          setUser(updatedUser);
          setIsUpdateModalOpen(false);
        }}
      />
    </div>
  );
}
