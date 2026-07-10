import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

export function AuthLayout() {
  const { isAuthenticated, profile } = useAuth();

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && profile) {
    const redirect =
      profile.role === "admin" ? ROUTES.ADMIN.DASHBOARD : ROUTES.CITIZEN.DASHBOARD;
    return <Navigate to={redirect} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-civic-950 via-civic-900 to-civic-800">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-civic-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-civic-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">CivicLink AI</h1>
              <p className="text-xs text-white/60">Community Assistance Platform</p>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold leading-tight">
              Building smarter,<br />
              <span className="text-civic-300">connected communities</span>
            </h2>
            <div className="space-y-4">
              {[
                { icon: "🏙️", text: "Report civic issues instantly with AI analysis" },
                { icon: "🩸", text: "Connect blood donors in emergencies" },
                { icon: "📢", text: "Stay informed with community notices" },
                { icon: "📊", text: "Track resolutions with real-time updates" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-sm text-white/80">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Citizens", value: "10K+" },
              { label: "Issues Resolved", value: "5K+" },
              { label: "Lives Saved", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
