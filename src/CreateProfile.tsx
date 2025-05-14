"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { FaArrowRight } from "react-icons/fa";

export function CreateProfile() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createProfile = useMutation(api.users.createProfile);

  const formInputClasses =
    "h-12 bg-black/50 rounded-[4px] px-3 font-normal text-ss-light/95 placeholder:text-ss-light/60 border-0 focus:ring-0 focus:outline-none";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProfile({ name });
      toast.success("Profile created! Waiting for approval.");
    } catch (error) {
      toast.error("Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center rounded-2xl shadow-md lg:p-12 p-8 bg-ss-blue">
      <h2 className="text-4xl font-bold mb-4 text-ss-white">Create Profile</h2>
      <p className="text-lg text-gray-300 mb-8">
        Enter your full name to complete setup.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={formInputClasses}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[4px] text-white font-semibold transition-colors duration-200
          bg-indigo-600 hover:bg-indigo-700
          ${submitting ? "opacity-50 cursor-not-allowed" : ""}
        `}
        >
          Create Profile
          <FaArrowRight className="text-lg" />
        </button>
      </form>
    </div>
  );
}
