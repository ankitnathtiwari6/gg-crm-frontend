import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../redux/store";
import { setSort, selectSort, SortField, SortOrder } from "../redux/slices/leadsSlice";
import { fetchLeads } from "../redux/slices/leadsSlice";

interface LeadStatsProps {
  totalLeads: number;
  todayLeads: number;
}

const SORT_OPTIONS: { label: string; field: SortField }[] = [
  { label: "Last Active", field: "lastInteraction" },
  { label: "Created", field: "createdAt" },
  { label: "AI Score", field: "leadQualityScore" },
];

const LeadStats: React.FC<LeadStatsProps> = ({ totalLeads, todayLeads }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sortBy, sortOrder } = useSelector(selectSort);

  const handleSort = (field: SortField) => {
    const newOrder: SortOrder =
      sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    dispatch(setSort({ sortBy: field, sortOrder: newOrder }));
    dispatch(fetchLeads(false));
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Total: <span className="font-semibold text-gray-800">{totalLeads}</span>
        </span>
        <span className="text-gray-300">|</span>
        <span>
          Today: <span className="font-semibold text-gray-800">{todayLeads}</span>
        </span>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400 mr-1">Sort by</span>
        {SORT_OPTIONS.map(({ label, field }) => {
          const active = sortBy === field;
          return (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {label}
              {active && (
                <svg
                  className={`w-3 h-3 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LeadStats;
