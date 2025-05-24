import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { CreateProfile } from "./CreateProfile";
import { Dashboard } from "./Dashboard";
import { useState, useEffect, useRef } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { Line } from "react-chartjs-2";
import { Id } from "../convex/_generated/dataModel";
import { useSwipeable } from "react-swipeable";
import { UserManagement } from "./UserManagement";
import { Analytics } from "./Analytics";
import ChartDataLabels from "chartjs-plugin-datalabels";
import SidebarLayout from "./SidebarLayout";

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

function Content({ profile, activeTab }: { profile: any; activeTab: string }) {
  if (profile === undefined) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 bg-gray-900 text-gray-100 min-h-[calc(100vh-64px)]">
      <Unauthenticated>
        <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 overflow-y-auto">
          <div className="w-full text-center max-w-2xl mx-auto rounded-2xl shadow-md lg:p-12 p-8 bg-gray-800">
            <h1 className="text-4xl font-bold mb-4 text-ss-white">Welcome</h1>
            <p className="text-xl text-gray-300 mb-8">
              Sign in to access your dashboard
            </p>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {profile === null ? (
          <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 overflow-y-auto">
            <CreateProfile />
          </div>
        ) : profile === undefined ? (
          <div>Loading...</div>
        ) : !profile.isActive ? (
          <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 overflow-y-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4 text-gray-100">
                Account Pending Approval
              </h1>
              <p className="text-gray-300">
                Your account is currently inactive. Please wait for a staff
                member to approve your account.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <div className="w-full max-w-3xl p-4">
              {activeTab === "Dashboard" && <Dashboard profile={profile} />}
              {activeTab === "Users" && profile.role === "staff" && (
                <UserManagement profile={profile} />
              )}
              {activeTab === "Analytics" && profile.role === "staff" && (
                <Analytics profile={profile} />
              )}
            </div>
          </div>
        )}
      </Authenticated>
    </div>
  );
}

function App() {
  const profile = useQuery(api.users.getProfile);
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <SidebarLayout
      profile={profile}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <main>
        <div>
          <Content profile={profile} activeTab={activeTab} />
        </div>
      </main>
      <Toaster />
    </SidebarLayout>
  );
}

export function StaffContent({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<
    "attendance" | "users" | "analytics"
  >("attendance");

  const tabs: ("attendance" | "users" | "analytics")[] = [
    "attendance",
    "users",
    "analytics",
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    }
  }, [activeTab]); // Re-run on tab change

  const cycleNextTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };

  const cyclePrevTab = () => {
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevIndex]);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: cycleNextTab,
    onSwipedRight: cyclePrevTab,
    trackMouse: true,
  });

  return (
    <div
      ref={containerRef}
      className={`h-[calc(100vh-64px)] bg-slate-200 overflow-y-auto ${
        isOverflowing ? "pt-36" : "pt-6"
      } flex flex-col items-center`}
    >
      {/* Always horizontal tabs */}
      <div className="border-b border-gray-200 lg:hidden">
        <nav className="flex justify-center -mb-px space-x-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab === "attendance"
                ? "Attendance"
                : tab === "users"
                  ? "Users Management"
                  : "Analytics"}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile: swipeable, show one at a time */}
      <div className="block lg:hidden mt-4" {...swipeHandlers}>
        {activeTab === "attendance" && <Dashboard profile={profile} />}
        {activeTab === "users" && <UserManagement profile={profile} />}
        {activeTab === "analytics" && <Analytics profile={profile} />}
      </div>

      {/* Desktop: show all three in grid layout */}
      <div className="hidden lg:grid lg:grid-cols-3 divide-x divide-gray-400">
        <div className="w-full text-center max-w-2xl mx-auto lg:p-4 ">
          <Dashboard profile={profile} />
        </div>
        <div className="w-full text-center max-w-2xl mx-auto  lg:p-4 ">
          <UserManagement profile={profile} />
        </div>
        <div className="w-full text-center max-w-2xl mx-auto  lg:p-4 ">
          <Analytics profile={profile} />
        </div>
      </div>
    </div>
  );
}

export default App;
