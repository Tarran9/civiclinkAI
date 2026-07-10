import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Building2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      // AuthContext handles redirect via profile role
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Logo mobile */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-civic-500 to-civic-700 rounded-xl flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-slate-900 dark:text-white">CivicLink AI</span>
      </div>

      <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-1">
        Welcome back
      </h2>
      <p className="text-slate-500 dark:text-white/60 mb-8">
        Sign in to your account to continue
      </p>

      <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 transition-all outline-none focus:ring-2 focus:ring-civic-500/50 focus:border-civic-500 ${
              errors.email
                ? "border-rose-400 focus:ring-rose-500/50 focus:border-rose-500"
                : "border-slate-200 dark:border-white/10"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-civic-600 dark:text-civic-400 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full px-4 py-3 pr-11 rounded-xl border bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 transition-all outline-none focus:ring-2 focus:ring-civic-500/50 focus:border-civic-500 ${
                errors.password
                  ? "border-rose-400 focus:ring-rose-500/50 focus:border-rose-500"
                  : "border-slate-200 dark:border-white/10"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={isSubmitting}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-civic-500/25 hover:shadow-xl hover:shadow-civic-500/35 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 dark:text-white/50">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="text-civic-600 dark:text-civic-400 font-semibold hover:underline"
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
