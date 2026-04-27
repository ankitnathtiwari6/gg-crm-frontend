import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LeadsTable from "../components/LeadsTable";
import LeadStats from "../components/LeadStats";
import { Filters } from "../components/Filters";
import { SearchBar } from "../components/Search";
import {
  fetchLeads,
  setPage,
  setSearchQuery,
  setFilters,
  clearError,
  selectLeadsState,
  selectLeads,
  selectIsLoading,
  selectError,
  selectFilters,
  selectPagination,
  selectTodayLeadsCount,
  selectSort,
} from "../redux/slices/leadsSlice";
import { AppDispatch } from "../redux/store";

const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const leads = useSelector(selectLeads);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);
  const { currentPage, totalPages, totalLeads, itemsPerPage } = useSelector(selectPagination);
  const { searchQuery } = useSelector(selectLeadsState);
  const todayLeadsCount = useSelector(selectTodayLeadsCount);
  const { sortBy, sortOrder } = useSelector(selectSort);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState("");

  // Fetch on filter / search / sort change (fresh replace).
  // currentPage is intentionally excluded — pagination clicks and infinite scroll
  // dispatch fetchLeads directly so they control append vs. replace themselves.
  useEffect(() => {
    dispatch(fetchLeads(false));
  }, [dispatch, filters, searchQuery, sortBy, sortOrder]);

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  };

  const handleRefresh = () => {
    dispatch(fetchLeads(false));
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || isLoading) return;

    // If the data for this page is already in the infinite-scroll list, scroll to it
    const pageStartIndex = (page - 1) * itemsPerPage;
    if (pageStartIndex < leads.length) {
      dispatch(setPage(page));
      const container = tableContainerRef.current;
      if (container) {
        const scrollTop =
          page === 1
            ? 0
            : (pageStartIndex / leads.length) * container.scrollHeight;
        container.scrollTo({ top: scrollTop, behavior: "smooth" });
      }
      return;
    }

    dispatch(setPage(page));
    dispatch(fetchLeads(false));
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpInput, 10);
    if (!isNaN(n)) goToPage(n);
    setJumpInput("");
  };

  // Build page number list with ellipsis
  const getPageNumbers = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (currentPage > 3) pages.push("…");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      pages.push(p);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  const activeFilterCount = [
    filters.neetStatus,
    filters.country,
    filters.location,
    filters.assignedTo,
    filters.dateRange.start,
    filters.dateRange.end,
    filters.activeDateRange.start,
    filters.activeDateRange.end,
    filters.isQualified,
  ].filter(Boolean).length + filters.tags.length;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalLeads);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col md:ml-20 min-w-0 transition-all duration-300">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar searchQuery={searchQuery} setSearchQuery={handleSearchChange} />
          </div>

          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{isLoading ? "Loading…" : "Refresh"}</span>
          </button>
        </div>

        {/* Stats bar */}
        <div className="px-4 py-2 bg-white border-b border-gray-50">
          <LeadStats totalLeads={totalLeads} todayLeads={todayLeadsCount} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex justify-between">
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())} className="underline ml-2">Dismiss</button>
          </div>
        )}

        {/* Table */}
        <div ref={tableContainerRef} className="flex-1 overflow-y-auto p-4">
          {isLoading && leads.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
                <p className="text-sm text-gray-400">Loading leads…</p>
              </div>
            </div>
          ) : (
            <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
              <LeadsTable />
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            {/* Count */}
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {totalLeads > 0 ? `${startItem}–${endItem} of ${totalLeads} leads` : "0 leads"}
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-2 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {getPageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 py-1 text-xs text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    disabled={isLoading}
                    className={`min-w-[32px] px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentPage === p
                        ? "bg-indigo-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-2 py-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Jump to page */}
            <form onSubmit={handleJump} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 whitespace-nowrap">Go to</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="pg"
                className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md disabled:opacity-40"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      {filterDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setFilterDrawerOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white z-40 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Filters</h2>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                    {activeFilterCount} active
                  </span>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <Filters filters={filters} setFilters={handleFilterChange} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
