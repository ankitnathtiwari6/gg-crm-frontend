import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useAuth();

  // If there's no token, redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
