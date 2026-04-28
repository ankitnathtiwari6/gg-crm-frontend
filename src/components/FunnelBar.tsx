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

const FILL: Record<string, { base: string; active: string }> = {
  total:                  { base: "#f3f4f6", active: "#374151" },
  aiEngaged:              { base: "#ede9fe", active: "#7c3aed" },
  warm:                   { base: "#fef3c7", active: "#d97706" },
  hot:                    { base: "#dcfce7", active: "#16a34a" },
  not_responding:         { base: "#fef9c3", active: "#eab308" },
  call_started:           { base: "#dbeafe", active: "#2563eb" },
  follow_up:              { base: "#f3e8ff", active: "#9333ea" },
  documents_requested:    { base: "#e0e7ff", active: "#4f46e5" },
  documents_received:     { base: "#ccfbf1", active: "#0d9488" },
  application_submitted:  { base: "#cffafe", active: "#0891b2" },
  closed_won:             { base: "#d1fae5", active: "#059669" },
  closed_lost:            { base: "#fee2e2", active: "#dc2626" },
};

const VIEW_H = 100;
const BAR_MAX = 82;
const BAR_MIN = 14;

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

  const activeStage = stageFilter;
  const activeAiEngaged = filters.aiEngaged;
  const activeWarm = filters.minQualityScore >= 40 && filters.minQualityScore < 70;
  const activeHot = filters.minQualityScore >= 70;

  const stages = [
    { key: "total",                 label: "All Leads",      count: stats.total,         onClick: clearFunnelFilter },
    { key: "aiEngaged",             label: "AI Engaged",     count: stats.aiEngaged,     onClick: () => { dispatch(setAiEngagedFilter(true)); dispatch(fetchLeads(false)); } },
    { key: "warm",                  label: "Warm (>40)",     count: stats.warm,          onClick: () => { dispatch(setHotFilter(40)); dispatch(fetchLeads(false)); } },
    { key: "hot",                   label: "Hot (≥70)",      count: stats.hot,           onClick: () => { dispatch(setHotFilter(70)); dispatch(fetchLeads(false)); } },
    { key: "not_responding",        label: "Not Responding", count: stats.notResponding, onClick: () => applyStage("not_responding") },
    { key: "call_started",          label: "Call Started",   count: stats.callStarted,   onClick: () => applyStage("call_started") },
    { key: "follow_up",             label: "Follow Up",      count: stats.followUp,      onClick: () => applyStage("follow_up") },
    { key: "documents_requested",   label: "Docs Requested", count: stats.docsRequested, onClick: () => applyStage("documents_requested") },
    { key: "documents_received",    label: "Docs Received",  count: stats.docsReceived,  onClick: () => applyStage("documents_received") },
    { key: "application_submitted", label: "Applied",        count: stats.applied,       onClick: () => applyStage("application_submitted") },
    { key: "closed_won",            label: "Won",            count: stats.won,           onClick: () => applyStage("closed_won") },
    { key: "closed_lost",           label: "Lost",           count: stats.lost,          onClick: () => applyStage("closed_lost") },
  ];

  const isActive = (key: string) => {
    if (key === "total") return !activeStage && !activeAiEngaged && !activeWarm && !activeHot;
    if (key === "aiEngaged") return activeAiEngaged;
    if (key === "warm") return activeWarm;
    if (key === "hot") return activeHot;
    return activeStage === key;
  };

  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const logMax = Math.log1p(maxCount);

  const getH = (stage: (typeof stages)[0]) =>
    stage.count === 0
      ? BAR_MIN
      : Math.round(BAR_MIN + (Math.log1p(stage.count) / logMax) * (BAR_MAX - BAR_MIN));

  const N = stages.length;
  const VIEW_W = N * 100;

  return (
    <div className="relative bg-white border-b border-gray-100">
      {/* Refresh */}
      <button
        onClick={() => dispatch(fetchFunnelStats())}
        className="absolute top-1 right-2 z-10 p-1 text-gray-400 hover:text-gray-600 bg-white/80 hover:bg-white rounded"
        title="Refresh funnel stats"
      >
        <svg
          className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Funnel chart */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height="88"
        preserveAspectRatio="none"
        className="block"
      >
        {stages.map((stage, i) => {
          const active = isActive(stage.key);
          const h = getH(stage);
          const hNext = i < N - 1 ? getH(stages[i + 1]) : h;
          const x0 = i * 100;
          const x1 = x0 + 100;
          const xMid = x0 + 50;
          const yTop = VIEW_H - h;
          const yNext = VIEW_H - hNext;
          // cubic bezier: flat on left, smoothly curves down to next section's height on right
          const d = `M ${x0} ${yTop} C ${xMid} ${yTop} ${xMid} ${yNext} ${x1} ${yNext} L ${x1} ${VIEW_H} L ${x0} ${VIEW_H} Z`;
          const fill = active ? FILL[stage.key].active : FILL[stage.key].base;

          return (
            <path
              key={stage.key}
              d={d}
              fill={fill}
              onClick={stage.onClick}
              style={{ transition: "fill 0.25s ease", cursor: "pointer" }}
            />
          );
        })}

        {/* Thin separator lines */}
        {stages.slice(0, -1).map((_, i) => (
          <line
            key={i}
            x1={(i + 1) * 100}
            y1={0}
            x2={(i + 1) * 100}
            y2={VIEW_H}
            stroke="#e5e7eb"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex border-t border-gray-100">
        {stages.map((stage) => {
          const active = isActive(stage.key);
          const pct = stats.total > 0
            ? stage.key === "total"
              ? 100
              : Math.round((stage.count / stats.total) * 100)
            : 0;
          return (
            <button
              key={stage.key}
              onClick={stage.onClick}
              style={{ width: `${100 / N}%` }}
              className={`flex flex-col items-center py-1.5 border-r border-gray-100 last:border-r-0 transition-colors duration-150 ${
                active ? "bg-gray-50" : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`font-bold text-sm leading-tight ${
                  active ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {stage.count}
              </span>
              <span className={`text-[9px] font-semibold leading-tight ${active ? "text-indigo-600" : "text-gray-400"}`}>
                {pct}%
              </span>
              <span className="text-[9px] text-gray-500 leading-tight whitespace-nowrap">
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelBar;
