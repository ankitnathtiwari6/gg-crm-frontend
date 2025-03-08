import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { ArrowUp, ArrowDown, Users, Award, BookOpen } from "lucide-react";
import _ from "lodash";
import { leadData } from "../data/data";

const LeadAnalyticsDashboard = () => {
  const data = leadData;

  // Color scheme using Tailwind colors
  const colors = {
    primary: "#0e7490", // cyan-700
    secondary: "#f59e0b", // amber-500
    accent: "#e2e8f0", // slate-200
    success: "#22c55e", // green-500
    danger: "#ef4444", // red-500
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLeads = data.length;
    const qualifiedLeads = data.filter((d) => d.qualifiedLead).length;
    const avgNeetScore = Math.round(_.meanBy(data, "neetScore"));

    const thisMonth = data.filter((d) => {
      const date = new Date(d.capturedDate);
      return date.getMonth() === new Date().getMonth();
    }).length;

    const lastMonth = data.filter((d) => {
      const date = new Date(d.capturedDate);
      return date.getMonth() === new Date().getMonth() - 1;
    }).length;

    const growth = ((thisMonth - lastMonth) / lastMonth) * 100;

    return {
      totalLeads,
      qualifiedLeads,
      qualificationRate: Math.round((qualifiedLeads / totalLeads) * 100),
      avgNeetScore,
      growth,
    };
  }, [data]);

  // Monthly trend data
  const monthlyData = useMemo(() => {
    const grouped = _.groupBy(data, (d) =>
      new Date(d.capturedDate).toLocaleDateString("en-US", { month: "short" })
    );

    return Object.entries(grouped).map(([month, items]) => ({
      month,
      total: items.length,
      qualified: items.filter((i) => i.qualifiedLead).length,
      avg: Math.round(_.meanBy(items, "neetScore")),
    }));
  }, [data]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Lead Analytics Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Track your student recruitment performance
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Leads Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                metrics.growth >= 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {metrics.growth >= 0 ? (
                <ArrowUp className="h-4 w-4 inline mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 inline mr-1" />
              )}
              {Math.abs(metrics.growth).toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-500 text-sm">Total Leads</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {metrics.totalLeads.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Qualified Leads Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
            <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-600">
              {metrics.qualificationRate}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-500 text-sm">Qualified Leads</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {metrics.qualifiedLeads.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Average NEET Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-gray-500 text-sm">Average NEET Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {metrics.avgNeetScore}
            </p>
          </div>
        </div>

        {/* Monthly Collection Card */}
        <div className="bg-cyan-700 rounded-lg shadow-sm p-6">
          <h3 className="text-gray-100 text-sm">Monthly Collection</h3>
          <p className="text-3xl font-bold text-white mt-1">
            ₹{(24000).toLocaleString()}
          </p>
          <div className="mt-4">
            <div className="h-2 bg-cyan-600 rounded-full">
              <div className="h-2 bg-amber-400 rounded-full w-8/12"></div>
            </div>
            <p className="text-sm mt-2 text-gray-100">70% of monthly target</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">
              Lead Acquisition Trend
            </h3>
            <select className="px-3 py-1 rounded-lg border text-sm bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={colors.primary}
                  fill={colors.accent}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Country Interest Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Russia", value: 8 },
                    { name: "Kazakhstan", value: 5 },
                    { name: "Ukraine", value: 4 },
                    { name: "Others", value: 3 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <Cell fill={colors.primary} />
                  <Cell fill={colors.secondary} />
                  <Cell fill={colors.success} />
                  <Cell fill={colors.accent} />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* NEET Score Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            NEET Score Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { range: "100-200", count: 3 },
                  { range: "200-300", count: 4 },
                  { range: "300-400", count: 5 },
                  { range: "400-500", count: 6 },
                  { range: "500+", count: 2 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={colors.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Qualification Rate Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Qualification Rate Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="qualified"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  dot={{ fill: colors.secondary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalyticsDashboard;
