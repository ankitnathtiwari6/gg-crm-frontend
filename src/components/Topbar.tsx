import React, { useState } from "react";

interface TopbarProps {
  onSearch: (query: string) => void;
  onToggleFilters: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onSearch, onToggleFilters }) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <form onSubmit={handleSubmit} className="flex items-center w-1/3">
        <input
          type="text"
          className="border border-gray-300 rounded-l px-4 py-2 w-full"
          placeholder="Search leads (AI powered)..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r"
        >
          Search
        </button>
      </form>

      {/* Extra button to toggle filter side panel (optional) */}
      <button
        onClick={onToggleFilters}
        className="ml-auto bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
      >
        Filters
      </button>
    </div>
  );
};

export default Topbar;
