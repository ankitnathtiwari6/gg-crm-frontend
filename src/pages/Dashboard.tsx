import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import api from "../services/api.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RemarkAnalytics {
  daywisePerson: { date: string; name: string; count: number }[];
  leadsCreatedWithRemark: { date: string; person: string; count: number }[];
  userRemarkFreshness: { date: string; person: string; isFresh: boolean; count: number }[];
  yearSummary: { total: number; pending: number };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERSON_COLORS = [
  "#6366f1", "#3b82f6", "#0891b2", "#0d9488", "#16a34a",
  "#d97706", "#a855f7", "#ec4899", "#f97316", "#eab308",
  "#9ca3af", "#dc2626",
];
const NO_REMARK_COLOR = "#e5e7eb";
const FRESH_COLOR = "#16a34a";
const REREMARK_COLOR = "#f97316";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fillDays(days: number) {
  const result: { key: string; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    result.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    });
  }
  return result;
}

function buildStackedData(
  raw: { date: string; [key: string]: any }[],
  nameKey: string,
  countKey: string,
  days: number
): Record<string, any>[] {
  const byDate: Record<string, Record<string, number>> = {};
  raw.forEach((item) => {
    if (!byDate[item.date]) byDate[item.date] = {};
    const k = item[nameKey] as string;
    byDate[item.date][k] = (byDate[item.date][k] ?? 0) + (item[countKey] as number);
  });
  return fillDays(days).map(({ key, label }) => ({ date: label, ...(byDate[key] ?? {}) }));
}

function buildFreshnessData(
  raw: { date: string; person: string; isFresh: boolean; count: number }[],
  person: string,
  days: number
): { date: string; fresh: number; reRemark: number }[] {
  const byDate: Record<string, { fresh: number; reRemark: number }> = {};
  raw
    .filter((d) => d.person === person)
    .forEach((d) => {
      if (!byDate[d.date]) byDate[d.date] = { fresh: 0, reRemark: 0 };
      if (d.isFresh) byDate[d.date].fresh += d.count;
      else byDate[d.date].reRemark += d.count;
    });
  return fillDays(days).map(({ key, label }) => ({
    date: label,
    fresh: byDate[key]?.fresh ?? 0,
    reRemark: byDate[key]?.reRemark ?? 0,
  }));
}

// ── Tooltip components ────────────────────────────────────────────────────────

const StackedTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
            <span className="text-gray-600 truncate max-w-[100px]">{p.dataKey}</span>
          </span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-1 pt-1 flex justify-between font-semibold text-gray-700">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>
  );
};

const FreshnessTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-xs min-w-[130px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
            <span className="text-gray-600">{p.dataKey === "fresh" ? "Fresh Lead" : "Re-Remark"}</span>
          </span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const DaysToggle: React.FC<{ value: number; onChange: (d: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[7, 14, 30].map((d) => (
      <button
        key={d}
        onClick={() => onChange(d)}
        className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
          value === d ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {d}d
      </button>
    ))}
  </div>
);

const PersonLegend: React.FC<{ persons: string[]; colorMap: Record<string, string> }> = ({ persons, colorMap }) => (
  <div className="flex flex-wrap gap-3 mt-3">
    {persons.map((name) => (
      <span key={name} className="flex items-center gap-1 text-[10px] text-gray-600">
        <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: colorMap[name] }} />
        {name}
      </span>
    ))}
  </div>
);

const Skel = ({ h = "h-56" }: { h?: string }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${h}`} />
);

// ── Main ──────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token) ?? "";

  const [analytics, setAnalytics] = useState<RemarkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [selectedUser, setSelectedUser] = useState<string>("");

  const fetchAnalytics = (d: number) => {
    setLoading(true);
    api.lead
      .getRemarkAnalytics(token, d)
      .then((res: any) => {
        if (res.success) {
          setAnalytics(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  // Auto-select first user for Chart 3 when data loads
  useEffect(() => {
    if (analytics) {
      const persons = Array.from(new Set(analytics.userRemarkFreshness.map((d) => d.person)));
      if (persons.length > 0 && (!selectedUser || !persons.includes(selectedUser))) {
        setSelectedUser(persons[0]);
      }
    }
  }, [analytics]);

  // ── Derived data ────────────────────────────────────────────────────────────

  // Chart 1: remarks by day stacked by person
  const remarkPersons = analytics
    ? Array.from(new Set(analytics.daywisePerson.map((d) => d.name)))
    : [];
  const remarkColorMap: Record<string, string> = {};
  remarkPersons.forEach((n, i) => { remarkColorMap[n] = PERSON_COLORS[i % PERSON_COLORS.length]; });
  const chart1Data = analytics
    ? buildStackedData(analytics.daywisePerson, "name", "count", days)
    : [];

  // Chart 2: leads created per day + remark attribution
  const leadPersons = analytics
    ? Array.from(new Set(analytics.leadsCreatedWithRemark.map((d) => d.person)))
    : [];
  // Put "No Remark" last
  const orderedLeadPersons = [
    ...leadPersons.filter((p) => p !== "No Remark"),
    ...leadPersons.filter((p) => p === "No Remark"),
  ];
  const leadColorMap: Record<string, string> = {};
  orderedLeadPersons
    .filter((p) => p !== "No Remark")
    .forEach((n, i) => { leadColorMap[n] = PERSON_COLORS[i % PERSON_COLORS.length]; });
  leadColorMap["No Remark"] = NO_REMARK_COLOR;
  const chart2Data = analytics
    ? buildStackedData(analytics.leadsCreatedWithRemark, "person", "count", days)
    : [];

  // Chart 3: freshness per selected user
  const freshnessPersons = analytics
    ? Array.from(new Set(analytics.userRemarkFreshness.map((d) => d.person)))
    : [];
  const chart3Data =
    analytics && selectedUser
      ? buildFreshnessData(analytics.userRemarkFreshness, selectedUser, days)
      : [];

  const { total: yearTotal = 0, pending: yearPending = 0 } = analytics?.yearSummary ?? {};
  const pendingPct = yearTotal > 0 ? ((yearPending / yearTotal) * 100).toFixed(1) : "0.0";

  const barSize = days <= 7 ? 28 : days <= 14 ? 18 : 10;
  const xInterval = days <= 14 ? 0 : Math.floor(days / 10);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:ml-16 transition-all duration-300">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Remark Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manual remark activity across your team</p>
        </div>
        <button
          onClick={() => fetchAnalytics(days)}
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

          {/* ── Summary + Days Selector ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              {/* Year total */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3 min-w-[160px]">
                <svg className="w-8 h-8 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">This Year Leads</p>
                  {loading && !analytics ? (
                    <div className="h-7 w-16 animate-pulse bg-gray-100 rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800 leading-tight">{yearTotal.toLocaleString()}</p>
                  )}
                </div>
              </div>
              {/* Remark pending */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3 min-w-[180px]">
                <svg className="w-8 h-8 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Remark Pending</p>
                  {loading && !analytics ? (
                    <div className="h-7 w-20 animate-pulse bg-gray-100 rounded mt-1" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-800 leading-tight">{yearPending.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{pendingPct}% of this year</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Time window:</span>
              <DaysToggle value={days} onChange={setDays} />
            </div>
          </div>

          {/* ── Chart 1: Manual Remarks by Day (stacked by person) ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Manual Remarks Added — Day by Day</h2>
                <p className="text-xs text-gray-400 mt-0.5">Stacked by team member</p>
              </div>
            </div>
            {loading && !analytics ? (
              <Skel />
            ) : chart1Data.length && remarkPersons.length ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chart1Data} barSize={barSize} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={xInterval} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<StackedTip />} cursor={{ fill: "#f3f4f6" }} />
                    {remarkPersons.map((name, i) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        stackId="a"
                        fill={remarkColorMap[name]}
                        radius={i === remarkPersons.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <PersonLegend persons={remarkPersons} colorMap={remarkColorMap} />
              </>
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No remarks in this period</p>
            )}
          </div>

          {/* ── Chart 2: Leads Added per Day + Remark Coverage ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">New Leads per Day — Remark Coverage</h2>
                <p className="text-xs text-gray-400 mt-0.5">Who added the first manual remark on each lead (gray = no remark yet)</p>
              </div>
            </div>
            {loading && !analytics ? (
              <Skel />
            ) : chart2Data.length && orderedLeadPersons.length ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chart2Data} barSize={barSize} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={xInterval} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<StackedTip />} cursor={{ fill: "#f3f4f6" }} />
                    {orderedLeadPersons.map((name, i) => (
                      <Bar
                        key={name}
                        dataKey={name}
                        stackId="a"
                        fill={leadColorMap[name]}
                        radius={i === orderedLeadPersons.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-3">
                  {orderedLeadPersons.map((name) => (
                    <span key={name} className="flex items-center gap-1 text-[10px] text-gray-600">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 border border-gray-200"
                        style={{ background: leadColorMap[name] }}
                      />
                      {name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No lead data in this period</p>
            )}
          </div>

          {/* ── Chart 3: Per-User Freshness ── */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">User Remark Freshness</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ background: FRESH_COLOR }} />
                    Fresh lead (first ever remark)
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-sm" style={{ background: REREMARK_COLOR }} />
                    Re-remark (already had remark)
                  </span>
                </p>
              </div>
              {freshnessPersons.length > 0 && (
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                >
                  {freshnessPersons.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              )}
            </div>
            {loading && !analytics ? (
              <Skel />
            ) : chart3Data.length && selectedUser ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chart3Data} barSize={barSize} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={xInterval} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<FreshnessTip />} cursor={{ fill: "#f3f4f6" }} />
                    <Bar dataKey="fresh" stackId="a" fill={FRESH_COLOR} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="reRemark" stackId="a" fill={REREMARK_COLOR} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Per-day summary stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(() => {
                    const totalFresh = chart3Data.reduce((s, d) => s + d.fresh, 0);
                    const totalRe = chart3Data.reduce((s, d) => s + d.reRemark, 0);
                    const total = totalFresh + totalRe;
                    return (
                      <>
                        <div className="bg-green-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-lg font-bold text-gray-800">{totalFresh}</p>
                          <p className="text-[10px] text-gray-500">Fresh leads remarked</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-lg font-bold text-gray-800">{totalRe}</p>
                          <p className="text-[10px] text-gray-500">Re-remarks</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg px-3 py-2 text-center">
                          <p className="text-lg font-bold text-gray-800">{total}</p>
                          <p className="text-[10px] text-gray-500">Total in period</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">
                {freshnessPersons.length === 0 ? "No remark data in this period" : "No activity for selected user"}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
