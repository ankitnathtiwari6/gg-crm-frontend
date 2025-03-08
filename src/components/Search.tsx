import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="relative">
      <div
        className={`relative flex items-center rounded-lg border shadow-sm transition-all duration-200 ${
          isSearchFocused
            ? "border-green-500 ring-2 ring-green-100 shadow-md"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <Search
          className={`w-5 h-5 ml-4 ${
            isSearchFocused ? "text-green-500" : "text-gray-400"
          }`}
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search by name, location, or country..."
          className="w-full px-3 py-3 pl-3 text-gray-700 placeholder-gray-400 focus:outline-none rounded-lg"
        />

        {searchQuery && (
          <button
            onClick={clearSearch}
            className="text-gray-400 hover:text-gray-600 p-2"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSearch(searchQuery)}
          className="ml-2 mr-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-colors duration-200 shadow-sm hover:shadow flex items-center justify-center"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </button>
      </div>

      {isSearchFocused && (
        <div className="absolute mt-1 right-3 text-xs text-gray-400">
          Press Enter to search
        </div>
      )}
    </div>
  );
};
