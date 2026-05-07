import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../redux/store";
import { setFilters, selectFilters, LeadsFilters } from "../redux/slices/leadsSlice";

const THIS_YEAR_START = `${new Date().getFullYear()}-01-01`;

const USERS: Record<string, string> = {
  "67d030142f4ff4037c3fdb60": "Arpit",
  "67ced4c72fe58c7016c2748a": "Priya",
  "67ced4c72fe58c7016c2748d": "Ankit",
  "68a97910c3271bbae187ab0e": "Pratiksha",
};

const NEET_STATUS_LABELS: Record<string, string> = {
  withScore: "With Score",
  withoutScore: "Without Score",
};

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

interface Chip {
  key: string;
  label: string;
  onRemove: (filters: LeadsFilters) => Partial<LeadsFilters>;
}

export const FilterChips: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(selectFilters);

  const chips: Chip[] = [];

  if (filters.neetStatus) {
    chips.push({
      key: "neetStatus",
      label: `NEET: ${NEET_STATUS_LABELS[filters.neetStatus] ?? filters.neetStatus}`,
      onRemove: () => ({ neetStatus: "" }),
    });
  }

  if (filters.neetScoreRange[0] !== 0 || filters.neetScoreRange[1] !== 720) {
    chips.push({
      key: "neetScore",
      label: `Score: ${filters.neetScoreRange[0]}–${filters.neetScoreRange[1]}`,
      onRemove: () => ({ neetScoreRange: [0, 720] }),
    });
  }

  if (filters.country) {
    chips.push({
      key: "country",
      label: `Country: ${filters.country}`,
      onRemove: () => ({ country: "" }),
    });
  }

  if (filters.location) {
    chips.push({
      key: "location",
      label: `Location: ${filters.location}`,
      onRemove: () => ({ location: "" }),
    });
  }

  if (filters.assignedTo) {
    const name =
      filters.assignedTo === "unassigned"
        ? "Unassigned"
        : (USERS[filters.assignedTo] ?? filters.assignedTo);
    chips.push({
      key: "assignedTo",
      label: `Assigned: ${name}`,
      onRemove: () => ({ assignedTo: "" }),
    });
  }

  if (filters.isQualified) {
    chips.push({
      key: "isQualified",
      label: "Qualified only",
      onRemove: () => ({ isQualified: false }),
    });
  }

  filters.tags.forEach((tag) => {
    chips.push({
      key: `tag-${tag}`,
      label: tag,
      onRemove: (f) => ({ tags: f.tags.filter((t) => t !== tag) }),
    });
  });

  if (filters.dateRange.start || filters.dateRange.end) {
    const parts = [
      filters.dateRange.start ? formatDate(filters.dateRange.start) : "…",
      filters.dateRange.end ? formatDate(filters.dateRange.end) : "…",
    ];
    chips.push({
      key: "dateRange",
      label: `Created: ${parts[0]} – ${parts[1]}`,
      onRemove: () => ({ dateRange: { start: "", end: "" } }),
    });
  }

  const activeStart = filters.activeDateRange.start;
  const activeEnd = filters.activeDateRange.end;
  if (activeStart !== THIS_YEAR_START || activeEnd) {
    const parts = [
      activeStart ? formatDate(activeStart) : "…",
      activeEnd ? formatDate(activeEnd) : "…",
    ];
    chips.push({
      key: "activeDateRange",
      label: `Active: ${parts[0]} – ${parts[1]}`,
      onRemove: () => ({ activeDateRange: { start: THIS_YEAR_START, end: "" } }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
        >
          {chip.label}
          <button
            onClick={() => dispatch(setFilters(chip.onRemove(filters)))}
            className="flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-indigo-200 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          onClick={() =>
            dispatch(
              setFilters({
                neetStatus: "",
                neetScoreRange: [0, 720],
                country: "",
                location: "",
                assignedTo: "",
                isQualified: false,
                tags: [],
                dateRange: { start: "", end: "" },
                activeDateRange: { start: THIS_YEAR_START, end: "" },
              })
            )
          }
          className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
