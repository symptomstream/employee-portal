"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-[6px] transition-colors bg-rose-600 hover:bg-rose-700 text-white"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
