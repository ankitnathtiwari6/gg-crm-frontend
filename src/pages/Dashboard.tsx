import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchFunnelStats,
  selectFunnelStats,
  selectFunnelStatsLoading,
  selectPagination,
  selectTodayLeadsCount,
} from "../redux/slices/leadsSlice";
import api from "../services/api.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardStats {
  avgQualityScore: number;
  scoredLeads: number;
  unassigned: number;
  activeLastWeek: number;
  activeLastMonth: number;
  avgMessagesPerEngaged: number;
  avgNeetScore: number;
  neetScoredLeads: number;
  leadsWithBudget: number;
  newThisWeek: number;
  newThisMonth: number;
  topCountries: { name: string; count: number }[];
  qualificationBreakdown: { name: string; count: number }[];
  contactTypeBreakdown: { name: string; count: number }[];
}

// ── Sub-components ────────────────────────────────────────────────────────────

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}> = ({ label, value, sub, color, icon }) => (
  <div className={`rounded-xl p-4 flex items-start gap-3 ${color}`}>
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const BarTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
      <p className="text-gray-600">{payload[0].value} leads</p>
    </div>
  );
};

const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-600">{payload[0].value} leads</p>
    </div>
  );
};

const QUAL_LABELS: Record<string, string> = {
  "12th_appearing": "12th Appearing",
  "12th_passed": "12th Passed",
  dropper: "Dropper",
  other: "Other",
};

const QUAL_COLORS = ["#6366f1", "#3b82f6", "#0891b2", "#9ca3af"];
const CONTACT_COLORS = ["#a855f7", "#ec4899", "#f97316", "#14b8a6", "#eab308", "#6b7280"];
const COUNTRY_COLOR = "#6366f1";

// ── Main ──────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token) ?? "";
  const funnel = useSelector(selectFunnelStats);
  const funnelLoading = useSelector(selectFunnelStatsLoading);
  const { totalLeads } = useSelector(selectPagination);
  const todayCount = useSelector(selectTodayLeadsCount);

  const [rich, setRich] = useState<DashboardStats | null>(null);
  const [richLoading, setRichLoading] = useState(true);

  const fetchAll = () => {
    dispatch(fetchFunnelStats());
    setRichLoading(true);
    api.lead
      .getDashboardStats(token)
      .then((res: any) => { if (res.success) setRich(res.stats); })
      .catch(() => {})
      .finally(() => setRichLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const loading = funnelLoading || richLoading;

  const conversionRate =
    funnel && funnel.total > 0 ? ((funnel.won / funnel.total) * 100).toFixed(1) : "0.0";

  // Pipeline bar data
  const pipelineData = funnel
    ? [
        { name: "Not Resp.",  count: funnel.notResponding, color: "#eab308" },
        { name: "Call Started", count: funnel.callStarted,   color: "#3b82f6" },
        { name: "Follow Up",   count: funnel.followUp,      color: "#a855f7" },
        { name: "Docs Req.",   count: funnel.docsRequested,  color: "#6366f1" },
        { name: "Docs Recv.",  count: funnel.docsReceived,   color: "#0d9488" },
        { name: "Applied",     count: funnel.applied,        color: "#0891b2" },
        { name: "Won",         count: funnel.won,            color: "#16a34a" },
        { name: "Lost",        count: funnel.lost,           color: "#dc2626" },
      ]
    : [];

  // Quality donut data
  const qualityData = funnel
    ? [
        { name: "Hot (≥80)",    value: funnel.hot,  fill: "#16a34a" },
        { name: "Warm (40–79)", value: funnel.warm, fill: "#d97706" },
        { name: "Cold (<40)",   value: funnel.cold, fill: "#6366f1" },
        { name: "No Score",     value: funnel.total - funnel.hot - funnel.warm - funnel.cold, fill: "#e5e7eb" },
      ].filter((d) => d.value > 0)
    : [];

  const qualBreakdown = (rich?.qualificationBreakdown ?? []).map((q, i) => ({
    name: QUAL_LABELS[q.name] ?? q.name,
    count: q.count,
    fill: QUAL_COLORS[i % QUAL_COLORS.length],
  }));

  const contactBreakdown = (rich?.contactTypeBreakdown ?? []).map((c, i) => ({
    name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
    count: c.count,
    fill: CONTACT_COLORS[i % CONTACT_COLORS.length],
  }));

  const Skel = ({ h = "h-28" }: { h?: string }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${h}`} />
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:ml-16 transition-all duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Real-time overview of your lead pipeline</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Row 1: Core counts ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading && !funnel ? Array.from({ length: 6 }).map((_, i) => <Skel key={i} />) : (
              <>
                <MetricCard label="Total Leads" value={funnel?.total ?? totalLeads} color="bg-indigo-50"
                  icon={<svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
                <MetricCard label="Today's New" value={todayCount} color="bg-blue-50"
                  icon={<svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <MetricCard label="AI Engaged" value={funnel?.aiEngaged ?? 0}
                  sub={funnel?.total ? `${((funnel.aiEngaged / funnel.total) * 100).toFixed(0)}% of total` : undefined}
                  color="bg-purple-50"
                  icon={<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                />
                <MetricCard label="Hot Leads" value={funnel?.hot ?? 0} sub="Score ≥ 80" color="bg-green-50"
                  icon={<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>}
                />
                <MetricCard label="Closed Won" value={funnel?.won ?? 0} color="bg-emerald-50"
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <MetricCard label="Conversion" value={`${conversionRate}%`} sub="Won / Total" color="bg-teal-50"
                  icon={<svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
              </>
            )}
          </div>

          {/* ── Row 2: Rich metrics ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {richLoading && !rich ? Array.from({ length: 8 }).map((_, i) => <Skel key={i} h="h-20" />) : (
              <>
                {[
                  { label: "Avg AI Score",     value: rich?.avgQualityScore ?? "—", sub: `${rich?.scoredLeads ?? 0} scored`, color: "bg-violet-50", textColor: "text-violet-500",
                    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                  { label: "Unassigned",        value: rich?.unassigned ?? "—",     sub: "No owner",         color: "bg-orange-50", textColor: "text-orange-500",
                    path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
                  { label: "Active (7d)",       value: rich?.activeLastWeek ?? "—", sub: "Interacted",       color: "bg-cyan-50",   textColor: "text-cyan-500",
                    path: "M13 10V3L4 14h7v7l9-11h-7z" },
                  { label: "Active (30d)",      value: rich?.activeLastMonth ?? "—",sub: "Interacted",       color: "bg-sky-50",    textColor: "text-sky-500",
                    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                  { label: "New (7d)",          value: rich?.newThisWeek ?? "—",    sub: "Created",          color: "bg-lime-50",   textColor: "text-lime-600",
                    path: "M12 4v16m8-8H4" },
                  { label: "New (30d)",         value: rich?.newThisMonth ?? "—",   sub: "Created",          color: "bg-green-50",  textColor: "text-green-500",
                    path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
                  { label: "Avg Messages",      value: rich?.avgMessagesPerEngaged ?? "—", sub: "Per engaged lead", color: "bg-pink-50", textColor: "text-pink-500",
                    path: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
                  { label: "Avg NEET Score",    value: rich?.avgNeetScore ? rich.avgNeetScore : "—", sub: rich?.neetScoredLeads ? `${rich.neetScoredLeads} leads` : "No data", color: "bg-amber-50", textColor: "text-amber-500",
                    path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl px-3 py-3 ${card.color}`}>
                    <svg className={`w-4 h-4 ${card.textColor} mb-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.path} />
                    </svg>
                    <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{card.label}</p>
                    <p className="text-xl font-bold text-gray-800 leading-tight">{card.value}</p>
                    {card.sub && <p className="text-[10px] text-gray-400 leading-tight">{card.sub}</p>}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* ── Row 3: Pipeline bar + Quality donut ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Stage Breakdown</h2>
              {funnelLoading && !funnel ? <div className="h-52 animate-pulse bg-gray-100 rounded-lg" /> : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={pipelineData} barSize={26} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<BarTip />} cursor={{ fill: "#f3f4f6" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {pipelineData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Lead Quality Distribution</h2>
              {funnelLoading && !funnel ? <div className="h-52 animate-pulse bg-gray-100 rounded-lg" /> : (
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={qualityData} cx="50%" cy="42%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                      {qualityData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Row 4: Countries + Qualification + Contact Type ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Top Countries horizontal bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Country Preferences</h2>
              {richLoading && !rich ? <div className="h-40 animate-pulse bg-gray-100 rounded-lg" /> : (
                rich?.topCountries?.length ? (
                  <div className="space-y-2.5">
                    {rich.topCountries.map((c) => {
                      const max = rich.topCountries[0].count;
                      const pct = max > 0 ? (c.count / max) * 100 : 0;
                      return (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 w-24 truncate flex-shrink-0">{c.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COUNTRY_COLOR }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-6 text-right">{c.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-gray-400">No country data yet</p>
              )}
            </div>

            {/* Qualification donut */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Qualification Breakdown</h2>
              {richLoading && !rich ? <div className="h-40 animate-pulse bg-gray-100 rounded-lg" /> : (
                qualBreakdown.length ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={qualBreakdown} cx="50%" cy="45%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="count">
                        {qualBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-gray-400">No qualification data yet</p>
              )}
            </div>

            {/* Contact type donut */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Type</h2>
              {richLoading && !rich ? <div className="h-40 animate-pulse bg-gray-100 rounded-lg" /> : (
                contactBreakdown.length ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={contactBreakdown} cx="50%" cy="45%" innerRadius={40} outerRadius={62} paddingAngle={2} dataKey="count">
                        {contactBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs text-gray-400">No contact type data yet</p>
              )}
            </div>
          </div>

          {/* ── Row 5: Pipeline progress bars ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Pipeline Progress</h2>
            {funnelLoading && !funnel ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-100 rounded h-5" />)}</div>
            ) : funnel ? (
              <div className="space-y-2.5">
                {pipelineData.map((stage) => {
                  const pct = funnel.total > 0 ? (stage.count / funnel.total) * 100 : 0;
                  return (
                    <div key={stage.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{stage.name}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{stage.count}</span>
                      <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
