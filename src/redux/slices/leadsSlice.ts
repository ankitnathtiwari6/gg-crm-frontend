import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Lead } from "../../types";
import { RootState } from "../store";
import api from "../../services/api.service";

export interface LeadsFilters {
  neetStatus: string;
  neetScoreRange: [number, number];
  country: string;
  location: string;
  isQualified: boolean;
  tags: string[];
  assignedTo: string;
  dateRange: {
    start: string;
    end: string;
  };
  activeDateRange: {
    start: string;
    end: string;
  };
}

export type SortField = "lastInteraction" | "createdAt" | "leadQualityScore";
export type SortOrder = "asc" | "desc";

interface LeadsState {
  leads: Lead[];
  totalLeads: number;
  todayLeadsCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  filters: LeadsFilters;
  sortBy: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  selectedLeadId: string | null;
}

const initialState: LeadsState = {
  leads: [],
  totalLeads: 0,
  todayLeadsCount: 0,
  totalPages: 1,
  currentPage: 1,
  itemsPerPage: 20,
  searchQuery: "",
  filters: {
    neetStatus: "",
    neetScoreRange: [0, 720],
    country: "",
    location: "",
    isQualified: false,
    tags: [],
    assignedTo: "",
    dateRange: {
      start: "",
      end: "",
    },
    activeDateRange: {
      start: "",
      end: "",
    },
  },
  sortBy: "lastInteraction" as SortField,
  sortOrder: "desc" as SortOrder,
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  selectedLeadId: null,
};

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (append: boolean = false, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { currentPage, itemsPerPage, searchQuery, filters, sortBy, sortOrder } = state.leads;

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
      };
      if (searchQuery) params.search = searchQuery;
      if (filters.neetStatus) params.neetStatus = filters.neetStatus;
      if (filters.neetScoreRange[0] > 0) params.minScore = filters.neetScoreRange[0];
      if (filters.neetScoreRange[1] < 720) params.maxScore = filters.neetScoreRange[1];
      // Both set: already covered above; each sends independently so backend handles partial ranges
      if (filters.country) params.country = filters.country;
      if (filters.location) params.location = filters.location;
      if (filters.assignedTo) {
        if (filters.assignedTo === "unassigned") {
          params.unassigned = true;
        } else {
          params.assignedTo = filters.assignedTo;
        }
      }
      if (filters.isQualified) params.isQualified = true;
      if (filters.tags && filters.tags.length > 0) params.tags = filters.tags;
      if (filters.dateRange.start) params.startDate = filters.dateRange.start;
      if (filters.dateRange.end) params.endDate = filters.dateRange.end;
      if (filters.activeDateRange.start) params.activeStartDate = filters.activeDateRange.start;
      if (filters.activeDateRange.end) params.activeEndDate = filters.activeDateRange.end;

      const token = state?.auth?.token ?? "";
      const response = await api.lead.getLeads(token, params);

      if (response.success) {
        return {
          leads: response.leads,
          totalPages: response.totalPages,
          totalLeads: response.totalLeads,
          todayLeadsCount: response.todayLeadsCount,
          append,
        };
      } else {
        return rejectWithValue(response.message || "Failed to fetch leads");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || "An error occurred");
      }
      return rejectWithValue("Failed to load leads. Please try again.");
    }
  }
);

export const deleteLead = createAsyncThunk(
  "leads/deleteLead",
  async (leadId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const response = await api.lead.deleteLead(leadId, state?.auth?.token ?? "");
      if (response.success) return leadId;
      return rejectWithValue(response.message || "Failed to delete lead");
    } catch {
      return rejectWithValue("Failed to delete lead. Please try again.");
    }
  }
);

export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (lead: Lead, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const response = await api.lead.updateLead(lead.id, lead, state?.auth?.token ?? "");
      if (response.success) {
        return response.lead;
      } else {
        return rejectWithValue(response.message || "Failed to update lead");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue("An error occurred in update");
      }
      return rejectWithValue("Failed to update lead. Please try again.");
    }
  }
);

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    setFilters: (state, action: PayloadAction<Partial<LeadsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    setTagFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload;
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    addTagFilter: (state, action: PayloadAction<string>) => {
      if (!state.filters.tags.includes(action.payload)) {
        state.filters.tags.push(action.payload);
        state.currentPage = 1;
        state.leads = [];
        state.hasMore = true;
      }
    },
    removeTagFilter: (state, action: PayloadAction<string>) => {
      state.filters.tags = state.filters.tags.filter((tag) => tag !== action.payload);
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    setAssignedToFilter: (state, action: PayloadAction<string>) => {
      state.filters.assignedTo = action.payload;
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    setSort: (state, action: PayloadAction<{ sortBy: SortField; sortOrder: SortOrder }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.currentPage = 1;
      state.leads = [];
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
      state.leads = [];
      state.hasMore = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedLead: (state, action: PayloadAction<string | null>) => {
      state.selectedLeadId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state, action) => {
        const append = action.meta.arg;
        if (append) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const { leads, totalPages, totalLeads, todayLeadsCount, append } = action.payload;
        if (append) {
          state.leads = [...state.leads, ...leads];
        } else {
          state.leads = leads;
        }
        state.totalPages = totalPages;
        state.totalLeads = totalLeads;
        state.todayLeadsCount = todayLeadsCount;
        state.hasMore = state.leads.length < totalLeads;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload as string;
        if (!action.meta.arg) {
          state.leads = [];
        }
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
        state.totalLeads = Math.max(0, state.totalLeads - 1);
        if (state.selectedLeadId === action.payload) state.selectedLeadId = null;
      })
      .addCase(updateLead.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const updatedLead = { ...action.payload };
        state.leads = state.leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));
        if (state.selectedLeadId === updatedLead.id) {
          state.selectedLeadId = null;
          state.selectedLeadId = updatedLead.id;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  setTagFilter,
  addTagFilter,
  removeTagFilter,
  setAssignedToFilter,
  setSort,
  setPage,
  incrementPage,
  resetFilters,
  clearError,
  setSelectedLead,
} = leadsSlice.actions;

export const selectLeadsState = (state: RootState) => state.leads;
export const selectLeads = (state: RootState) => state.leads.leads;
export const selectIsLoading = (state: RootState) => state.leads.isLoading;
export const selectIsLoadingMore = (state: RootState) => state.leads.isLoadingMore;
export const selectHasMore = (state: RootState) => state.leads.hasMore;
export const selectError = (state: RootState) => state.leads.error;
export const selectFilters = (state: RootState) => state.leads.filters;
export const selectSelectedLeadId = (state: RootState) => state.leads.selectedLeadId;
export const selectSelectedLead = (state: RootState) => {
  const selectedId = state.leads.selectedLeadId;
  return selectedId ? state.leads.leads.find((lead) => lead.id === selectedId) : null;
};
export const selectPagination = (state: RootState) => ({
  currentPage: state.leads.currentPage,
  totalPages: state.leads.totalPages,
  totalLeads: state.leads.totalLeads,
  itemsPerPage: state.leads.itemsPerPage,
});
export const selectTodayLeadsCount = (state: RootState) => state.leads.todayLeadsCount;
export const selectSort = (state: RootState) => ({ sortBy: state.leads.sortBy, sortOrder: state.leads.sortOrder });

export default leadsSlice.reducer;
