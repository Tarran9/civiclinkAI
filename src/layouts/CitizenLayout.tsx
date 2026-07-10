import { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Droplets,
  Megaphone,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    to: ROUTES.CITIZEN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Complaints",
    to: ROUTES.CITIZEN.COMPLAINTS,
    icon: FileText,
  },
  {
    label: "Blood Bank",
    to: ROUTES.CITIZEN.BLOOD_REQUESTS,
    icon: Droplets,
  },
  {
    label: "Notices",
    to: ROUTES.CITIZEN.NOTICES,
    icon: Megaphone,
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
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
          isActive
            ? "bg-civic-500/15 text-civic-700 dark:text-civic-300 border border-civic-500/20"
            : "text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`w-5 h-5 flex-shrink-0 transition-colors ${
              isActive ? "text-civic-600 dark:text-civic-400" : "text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/70"
            }`}
          />
          <span className="flex-1">{label}</span>
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-civic-500" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function CitizenLayout() {
  const { profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate(ROUTES.LOGIN);
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* ── Mobile overlay ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/10 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-white/10 flex-shrink-0">
          <Link to={ROUTES.CITIZEN.DASHBOARD} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-civic-500 to-civic-700 rounded-xl flex items-center justify-center shadow-md shadow-civic-500/30">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 dark:text-white text-sm leading-tight">
                CivicLink
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/40 leading-tight">
                Citizen Portal
              </p>
            </div>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 px-4 mb-2">
            Menu
          </p>
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={closeSidebar}
            />
          ))}

          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 px-4 mb-2">
              Account
            </p>
            <SidebarLink
              to={ROUTES.CITIZEN.NOTIFICATIONS}
              icon={Bell}
              label="Notifications"
              onClick={closeSidebar}
            />
            <SidebarLink
              to={ROUTES.CITIZEN.PROFILE}
              icon={User}
              label="Profile"
              onClick={closeSidebar}
            />
          </div>
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {profile?.full_name ?? "User"}
              </p>
              <p className="text-xs text-slate-400 dark:text-white/40 truncate">
                {profile?.email ?? ""}
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

      {/* ── Main area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 flex items-center gap-4 px-6 flex-shrink-0">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white/70"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search complaints, notices..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 outline-none focus:ring-2 focus:ring-civic-500/30 focus:border-civic-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <NavLink
              to={ROUTES.CITIZEN.NOTIFICATIONS}
              className={({ isActive }) =>
                `w-9 h-9 rounded-xl border flex items-center justify-center transition-colors relative ${
                  isActive
                    ? "bg-civic-50 dark:bg-civic-900/30 border-civic-200 dark:border-civic-700/50 text-civic-600 dark:text-civic-400"
                    : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <Bell className="w-4 h-4" />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
            </NavLink>

            {/* Profile avatar */}
            <NavLink
              to={ROUTES.CITIZEN.PROFILE}
              className="flex items-center gap-2 pl-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-civic-500/30">
                {profile?.full_name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
