// src/components/AuthWrapper.tsx
import { useEffect, useState, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../redux/slices/authSlice";
import { RootState, AppDispatch } from "../redux/store";

/**
 * AuthWrapper handles the initial app authentication state loading
 * This ensures we only render the app once we've checked authentication
 */
interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, loading } = useSelector((state: RootState) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Try to load the user data on initial load
    async function checkAuth() {
      if (token) {
        await dispatch(loadUser());
      }
      // Mark initial check as done regardless of result
      setInitialCheckDone(true);
    }

    checkAuth();
  }, [dispatch, token]);

  // Show loading state during the initial authentication check
  if (!initialCheckDone) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  // After initial check, render the app
  return children;
};

export default AuthWrapper;
