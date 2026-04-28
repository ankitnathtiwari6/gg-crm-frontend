import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../redux/store";
import {
  fetchFunnelStats,
  setStageFilter,
  setAiEngagedFilter,
  setHotFilter,
  selectFunnelStats,
  selectFunnelStatsLoading,
  selectStageFilter,
  selectFilters,
  fetchLeads,
} from "../redux/slices/leadsSlice";

interface PillDef {
  key: string;
  label: string;
  count: number;
  color: string;
  activeColor: string;
  onClick: () => void;
}

const pct = (num: number, den: number) =>
  den === 0 ? "—" : `${Math.round((num / den) * 100)}%`;

const FunnelBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectFunnelStats);
  const loading = useSelector(selectFunnelStatsLoading);
  const stageFilter = useSelector(selectStageFilter);
  const filters = useSelector(selectFilters);

  useEffect(() => {
    dispatch(fetchFunnelStats());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400" />
        Loading funnel…
      </div>
    );
  }

  if (!stats) return null;

  const clearFunnelFilter = () => {
    dispatch(setStageFilter(""));
    dispatch(setAiEngagedFilter(false));
    dispatch(setHotFilter(0));
    dispatch(fetchLeads(false));
  };

  const applyStage = (stage: string) => {
    dispatch(setStageFilter(stage));
    dispatch(fetchLeads(false));
  };

  const applyAiEngaged = () => {
    dispatch(setAiEngagedFilter(true));
    dispatch(fetchLeads(false));
  };

  const applyHot = () => {
    dispatch(setHotFilter(70));
    dispatch(fetchLeads(false));
  };

  const activeStage = stageFilter;
  const activeAiEngaged = filters.aiEngaged;

  const pills: PillDef[] = [
    {
      key: "total",
      label: "All Leads",
      count: stats.total,
      color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
      activeColor: "bg-gray-700 text-white",
      onClick: clearFunnelFilter,
    },
    {
      key: "aiEngaged",
      label: "AI Engaged",
      count: stats.aiEngaged,
      color: "bg-violet-100 text-violet-700 hover:bg-violet-200",
      activeColor: "bg-violet-600 text-white",
      onClick: applyAiEngaged,
    },
    {
      key: "hot",
      label: "Hot (≥70)",
      count: stats.hot,
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      activeColor: "bg-green-600 text-white",
      onClick: applyHot,
    },
    {
      key: "not_responding",
      label: "Not Responding",
      count: stats.notResponding,
      color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      activeColor: "bg-yellow-500 text-white",
      onClick: () => applyStage("not_responding"),
    },
    {
      key: "call_started",
      label: "Call Started",
      count: stats.callStarted,
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      activeColor: "bg-blue-600 text-white",
      onClick: () => applyStage("call_started"),
    },
    {
      key: "follow_up",
      label: "Follow Up",
      count: stats.followUp,
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      activeColor: "bg-purple-600 text-white",
      onClick: () => applyStage("follow_up"),
    },
    {
      key: "documents_requested",
      label: "Docs Requested",
      count: stats.docsRequested,
      color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      activeColor: "bg-indigo-600 text-white",
      onClick: () => applyStage("documents_requested"),
    },
    {
      key: "documents_received",
      label: "Docs Received",
      count: stats.docsReceived,
      color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
      activeColor: "bg-teal-600 text-white",
      onClick: () => applyStage("documents_received"),
    },
    {
      key: "application_submitted",
      label: "Applied",
      count: stats.applied,
      color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
      activeColor: "bg-cyan-600 text-white",
      onClick: () => applyStage("application_submitted"),
    },
    {
      key: "closed_won",
      label: "Won",
      count: stats.won,
      color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      activeColor: "bg-emerald-600 text-white",
      onClick: () => applyStage("closed_won"),
    },
    {
      key: "closed_lost",
      label: "Lost",
      count: stats.lost,
      color: "bg-red-100 text-red-700 hover:bg-red-200",
      activeColor: "bg-red-600 text-white",
      onClick: () => applyStage("closed_lost"),
    },
  ];

  const activeHot = filters.minQualityScore >= 70;

  const isActive = (key: string) => {
    if (key === "total") return !activeStage && !activeAiEngaged && !activeHot;
    if (key === "aiEngaged") return activeAiEngaged;
    if (key === "hot") return activeHot;
    return activeStage === key;
  };

  return (
    <div className="px-4 py-2 bg-white border-b border-gray-100">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {pills.map((pill, i) => {
          const active = isActive(pill.key);
          const prevCount = i === 0 ? stats.total : pills[i - 1].count;
          const convPct = i === 0 ? null : pct(pill.count, prevCount);

          return (
            <div key={pill.key} className="flex items-center gap-1 flex-shrink-0">
              {i > 0 && (
                <div className="flex flex-col items-center">
                  <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {convPct && (
                    <span className="text-[9px] text-gray-400 leading-none">{convPct}</span>
                  )}
                </div>
              )}
              <button
                onClick={pill.onClick}
                className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active ? pill.activeColor : pill.color
                }`}
              >
                <span className="font-bold text-sm leading-tight">{pill.count}</span>
                <span className="leading-tight whitespace-nowrap">{pill.label}</span>
              </button>
            </div>
          );
        })}

        <button
          onClick={() => dispatch(fetchFunnelStats())}
          className="ml-auto flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          title="Refresh funnel stats"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FunnelBar;
