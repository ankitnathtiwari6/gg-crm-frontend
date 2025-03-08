import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LeadDetailPage from "./pages/LeadDetailPage";
import WhatsAppNumbersPage from "./pages/WhatsAppNumbersPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route (Login) */}
          <Route path="/login" element={<LoginPage />} />

          {/* All other routes require authentication */}
          <Route
            path="/"
            element={
              // <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
              // </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              // <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
              // </ProtectedRoute>
            }
          />
          <Route
            path="/lead/:id"
            element={
              // <ProtectedRoute>
              <Layout>
                <LeadDetailPage />
              </Layout>
              // </ProtectedRoute>
            }
          />

          {/* Fallback route can go here, e.g. 404 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
