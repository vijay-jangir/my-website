"use client";

import { signIn, signOut } from "next-auth/react";

type AuthButtonProps = {
  signedIn?: boolean;
};

export function SignInButton() {
  return (
    <button
      className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      onClick={() => signIn("github", { callbackUrl: "/admin" })}
      type="button"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton({ signedIn = false }: AuthButtonProps) {
  if (!signedIn) {
    return null;
  }

  return (
    <button
      className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium transition hover:border-black/20 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
    >
      Sign out
    </button>
  );
}
