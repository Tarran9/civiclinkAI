import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  ArrowRight,
  Building2,
  Droplets,
  Megaphone,
  Sparkles,
  Shield,
  BarChart3,
  CheckCircle2,
  Star,
  ChevronRight,
  Zap,
  Users,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

// ── Animated counter ──────────────────────────────────────────
function Counter({ end, label }: { end: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl lg:text-5xl font-display font-black text-white">{end}</p>
      <p className="text-sm text-white/60 mt-1 font-medium">{label}</p>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="group relative bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
      style={{ animationDelay: delay }}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color} blur-xl`}
      />
      <div className="relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color.replace("bg-", "bg-").replace("/5", "/15")} group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-white/60 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────
function TestimonialCard({
  quote,
  name,
  role,
  avatar,
}: {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-8 flex flex-col gap-6">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed italic">"{quote}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{name}</p>
          <p className="text-xs text-slate-400 dark:text-white/40">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────
function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-civic-500/30">
        {step}
      </div>
      <div>
        <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">{title}</h4>
        <p className="text-sm text-slate-500 dark:text-white/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-lg border-b border-slate-100 dark:border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-civic-500 to-civic-700 rounded-xl flex items-center justify-center shadow-md shadow-civic-500/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">
            CivicLink<span className="text-civic-500"> AI</span>
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it works", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-slate-600 dark:text-white/70 hover:text-civic-600 dark:hover:text-white transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm font-semibold text-slate-700 dark:text-white/80 hover:text-civic-600 dark:hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="text-sm font-semibold bg-gradient-to-r from-civic-600 to-civic-500 text-white px-5 py-2.5 rounded-xl shadow-md shadow-civic-500/30 hover:shadow-lg hover:shadow-civic-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ── Main Landing Page ─────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background mesh gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-civic-50 via-slate-50 to-violet-50 dark:from-slate-950 dark:via-civic-950 dark:to-slate-950" />
        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-civic-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-civic-300/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-civic-50 dark:bg-civic-900/30 border border-civic-200 dark:border-civic-700/50 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-civic-600 dark:text-civic-400" />
            <span className="text-xs font-semibold text-civic-700 dark:text-civic-300">
              Powered by Groq AI — Blazing fast intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-slate-900 dark:text-white leading-[1.05] mb-6">
            Your City.
            <br />
            <span className="bg-gradient-to-r from-civic-600 via-civic-500 to-violet-500 bg-clip-text text-transparent">
              Your Voice.
            </span>
            <br />
            Amplified by AI.
          </h1>

          {/* Sub */}
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-white/60 mb-10 leading-relaxed">
            CivicLink AI is the all-in-one community platform. Report issues, connect blood donors,
            stay informed — all powered by AI that works for you, not against you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to={ROUTES.REGISTER}
              id="hero-get-started"
              className="group flex items-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-civic-500/30 hover:shadow-2xl hover:shadow-civic-500/40 hover:-translate-y-1 transition-all duration-300 text-lg"
            >
              Get started free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold px-8 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300 text-lg"
            >
              Sign in
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-white/40 text-sm">
            <div className="flex -space-x-2">
              {["RK", "SM", "AP", "VJ", "LN"].map((init) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-civic-400 to-civic-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-bold"
                >
                  {init}
                </div>
              ))}
            </div>
            <span>
              Trusted by <strong className="text-slate-600 dark:text-white/70">10,000+</strong>{" "}
              citizens
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-400 dark:border-white/30 flex items-start justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-slate-400 dark:bg-white/30 animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── Stats banner ─────────────────────────────────── */}
      <section className="bg-gradient-to-r from-civic-900 via-civic-800 to-civic-900 dark:from-civic-950 dark:via-civic-900 dark:to-civic-950 py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Counter end="10K+" label="Active Citizens" />
          <Counter end="5,200+" label="Issues Resolved" />
          <Counter end="500+" label="Lives Saved" />
          <Counter end="99%" label="Satisfaction Rate" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-civic-600 dark:text-civic-400 font-semibold text-sm uppercase tracking-widest">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mt-3 mb-4">
              Everything your community needs
            </h2>
            <p className="max-w-xl mx-auto text-slate-500 dark:text-white/60 text-lg">
              A unified platform for civic engagement, emergency response, and community awareness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Building2 className="w-7 h-7 text-civic-600 dark:text-civic-400" />}
              title="Civic Issue Reporting"
              description="Report potholes, broken streetlights, water leaks, and more with AI-assisted categorization and photo analysis."
              color="bg-civic-500/5 dark:bg-civic-400/5"
              delay="0ms"
            />
            <FeatureCard
              icon={<Droplets className="w-7 h-7 text-rose-500" />}
              title="Blood Donation Network"
              description="Connect emergency blood seekers with willing donors nearby. Real-time matching with urgency prioritization."
              color="bg-rose-500/5"
              delay="100ms"
            />
            <FeatureCard
              icon={<Megaphone className="w-7 h-7 text-amber-500" />}
              title="Community Notices"
              description="Stay informed with official announcements, civic updates, and important community alerts — never miss what matters."
              color="bg-amber-500/5"
              delay="200ms"
            />
            <FeatureCard
              icon={<Sparkles className="w-7 h-7 text-violet-500" />}
              title="Groq AI Analysis"
              description="Upload photos of issues and our AI instantly categorizes, prioritizes, and routes your complaint to the right department."
              color="bg-violet-500/5"
              delay="300ms"
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7 text-emerald-500" />}
              title="Real-time Analytics"
              description="Administrators get powerful dashboards with trend analysis, resolution rates, and community health indicators."
              color="bg-emerald-500/5"
              delay="400ms"
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-slate-500" />}
              title="Secure & Private"
              description="Built on Supabase with row-level security. Your data is protected with enterprise-grade access controls."
              color="bg-slate-500/5"
              delay="500ms"
            />
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900/50 dark:to-slate-950">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-civic-600 dark:text-civic-400 font-semibold text-sm uppercase tracking-widest">
              How it works
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mt-3 mb-6">
              Simple steps to make your city better
            </h2>
            <p className="text-slate-500 dark:text-white/60 mb-12 text-lg">
              From reporting an issue to seeing it resolved — our platform makes civic engagement
              effortless and transparent.
            </p>
            <div className="space-y-8">
              <StepCard
                step={1}
                title="Create your account"
                desc="Sign up in seconds. No bureaucracy, no waiting — just your name and email."
              />
              <StepCard
                step={2}
                title="Report or request"
                desc="Submit a civic complaint with photos, request blood urgently, or read community notices."
              />
              <StepCard
                step={3}
                title="AI does the heavy lifting"
                desc="Groq AI analyzes your submission, categorizes it, and routes it to the right authority."
              />
              <StepCard
                step={4}
                title="Track & get notified"
                desc="Real-time status updates via email and in-app notifications until your issue is resolved."
              />
            </div>
          </div>

          {/* Visual mockup panel */}
          <div className="relative">
            <div className="bg-gradient-to-br from-civic-900 to-civic-950 rounded-3xl p-8 shadow-2xl shadow-civic-900/40">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              {/* Mock complaint card */}
              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-civic-500/30 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-civic-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">AI Analysis Complete</p>
                      <p className="text-white/50 text-xs">Just now</p>
                    </div>
                    <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">
                      High Priority
                    </span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Pothole detected at MG Road intersection. Routed to Public Works Department.
                    Estimated resolution: 3-5 days.
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/30 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-rose-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Blood Request Matched</p>
                      <p className="text-white/50 text-xs">2 min ago</p>
                    </div>
                    <span className="ml-auto text-xs bg-rose-500/20 text-rose-400 px-2 py-1 rounded-full font-medium">
                      O+ Urgent
                    </span>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed">
                    3 compatible donors found within 5km. Notifications sent automatically.
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">New Community Notice</p>
                      <p className="text-white/50 text-xs">5 min ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-white">
                Issue resolved!
              </span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-civic-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-white">
                127 citizens helped
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-civic-600 dark:text-civic-400 font-semibold text-sm uppercase tracking-widest">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mt-3 mb-4">
              Citizens love CivicLink AI
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="I reported a broken streetlight and it was fixed in 2 days. The AI helped me describe the problem precisely. Incredible service!"
              name="Ravi Kumar"
              role="Citizen, Bangalore"
              avatar="RK"
            />
            <TestimonialCard
              quote="My mother needed O-negative blood urgently. CivicLink found 4 donors in 10 minutes. This platform literally saved her life."
              name="Sunita Mehra"
              role="Citizen, Mumbai"
              avatar="SM"
            />
            <TestimonialCard
              quote="As an admin, the analytics dashboard gives me a real picture of civic health across the city. Game-changing for decision making."
              name="Priya Agarwal"
              role="Municipal Officer, Delhi"
              avatar="PA"
            />
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-civic-600 via-civic-700 to-civic-900 rounded-3xl p-12 md:p-16 shadow-2xl shadow-civic-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-civic-400/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Globe className="w-12 h-12 text-white/50 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
                Ready to improve your city?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of citizens already making a difference. It's free, it's fast, and
                it's powered by AI.
              </p>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex items-center gap-2 bg-white text-civic-700 font-bold px-10 py-4 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 text-lg"
              >
                Join CivicLink AI
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-civic-500 to-civic-700 rounded-xl flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-slate-700 dark:text-white">
              CivicLink AI
            </span>
          </div>
          <p className="text-slate-400 dark:text-white/40 text-sm">
            © 2025 CivicLink AI. Building smarter, connected communities.
          </p>
          <div className="flex gap-6">
            <Link
              to={ROUTES.LOGIN}
              className="text-sm text-slate-500 dark:text-white/50 hover:text-civic-600 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="text-sm text-slate-500 dark:text-white/50 hover:text-civic-600 dark:hover:text-white transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
