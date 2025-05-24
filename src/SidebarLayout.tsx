import { useState } from "react";
import { SignOutButton } from "./SignOutButton";

export default function SidebarLayout({
  children,
  profile,
  activeTab,
  setActiveTab,
}: {
  children: React.ReactNode;
  profile: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("User profile:", profile);

  if (!profile) return <>{children}</>;

  const navItems =
    profile && profile.role === "staff"
      ? ["Dashboard", "Users", "Analytics", "Settings"]
      : profile
        ? ["Dashboard", "Settings"]
        : [];

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:translate-x-0 lg:w-64`}
      >
        <div className="h-full flex flex-col justify-between">
          {/* Top: Logo + Nav */}
          <div>
            <div className="p-4 text-2xl font-bold border-b border-gray-600">
              Employee Portal
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setSidebarOpen(false); // close on mobile
                  }}
                  className={`block w-full text-left px-4 py-2 rounded hover:bg-gray-700 ${
                    activeTab === item ? "bg-gray-700" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom: Sign Out */}
          <div className="p-4 border-t border-gray-700">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-gray-800 shadow lg:hidden text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white text-3xl focus:outline-none"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">{activeTab}</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900 text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
