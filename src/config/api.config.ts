// src/config/api.config.ts

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: {
    "Content-Type": string;
    Accept: string;
  };
}

// Development environment configuration
const devConfig: ApiConfig = {
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Production environment configuration
const prodConfig: ApiConfig = {
  baseUrl: "https://api.globalgrads.in/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Staging/QA environment configuration (optional)
const stagingConfig: ApiConfig = {
  baseUrl: "https://api-staging.yourapp.com/api",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Select the appropriate configuration based on the environment
// Uses Node's environment variables
const getConfig = (): ApiConfig => {
  const env: string = "production";

  switch (env) {
    case "development":
      return devConfig;
    case "production":
      return prodConfig;
    case "staging":
      return stagingConfig;
    default:
      return devConfig; // Default to development
  }
};

// Create and export the configuration
const apiConfig = getConfig();

export default apiConfig;

// API endpoints
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    user: "/auth/user",
  },
  leads: {
    getAll: "/leads",
    getOne: "/leads/:id",
    create: "/leads",
    update: "/leads/",
    delete: "/leads/:id",
  },
};
