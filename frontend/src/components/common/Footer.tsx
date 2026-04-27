export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-6 py-5 text-sm text-[var(--text-muted)] sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div>
          <p className="font-semibold text-[var(--ink)]">
            GodBless Retirement Onboarding Portal
          </p>
          <p className="mt-1">
            Secure internal workspace for onboarding, agreements, and deposit processing.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-left lg:text-right">
          <p>&copy; {new Date().getFullYear()} GodBless Retirement. All rights reserved.</p>
          <p>Confidential and proprietary.</p>
        </div>
      </div>
    </footer>
  );
}
