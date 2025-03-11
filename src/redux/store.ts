// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import leadReducer from "./slices/leadsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
  },
});

// Infer types from the store itself for use with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
