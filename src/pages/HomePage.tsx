import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { LeadsTable } from "../components/LeadsTable";
import { Lead } from "../types";
import { Filters } from "../components/Filters";
import { SearchBar } from "../components/Search";
import axios from "axios";

// API base URL - should be in an environment config
const API_URL = "http://localhost:3000/api";

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [leadData, setLeadData] = useState<Lead[]>([]);
  const [filters, setFilters] = useState({
    neetStatus: "",
    neetScoreRange: [0, 720] as [number, number],
    country: "",
    location: "",
    isQualified: false,
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const itemsPerPage = 20; // Match the backend default

  const fetchLeads = async (pageNumber: number) => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      // NEET status filtering
      if (filters.neetStatus) params.append("neetStatus", filters.neetStatus);

      // NEET score range
      if (filters.neetScoreRange[0] > 0)
        params.append("minScore", filters.neetScoreRange[0].toString());
      if (filters.neetScoreRange[1] < 720)
        params.append("maxScore", filters.neetScoreRange[1].toString());

      // Location filters
      if (filters.country) params.append("country", filters.country);
      if (filters.location) params.append("location", filters.location);

      // Qualified status
      if (filters.isQualified) params.append("isQualified", "true");

      // Date range
      if (filters.dateRange.start)
        params.append("startDate", filters.dateRange.start);
      if (filters.dateRange.end)
        params.append("endDate", filters.dateRange.end);

      // Pagination
      params.append("page", pageNumber.toString());
      params.append("limit", itemsPerPage.toString());

      const response = await axios.get(`${API_URL}/leads?${params.toString()}`);

      if (response.data.success) {
        setLeadData(response.data.leads);
        setTotalPages(response.data.totalPages);
        setTotalLeads(response.data.totalLeads);
      } else {
        throw new Error(response.data.message || "Failed to fetch leads");
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      setError("Failed to load leads. Please try again.");
      setLeadData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Fetch leads when page or filters change
  useEffect(() => {
    fetchLeads(currentPage);
  }, [currentPage, searchQuery, filters]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    fetchLeads(currentPage);
  };

  // Pagination component
  const Pagination = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if end page is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    return (
      <div className="flex flex-col items-center justify-center mt-4 mb-8">
        <div className="text-sm text-gray-500 mb-2">
          Showing {leadData.length} of {totalLeads} leads
        </div>

        <div className="flex items-center">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-3 py-1 mx-1 rounded border ${
                  currentPage === 1
                    ? "bg-blue-500 text-white"
                    : "border-gray-300"
                }`}
              >
                1
              </button>
              {startPage > 2 && <span className="mx-1">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 mx-1 rounded border ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="mx-1">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 mx-1 rounded border ${
                  currentPage === totalPages
                    ? "bg-blue-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 m-4 rounded-lg">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div className="bg-white shadow-sm p-4 m-4 rounded-lg">
          <div className="max-w-6xl mx-auto space-y-8">
            <Filters filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">All Leads</h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <LeadsTable leads={leadData} />

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading leads...</p>
            </div>
          )}

          {!isLoading && leadData.length === 0 && !error && (
            <div className="text-center py-4 text-gray-500">
              No leads found matching your criteria
            </div>
          )}

          {leadData.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
