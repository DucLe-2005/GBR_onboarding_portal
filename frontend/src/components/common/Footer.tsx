export default function Footer() {
    return (
      <footer className="w-full border-t border-[#e5e7eb] bg-[#f3f4f6]">
        <div className="mx-auto max-w-screen-xl px-6 py-6 text-center">
          <p className="text-sm text-[#5f7396]">
            © {new Date().getFullYear()} GodBless Retirement. All rights reserved.
          </p>
          <p className="mt-1 text-sm text-[#5f7396]">
            Confidential &amp; Proprietary.
          </p>
        </div>
      </footer>
    );
  }