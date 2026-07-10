import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-3">
          Check your inbox
        </h2>
        <p className="text-slate-500 dark:text-white/60 text-sm mb-2">
          We sent a password reset link to:
        </p>
        <p className="text-civic-600 dark:text-civic-400 font-semibold mb-8">
          {getValues("email")}
        </p>
        <p className="text-xs text-slate-400 dark:text-white/40 mb-6">
          Didn't receive it? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-civic-600 dark:text-civic-400 hover:underline font-medium"
          >
            try again
          </button>
          .
        </p>
        <Link
          to={ROUTES.LOGIN}
          className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-white/70 hover:text-civic-600 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-civic-100 dark:bg-civic-900/30 flex items-center justify-center mb-6">
        <Mail className="w-7 h-7 text-civic-600 dark:text-civic-400" />
      </div>

      <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white mb-2">
        Forgot password?
      </h2>
      <p className="text-slate-500 dark:text-white/60 mb-8 text-sm leading-relaxed">
        No worries. Enter your email and we'll send you a link to reset your password.
      </p>

      <form id="forgot-password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-1.5">
            Email address
          </label>
          <input
            id="forgot-email"
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

        <button
          id="forgot-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-civic-600 to-civic-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-civic-500/25 hover:shadow-xl hover:shadow-civic-500/35 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
        </button>
      </form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-2 mt-8 text-sm text-slate-600 dark:text-white/70 hover:text-civic-600 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>
    </div>
  );
}
