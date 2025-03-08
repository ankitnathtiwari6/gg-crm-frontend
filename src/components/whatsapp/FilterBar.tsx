// FilterBar.tsx
import React from "react";
import { SortOption } from "../../types";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterUnread: boolean;
  setFilterUnread: (value: boolean) => void;
  filterByRelevance: boolean;
  setFilterByRelevance: (value: boolean) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  setShowAddPopup: (show: boolean) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  filterUnread,
  setFilterUnread,
  filterByRelevance,
  setFilterByRelevance,
  sortBy,
  setSortBy,
  setShowAddPopup,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-bold text-gray-800">
            WhatsApp Management
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Search contacts or messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnread}
                onChange={() => setFilterUnread(!filterUnread)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Unread only</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filterByRelevance}
                onChange={() => setFilterByRelevance(!filterByRelevance)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">High relevance</span>
            </label>
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
          >
            <option value="latest">Sort by Latest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="longest">Sort by Chat Length</option>
            <option value="relevant">Sort by Relevance</option>
          </select>

          {/* Add Contact Button */}
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
