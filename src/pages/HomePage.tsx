import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import LeadsTable from "../components/LeadsTable";
import { Filters } from "../components/Filters";
import { SearchBar } from "../components/Search";
import {
  fetchLeads,
  setSearchQuery,
  setFilters,
  setPage,
  clearError,
  selectLeadsState,
  selectLeads,
  selectIsLoading,
  selectError,
  selectFilters,
  selectPagination,
} from "../redux/slices/leadsSlice";
import { AppDispatch } from "../redux/store";

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const leads = useSelector(selectLeads);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const { currentPage, totalPages, totalLeads, itemsPerPage } =
    useSelector(selectPagination);
  const { searchQuery } = useSelector(selectLeadsState);

  // Fetch leads when page or filters change
  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch, currentPage]);

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(fetchLeads());
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
    // Fetching will be triggered after filters state changes due to the middleware
    dispatch(fetchLeads());
  };

  const handlePageChange = (pageNumber: number) => {
    dispatch(setPage(pageNumber));
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Fetching will be triggered by the useEffect when currentPage changes
  };

  const handleRefresh = () => {
    dispatch(fetchLeads());
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
          Showing {leads.length} of {totalLeads} leads
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
            setSearchQuery={handleSearchChange}
          />
        </div>

        <div className="bg-white shadow-sm p-4 m-4 rounded-lg">
          <div className="max-w-6xl mx-auto space-y-8">
            <Filters filters={filters} setFilters={handleFilterChange} />
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
              <button
                onClick={() => dispatch(clearError())}
                className="ml-2 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <LeadsTable />

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading leads...</p>
            </div>
          )}

          {!isLoading && leads.length === 0 && !error && (
            <div className="text-center py-4 text-gray-500">
              No leads found matching your criteria
            </div>
          )}

          {leads.length > 0 && <Pagination />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
