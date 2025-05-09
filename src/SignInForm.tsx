"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { FaArrowRight } from "react-icons/fa";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const formInputClasses =
    "h-12 bg-black/50 rounded-[4px] px-3 font-normal text-ss-light/95 placeholder:text-ss-light/60 border-0 focus:ring-0 focus:outline-none";

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4  w-full"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((_error) => {
            const toastTitle =
              flow === "signIn"
                ? "Could not sign in, did you mean to sign up?"
                : "Could not sign up, did you mean to sign in?";
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className={formInputClasses}
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className={formInputClasses}
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] text-white font-semibold transition-colors duration-200
    ${flow === "signIn" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-cyan-600 hover:bg-cyan-700"}
    ${submitting ? "opacity-50 cursor-not-allowed" : ""}
  `}
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
          <FaArrowRight className="text-lg" />
        </button>
        <div className="text-center text-sm text-slate-300">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-blue-500 cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
    </div>
  );
}
