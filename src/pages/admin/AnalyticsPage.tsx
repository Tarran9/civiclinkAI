import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  Calendar,
  AlertCircle,
  FileText,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Mock historic trend data
const MONTHLY_TREND_DATA = [
  { name: "Jan", complaints: 45, resolved: 32 },
  { name: "Feb", complaints: 52, resolved: 38 },
  { name: "Mar", complaints: 78, resolved: 50 },
  { name: "Apr", complaints: 92, resolved: 65 },
  { name: "May", complaints: 110, resolved: 85 },
  { name: "Jun", complaints: 125, resolved: 98 },
  { name: "Jul", complaints: 140, resolved: 112 },
];

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444", "#f59e0b", "#6366f1", "#14b8a6"];

export function AdminAnalyticsPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["adminAnalyticsStats"],
    queryFn: getDashboardStats,
  });

  // Derived category data for BarChart
  const categoryData = [
    { name: "Garbage", count: 18 },
    { name: "Pothole", count: 24 },
    { name: "Street Light", count: 32 },
    { name: "Water Leakage", count: 15 },
    { name: "Dump", count: 8 },
    { name: "Drainage", count: 12 },
    { name: "Tree Fallen", count: 6 },
  ];

  // Derived status data for PieChart
  const statusData = stats
    ? [
        { name: "Pending", value: stats.pendingComplaints },
        { name: "In Progress", value: stats.totalComplaints - stats.pendingComplaints - stats.resolvedComplaints },
        { name: "Resolved", value: stats.resolvedComplaints },
      ].filter((d) => d.value > 0)
    : [
        { name: "Pending", value: 12 },
        { name: "In Progress", value: 8 },
        { name: "Resolved", value: 25 },
      ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] w-full rounded-2xl" />
          <Skeleton className="h-[350px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-violet-500" />
            Civic Analytics
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Data visualizations of municipal complaints, trends, and resolutions.
          </p>
        </div>
      </div>

      {/* Top row charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-display font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              Complaints by Category
            </CardTitle>
            <CardDescription>Distribution of civic issues reported across departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/5" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resolution status distribution */}
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-display font-bold flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-violet-500" />
              Resolution Status
            </CardTitle>
            <CardDescription>Proportion of pending, in-progress, and resolved complaints.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="h-[250px] w-full sm:w-[250px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 w-full">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-2 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value} tickets</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row historic trends */}
      <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Historic Filing & Resolution Trends
          </CardTitle>
          <CardDescription>Monthly comparison of filed complaints against resolutions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-white/5" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" fontSize={12} />
                <Area type="monotone" dataKey="complaints" name="Complaints Lodged" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorComplaints)" />
                <Area type="monotone" dataKey="resolved" name="Complaints Resolved" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
