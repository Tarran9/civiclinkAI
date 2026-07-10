import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Droplets,
  Megaphone,
  Users,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  X,
  Building2,
  Moon,
  Sun,
  Shield,
  Bell,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
      { label: "Analytics", to: ROUTES.ADMIN.ANALYTICS, icon: BarChart3 },
      { label: "Activity Logs", to: ROUTES.ADMIN.ACTIVITY_LOGS, icon: Activity },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Complaints", to: ROUTES.ADMIN.COMPLAINTS, icon: FileText },
      { label: "Blood Bank", to: ROUTES.ADMIN.BLOOD_DONORS, icon: Droplets },
      { label: "Notices", to: ROUTES.ADMIN.NOTICES, icon: Megaphone },
      { label: "Users", to: ROUTES.ADMIN.USERS, icon: Users },
    ],
  },
];

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === ROUTES.ADMIN.DASHBOARD}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
          isActive
            ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/20"
            : "text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-4 h-4 flex-shrink-0 transition-colors ${
              isActive
                ? "text-violet-600 dark:text-violet-400"
                : "text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/70"
            }`}
          />
          <span className="flex-1">{label}</span>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
        </>
      )}
    </NavLink>
  );
}

export function AdminLayout() {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out");
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-white/10 flex-shrink-0">
          <Link to={ROUTES.ADMIN.DASHBOARD} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/30">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-sm leading-tight">
                CivicLink
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/40 leading-tight">
                Admin Panel
              </p>
            </div>
          </Link>
          <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 px-4 mb-2">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarLink
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    onClick={closeSidebar}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {profile?.full_name ?? "Admin"}
              </p>
              <p className="text-xs text-violet-500 dark:text-violet-400 font-medium">
                Administrator
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-white/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 flex items-center gap-4 px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white/70"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin Panel</p>
            <p className="text-xs text-slate-400 dark:text-white/40">CivicLink AI Management</p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {profile?.full_name?.charAt(0).toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
