import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpen(!mobileOpen);
  };

  // Common navigation links component
  const NavLinks = ({ isMobile = false }) => (
    <ul className={isMobile ? "px-2 py-4" : "px-2"}>
      <li className="mb-1">
        <Link
          to="/"
          className={`block ${
            collapsed && !isMobile ? "px-2" : "px-4"
          } py-2.5 rounded-md transition-colors duration-200 flex items-center ${
            isMobile
              ? "justify-start"
              : collapsed
              ? "justify-center"
              : "justify-start"
          } ${
            isActive("/")
              ? "bg-[#000000] text-white"
              : "text-gray-300 hover:bg-[#000000] hover:text-white"
          }`}
          onClick={isMobile ? toggleMobile : undefined}
        >
          <svg
            className={`w-5 h-5 ${collapsed && !isMobile ? "" : "mr-3"}`}
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
          {(!collapsed || isMobile) && "Home"}
        </Link>
      </li>

      <li className="mb-1">
        <Link
          to="/dashboard"
          className={`block ${
            collapsed && !isMobile ? "px-2" : "px-4"
          } py-2.5 rounded-md transition-colors duration-200 flex items-center ${
            isMobile
              ? "justify-start"
              : collapsed
              ? "justify-center"
              : "justify-start"
          } ${
            isActive("/dashboard")
              ? "bg-[#000000] text-white"
              : "text-gray-300 hover:bg-[#000000] hover:text-white"
          }`}
          onClick={isMobile ? toggleMobile : undefined}
        >
          <svg
            className={`w-5 h-5 ${collapsed && !isMobile ? "" : "mr-3"}`}
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
          {(!collapsed || isMobile) && "Dashboard"}
        </Link>
      </li>
    </ul>
  );

  // Desktop sidebar
  const DesktopSidebar = (
    <div
      className={`hidden md:flex transition-all duration-300 bg-[#28282B] text-white shadow-lg h-screen flex-col fixed top-0 left-0 z-10 ${
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
        <NavLinks />
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

  // Mobile burger menu and drawer
  const MobileSidebar = (
    <>
      {/* Mobile burger button */}
      <div className="md:hidden fixed top-0 left-0 z-20 p-4">
        <button
          onClick={toggleMobile}
          className="text-gray-800 hover:text-gray-600 focus:outline-none"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-30 transition-all duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            mobileOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={toggleMobile}
        ></div>

        {/* Sidebar drawer */}
        <div
          className={`absolute top-0 left-0 w-64 h-full bg-[#28282B] transition-transform duration-300 transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-100">Workdesk</h2>
            <button
              onClick={toggleMobile}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Close menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1">
            <NavLinks isMobile={true} />
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
      </div>
    </>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
};

export default Sidebar;
