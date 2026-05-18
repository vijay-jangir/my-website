import React from "react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-auto mb-10 px-4 text-center text-gray-400">
      <small className="mb-2 block text-xs">
        &copy; {currentYear} Vijay Jangir.
      </small>
      <p className="text-xs leading-6">
        Built with Next.js, Tailwind CSS, Framer Motion, a Wix-backed blog, and
        a zero-cost-first architecture for structured resume views, JD analysis,
        and ATS-safe PDF generation.
      </p>
    </footer>
  );
}
