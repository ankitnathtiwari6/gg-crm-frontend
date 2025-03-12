import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div
      className={`transition-all duration-300 bg-[#28282B] text-white shadow-lg h-screen flex flex-col fixed top-0 left-0 z-10 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-gray-100">Workdesk</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-white focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                collapsed
                  ? "M13 5l7 7-7 7M5 5l7 7-7 7" // Arrows pointing right (expand)
                  : "M11 19l-7-7 7-7M19 19l-7-7 7-7" // Arrows pointing left (collapse)
              }
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4">
        <ul className="px-2">
          <li className="mb-1">
            <Link
              to="/"
              className={`block ${
                collapsed ? "px-2" : "px-4"
              } py-2.5 rounded-md transition-colors duration-200 flex items-center justify-center ${
                isActive("/")
                  ? "bg-[#000000] text-white"
                  : "text-gray-300 hover:bg-[#000000] hover:text-white"
              }`}
            >
              <svg
                className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              {!collapsed && "Home"}
            </Link>
          </li>

          <li className="mb-1">
            <Link
              to="/dashboard"
              className={`block ${
                collapsed ? "px-2" : "px-4"
              } py-2.5 rounded-md transition-colors duration-200 flex items-center justify-center ${
                isActive("/dashboard")
                  ? "bg-[#000000] text-white"
                  : "text-gray-300 hover:bg-[#000000] hover:text-white"
              }`}
            >
              <svg
                className={`w-5 h-5 ${collapsed ? "" : "mr-3"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              {!collapsed && "Dashboard"}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
              <span className="text-white font-medium">U</span>
            </div>
            <div className="text-sm">
              <p className="text-gray-300">User</p>
              <p className="text-xs text-gray-400">user@example.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
