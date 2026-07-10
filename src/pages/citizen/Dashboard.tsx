import { Link } from "react-router-dom";
import {
  FileText,
  Droplets,
  Megaphone,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

// ── Stat card ─────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6 dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-black text-slate-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-slate-500 dark:text-white/50">{label}</p>
    </div>
  );
}

// ── Quick action card ─────────────────────────────────────────
function QuickAction({
  to,
  icon,
  label,
  description,
  color,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-slate-400 dark:text-white/40 truncate">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-white/30 group-hover:text-civic-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
    </Link>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "status-pending",
    in_progress: "status-in-progress",
    resolved: "status-resolved",
    rejected: "status-rejected",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Recent complaint row ──────────────────────────────────────
function RecentComplaintRow({
  title,
  category,
  status,
  date,
}: {
  title: string;
  category: string;
  status: string;
  date: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-50 dark:border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-slate-400 dark:text-white/40" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</p>
        <p className="text-xs text-slate-400 dark:text-white/40">{category}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={status} />
        <span className="text-xs text-slate-300 dark:text-white/30">{date}</span>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export function CitizenDashboard() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Citizen";

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-1 text-sm">
            Here's what's happening in your community today.
          </p>
        </div>
        <Link
          to={ROUTES.CITIZEN.COMPLAINT_NEW}
          className="flex items-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-civic-500/25 hover:shadow-lg hover:shadow-civic-500/35 hover:-translate-y-0.5 transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </Link>
      </div>

      {/* AI greeting card */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-civic-900 dark:from-civic-950 dark:via-civic-900 dark:to-civic-950 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold mb-0.5">AI-Powered Community</p>
          <p className="text-white/60 text-sm">
            Your complaints are analyzed by Groq AI for faster routing and resolution. Upload photos
            for instant categorization.
          </p>
        </div>
        <Link
          to={ROUTES.CITIZEN.COMPLAINT_NEW}
          className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
        >
          Try it
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-civic-600 dark:text-civic-400" />}
          label="Total Complaints"
          value={12}
          trend="+3 this month"
          color="bg-civic-100 dark:bg-civic-900/30"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          label="Pending"
          value={4}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Resolved"
          value={7}
          trend="58% rate"
          color="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
          label="In Progress"
          value={1}
          color="bg-rose-100 dark:bg-rose-900/30"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction
            to={ROUTES.CITIZEN.COMPLAINT_NEW}
            icon={<FileText className="w-5 h-5 text-civic-600 dark:text-civic-400" />}
            label="Report an Issue"
            description="Submit a new civic complaint"
            color="bg-civic-100 dark:bg-civic-900/30"
          />
          <QuickAction
            to={ROUTES.CITIZEN.BLOOD_REQUEST_NEW}
            icon={<Droplets className="w-5 h-5 text-rose-500" />}
            label="Request Blood"
            description="Urgent blood donation request"
            color="bg-rose-100 dark:bg-rose-900/30"
          />
          <QuickAction
            to={ROUTES.CITIZEN.BLOOD_DONATE}
            icon={<Droplets className="w-5 h-5 text-pink-500" />}
            label="Donate Blood"
            description="Register as a blood donor"
            color="bg-pink-100 dark:bg-pink-900/30"
          />
          <QuickAction
            to={ROUTES.CITIZEN.NOTICES}
            icon={<Megaphone className="w-5 h-5 text-amber-600" />}
            label="Community Notices"
            description="View latest announcements"
            color="bg-amber-100 dark:bg-amber-900/30"
          />
          <QuickAction
            to={ROUTES.CITIZEN.COMPLAINTS}
            icon={<FileText className="w-5 h-5 text-violet-600" />}
            label="My Complaints"
            description="Track all your submissions"
            color="bg-violet-100 dark:bg-violet-900/30"
          />
          <QuickAction
            to={ROUTES.CITIZEN.NOTIFICATIONS}
            icon={<Bell className="w-5 h-5 text-slate-500" />}
            label="Notifications"
            description="View all your updates"
            color="bg-slate-100 dark:bg-white/5"
          />
        </div>
      </div>

      {/* Recent complaints */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              Recent Complaints
            </h2>
            <Link
              to={ROUTES.CITIZEN.COMPLAINTS}
              className="text-xs text-civic-600 dark:text-civic-400 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <RecentComplaintRow
              title="Pothole on MG Road"
              category="Roads & Infrastructure"
              status="in_progress"
              date="2 days ago"
            />
            <RecentComplaintRow
              title="Broken streetlight near park"
              category="Electricity"
              status="pending"
              date="5 days ago"
            />
            <RecentComplaintRow
              title="Water pipe leaking"
              category="Water Supply"
              status="resolved"
              date="1 week ago"
            />
            <RecentComplaintRow
              title="Garbage not collected"
              category="Sanitation"
              status="resolved"
              date="2 weeks ago"
            />
          </div>
        </div>

        {/* Community notices */}
        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              Latest Notices
            </h2>
            <Link
              to={ROUTES.CITIZEN.NOTICES}
              className="text-xs text-civic-600 dark:text-civic-400 font-semibold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Water supply disruption on July 12",
                category: "Infrastructure",
                date: "Today",
                color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
              },
              {
                title: "Road widening project — MG Road",
                category: "Development",
                date: "Yesterday",
                color: "bg-civic-100 dark:bg-civic-900/30 text-civic-600 dark:text-civic-400",
              },
              {
                title: "Blood donation camp — Sat, July 15",
                category: "Health",
                date: "2 days ago",
                color: "bg-rose-100 dark:bg-rose-900/30 text-rose-500",
              },
            ].map((notice) => (
              <div
                key={notice.title}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${notice.color.split(" ").slice(0, 2).join(" ")}`}>
                  <Megaphone className={`w-4 h-4 ${notice.color.split(" ").slice(2).join(" ")}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {notice.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400 dark:text-white/40">{notice.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                    <span className="text-xs text-slate-400 dark:text-white/40">{notice.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
