import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Line } from "react-chartjs-2";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function StaffDashboard({ profile }: { profile: any }) {
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Staff Dashboard</h2>
        <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
        <div className="space-y-4">
          {users?.map((user) => (
            <div
              key={user._id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-600">Role: {user.role}</p>
                <p className="text-sm text-gray-600">
                  Status: {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="space-x-2">
                {!user.isActive && (
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleToggleStatus(user._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Toggle Status
                </button>
                {user.role === "intern" && (
                  <button
                    onClick={() => handlePromote(user._id)}
                    className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Promote to Staff
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {users?.map((user) => (
        <UserAnalytics key={user._id} user={user} />
      ))}
    </div>
  );
}

function UserAnalytics({ user }: { user: any }) {
  const today = new Date();
  const workSessions = useQuery(api.workSessions.getWorkSessions, {
    userId: user.userId,
    startTime: startOfDay(subDays(today, 7)).getTime(),
    endTime: endOfDay(today).getTime(),
  });

  if (!workSessions) return null;

  // Process data for chart
  const dailyHours: { [date: string]: number } = {};
  workSessions.forEach((session) => {
    if (!session.duration) return;
    const date = format(session.checkIn, "MM/dd");
    dailyHours[date] = (dailyHours[date] || 0) + session.duration / 1000 / 60 / 60;
  });

  const chartData = {
    labels: Object.keys(dailyHours),
    datasets: [
      {
        label: "Hours Worked",
        data: Object.values(dailyHours),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const totalHours = Object.values(dailyHours).reduce((a, b) => a + b, 0);
  const averageHours = totalHours / Object.keys(dailyHours).length || 0;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">{user.name}'s Analytics</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Hours (7 days)</p>
          <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Daily Average</p>
          <p className="text-2xl font-bold">{averageHours.toFixed(1)}</p>
        </div>
      </div>
      <div className="h-64">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Hours",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
