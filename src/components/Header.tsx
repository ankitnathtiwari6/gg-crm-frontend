import React from "react";
import { NavLink } from "react-router-dom";
// If you're using an AuthContext to get user info:
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  navLinks: { label: string; to: string }[];
}

const Header: React.FC<HeaderProps> = ({ navLinks }) => {
  // Example: Suppose your AuthContext provides user info.
  // If not, you can pass the user name as a prop or decode from token.
  const { token } = useAuth();

  // For demo purposes, define a dummy userName or decode from token.
  // In a real app, you'd decode the JWT or get user details from server:
  const userName = "John Doe";

  return (
    <header className="w-full bg-[#fffdf9] px-4 py-6 flex items-center justify-between shadow-md">
      <nav className="flex space-x-4"></nav>

      {/* User Name (top-right corner) */}
      <div className="text-gray-800">
        {token ? `Hello, ${userName}` : "Not logged in"}
      </div>
    </header>
  );
};

export default Header;
