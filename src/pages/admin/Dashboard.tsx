import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats, getActivityLogs } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Droplets,
  Heart,
  Megaphone,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color: string;
  subtext?: string;
}

function StatCard({ icon, title, value, color, subtext }: StatCardProps) {
  return (
    <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 dark:text-white/40">{title}</p>
            <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white">
              {value}
            </h3>
            {subtext && <p className="text-xs text-slate-400 dark:text-white/30">{subtext}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["adminRecentLogs"],
    queryFn: () => getActivityLogs(1, 6),
  });

  const logs = logsData?.data ?? [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-violet-500" />
            Admin Overview
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Real-time operations summary and activity logs for CivicLink AI.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : statsError || !stats ? (
        <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
          <h3 className="font-bold">Failed to load statistics</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />}
            title="Total Registered Citizens"
            value={stats.totalUsers}
            color="bg-violet-100 dark:bg-violet-950/20"
            subtext="Platform members"
          />
          <StatCard
            icon={<FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            title="Total Filed Complaints"
            value={stats.totalComplaints}
            color="bg-blue-100 dark:bg-blue-950/20"
            subtext={`Pending: ${stats.pendingComplaints}`}
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            title="Resolved Complaints"
            value={stats.resolvedComplaints}
            color="bg-emerald-100 dark:bg-emerald-950/20"
            subtext={`${Math.round((stats.resolvedComplaints / (stats.totalComplaints || 1)) * 100)}% resolution rate`}
          />
          <StatCard
            icon={<Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
            title="Emergency Blood Donors"
            value={stats.totalDonors}
            color="bg-rose-100 dark:bg-rose-950/20"
            subtext={`Open requests: ${stats.openBloodRequests}`}
          />
        </div>
      )}

      {/* Main dashboard body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick action shortcuts */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold">Quick Links</CardTitle>
              <CardDescription>Shortcut controls for municipal actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={ROUTES.ADMIN.COMPLAINTS} className="block">
                <Button className="w-full justify-between hover:bg-violet-500 hover:text-white border-slate-200 dark:border-white/10 font-semibold" variant="outline">
                  Manage Civic Complaints
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN.NOTICES} className="block">
                <Button className="w-full justify-between hover:bg-violet-500 hover:text-white border-slate-200 dark:border-white/10 font-semibold" variant="outline">
                  Manage Community Notices
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN.USERS} className="block">
                <Button className="w-full justify-between hover:bg-violet-500 hover:text-white border-slate-200 dark:border-white/10 font-semibold" variant="outline">
                  Manage User Accounts
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to={ROUTES.ADMIN.ANALYTICS} className="block">
                <Button className="w-full justify-between hover:bg-violet-500 hover:text-white border-slate-200 dark:border-white/10 font-semibold" variant="outline">
                  View Complex Analytics
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity log audit trail */}
        <div className="lg:col-span-2">
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-display font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-500" />
                  Recent Activity Trail
                </CardTitle>
                <CardDescription>Real-time audit log of system events.</CardDescription>
              </div>
              <Link to={ROUTES.ADMIN.ACTIVITY_LOGS}>
                <Button variant="ghost" size="sm" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">
                  View Audit Log
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-white/20 text-xs">
                  No activity logs recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-white/5">
                  {logs.map((log) => (
                    <div key={log.id} className="py-3 flex justify-between items-center text-xs gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] mr-2 bg-slate-100 dark:bg-white/5 py-0.5 px-1.5 rounded">
                          {log.action.replace("create_", "").replace("update_", "")}
                        </span>
                        <span className="text-slate-600 dark:text-white/70">
                          {log.entity_type} ID: {log.entity_id?.substring(0, 8)}... Action recorded.
                        </span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
