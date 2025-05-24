import { useState } from "react";
import { api } from "../convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export function Settings({ profile }: { profile: any }) {
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState(profile?.name ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name });
      toast.success("Profile name updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-gray-100 px-6 py-12">
      <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded shadow space-y-6">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 p-2 rounded bg-gray-900 border border-gray-700"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
