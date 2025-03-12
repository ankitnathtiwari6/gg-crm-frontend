import React, { useState } from "react";

import { TAG_OPTIONS } from "./CompactEditModal";

interface FilterValues {
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

interface FiltersProps {
  filters: FilterValues;
  setFilters: (filters: Partial<FilterValues>) => void;
}

// User interface for assignedTo dropdown

// Predefined tag options for filtering

const user = [
  {
    _id: "67ced4c72fe58c7016c27423",
    name: "Arpit",
  },
  {
    _id: "67ced4c72fe58c7016c2748a",
    name: "Priya",
  },
  {
    _id: "67ced4c72fe58c7016c2748d",
    name: "Ankit",
  },
];

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  const users = user;
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Helper function to handle filter updates
  const updateFilter = <K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
  ) => {
    setFilters({ [key]: value });
  };

  // Helper for nested date range updates
  const updateDateRange = (key: "start" | "end", value: string) => {
    setFilters({
      dateRange: {
        ...filters.dateRange,
        [key]: value,
      },
    });
  };

  // Handle tag selection/deselection
  const handleTagToggle = (tag: string) => {
    const currentTags = [...filters.tags];
    if (currentTags.includes(tag)) {
      // Remove tag if already selected
      updateFilter(
        "tags",
        currentTags.filter((t) => t !== tag)
      );
    } else {
      // Add tag if not selected
      updateFilter("tags", [...currentTags, tag]);
    }
  };

  // Count active filters to display on mobile
  const countActiveFilters = () => {
    let count = 0;
    if (filters.neetStatus) count++;
    if (filters.country) count++;
    if (filters.location) count++;
    if (filters.assignedTo) count++;
    if (filters.dateRange.start) count++;
    if (filters.dateRange.end) count++;
    if (filters.isQualified) count++;
    if (filters.tags.length > 0) count += filters.tags.length;
    return count;
  };

  const toggleFilters = () => {
    setIsFiltersExpanded(!isFiltersExpanded);
  };

  return (
    <div className="space-y-4 rounded-lg">
      {/* Mobile filter toggle button */}
      <div className="md:hidden">
        <button
          onClick={toggleFilters}
          className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow text-sm"
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
            {countActiveFilters() > 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                {countActiveFilters()}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isFiltersExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Desktop view always visible, mobile view toggleable */}
      <div
        className={`${
          isFiltersExpanded ? "block" : "hidden"
        } md:block bg-white p-4 rounded-lg shadow`}
      >
        {/* Filters grid - responsive for different screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              NEET Status
            </label>
            <select
              value={filters.neetStatus}
              onChange={(e) => updateFilter("neetStatus", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            >
              <option value="">All NEET Status</option>
              <option value="withScore">With Score</option>
              <option value="withoutScore">Without Score</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Country</label>
            <select
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            >
              <option value="">All Countries</option>
              <option value="Russia">Russia</option>
              <option value="Kazakhstan">Kazakhstan</option>
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              placeholder="Search location..."
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => updateFilter("assignedTo", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => updateDateRange("start", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">To Date</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => updateDateRange("end", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-2">
          <div className="flex items-center mr-4">
            <input
              type="checkbox"
              id="qualifiedOnly"
              checked={filters.isQualified}
              onChange={(e) => updateFilter("isQualified", e.target.checked)}
              className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-400"
            />
            <label
              htmlFor="qualifiedOnly"
              className="ml-2 text-sm text-gray-700"
            >
              Qualified leads only
            </label>
          </div>

          {/* Reset filters button */}
          {countActiveFilters() > 0 && (
            <button
              onClick={() =>
                setFilters({
                  neetStatus: "",
                  country: "",
                  location: "",
                  assignedTo: "",
                  isQualified: false,
                  tags: [],
                  dateRange: { start: "", end: "" },
                })
              }
              className="text-xs px-2 py-1 text-red-600 hover:text-red-800 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Tags Filter */}
        <div className="mt-4">
          <span className="text-xs text-gray-500 block mb-1">Tags</span>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-2 py-1 text-xs rounded-full ${
                  filters.tags.includes(tag)
                    ? tag === "Qualified"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {filters.tags.length > 0 && (
            <button
              onClick={() => updateFilter("tags", [])}
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
              Clear tags
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
