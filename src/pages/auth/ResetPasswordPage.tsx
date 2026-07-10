import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data.password);
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed. Please try again.";
      toast.error(msg);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-3">
          Password updated!
        </h2>
        <p className="text-slate-500 dark:text-white/60 text-sm mb-6">
          Redirecting you to sign in...
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="text-civic-600 dark:text-civic-400 font-semibold hover:underline text-sm"
        >
          Go to sign in now
        </Link>
      </div>
    );
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 pr-11 rounded-xl border bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 transition-all outline-none focus:ring-2 ${
      hasError
        ? "border-rose-400 focus:ring-rose-500/50 focus:border-rose-500"
        : "border-slate-200 dark:border-white/10 focus:ring-civic-500/50 focus:border-civic-500"
    }`;

  return (
    <div className="animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-civic-100 dark:bg-civic-900/30 flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-civic-600 dark:text-civic-400" />
      </div>

      <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2">
        Set new password
      </h2>
      <p className="text-slate-500 dark:text-white/60 mb-8 text-sm">
        Choose a strong password for your account.
      </p>

      <form id="reset-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("password")}
              className={inputClass(!!errors.password)}
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showCPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={inputClass(!!errors.confirmPassword)}
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

        <button
          id="reset-submit"
          type="submit"
          disabled={isSubmitting}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-civic-500/25 hover:shadow-xl hover:shadow-civic-500/35 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Reset password
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
