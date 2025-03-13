import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffdf9]">
      <Sidebar />

      {/* Page content goes here */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
