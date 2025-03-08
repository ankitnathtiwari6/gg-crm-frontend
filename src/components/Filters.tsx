import React from "react";

interface FiltersProps {
  filters: {
    neetStatus: string;
    neetScoreRange: [number, number];
    country: string;
    location: string;
    isQualified: boolean;
    dateRange: {
      start: string;
      end: string;
    };
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      neetStatus: string;
      neetScoreRange: [number, number];
      country: string;
      location: string;
      isQualified: boolean;
      dateRange: {
        start: string;
        end: string;
      };
    }>
  >;
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex items-center w-full justify-between">
      <div className="flex-1">
        <select
          value={filters.neetStatus}
          onChange={(e) =>
            setFilters({ ...filters, neetStatus: e.target.value })
          }
          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
        >
          <option value="">All NEET Status</option>
          <option value="Qualified">Qualified</option>
          <option value="Not Qualified">Not Qualified</option>
        </select>
      </div>

      <div className="flex-1 mx-2">
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
        >
          <option value="">All Countries</option>
          <option value="Russia">Russia</option>
          <option value="Kazakhstan">Kazakhstan</option>
        </select>
      </div>

      <div className="flex-1 mx-2">
        <input
          type="text"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          placeholder="Location..."
          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="flex-1 mx-2">
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            setFilters({
              ...filters,
              dateRange: {
                ...filters.dateRange,
                start: e.target.value,
              },
            })
          }
          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="flex-1 mx-2">
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            setFilters({
              ...filters,
              dateRange: { ...filters.dateRange, end: e.target.value },
            })
          }
          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-green-400 focus:ring-1 focus:ring-green-400"
        />
      </div>

      <div className="whitespace-nowrap px-2">
        <input
          type="checkbox"
          id="qualifiedOnly"
          checked={filters.isQualified}
          onChange={(e) =>
            setFilters({ ...filters, isQualified: e.target.checked })
          }
          className="h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-400"
        />
        <label htmlFor="qualifiedOnly" className="ml-2 text-sm text-gray-700">
          Qualified leads only
        </label>
      </div>
    </div>
  );
};
