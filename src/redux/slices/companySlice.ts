import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.service";
import { RootState } from "../store";

export interface WhatsappNumber {
  phoneNumberId: string;
  displayPhoneNumber: string;
  accessToken: string;
  verifyToken: string;
  isActive: boolean;
}

export interface CompanyUser {
  userId: { _id: string; name: string; email: string };
  role: "admin" | "member";
}

export interface Company {
  _id: string;
  name: string;
  users: CompanyUser[];
  whatsappNumbers: WhatsappNumber[];
  settings: { aiEnabled: boolean; language: string };
}

interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  company: null,
  loading: false,
  error: null,
};

export const fetchCompany = createAsyncThunk<Company, string, { state: RootState; rejectValue: string }>(
  "company/fetch",
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.getCompany(id, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to load company");
    }
  }
);

export const createCompany = createAsyncThunk<Company, string, { state: RootState; rejectValue: string }>(
  "company/create",
  async (name, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.createCompany(name, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to create company");
    }
  }
);

export const updateCompany = createAsyncThunk<Company, { id: string; payload: any }, { state: RootState; rejectValue: string }>(
  "company/update",
  async ({ id, payload }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.updateCompany(id, payload, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to update company");
    }
  }
);

export const addUser = createAsyncThunk<Company, { id: string; email: string; role: string }, { state: RootState; rejectValue: string }>(
  "company/addUser",
  async ({ id, email, role }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.addUser(id, email, role, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to add user");
    }
  }
);

export const removeUser = createAsyncThunk<Company, { id: string; userId: string }, { state: RootState; rejectValue: string }>(
  "company/removeUser",
  async ({ id, userId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.removeUser(id, userId, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to remove user");
    }
  }
);

export const addWhatsapp = createAsyncThunk<Company, { id: string; payload: Omit<WhatsappNumber, "isActive"> }, { state: RootState; rejectValue: string }>(
  "company/addWhatsapp",
  async ({ id, payload }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.addWhatsapp(id, payload, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to add WhatsApp number");
    }
  }
);

export const removeWhatsapp = createAsyncThunk<Company, { id: string; phoneNumberId: string }, { state: RootState; rejectValue: string }>(
  "company/removeWhatsapp",
  async ({ id, phoneNumberId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.removeWhatsapp(id, phoneNumberId, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to remove WhatsApp number");
    }
  }
);

export const toggleWhatsapp = createAsyncThunk<Company, { id: string; phoneNumberId: string }, { state: RootState; rejectValue: string }>(
  "company/toggleWhatsapp",
  async ({ id, phoneNumberId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token!;
      const data = await api.company.toggleWhatsapp(id, phoneNumberId, token);
      return data.company;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Failed to toggle WhatsApp number");
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const setLoading = (state: CompanyState) => { state.loading = true; state.error = null; };
    const setCompany = (state: CompanyState, action: any) => { state.loading = false; state.company = action.payload; };
    const setError = (state: CompanyState, action: any) => { state.loading = false; state.error = action.payload; };

    [fetchCompany, createCompany, updateCompany, addUser, removeUser, addWhatsapp, removeWhatsapp, toggleWhatsapp].forEach((thunk) => {
      builder
        .addCase(thunk.pending, setLoading)
        .addCase(thunk.fulfilled, setCompany)
        .addCase(thunk.rejected, setError);
    });
  },
});

export const { clearError } = companySlice.actions;
export default companySlice.reducer;
