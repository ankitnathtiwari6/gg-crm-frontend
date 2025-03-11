import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Lead } from "../../types";
import { RootState } from "../store";
import api from "../../services/api.service";

// Define filter state interface
export interface LeadsFilters {
  neetStatus: string;
  neetScoreRange: [number, number];
  country: string;
  location: string;
  isQualified: boolean;
  tags: string[];
  assignedTo: string; // Added assignedTo filter
  dateRange: {
    start: string;
    end: string;
  };
}

// Define leads state interface
interface LeadsState {
  leads: Lead[];
  totalLeads: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  filters: LeadsFilters;
  isLoading: boolean;
  error: string | null;
  selectedLeadId: string | null; // Added for edit modal
}

// Initial state
const initialState: LeadsState = {
  leads: [],
  totalLeads: 0,
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
    assignedTo: "", // Initialize with empty string
    dateRange: {
      start: "",
      end: "",
    },
  },
  isLoading: false,
  error: null,
  selectedLeadId: null, // Added for edit modal
};

// Async thunk for fetching leads with filters
export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { currentPage, itemsPerPage, searchQuery, filters } = state.leads;

    try {
      // Build params object directly rather than using URLSearchParams
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Search query
      if (searchQuery) params.search = searchQuery;

      // NEET status filtering
      if (filters.neetStatus) params.neetStatus = filters.neetStatus;

      // NEET score range
      if (filters.neetScoreRange[0] > 0)
        params.minScore = filters.neetScoreRange[0];
      if (filters.neetScoreRange[1] < 720)
        params.maxScore = filters.neetScoreRange[1];

      // Location filters
      if (filters.country) params.country = filters.country;
      if (filters.location) params.location = filters.location;

      // Assigned To filter
      if (filters.assignedTo) {
        if (filters.assignedTo === "unassigned") {
          params.unassigned = true;
        } else {
          params.assignedTo = filters.assignedTo;
        }
      }

      // Qualified status
      if (filters.isQualified) params.isQualified = true;

      // Tags filtering - pass as array directly
      if (filters.tags && filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      // Date range
      if (filters.dateRange.start) params.startDate = filters.dateRange.start;
      if (filters.dateRange.end) params.endDate = filters.dateRange.end;

      const token = state?.auth?.token ?? "";
      const response = await api.lead.getLeads(token, params);

      if (response.success) {
        return {
          leads: response.leads,
          totalPages: response.totalPages,
          totalLeads: response.totalLeads,
        };
      } else {
        return rejectWithValue(response.message || "Failed to fetch leads");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "An error occurred"
        );
      }
      return rejectWithValue("Failed to load leads. Please try again.");
    }
  }
);

// New async thunk for updating a lead
export const updateLead = createAsyncThunk(
  "leads/updateLead",
  async (lead: Lead, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      const response = await api.lead.updateLead(
        lead.id,
        lead,
        state?.auth?.token ?? ""
      );
      //   const response = await axios.put(`${API_URL}/leads/${lead.id}`, lead);

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

// Create the leads slice
const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset page when search changes
    },
    setFilters: (state, action: PayloadAction<Partial<LeadsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset page when filters change
    },
    setTagFilter: (state, action: PayloadAction<string[]>) => {
      state.filters.tags = action.payload;
      state.currentPage = 1; // Reset page when tags filter changes
    },
    addTagFilter: (state, action: PayloadAction<string>) => {
      if (!state.filters.tags.includes(action.payload)) {
        state.filters.tags.push(action.payload);
        state.currentPage = 1; // Reset page when tag is added
      }
    },
    removeTagFilter: (state, action: PayloadAction<string>) => {
      state.filters.tags = state.filters.tags.filter(
        (tag) => tag !== action.payload
      );
      state.currentPage = 1; // Reset page when tag is removed
    },
    setAssignedToFilter: (state, action: PayloadAction<string>) => {
      state.filters.assignedTo = action.payload;
      state.currentPage = 1; // Reset page when assigned to filter changes
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    // New reducers for lead selection
    setSelectedLead: (state, action: PayloadAction<string | null>) => {
      state.selectedLeadId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leads reducers
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload.leads;
        state.totalPages = action.payload.totalPages;
        state.totalLeads = action.payload.totalLeads;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.leads = [];
      })

      // Update lead reducers
      .addCase(updateLead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update the lead in the state
        const updatedLead = action.payload;
        const index = state.leads.findIndex(
          (lead) => lead.id === updatedLead.id
        );

        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSearchQuery,
  setFilters,
  setTagFilter,
  addTagFilter,
  removeTagFilter,
  setAssignedToFilter,
  setPage,
  resetFilters,
  clearError,
  setSelectedLead,
} = leadsSlice.actions;

// Export selectors
export const selectLeadsState = (state: RootState) => state.leads;
export const selectLeads = (state: RootState) => state.leads.leads;
export const selectIsLoading = (state: RootState) => state.leads.isLoading;
export const selectError = (state: RootState) => state.leads.error;
export const selectFilters = (state: RootState) => state.leads.filters;
export const selectSelectedLeadId = (state: RootState) =>
  state.leads.selectedLeadId;
export const selectSelectedLead = (state: RootState) => {
  const selectedId = state.leads.selectedLeadId;
  return selectedId
    ? state.leads.leads.find((lead) => lead.id === selectedId)
    : null;
};
export const selectPagination = (state: RootState) => ({
  currentPage: state.leads.currentPage,
  totalPages: state.leads.totalPages,
  totalLeads: state.leads.totalLeads,
  itemsPerPage: state.leads.itemsPerPage,
});

// Export reducer
export default leadsSlice.reducer;
