import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import { IoExitOutline } from "react-icons/io5";
import { IoEnterOutline } from "react-icons/io5";
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

export function Dashboard({ profile }: { profile: any }) {
  const currentSession = useQuery(api.workSessions.getCurrentSession);
  const checkIn = useMutation(api.workSessions.checkIn);
  const checkOut = useMutation(api.workSessions.checkOut);

  const today = new Date();
  // Get today's sessions
  const todayWorkSessions = useQuery(api.workSessions.getWorkSessions, {
    userId: profile.userId,
    startTime: startOfDay(today).getTime(),
    endTime: endOfDay(today).getTime(),
  });

  // Get last 7 days of sessions for the chart
  const weekWorkSessions = useQuery(api.workSessions.getWorkSessions, {
    userId: profile.userId,
    startTime: startOfDay(subDays(today, 7)).getTime(),
    endTime: endOfDay(today).getTime(),
  });

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success("Checked in successfully");
    } catch (error) {
      toast.error("Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success("Checked out successfully");
    } catch (error) {
      toast.error("Failed to check out");
    }
  };

  // Process data for chart
  const dailyHours: { [date: string]: number } = {};
  weekWorkSessions?.forEach((session) => {
    if (!session.duration) return;
    const date = format(session.checkIn, "MM/dd");
    dailyHours[date] =
      (dailyHours[date] || 0) + session.duration / 1000 / 60 / 60;
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
    <div className="space-y-6">
      <div className="">
        <h2 className="text-2xl font-bold mb-4">Welcome, {profile.name}</h2>
        <div className="flex justify-center space-x-4">
          {!currentSession && (
            <button
              onClick={handleCheckIn}
              disabled={!!currentSession}
              className={
                "px-6 py-2 rounded-[6px] text-white font-medium bg-green-600 hover:bg-green-700"
              }
            >
              <div className="flex items-center justify-center gap-2">
                <span>Check In</span>
                <IoExitOutline className="text-xl" />
              </div>
            </button>
          )}
          {currentSession && (
            <button
              onClick={handleCheckOut}
              disabled={!currentSession}
              className={
                "px-6 py-2 rounded-[6px]  text-white font-medium bg-rose-600 hover:bg-rose-700"
              }
            >
              <div className="flex items-center justify-center gap-2">
                <span>Check Out</span>
                <IoEnterOutline className="text-xl" />
              </div>
            </button>
          )}
        </div>
      </div>

      <div className=" p-2">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-[6px]">
            <p className="text-sm text-gray-600">Total Hours (7 days)</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-[6px]">
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

      <div className=" rounded-xl  space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Today's Work Sessions
        </h3>

        {todayWorkSessions && todayWorkSessions.length > 0 ? (
          [...todayWorkSessions].reverse().map((session) => (
            <div
              key={session._id}
              className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-3 bg-gray-50"
            >
              <div className="space-y-1">
                <p className="flex items-center text-sm text-gray-700 gap-2">
                  <IoEnterOutline className="text-green-600" />
                  <span>Check In: {format(session.checkIn, "h:mm a")}</span>
                </p>
                {session.checkOut && (
                  <p className="flex items-center text-sm text-gray-700 gap-2">
                    <IoExitOutline className="text-red-600" />
                    <span>Check Out: {format(session.checkOut, "h:mm a")}</span>
                  </p>
                )}
              </div>
              {session.duration && (
                <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                  {Math.round(session.duration / 1000 / 60)} min
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center italic">
            No work sessions today
          </p>
        )}
      </div>
    </div>
  );
}
