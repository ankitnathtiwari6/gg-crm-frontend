// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import leadReducer, { saveLeadsPrefs } from "./slices/leadsSlice";
import companyReducer from "./slices/companySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    company: companyReducer,
  },
});

store.subscribe(() => {
  saveLeadsPrefs(store.getState().leads);
});

// Infer types from the store itself for use with TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
