import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import { MdBlockFlipped } from "react-icons/md";
import { CiCircleCheck } from "react-icons/ci";

export function UserManagement({ profile }: { profile: any }) {
  const users = useQuery(api.users.getAllUsers);
  const approveUser = useMutation(api.users.approveUser);
  const toggleUserStatus = useMutation(api.users.toggleUserStatus);
  const promoteToStaff = useMutation(api.users.promoteToStaff);

  const handleApprove = async (profileId: Id<"profiles">) => {
    try {
      await approveUser({ profileId });
      toast.success("User approved successfully");
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleToggleStatus = async (profileId: Id<"profiles">) => {
    try {
      await toggleUserStatus({ profileId });
      toast.success("User status updated");
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handlePromote = async (profileId: Id<"profiles">) => {
    try {
      await promoteToStaff({ profileId });
      toast.success("User promoted to staff");
    } catch (error) {
      toast.error("Failed to promote user");
    }
  };

  return (
    <div>
      <div className="space-y-4">
        {users?.map((user) => (
          <div
            key={user._id}
            className="border border-gray-700 rounded-[4px] p-4 flex justify-between items-center bg-gray-800 text-gray-100"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-300">Role: {user.role}</p>
              <p className="text-sm text-gray-300">
                Status: {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-40">
              {" "}
              {/* fixed width for the button group */}
              {!user.isActive && (
                <button
                  onClick={() => handleApprove(user._id)}
                  className="w-full px-3 py-1 bg-green-600 text-white rounded-[6px] hover:bg-green-700 "
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Approve</span>
                    <CiCircleCheck />
                  </div>
                </button>
              )}
              {user.isActive && (
                <button
                  onClick={() => handleToggleStatus(user._id)}
                  className="w-full px-3 py-1 bg-red-600 text-white rounded-[6px] hover:bg-red-700"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Block</span>
                    <MdBlockFlipped className="text-lg" />
                  </div>
                </button>
              )}
              {user.role === "intern" && (
                <button
                  onClick={() => handlePromote(user._id)}
                  className="w-full px-3 py-1 bg-purple-600 text-white rounded-[6px] hover:bg-purple-700"
                >
                  Promote to Staff
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
