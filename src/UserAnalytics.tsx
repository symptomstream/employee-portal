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

  const sessionCounts: { [date: string]: number } = {};
  workSessions.forEach((session) => {
    const date = format(session.checkIn, "MM/dd");
    sessionCounts[date] = (sessionCounts[date] || 0) + 1;
  });

  const hasActiveSession = workSessions.some(
    (session) => session.checkOut === undefined
  );

  const labels = Object.keys(dailyHours);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Hours Worked",
        data: labels.map((date) => dailyHours[date] ?? 0),
        borderColor: "#4f46e5", // indigo-600
        backgroundColor: "rgba(99, 102, 241, 0.15)", // translucent indigo
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: "#c7d2fe", // indigo-200
        pointBorderColor: "#6366f1", // indigo-500
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        datalabels: {
          align: "top",
          anchor: "end",
          color: "#f9fafb", // white/gray-50
          backgroundColor: "#1e293b", // slate-800
          borderRadius: 6,
          padding: 6,
          font: {
            weight: "bold",
            size: 14,
          },
          formatter: function (value, context) {
            const date = context.chart.data.labels?.[context.dataIndex];
            return sessionCounts[date] ?? "";
          },
        },
      },
    ],
  };

  const totalHours = Object.values(dailyHours).reduce((a, b) => a + b, 0);
  const averageHours = totalHours / Object.keys(dailyHours).length || 0;

  return (
    <div
      className="bg-gray-800/80 shadow rounded-[6px] p-6 border border-gray-600 backdrop-blur-md cursor-pointer transition-colors hover:bg-gray-700/30"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <h3 className="text-xl font-semibold">{user.name}</h3>
          {hasActiveSession && (
            <span title="Active Session" className="relative flex h-3 w-3">
              <span className="animate-pulseDot absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
          )}
        </div>
        <div className="flex justify-between items-center px-2 py-1 rounded-md">
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-sm text-gray-300">Total Hours (7 days)</p>
              <p className="text-xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Daily Average</p>
              <p className="text-xl font-bold">{averageHours.toFixed(1)}</p>
            </div>
          </div>

          <div className="ml-4 p-2">
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
          </div>
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
                animation: {
                  duration: 800,
                  easing: "easeOutQuart",
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  datalabels: {},
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
                        const date = context.label;
                        const hours = context.formattedValue;
                        const count = sessionCounts[date] ?? 0;
                        return `Hours: ${hours}, Sessions: ${count}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    suggestedMax: 8,
                    ticks: {
                      stepSize: 1,
                      font: { size: 12 },
                    },
                    title: {
                      display: true,
                      text: "Hours",
                      font: { weight: "bold", size: 14 },
                    },
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                  x: {
                    ticks: {
                      font: { size: 12 },
                    },
                    grid: {
                      color: "rgba(255, 255, 255, 0.05)",
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
                    pointStyle: "circle",
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
