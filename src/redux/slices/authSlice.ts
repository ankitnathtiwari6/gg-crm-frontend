// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState, AuthUser } from "../../types";
import api from "../../services/api.service";

// Define login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"), // Get token from localStorage if exists
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk<
  { user: AuthUser; token: string },
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await api.auth.login(credentials.email, credentials.password);
    localStorage.setItem("token", data.token);
    return { user: data.user, token: data.token };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed"
    );
  }
});

// Async thunk for loading user data
export const loadUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: string }
>("auth/loadUser", async (_, { getState, rejectWithValue }) => {
  try {
    // @ts-ignore - accessing state type
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("No token found");
    }

    const { user } = await api.auth.getUser(token);
    return user;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load user"
    );
  }
});

// Create the auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      if (state.token) {
        api.auth.logout(state.token).catch(console.error);
      }

      localStorage.removeItem("token");
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });

    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        // Only clear token if there was an authentication error
        if (
          action.payload === "Token invalid" ||
          action.payload === "Token expired"
        ) {
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem("token");
        }
      });
  },
});

// Export actions and reducer
export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
