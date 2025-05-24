import { useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import { IoExitOutline } from "react-icons/io5";
import { IoEnterOutline } from "react-icons/io5";
import ChartDataLabels from "chartjs-plugin-datalabels";
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
  Legend,
  ChartDataLabels
);

export function Dashboard({ profile }: { profile: any }) {
  const currentSession = useQuery(api.workSessions.getCurrentSession);
  const checkIn = useMutation(api.workSessions.checkIn);
  const checkOut = useMutation(api.workSessions.checkOut);

  const [liveDuration, setLiveDuration] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentSession && currentSession.checkIn && !currentSession.checkOut) {
      const updateDuration = () => {
        const now = Date.now();
        setLiveDuration(now - currentSession.checkIn);
      };

      updateDuration(); // initial run
      interval = setInterval(updateDuration, 1000); // update every second
    } else {
      setLiveDuration(null);
    }

    return () => clearInterval(interval);
  }, [currentSession]);

  const [liveTimeDisplay, setLiveTimeDisplay] = useState("00:00:00");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentSession && currentSession.checkIn && !currentSession.checkOut) {
      const updateTime = () => {
        const now = Date.now();
        const elapsed = now - currentSession.checkIn;

        const totalSeconds = Math.floor(elapsed / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
          2,
          "0"
        );
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        setLiveTimeDisplay(`${hours}:${minutes}:${seconds}`);
      };

      updateTime();
      interval = setInterval(updateTime, 1000);
    } else {
      setLiveTimeDisplay("00:00:00");
    }

    return () => clearInterval(interval);
  }, [currentSession]);

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

  // Count sessions per day
  const sessionCounts: { [date: string]: number } = {};
  weekWorkSessions?.forEach((session) => {
    const date = format(session.checkIn, "MM/dd");
    sessionCounts[date] = (sessionCounts[date] || 0) + 1;
  });

  const labels = Object.keys(dailyHours);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Hours Worked",
        data: labels.map((date) => dailyHours[date] ?? 0),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.15)",
        fill: true,
        tension: 0.4, // ✅ Smooth curve
        pointBackgroundColor: "rgb(75, 192, 192)",
        pointRadius: 6,
        datalabels: {
          align: "center",
          anchor: "center",
          color: "#fff",
          font: {
            weight: "bold",
            size: 10,
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
  let summaryTextColor = "text-red-600"; // under 10 hours

  if (totalHours > 20) {
    summaryTextColor = "text-green-600";
  } else if (totalHours > 10) {
    summaryTextColor = "text-yellow-600";
  }

  const averageHours = totalHours / Object.keys(dailyHours).length || 0;

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 mx-auto bg-gray-900 text-gray-100 min-h-screen">
      <div className="">
        <h2 className="text-2xl font-bold mb-8">Welcome, {profile.name}</h2>
        <div className="flex justify-center space-x-4">
          {!currentSession && (
            <button
              onClick={handleCheckIn}
              disabled={!!currentSession}
              className={
                "w-full px-6 py-5 rounded-[6px] text-white text-xl font-bold bg-green-600 hover:bg-green-700"
              }
            >
              <div className="flex items-center justify-center gap-2">
                <span>Check In</span>
                <IoExitOutline className="text-2xl" />
              </div>
            </button>
          )}
          {currentSession && (
            <button
              onClick={handleCheckOut}
              disabled={!currentSession}
              className="w-full px-6 py-5 rounded-[6px] text-white font-bold text-xl bg-rose-600 hover:bg-rose-700 group"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="group-hover:hidden">{liveTimeDisplay}</span>
                <span className="hidden group-hover:inline">Check Out</span>
                <IoEnterOutline className="text-xl" />
              </div>
            </button>
          )}
        </div>
      </div>

      <div className=" p-2">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-[6px]">
            <p className="text-sm text-gray-600">Total Hours (7 days)</p>
            <p className={`${summaryTextColor} text-2xl font-bold`}>
              {totalHours.toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-[6px]">
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className={`${summaryTextColor} text-2xl font-bold`}>
              {averageHours.toFixed(1)}
            </p>
          </div>
        </div>
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
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                },
                x: {
                  ticks: {
                    font: { size: 12 },
                  },
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
                  pointStyle: "circle",
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
              className="flex justify-between items-center border border-gray-700 rounded-lg px-4 py-3 bg-gray-800"
            >
              <div className="space-y-1">
                <p className="flex items-center text-sm text-gray-300 gap-2">
                  <IoEnterOutline className="text-green-600" />
                  <span>Check In: {format(session.checkIn, "h:mm a")}</span>
                </p>
                {session.checkOut && (
                  <p className="flex items-center text-sm text-gray-300 gap-2">
                    <IoExitOutline className="text-red-600" />
                    <span>Check Out: {format(session.checkOut, "h:mm a")}</span>
                  </p>
                )}
              </div>
              {session.checkOut ? (
                <p className="text-sm font-medium text-white whitespace-nowrap">
                  {`${Math.round(session.duration / 1000 / 60)} min`}
                </p>
              ) : session._id === currentSession?._id &&
                liveDuration !== null ? (
                <p className="text-sm font-medium text-green-600 whitespace-nowrap">
                  {`${Math.round(liveDuration / 1000 / 60)} min`}
                </p>
              ) : (
                "--"
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
