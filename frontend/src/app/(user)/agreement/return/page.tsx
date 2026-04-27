"use client";

import { useEffect } from "react";

export default function AgreementReturnPage() {
  useEffect(() => {
    window.parent.postMessage(
      { type: "DOCUSIGN_SIGNING_DONE" },
      window.location.origin,
    );
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
    </div>
  );
}
