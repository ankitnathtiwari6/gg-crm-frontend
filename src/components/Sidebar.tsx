import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-56 bg-[#28282B] text-white shadow-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-gray-100">
          Workdesk
          {/* FlowDesk */}
        </h2>
      </div>

      <nav className="flex-1 py-4">
        <ul className="px-2">
          <li className="mb-1">
            <Link
              to="/"
              className={`block px-4 py-2.5 rounded-md transition-colors duration-200 flex items-center ${
                isActive("/")
                  ? "bg-[#000000] text-white"
                  : "text-gray-300 hover:bg-[#000000] hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Home
            </Link>
          </li>

          <li className="mb-1">
            <Link
              to="/dashboard"
              className={`block px-4 py-2.5 rounded-md transition-colors duration-200 flex items-center ${
                isActive("/dashboard")
                  ? "bg-[#000000] text-white"
                  : "text-gray-300 hover:bg-[#000000] hover:text-white"
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
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
              Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-white font-medium">U</span>
          </div>
          <div className="text-sm">
            <p className="text-gray-300">User</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
