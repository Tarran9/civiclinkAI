// ============================================================
// APPLICATION ROUTES
// ============================================================

export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Citizen
  CITIZEN: {
    DASHBOARD: "/citizen/dashboard",
    COMPLAINTS: "/citizen/complaints",
    COMPLAINT_NEW: "/citizen/complaints/new",
    COMPLAINT_DETAIL: (id: string) => `/citizen/complaints/${id}`,
    COMPLAINT_EDIT: (id: string) => `/citizen/complaints/${id}/edit`,
    BLOOD_DONATE: "/citizen/blood/donate",
    BLOOD_REQUESTS: "/citizen/blood/requests",
    BLOOD_REQUEST_NEW: "/citizen/blood/requests/new",
    BLOOD_SEARCH: "/citizen/blood/search",
    NOTICES: "/citizen/notices",
    NOTICE_DETAIL: (id: string) => `/citizen/notices/${id}`,
    PROFILE: "/citizen/profile",
    NOTIFICATIONS: "/citizen/notifications",
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    COMPLAINTS: "/admin/complaints",
    COMPLAINT_DETAIL: (id: string) => `/admin/complaints/${id}`,
    BLOOD_DONORS: "/admin/blood/donors",
    BLOOD_REQUESTS: "/admin/blood/requests",
    NOTICES: "/admin/notices",
    NOTICE_NEW: "/admin/notices/new",
    NOTICE_EDIT: (id: string) => `/admin/notices/${id}/edit`,
    ANALYTICS: "/admin/analytics",
    SETTINGS: "/admin/settings",
    ACTIVITY_LOGS: "/admin/activity-logs",
  },
} as const;
