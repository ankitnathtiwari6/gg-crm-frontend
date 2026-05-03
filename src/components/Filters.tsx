import React, { useState, useEffect } from "react";
import { useTagOptions } from "../hooks/useTagOptions";

interface FilterValues {
  neetStatus: string;
  neetScoreRange: [number, number];
  country: string;
  location: string;
  isQualified: boolean;
  tags: string[];
  assignedTo: string;
  dateRange: {
    start: string;
    end: string;
  };
  activeDateRange: {
    start: string;
    end: string;
  };
}

interface FiltersProps {
  filters: FilterValues;
  setFilters: (filters: Partial<FilterValues>) => void;
}

const users = [
  { _id: "67d030142f4ff4037c3fdb60", name: "Arpit" },
  { _id: "67ced4c72fe58c7016c2748a", name: "Priya" },
  { _id: "67ced4c72fe58c7016c2748d", name: "Ankit" },
  { _id: "68a97910c3271bbae187ab0e", name: "Pratiksha" },
];

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  const tagOptions = useTagOptions();
  const [scoreMin, setScoreMin] = useState(String(filters.neetScoreRange[0]));
  const [scoreMax, setScoreMax] = useState(String(filters.neetScoreRange[1]));

  useEffect(() => {
    setScoreMin(String(filters.neetScoreRange[0]));
    setScoreMax(String(filters.neetScoreRange[1]));
  }, [filters.neetScoreRange[0], filters.neetScoreRange[1]]);

  const updateFilter = <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
    setFilters({ [key]: value });
  };

  const updateDateRange = (key: "start" | "end", value: string) => {
    setFilters({ dateRange: { ...filters.dateRange, [key]: value } });
  };

  const updateActiveDateRange = (key: "start" | "end", value: string) => {
    setFilters({ activeDateRange: { ...filters.activeDateRange, [key]: value } });
  };

  const handleTagToggle = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter("tags", next);
  };

  const countActiveFilters = () => {
    const scoreRangeActive =
      filters.neetScoreRange[0] !== 0 || filters.neetScoreRange[1] !== 720;
    return [
      filters.neetStatus,
      filters.country,
      filters.location,
      filters.assignedTo,
      filters.dateRange.start,
      filters.dateRange.end,
      filters.activeDateRange.start,
      filters.activeDateRange.end,
      filters.isQualified,
      scoreRangeActive,
    ].filter(Boolean).length + filters.tags.length;
  };

  const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide";
  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-white";

  return (
    <div className="space-y-5">

      {/* Reset */}
      {countActiveFilters() > 0 && (
        <button
          onClick={() =>
            setFilters({
              neetStatus: "",
              neetScoreRange: [0, 720],
              country: "",
              location: "",
              assignedTo: "",
              isQualified: false,
              tags: [],
              dateRange: { start: "", end: "" },
              activeDateRange: { start: "", end: "" },
            })
          }
          className="w-full py-2 text-sm text-red-500 hover:text-red-700 border border-red-100 hover:border-red-200 rounded-lg bg-red-50/50 transition-colors"
        >
          Reset all filters
        </button>
      )}

      {/* NEET Status */}
      <div>
        <label className={labelClass}>NEET Status</label>
        <select
          value={filters.neetStatus}
          onChange={(e) => updateFilter("neetStatus", e.target.value)}
          className={inputClass}
        >
          <option value="">All NEET Status</option>
          <option value="withScore">With Score</option>
          <option value="withoutScore">Without Score</option>
        </select>
      </div>

      {/* NEET Score Range */}
      <div>
        <label className={labelClass}>NEET Score Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={720}
            value={scoreMin}
            onChange={(e) => setScoreMin(e.target.value)}
            onBlur={() => {
              const val = Math.min(Math.max(Number(scoreMin) || 0, 0), filters.neetScoreRange[1]);
              setScoreMin(String(val));
              updateFilter("neetScoreRange", [val, filters.neetScoreRange[1]]);
            }}
            placeholder="Min"
            className={inputClass}
          />
          <span className="text-gray-400 text-sm flex-shrink-0">to</span>
          <input
            type="number"
            min={0}
            max={720}
            value={scoreMax}
            onChange={(e) => setScoreMax(e.target.value)}
            onBlur={() => {
              const val = Math.max(Math.min(Number(scoreMax) || 720, 720), filters.neetScoreRange[0]);
              setScoreMax(String(val));
              updateFilter("neetScoreRange", [filters.neetScoreRange[0], val]);
            }}
            placeholder="Max"
            className={inputClass}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
          <span>{scoreMin}</span>
          <span>{scoreMax}</span>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className={labelClass}>Preferred Country</label>
        <select
          value={filters.country}
          onChange={(e) => updateFilter("country", e.target.value)}
          className={inputClass}
        >
          <option value="">All Countries</option>
          <option value="Russia">Russia</option>
          <option value="Uzbekistan">Uzbekistan</option>
          <option value="Kazakhstan">Kazakhstan</option>
          <option value="Kyrgyzstan">Kyrgyzstan</option>
          <option value="Georgia">Georgia</option>
          <option value="Bangladesh">Bangladesh</option>
          <option value="Nepal">Nepal</option>
          <option value="India">India</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Location */}
      <div>
        <label className={labelClass}>Location</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilter("location", e.target.value)}
          placeholder="Search city or state…"
          className={inputClass}
        />
      </div>

      {/* Assigned To */}
      <div>
        <label className={labelClass}>Assigned To</label>
        <select
          value={filters.assignedTo}
          onChange={(e) => updateFilter("assignedTo", e.target.value)}
          className={inputClass}
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Created At */}
      <div>
        <label className={labelClass}>Created At</label>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-400 mb-1 block">From</span>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => updateDateRange("start", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 mb-1 block">To</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => updateDateRange("end", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Active Date */}
      <div>
        <label className={labelClass}>Active Date</label>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-400 mb-1 block">From</span>
            <input
              type="date"
              value={filters.activeDateRange.start}
              onChange={(e) => updateActiveDateRange("start", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 mb-1 block">To</span>
            <input
              type="date"
              value={filters.activeDateRange.end}
              onChange={(e) => updateActiveDateRange("end", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Qualified */}
      <div className="flex items-center gap-3 py-2">
        <input
          type="checkbox"
          id="qualifiedOnly"
          checked={filters.isQualified}
          onChange={(e) => updateFilter("isQualified", e.target.checked)}
          className="h-4 w-4 text-indigo-500 rounded border-gray-300 focus:ring-indigo-400"
        />
        <label htmlFor="qualifiedOnly" className="text-sm text-gray-700 cursor-pointer">
          Qualified leads only
        </label>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass} style={{ marginBottom: 0 }}>Tags</label>
          {filters.tags.length > 0 && (
            <button
              onClick={() => updateFilter("tags", [])}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tagOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
