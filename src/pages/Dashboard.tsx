import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaPhoneAlt,
  FaRegCalendarCheck,
  FaChartLine,
} from "react-icons/fa";
import { BsChatSquareDots } from "react-icons/bs";
import { MdOutlineSchool } from "react-icons/md";
import Sidebar from "../components/Sidebar";

// Metric Card Component - Streamlined for better vertical space usage
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  bgColor,
}) => {
  const changeColor = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
  }[changeType];

  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm p-4 flex items-center h-full`}
    >
      <div className="p-2 rounded-full bg-white bg-opacity-40 mr-4">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-xs flex items-center ${changeColor}`}>
            {changeType === "positive" && "↑ "}
            {changeType === "negative" && "↓ "}
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

// Stage Distribution Component - Optimized for compact display
interface StageData {
  stage: string;
  count: number;
  color: string;
}

const StageDistribution: React.FC<{ stageData: StageData[] }> = ({
  stageData,
}) => {
  const total = stageData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full overflow-auto">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Lead Stage Distribution
      </h3>
      <div className="space-y-3 max-h-[calc(100%-2rem)] overflow-auto pr-1">
        {stageData.map((item) => (
          <div key={item.stage}>
            <div className="flex justify-between text-xs mb-1">
              <span>{item.stage}</span>
              <span>
                {Math.round((item.count / total) * 100)}% ({item.count})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`${item.color} h-1.5 rounded-full`}
                style={{ width: `${(item.count / total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component - Optimized for vertical scrolling
interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  leadName?: string;
}

const RecentActivity: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <FaPhoneAlt className="text-blue-500" />;
      case "message":
        return <BsChatSquareDots className="text-green-500" />;
      case "status":
        return <FaRegCalendarCheck className="text-purple-500" />;
      default:
        return <FaChartLine className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Recent Activities
      </h3>
      <div className="space-y-3 max-h-[calc(100%-2rem)] overflow-auto pr-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-b-0"
          >
            <div className="p-1.5 bg-gray-100 rounded-full flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div>
              <p className="text-xs text-gray-800">{activity.description}</p>
              {activity.leadName && (
                <p className="text-xs text-gray-500">
                  Lead: {activity.leadName}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(activity.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
    activeCallbacks: 0,
    enrollments: 0,
  });

  const [stageData] = useState<StageData[]>([
    { stage: "New Lead", count: 42, color: "bg-blue-500" },
    { stage: "Not Responding", count: 28, color: "bg-yellow-500" },
    { stage: "Call Started", count: 35, color: "bg-indigo-500" },
    { stage: "Documents Requested", count: 18, color: "bg-purple-500" },
    { stage: "Application Submitted", count: 12, color: "bg-teal-500" },
    { stage: "Closed Won", count: 8, color: "bg-green-500" },
    { stage: "Closed Lost", count: 15, color: "bg-red-500" },
  ]);

  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "call",
      description: "Phone call with Rahul Sharma",
      timestamp: "2023-09-15T09:30:00",
      leadName: "Rahul Sharma",
    },
    {
      id: "2",
      type: "message",
      description: "WhatsApp message sent to Priya Patel",
      timestamp: "2023-09-15T10:15:00",
      leadName: "Priya Patel",
    },
    {
      id: "3",
      type: "status",
      description: 'Lead status changed to "Documents Received"',
      timestamp: "2023-09-15T11:05:00",
      leadName: "Amit Kumar",
    },
    {
      id: "4",
      type: "call",
      description: "Scheduled follow-up call",
      timestamp: "2023-09-15T13:20:00",
      leadName: "Sunita Gupta",
    },
    {
      id: "5",
      type: "status",
      description: "Application submitted for University of Toronto",
      timestamp: "2023-09-15T14:45:00",
      leadName: "Vikram Singh",
    },
  ]);

  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        // Uncomment and modify when your API is ready
        // const response = await axios.get('/api/dashboard');
        // setMetrics(response.data.metrics);
        // setStageData(response.data.stageData);
        // setActivities(response.data.activities);

        // For now, using sample data
        setMetrics({
          totalLeads: 158,
          newLeadsToday: 12,
          qualifiedLeads: 67,
          conversionRate: 42.4,
          activeCallbacks: 23,
          enrollments: 8,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Overview of your lead management performance
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {/* Metrics Grid - Horizontal scrolling on small screens */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <MetricCard
                title="Total Leads"
                value={metrics.totalLeads}
                icon={<FaUserGraduate size={20} className="text-blue-600" />}
                change="15% this month"
                changeType="positive"
                bgColor="bg-blue-50"
              />
              <MetricCard
                title="New Leads Today"
                value={metrics.newLeadsToday}
                icon={<FaChartLine size={20} className="text-green-600" />}
                change="↑ 3 from yesterday"
                changeType="positive"
                bgColor="bg-green-50"
              />
              <MetricCard
                title="Qualified Leads"
                value={metrics.qualifiedLeads}
                icon={
                  <FaRegCalendarCheck size={20} className="text-purple-600" />
                }
                change={`${Math.round(
                  (metrics.qualifiedLeads / metrics.totalLeads) * 100
                )}% of total`}
                bgColor="bg-purple-50"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${metrics.conversionRate}%`}
                icon={<FaChartLine size={20} className="text-indigo-600" />}
                change="2.5% increase"
                changeType="positive"
                bgColor="bg-indigo-50"
              />
              <MetricCard
                title="Active Callbacks"
                value={metrics.activeCallbacks}
                icon={<FaPhoneAlt size={20} className="text-yellow-600" />}
                bgColor="bg-yellow-50"
              />
              <MetricCard
                title="Enrollments"
                value={metrics.enrollments}
                icon={<MdOutlineSchool size={20} className="text-teal-600" />}
                change="2 new this week"
                changeType="positive"
                bgColor="bg-teal-50"
              />
            </div>

            {/* Two Column Layout with Fixed Height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-260px)]">
              <StageDistribution stageData={stageData} />
              <RecentActivity activities={activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
