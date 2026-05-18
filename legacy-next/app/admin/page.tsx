import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import ResumeLab from "@/components/admin/resume-lab";
import { SignInButton, SignOutButton } from "@/components/admin/auth-buttons";
import { focusDefinitions } from "@/content/portfolio";
import { authOptions } from "@/lib/auth";
import { env, isAuthConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Private tools for tailoring resume variants and reviewing JD analysis.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isAuthConfigured()) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20">
        <section className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Admin setup required
          </p>
          <h1 className="mt-4 text-3xl font-semibold">
            GitHub auth is not configured
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-700 dark:text-white/70">
            Add <code>NEXTAUTH_SECRET</code>, <code>GITHUB_ID</code>,{" "}
            <code>GITHUB_SECRET</code>, and <code>ADMIN_GITHUB_LOGINS</code> to
            unlock the private resume tooling.
          </p>
        </section>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-20">
        <section className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Private admin
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Sign in to continue</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-700 dark:text-white/70">
            This area is reserved for private resume tailoring and JD analysis.
            It does not depend on any public AI endpoint.
          </p>
          <div className="mt-6">
            <SignInButton />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pb-20">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500">
            Private admin
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Resume tailoring lab</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-700 dark:text-white/70">
            Paste a job description, review the deterministic focus scores, and
            generate a resume variant before sending a link or PDF to an
            employer.
          </p>
        </div>
        <SignOutButton signedIn />
      </section>

      <ResumeLab
        focusOptions={focusDefinitions}
        turnstileSiteKey={env.turnstileSiteKey}
      />
    </main>
  );
}
