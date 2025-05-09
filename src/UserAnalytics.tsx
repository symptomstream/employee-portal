import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Line } from "react-chartjs-2";

export function UserAnalytics({ user }: { user: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const today = new Date();
  const workSessions = useQuery(api.workSessions.getWorkSessions, {
    userId: user.userId,
    startTime: startOfDay(subDays(today, 7)).getTime(),
    endTime: endOfDay(today).getTime(),
  });

  if (!workSessions) return null;

  const dailyHours: { [date: string]: number } = {};
  workSessions.forEach((session) => {
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
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const totalHours = Object.values(dailyHours).reduce((a, b) => a + b, 0);
  const averageHours = totalHours / Object.keys(dailyHours).length || 0;

  return (
    <div className="bg-ss-light shadow rounded-[6px] p-6">
      <div className="flex flex-col gap-4">
        <div className="w-full text-left">
          <h3 className="text-xl font-semibold">{user.name}</h3>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Hours (7 days)</p>
              <p className="text-xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-xl font-bold">{averageHours.toFixed(1)}</p>
            </div>
          </div>

          <button
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t">
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    titleColor: "#1e293b",
                    bodyColor: "#1e293b",
                    borderColor: "#e2e8f0",
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                      label: function (context) {
                        return `${context.parsed.y.toFixed(1)} hours`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Hours",
                      font: {
                        weight: "bold",
                      },
                    },
                    grid: {
                      color: "rgba(0, 0, 0, 0.05)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                  },
                },
                elements: {
                  line: {
                    tension: 0.4,
                  },
                  point: {
                    radius: 4,
                    hoverRadius: 6,
                    backgroundColor: "white",
                    borderWidth: 2,
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
