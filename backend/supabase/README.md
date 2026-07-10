# CivicLink AI — Backend (Supabase)

This folder contains everything related to the **backend** of CivicLink AI.
The backend is fully managed by **Supabase** — a Backend-as-a-Service built on PostgreSQL.

There is **no custom Node.js/Express server**. All backend logic lives in:
- Supabase PostgreSQL (database + RLS + triggers)
- Supabase Auth (authentication)
- Supabase Storage (file uploads)
- Frontend service layer (`../src/services/supabase/`)

---

## 📁 Folder Structure

```
backend/
└── supabase/
    ├── migrations/
    │   ├── 001_initial_schema.sql      ← All tables, indexes, enums
    │   ├── 002_rls_policies.sql        ← Row Level Security rules
    │   ├── 003_triggers_and_functions.sql ← Auto-triggers & RPC functions
    │   ├── 004_storage.sql             ← Storage buckets & policies
    │   └── 005_seed_data.sql           ← Dev/test sample data (⚠️ dev only)
    └── README.md                       ← This file
```

---

## 🚀 Setup Instructions

### Step 1 — Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Set a strong database password
3. Choose a region close to your users

### Step 2 — Copy Environment Variables
1. In Supabase → **Settings → API**
2. Copy `Project URL` and `anon public` key
3. Paste into your frontend `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 3 — Run SQL Migrations (in order)
Open **Supabase Dashboard → SQL Editor** and run each file in order:

| Order | File | Purpose |
|-------|------|---------|
| 1st | `001_initial_schema.sql` | Create all tables |
| 2nd | `002_rls_policies.sql` | Set access rules |
| 3rd | `003_triggers_and_functions.sql` | Automate backend logic |
| 4th | `004_storage.sql` | Create file storage buckets |
| 5th | `005_seed_data.sql` | *(Dev only)* Add sample data |

> 💡 **Tip**: You can also use the Supabase CLI to apply migrations automatically.

### Step 4 — Configure Supabase Auth
1. Go to **Authentication → Settings**
2. Set **Site URL** to `http://localhost:3000` (dev) or your deployed URL
3. Add `http://localhost:3000/**` to **Redirect URLs**
4. Enable **Email/Password** provider

### Step 5 — Optional: External API Keys
Add these to `.env` if you want AI features:

```env
VITE_GROQ_API_KEY=your-groq-key         # AI text enhancement
VITE_RESEND_API_KEY=your-resend-key     # Email notifications
```

---

## 🗄️ Database Schema Overview

```
auth.users  (Supabase managed)
     │
     └──► profiles          ← Extended user data (role, phone, address)
               │
               ├──► complaints          ← Civic issue reports
               │         └──► complaint_images  ← Evidence photos
               │
               ├──► blood_donors        ← Registered blood donors
               ├──► blood_requests      ← Emergency blood requests
               ├──► community_notices   ← Admin announcements
               ├──► notifications       ← In-app user alerts
               └──► activity_logs       ← Audit trail
```

---

## 🔒 Security Model

| Role | Access |
|------|--------|
| **Anonymous** | None (all tables protected by RLS) |
| **citizen** | Own complaints, own blood data, published notices, own notifications |
| **admin** | Full read/write on all tables |

Role is stored in `profiles.role` and checked via the `is_admin()` helper function.

---

## ⚙️ Automated Backend Logic (Triggers)

| Trigger | What it does |
|---------|-------------|
| `on_auth_user_created` | Creates `profiles` row automatically on signup |
| `*_set_updated_at` | Auto-updates `updated_at` on every table update |
| `on_complaint_status_change` | Sets `resolved_at` when status → resolved |
| `on_complaint_status_notify` | Sends notification to citizen on status change |
| `on_notice_publish` | Sets `published_at` when notice is published |

---

## 📡 RPC Functions (Callable from Frontend)

```typescript
// Get all dashboard stats in one network call
const { data } = await supabase.rpc('get_dashboard_stats');

// Search donors by blood group and city
const { data } = await supabase.rpc('search_donors', {
  p_blood_group: 'O+',
  p_city: 'Mumbai'
});
```
