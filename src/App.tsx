import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import LeadDetailPage from "./pages/LeadDetailPage";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { useDispatch, useSelector } from "react-redux";
// import ProtectedRoute from "./components/ProtectedRoute";
import { AppDispatch, RootState } from "./redux/store";
import { loadUser } from "./redux/slices/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUser());
    }
  }, [token, dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Route (Login) */}
        <Route path="/login" element={<LoginPage />} />

        {/* All other routes require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lead/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <LeadDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback route can go here, e.g. 404 */}
      </Routes>
    </Router>
  );
}

export default App;
