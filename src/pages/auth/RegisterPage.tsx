import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Building2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a letter", test: (v: string) => /[a-zA-Z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /[0-9]/.test(v) },
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [pwValue, setPwValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Watch password for strength meter
  const watchedPw = watch("password", "");

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data.email, data.password, data.fullName, data.phone);
      toast.success("Account created! Please check your email to verify your account.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 transition-all outline-none focus:ring-2 ${
      hasError
        ? "border-rose-400 focus:ring-rose-500/50 focus:border-rose-500"
        : "border-slate-200 dark:border-white/10 focus:ring-civic-500/50 focus:border-civic-500"
    }`;

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
        Create your account
      </h2>
      <p className="text-slate-500 dark:text-white/60 mb-8">
        Join thousands of citizens making a difference
      </p>

      <form id="register-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Full name
          </label>
          <input
            id="register-fullname"
            type="text"
            autoComplete="name"
            placeholder="Ravi Kumar"
            {...register("fullName")}
            className={inputClass(!!errors.fullName)}
          />
          {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
        </div>

        {/* Phone (optional) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Phone number{" "}
            <span className="text-slate-400 dark:text-white/30 font-normal">(optional)</span>
          </label>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            {...register("phone")}
            className={inputClass(!!errors.phone)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password", {
                onChange: (e) => setPwValue(e.target.value),
              })}
              className={inputClass(!!errors.password) + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/70 transition-colors"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
          )}
          {/* Password strength indicators */}
          {watchedPw && (
            <div className="mt-2 space-y-1">
              {passwordRules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3 h-3 transition-colors ${
                      rule.test(watchedPw) ? "text-emerald-500" : "text-slate-300 dark:text-white/20"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors ${
                      rule.test(watchedPw)
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-white/40"
                    }`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="register-confirm-password"
              type={showCPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={inputClass(!!errors.confirmPassword) + " pr-11"}
            />
            <button
              type="button"
              onClick={() => setShowCPw(!showCPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white/70 transition-colors"
            >
              {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-400 dark:text-white/40 leading-relaxed">
          By creating an account, you agree to our{" "}
          <span className="text-civic-600 dark:text-civic-400 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-civic-600 dark:text-civic-400 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
          .
        </p>

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          disabled={isSubmitting}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-civic-500/25 hover:shadow-xl hover:shadow-civic-500/35 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/50">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="text-civic-600 dark:text-civic-400 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
