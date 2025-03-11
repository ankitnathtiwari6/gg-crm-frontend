import React from "react";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center w-full justify-between flex-wrap gap-2">
        <div className="flex-1 min-w-[150px]">
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

        <div className="flex-1 min-w-[150px]">
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

        <div className="flex-1 min-w-[150px]">
          <input
            type="text"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
            placeholder="Location..."
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
          />
        </div>

        {/* Assigned To filter */}
        <div className="flex-1 min-w-[150px]">
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

        <div className="flex-1 min-w-[150px]">
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => updateDateRange("start", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
          />
        </div>

        <div className="flex-1 min-w-[150px]">
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => updateDateRange("end", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
          />
        </div>

        <div className="whitespace-nowrap px-2">
          <input
            type="checkbox"
            id="qualifiedOnly"
            checked={filters.isQualified}
            onChange={(e) => updateFilter("isQualified", e.target.checked)}
            className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-400"
          />
          <label htmlFor="qualifiedOnly" className="ml-2 text-sm text-gray-700">
            Qualified leads only
          </label>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex items-center flex-wrap">
        <span className="text-sm font-medium text-gray-700 mr-3 mb-2">
          Filter by tags:
        </span>
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
            className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear tags
          </button>
        )}
      </div>
    </div>
  );
};
