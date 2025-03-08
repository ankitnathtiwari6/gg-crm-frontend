import React, { createContext, useState, useContext, useEffect } from "react";

// Define the shape of our Auth state
interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  token: null,
  login: () => {},
  logout: () => {},
});

// Provide a convenient hook for accessing auth state
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthContext provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // On mount, check localStorage if a token is saved
    localStorage.setItem("authToken", "123");
    const savedToken = localStorage.getItem("authToken");

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
