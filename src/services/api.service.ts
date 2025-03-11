import apiConfig, { endpoints } from "../config/api.config";

// Helper for handling response errors consistently
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Attempt to parse error response
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Server error: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

// Create headers with authentication token when available
const createHeaders = (token?: string) => {
  const headers = new Headers(apiConfig.headers);
  console.log(headers, "headers");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  return headers;
};

// Helper to build URL with query parameters
const buildUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url;

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle arrays (e.g., for tags)
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, item.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

// Generic API request function
const apiRequest = async <T>(
  url: string,
  method: string = "GET",
  data?: any,
  token?: string,
  params?: Record<string, any>
): Promise<T> => {
  const config: RequestInit = {
    method,
    headers: createHeaders(token),
    // Add timeout if using a custom fetch implementation or axios
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    config.body = JSON.stringify(data);
  }

  const fullUrl = buildUrl(`${apiConfig.baseUrl}${url}`, params);
  const response = await fetch(fullUrl, config);
  return handleResponse(response);
};

// Auth service
export const authService = {
  login: (email: string, password: string): any =>
    apiRequest(endpoints.auth.login, "POST", { email, password }),

  register: (username: string, email: string, password: string): any =>
    apiRequest(endpoints.auth.register, "POST", { username, email, password }),

  logout: (token: string): any =>
    apiRequest(endpoints.auth.logout, "POST", {}, token),

  refreshToken: (refreshToken: string): any =>
    apiRequest(endpoints.auth.refreshToken, "POST", { refreshToken }),

  getUser: (token: string): any =>
    apiRequest(endpoints.auth.user, "GET", undefined, token),
};

// Lead service
export const leadService = {
  getLeads: (token: string, params?: any): any =>
    apiRequest(endpoints.leads.getAll, "GET", undefined, token, params),

  getLeadById: (id: string, token: string): any =>
    apiRequest(`${endpoints.leads.getOne}/${id}`, "GET", undefined, token),

  updateLead: (id: string, data: any, token: string): any =>
    apiRequest(`${endpoints.leads.update}/${id}`, "PUT", data, token),
};

// Export a default API object that contains all services
const api = {
  auth: authService,
  lead: leadService,
};

export default api;
